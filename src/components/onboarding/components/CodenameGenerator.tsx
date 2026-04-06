'use client'

import { Button, Input, Label } from '@/components/ui'

interface CodenameGeneratorProps {
  value: string
  onChange: (value: string, source: 'manual' | 'ai') => void
}

const SUGGESTIONS = ['Projeto Tiger', 'Projeto Atlas', 'Projeto Falcon', 'Projeto Aurora']

export function CodenameGenerator({ value, onChange }: CodenameGeneratorProps) {
  const suggestWithAi = () => {
    const suggestion = SUGGESTIONS[Math.floor(Math.random() * SUGGESTIONS.length)]
    onChange(suggestion, 'ai')
  }

  return (
    <div className="space-y-3">
      <Label>Codinome do projeto</Label>
      <div className="flex flex-col gap-3 md:flex-row">
        <Input
          value={value}
          onChange={(event) => onChange(event.target.value, 'manual')}
          placeholder="Ex.: Projeto Tiger"
        />
        <Button type="button" variant="outline" onClick={suggestWithAi}>
          Sugerir com Mary AI
        </Button>
      </div>
    </div>
  )
}

export default CodenameGenerator
