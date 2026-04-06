'use client'

import * as React from 'react'

export type AutoSaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export interface UseAutoSaveOptions {
  entityId: string
  entityType: string
  debounceMs?: number
  maxRetries?: number
  onSave: (field: string, value: unknown, context: { entityId: string; entityType: string }) => Promise<void>
}

export interface RegisteredField {
  onChange: (value: unknown) => void
  saveStatus: AutoSaveStatus
}

export interface UseAutoSaveReturn {
  registerField: (field: string) => RegisteredField
  getFieldStatus: (field: string) => AutoSaveStatus
  getFieldError: (field: string) => string | null
  getFieldValue: <T = unknown>(field: string) => T | undefined
  isSaving: boolean
  lastSaved: Date | null
  resetField: (field: string) => void
  resetAll: () => void
}

const DEFAULT_DEBOUNCE_MS = 2000
const DEFAULT_MAX_RETRIES = 2
const SAVED_FEEDBACK_MS = 1400

interface FieldMeta {
  timer: ReturnType<typeof setTimeout> | null
  savedTimer: ReturnType<typeof setTimeout> | null
  retryCount: number
  lastValue: unknown
}

function toErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  return 'Falha ao salvar automaticamente'
}

export function useAutoSave({
  entityId,
  entityType,
  debounceMs = DEFAULT_DEBOUNCE_MS,
  maxRetries = DEFAULT_MAX_RETRIES,
  onSave,
}: UseAutoSaveOptions): UseAutoSaveReturn {
  const [fieldStatus, setFieldStatus] = React.useState<Record<string, AutoSaveStatus>>({})
  const [fieldError, setFieldError] = React.useState<Record<string, string | null>>({})
  const [fieldValue, setFieldValue] = React.useState<Record<string, unknown>>({})
  const [lastSaved, setLastSaved] = React.useState<Date | null>(null)

  const fieldsRef = React.useRef<Map<string, FieldMeta>>(new Map())
  const unmountedRef = React.useRef(false)

  React.useEffect(() => {
    return () => {
      unmountedRef.current = true
      const fieldMetas = Array.from(fieldsRef.current.values())
      for (const meta of fieldMetas) {
        if (meta.timer) clearTimeout(meta.timer)
        if (meta.savedTimer) clearTimeout(meta.savedTimer)
      }
      fieldsRef.current.clear()
    }
  }, [])

  const performSave = React.useCallback(
    async (field: string, value: unknown) => {
      if (unmountedRef.current) return

      setFieldStatus((prev) => ({ ...prev, [field]: 'saving' }))
      setFieldError((prev) => ({ ...prev, [field]: null }))

      const saveWithRetry = async (): Promise<void> => {
        const meta = fieldsRef.current.get(field)
        if (!meta || unmountedRef.current) return

        try {
          await onSave(field, value, { entityId, entityType })
          if (unmountedRef.current) return

          meta.retryCount = 0
          setLastSaved(new Date())
          setFieldStatus((prev) => ({ ...prev, [field]: 'saved' }))

          if (meta.savedTimer) clearTimeout(meta.savedTimer)
          meta.savedTimer = setTimeout(() => {
            if (unmountedRef.current) return
            setFieldStatus((prev) => ({ ...prev, [field]: 'idle' }))
          }, SAVED_FEEDBACK_MS)
        } catch (error) {
          const message = toErrorMessage(error)
          if (meta.retryCount < maxRetries) {
            meta.retryCount += 1
            const backoffMs = 400 * meta.retryCount
            meta.timer = setTimeout(saveWithRetry, backoffMs)
            return
          }

          if (unmountedRef.current) return
          meta.retryCount = 0
          setFieldStatus((prev) => ({ ...prev, [field]: 'error' }))
          setFieldError((prev) => ({ ...prev, [field]: message }))
        }
      }

      await saveWithRetry()
    },
    [entityId, entityType, maxRetries, onSave]
  )

  const onChangeFactory = React.useCallback(
    (field: string) => (value: unknown) => {
      if (!field) return

      setFieldValue((prev) => ({ ...prev, [field]: value }))
      setFieldError((prev) => ({ ...prev, [field]: null }))

      const existing = fieldsRef.current.get(field)
      const meta: FieldMeta = existing ?? {
        timer: null,
        savedTimer: null,
        retryCount: 0,
        lastValue: undefined,
      }

      meta.lastValue = value
      if (meta.timer) clearTimeout(meta.timer)
      if (meta.savedTimer) {
        clearTimeout(meta.savedTimer)
        meta.savedTimer = null
      }

      fieldsRef.current.set(field, meta)

      meta.timer = setTimeout(() => {
        void performSave(field, meta.lastValue)
      }, debounceMs)
    },
    [debounceMs, performSave]
  )

  const registerField = React.useCallback(
    (field: string): RegisteredField => {
      if (!fieldsRef.current.has(field)) {
        fieldsRef.current.set(field, {
          timer: null,
          savedTimer: null,
          retryCount: 0,
          lastValue: undefined,
        })
      }

      return {
        onChange: onChangeFactory(field),
        saveStatus: fieldStatus[field] ?? 'idle',
      }
    },
    [fieldStatus, onChangeFactory]
  )

  const getFieldStatus = React.useCallback(
    (field: string): AutoSaveStatus => fieldStatus[field] ?? 'idle',
    [fieldStatus]
  )

  const getFieldError = React.useCallback(
    (field: string): string | null => fieldError[field] ?? null,
    [fieldError]
  )

  const getFieldValue = React.useCallback(
    <T = unknown,>(field: string): T | undefined => fieldValue[field] as T | undefined,
    [fieldValue]
  )

  const resetField = React.useCallback((field: string) => {
    const meta = fieldsRef.current.get(field)
    if (meta?.timer) clearTimeout(meta.timer)
    if (meta?.savedTimer) clearTimeout(meta.savedTimer)
    fieldsRef.current.delete(field)

    setFieldStatus((prev) => {
      const next = { ...prev }
      delete next[field]
      return next
    })
    setFieldError((prev) => {
      const next = { ...prev }
      delete next[field]
      return next
    })
    setFieldValue((prev) => {
      const next = { ...prev }
      delete next[field]
      return next
    })
  }, [])

  const resetAll = React.useCallback(() => {
    const fieldMetas = Array.from(fieldsRef.current.values())
    for (const meta of fieldMetas) {
      if (meta.timer) clearTimeout(meta.timer)
      if (meta.savedTimer) clearTimeout(meta.savedTimer)
    }
    fieldsRef.current.clear()
    setFieldStatus({})
    setFieldError({})
    setFieldValue({})
    setLastSaved(null)
  }, [])

  const isSaving = React.useMemo(
    () => Object.values(fieldStatus).some((status) => status === 'saving'),
    [fieldStatus]
  )

  return {
    registerField,
    getFieldStatus,
    getFieldError,
    getFieldValue,
    isSaving,
    lastSaved,
    resetField,
    resetAll,
  }
}

export default useAutoSave
