'use client'

import * as React from 'react'
import { Button, Input, Label } from '@/components/ui'
import { useAutoSave } from '@/hooks/useAutoSave'
import { AutoSaveIndicator } from '@/components/shared/AutoSaveIndicator'
import { FieldTooltip } from '@/components/shared/FieldTooltip'
import { autoSaveOnboardingFields } from '@/lib/actions/onboarding'
import { AdvisorEditor, type AdvisorRow } from '@/components/onboarding/components/AdvisorEditor'
import { ShareholderEditor, type Shareholder } from '@/components/onboarding/ShareholderEditor'
import type { AssetTeamData } from '@/types/onboarding'
import { TOOLTIPS } from '@/lib/constants/tooltips'

interface AssetTeamStepProps {
  organizationId?: string
  initialData?: Partial<AssetTeamData>
  onSave: (data: AssetTeamData) => void
  onBack: () => void
  onAutoSave?: (data: AssetTeamData) => Promise<void>
}

interface InvitedMember {
  name: string
  email: string
}

interface TeamShareholder extends Shareholder {
  email: string
}

const EMPTY_INVITED_MEMBER: InvitedMember = { name: '', email: '' }

export function AssetTeamStep({ organizationId, initialData, onSave, onBack }: AssetTeamStepProps) {
  const [shareholders, setShareholders] = React.useState<TeamShareholder[]>(
    (initialData?.shareholders || []).map((item) => ({
      nome: item.name,
      email: item.email || '',
      cpfCnpj: '',
      qualificacao: item.role || '',
      percentualParticipacao: item.ownershipPercent,
    }))
  )
  const [advisors, setAdvisors] = React.useState<AdvisorRow[]>(initialData?.advisors || [])
  const [invitedMembers, setInvitedMembers] = React.useState<InvitedMember[]>(
    initialData?.invitedMembers || []
  )
  const autoSave = useAutoSave({
    entityId: 'asset-team-step',
    entityType: 'onboarding',
    onSave: async (_field, value) => {
      if (organizationId) {
        const result = await autoSaveOnboardingFields(organizationId, {
          assetTeamData: value as Record<string, unknown>,
        })
        if (result.success) return
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('mary_h06_asset_team_draft', JSON.stringify(value))
      }
    },
  })

  const shareholdersField = autoSave.registerField('shareholders')
  const advisorsField = autoSave.registerField('advisors')
  const invitedMembersField = autoSave.registerField('invitedMembers')

  const isValid = shareholders.some(
    (item) => item.nome.trim().length > 0 && item.email.trim().length > 0
  )

  const handleShareholdersChange = (nextShareholders: Shareholder[]) => {
    setShareholders((current) => {
      const merged = nextShareholders.map((nextItem, index) => {
        const fromCurrentIndex = current[index]
        const fromCurrentMatch = current.find(
          (item) => item.cpfCnpj && item.cpfCnpj === nextItem.cpfCnpj
        )
        const typedEmail =
          'email' in nextItem && typeof nextItem.email === 'string' ? nextItem.email : undefined

        return {
          ...nextItem,
          email: typedEmail ?? fromCurrentMatch?.email ?? fromCurrentIndex?.email ?? '',
        }
      })
      shareholdersField.onChange(merged)
      return merged
    })
  }

  const updateInvitedMember = (index: number, patch: Partial<InvitedMember>) => {
    setInvitedMembers((current) => {
      const next = current.map((member, currentIndex) => (currentIndex === index ? { ...member, ...patch } : member))
      invitedMembersField.onChange(next)
      return next
    })
  }

  const draftPayload = React.useMemo<AssetTeamData>(
    () => ({
      shareholders: shareholders.map((item) => ({
        name: item.nome,
        email: item.email.trim(),
        role: item.qualificacao,
        ownershipPercent: item.percentualParticipacao,
      })),
      advisors,
      invitedMembers,
    }),
    [advisors, invitedMembers, shareholders]
  )

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-semibold">Equipe</h2>
      <AutoSaveIndicator status={autoSave.isSaving ? 'saving' : autoSave.lastSaved ? 'saved' : 'idle'} />

      <ShareholderEditor shareholders={shareholders} onChange={handleShareholdersChange} />
      <AutoSaveIndicator status={shareholdersField.saveStatus} errorMessage={autoSave.getFieldError('shareholders')} />
      {shareholders.length > 0 && (
        <div className="space-y-2">
          <Label className="inline-flex items-center gap-1.5">
            Emails dos sócios (obrigatório para avançar)
            <FieldTooltip label="Emails dos sócios" text={TOOLTIPS.onboarding.asset.advisors} />
          </Label>
          <div className="space-y-2">
            {shareholders.map((item, index) => (
              <Input
                key={`shareholder-email-${index}-${item.cpfCnpj || item.nome}`}
                type="email"
                placeholder={`Email do sócio ${index + 1}`}
                value={item.email}
                onChange={(event) =>
                  setShareholders((current) =>
                    current.map((shareholder, currentIndex) => {
                      const nextValue =
                        currentIndex === index
                          ? { ...shareholder, email: event.target.value }
                          : shareholder
                      return nextValue
                    }
                    )
                  )
                }
              />
            ))}
          </div>
        </div>
      )}
      <AdvisorEditor
        advisors={advisors}
        onChange={(next) => {
          setAdvisors(next)
          advisorsField.onChange(next)
        }}
      />
      <AutoSaveIndicator status={advisorsField.saveStatus} errorMessage={autoSave.getFieldError('advisors')} />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="inline-flex items-center gap-1.5">
            Convite de membros
            <FieldTooltip label="Convite de membros" text={TOOLTIPS.onboarding.asset.advisors} />
          </Label>
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              setInvitedMembers((current) => {
                const next = [...current, { ...EMPTY_INVITED_MEMBER }]
                invitedMembersField.onChange(next)
                return next
              })
            }
          >
            Adicionar convite
          </Button>
        </div>
        {invitedMembers.map((member, index) => (
          <div key={`member-${index}`} className="grid gap-3 md:grid-cols-3">
            <Input
              placeholder="Nome"
              value={member.name}
              onChange={(event) => updateInvitedMember(index, { name: event.target.value })}
            />
            <Input
              placeholder="Email"
              value={member.email}
              onChange={(event) => updateInvitedMember(index, { email: event.target.value })}
            />
            <Button
              type="button"
              variant="ghost"
              onClick={() =>
                setInvitedMembers((current) => {
                  const next = current.filter((_, currentIndex) => currentIndex !== index)
                  invitedMembersField.onChange(next)
                  return next
                })
              }
            >
              Remover
            </Button>
          </div>
        ))}
      </div>
      <AutoSaveIndicator
        status={invitedMembersField.saveStatus}
        errorMessage={autoSave.getFieldError('invitedMembers')}
      />

      <div className="flex justify-between">
        <Button type="button" variant="ghost" onClick={onBack}>
          Voltar
        </Button>
        <Button type="button" disabled={!isValid} onClick={() => onSave(draftPayload)}>
          Próximo passo
        </Button>
      </div>
    </div>
  )
}

export default AssetTeamStep
