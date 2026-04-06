'use client'

import * as React from 'react'
import { Button } from '@/components/ui'
import { useAutoSave } from '@/hooks/useAutoSave'
import { AutoSaveIndicator } from '@/components/shared/AutoSaveIndicator'
import { FieldTooltip } from '@/components/shared/FieldTooltip'
import { CodenameGenerator } from '@/components/onboarding/components/CodenameGenerator'
import type { AssetCodenameData } from '@/types/onboarding'
import { TOOLTIPS } from '@/lib/constants/tooltips'
import { autoSaveOnboardingFields } from '@/lib/actions/onboarding'

interface AssetCodenameStepProps {
  organizationId?: string
  initialData?: Partial<AssetCodenameData>
  onSave: (data: AssetCodenameData) => void
  onBack: () => void
}

export function AssetCodenameStep({ organizationId, initialData, onSave, onBack }: AssetCodenameStepProps) {
  const [codename, setCodename] = React.useState(initialData?.codename || '')
  const [source, setSource] = React.useState<'manual' | 'ai'>(initialData?.codenameSource || 'manual')
  const autoSave = useAutoSave({
    entityId: 'asset-codename-step',
    entityType: 'onboarding',
    onSave: async (_field, value) => {
      if (organizationId) {
        const result = await autoSaveOnboardingFields(organizationId, {
          assetCodenameData: value as Record<string, unknown>,
        })
        if (result.success) return
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('mary_h06_asset_codename_draft', JSON.stringify(value))
      }
    },
  })
  const codenameField = autoSave.registerField('codename')

  const isValid = codename.trim().length > 0

  const completeStep = () => {
    onSave({
      codename: codename.trim(),
      codenameSource: source,
    })
  }

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-semibold">Codinome</h2>
      <p className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
        Sigilo do projeto
        <FieldTooltip label="Codinome confidencial" text={TOOLTIPS.onboarding.asset.codename} />
      </p>
      <AutoSaveIndicator status={codenameField.saveStatus} errorMessage={autoSave.getFieldError('codename')} />
      <AutoSaveIndicator status={autoSave.isSaving ? 'saving' : autoSave.lastSaved ? 'saved' : 'idle'} />

      <CodenameGenerator
        value={codename}
        onChange={(nextCodename, nextSource) => {
          setCodename(nextCodename)
          setSource(nextSource)
          codenameField.onChange({
            codename: nextCodename,
            codenameSource: nextSource,
          })
        }}
      />

      <div className="flex justify-between">
        <Button type="button" variant="ghost" onClick={onBack}>
          Voltar
        </Button>
        <Button type="button" disabled={!isValid} onClick={completeStep}>
          Continuar para termos
        </Button>
      </div>
    </div>
  )
}

export default AssetCodenameStep
