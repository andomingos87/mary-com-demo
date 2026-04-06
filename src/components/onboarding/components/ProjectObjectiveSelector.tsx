'use client'

import * as React from 'react'
import { Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui'

type ObjectiveType = 'investment' | 'full_sale'

const OBJECTIVE_OPTIONS: Record<ObjectiveType, string[]> = {
  investment: [
    'Expansão e Crescimento',
    'Desenvolvimento de Produtos/Inovação',
    'Capital de Giro',
    'Marketing e Vendas',
    'Atração de Talentos',
    'Fortalecimento da Estrutura',
  ],
  full_sale: [
    'Retirada de Capital (Cashing Out)',
    'Mudança de Estilo de Vida ou Burnout',
    'Falta de Sucessão',
    'Novas Oportunidades',
    'Disputas de Sócios',
    'Riscos de Mercado',
    'Proposta Irrecusável',
  ],
}

export interface ProjectObjectiveValue {
  type: ObjectiveType
  subReason: string
}

interface ProjectObjectiveSelectorProps {
  value: ProjectObjectiveValue
  onChange: (value: ProjectObjectiveValue) => void
}

export function ProjectObjectiveSelector({ value, onChange }: ProjectObjectiveSelectorProps) {
  const subOptions = React.useMemo(() => OBJECTIVE_OPTIONS[value.type], [value.type])

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label>Objetivo do projeto</Label>
        <Select
          value={value.type}
          onValueChange={(nextType: ObjectiveType) =>
            onChange({
              type: nextType,
              subReason: OBJECTIVE_OPTIONS[nextType][0] || '',
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o objetivo principal" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="investment">Captação de Investimento</SelectItem>
            <SelectItem value="full_sale">Venda Integral</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Motivo específico</Label>
        <Select value={value.subReason} onValueChange={(subReason) => onChange({ ...value, subReason })}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o motivo" />
          </SelectTrigger>
          <SelectContent>
            {subOptions.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

export default ProjectObjectiveSelector
