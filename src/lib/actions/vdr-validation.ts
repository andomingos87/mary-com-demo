'use server'

import { createClient } from '@/lib/supabase/server'
import { logAuditEvent } from '@/lib/audit'
import { triggerReadinessRecalc } from './vdr-utils'
import type { VdrValidationLevel } from '@/types/vdr'
import type { Json } from '@/types/database'

/**
 * Validate a document at a specific level (N1, N2, or N3)
 * - N1: Asset validates (owner/admin/member of project's org)
 * - N2: Advisor validates (advisor with access to project)
 * - N3: Owner/Admin validates (owner/admin da organização do projeto)
 */
export async function validateDocument(
  documentId: string,
  level: VdrValidationLevel
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Não autenticado' }
  }

  // Use database function for validation
  const { data, error } = await supabase.rpc('validate_vdr_document', {
    p_document_id: documentId,
    p_level: level,
    p_user_id: user.id,
  })

  if (error) {
    console.error('Error validating document:', error)
    return { success: false, error: error.message }
  }

  if (!data) {
    return { success: false, error: `Você não tem permissão para validar em nível ${level.toUpperCase()}` }
  }

  await logAuditEvent('vdr.document_validated', {
    document_id: documentId,
    level,
  }, user.id)

  const { data: doc } = await supabase
    .from('vdr_documents')
    .select('project_id')
    .eq('id', documentId)
    .single()

  if (doc?.project_id) {
    await triggerReadinessRecalc(doc.project_id)
  }

  return { success: true }
}

/**
 * Remove validation from a document at a specific level
 */
export async function unvalidateDocument(
  documentId: string,
  level: VdrValidationLevel
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Não autenticado' }
  }

  // Use database function for unvalidation
  const { data, error } = await supabase.rpc('unvalidate_vdr_document', {
    p_document_id: documentId,
    p_level: level,
    p_user_id: user.id,
  })

  if (error) {
    console.error('Error unvalidating document:', error)
    return { success: false, error: error.message }
  }

  if (!data) {
    return { success: false, error: 'Você não tem permissão para remover validação' }
  }

  await logAuditEvent('vdr.document_unvalidated', {
    document_id: documentId,
    level,
  }, user.id)

  const { data: doc } = await supabase
    .from('vdr_documents')
    .select('project_id')
    .eq('id', documentId)
    .single()

  if (doc?.project_id) {
    await triggerReadinessRecalc(doc.project_id)
  }

  return { success: true }
}

export async function getDocumentValidationHistory(
  documentId: string,
  options?: { limit?: number; offset?: number }
): Promise<{
  success: boolean
  data?: Array<{
    id: string
    validationLevel: 'N1' | 'N2' | 'N3'
    approved: boolean
    validatedAt: string
    validatedBy: string
    metadata: Json | null
  }>
  hasMore?: boolean
  error?: string
}> {
  const supabase = await createClient()

  const limit = options?.limit ?? 20
  const offset = options?.offset ?? 0

  // Fetch limit + 1 to detect if there are more records
  const { data, error } = await (supabase
    .from('vdr_document_validations' as any)
    .select('id, validation_level, approved, validated_at, validated_by, metadata')
    .eq('document_id', documentId)
    .order('validated_at', { ascending: false })
    .range(offset, offset + limit)
  )

  if (error) {
    console.error('Error loading validation history:', error)
    return { success: false, error: error.message }
  }

  const rows = (data || []) as any[]
  const hasMore = rows.length > limit
  const page = hasMore ? rows.slice(0, limit) : rows

  return {
    success: true,
    data: page.map(row => ({
      id: row.id,
      validationLevel: row.validation_level as 'N1' | 'N2' | 'N3',
      approved: row.approved,
      validatedAt: row.validated_at,
      validatedBy: row.validated_by,
      metadata: row.metadata,
    })),
    hasMore,
  }
}
