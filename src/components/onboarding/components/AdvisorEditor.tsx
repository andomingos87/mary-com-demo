'use client'

import { Button, Input, Label } from '@/components/ui'

export interface AdvisorRow {
  name: string
  email: string
  company?: string
  role?: string
}

interface AdvisorEditorProps {
  advisors: AdvisorRow[]
  onChange: (advisors: AdvisorRow[]) => void
}

const EMPTY_ADVISOR: AdvisorRow = {
  name: '',
  email: '',
  company: '',
  role: '',
}

export function AdvisorEditor({ advisors, onChange }: AdvisorEditorProps) {
  const updateAdvisor = (index: number, patch: Partial<AdvisorRow>) => {
    const next = advisors.map((advisor, currentIndex) =>
      currentIndex === index ? { ...advisor, ...patch } : advisor
    )
    onChange(next)
  }

  const removeAdvisor = (index: number) => {
    onChange(advisors.filter((_, currentIndex) => currentIndex !== index))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Advisors do projeto</Label>
        <Button type="button" variant="outline" onClick={() => onChange([...advisors, { ...EMPTY_ADVISOR }])}>
          Adicionar advisor
        </Button>
      </div>

      <div className="space-y-3">
        {advisors.map((advisor, index) => (
          <div key={`advisor-${index}`} className="grid gap-3 rounded-lg border border-border bg-card p-3 md:grid-cols-5">
            <Input
              value={advisor.name}
              placeholder="Nome"
              onChange={(event) => updateAdvisor(index, { name: event.target.value })}
            />
            <Input
              value={advisor.email}
              placeholder="Email"
              onChange={(event) => updateAdvisor(index, { email: event.target.value })}
            />
            <Input
              value={advisor.company || ''}
              placeholder="Empresa"
              onChange={(event) => updateAdvisor(index, { company: event.target.value })}
            />
            <Input
              value={advisor.role || ''}
              placeholder="Função"
              onChange={(event) => updateAdvisor(index, { role: event.target.value })}
            />
            <Button type="button" variant="ghost" onClick={() => removeAdvisor(index)}>
              Remover
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AdvisorEditor
