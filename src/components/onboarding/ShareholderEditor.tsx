'use client'

/**
 * ShareholderEditor Component
 * TASK-022/023 - Quadro Societário Expandido
 *
 * Componente para gerenciamento completo do quadro societário com:
 * - Visualização expandida (CPF/CNPJ mascarado, participação %)
 * - Edição inline de sócios existentes
 * - Adição de novos sócios manualmente
 * - Remoção de sócios (com confirmação)
 */

import * as React from 'react'
import { cn } from '@/lib/utils'
import {
  Button,
  Input,
  Label,
  Card,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui'
import {
  Users,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  AlertTriangle,
} from 'lucide-react'

// ============================================
// Types
// ============================================

export interface Shareholder {
  nome: string
  cpfCnpj: string
  qualificacao: string
  percentualParticipacao?: number
  dataEntrada?: string
  /** Indica se o sócio veio da API (BrasilAPI/QSA) — participação obrigatória */
  isFromApi?: boolean
}

export interface ShareholderEditorProps {
  /** Lista de sócios */
  shareholders: Shareholder[]
  /** Callback quando a lista é alterada */
  onChange: (shareholders: Shareholder[]) => void
  /** Modo somente leitura */
  readOnly?: boolean
  /** Classes CSS adicionais */
  className?: string
}

// ============================================
// Utilities
// ============================================

/**
 * Mascara CPF/CNPJ para exibição segura
 * CPF: ***.***123-45
 * CNPJ: **.***\/****12-34
 */
function maskCpfCnpj(value: string): string {
  if (!value) return '-'
  const clean = value.replace(/\D/g, '')

  if (clean.length === 11) {
    // CPF: ***.***.XXX-XX
    return `***.***${clean.slice(6, 9)}-${clean.slice(9)}`
  }

  if (clean.length === 14) {
    // CNPJ: **.***/XXXX-XX
    return `**.***/****${clean.slice(8, 12)}-${clean.slice(12)}`
  }

  return value
}

/**
 * Formata CPF/CNPJ para exibição (sem máscara de segurança)
 */
function formatCpfCnpj(value: string): string {
  const clean = value.replace(/\D/g, '')

  if (clean.length <= 11) {
    // CPF
    if (clean.length <= 3) return clean
    if (clean.length <= 6) return `${clean.slice(0, 3)}.${clean.slice(3)}`
    if (clean.length <= 9) return `${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6)}`
    return `${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6, 9)}-${clean.slice(9, 11)}`
  }

  // CNPJ
  if (clean.length <= 2) return clean
  if (clean.length <= 5) return `${clean.slice(0, 2)}.${clean.slice(2)}`
  if (clean.length <= 8) return `${clean.slice(0, 2)}.${clean.slice(2, 5)}.${clean.slice(5)}`
  if (clean.length <= 12) return `${clean.slice(0, 2)}.${clean.slice(2, 5)}.${clean.slice(5, 8)}/${clean.slice(8)}`
  return `${clean.slice(0, 2)}.${clean.slice(2, 5)}.${clean.slice(5, 8)}/${clean.slice(8, 12)}-${clean.slice(12, 14)}`
}

/**
 * Valida CPF
 */
function validateCpf(cpf: string): boolean {
  const clean = cpf.replace(/\D/g, '')
  if (clean.length !== 11) return false
  if (/^(\d)\1{10}$/.test(clean)) return false

  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += parseInt(clean[i]) * (10 - i)
  }
  let rest = (sum * 10) % 11
  if (rest === 10 || rest === 11) rest = 0
  if (rest !== parseInt(clean[9])) return false

  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += parseInt(clean[i]) * (11 - i)
  }
  rest = (sum * 10) % 11
  if (rest === 10 || rest === 11) rest = 0
  if (rest !== parseInt(clean[10])) return false

  return true
}

/**
 * Valida CNPJ
 */
function validateCnpj(cnpj: string): boolean {
  const clean = cnpj.replace(/\D/g, '')
  if (clean.length !== 14) return false
  if (/^(\d)\1{13}$/.test(clean)) return false

  let sum = 0
  let weight = 5
  for (let i = 0; i < 12; i++) {
    sum += parseInt(clean[i]) * weight
    weight = weight === 2 ? 9 : weight - 1
  }
  let rest = sum % 11
  const digit1 = rest < 2 ? 0 : 11 - rest
  if (parseInt(clean[12]) !== digit1) return false

  sum = 0
  weight = 6
  for (let i = 0; i < 13; i++) {
    sum += parseInt(clean[i]) * weight
    weight = weight === 2 ? 9 : weight - 1
  }
  rest = sum % 11
  const digit2 = rest < 2 ? 0 : 11 - rest
  if (parseInt(clean[13]) !== digit2) return false

  return true
}

/**
 * Valida CPF ou CNPJ
 */
function validateCpfCnpj(value: string): boolean {
  const clean = value.replace(/\D/g, '')
  if (clean.length === 11) return validateCpf(clean)
  if (clean.length === 14) return validateCnpj(clean)
  return false
}

// ============================================
// ShareholderRow Component
// ============================================

interface ShareholderRowProps {
  shareholder: Shareholder
  index: number
  isEditing: boolean
  onEdit: () => void
  onSave: (data: Shareholder) => void
  onCancel: () => void
  onRemove: () => void
  readOnly?: boolean
}

function ShareholderRow({
  shareholder,
  index,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  onRemove,
  readOnly,
}: ShareholderRowProps) {
  const [editData, setEditData] = React.useState<Shareholder>(shareholder)
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false)

  React.useEffect(() => {
    setEditData(shareholder)
  }, [shareholder])

  const handleSave = () => {
    const newErrors: Record<string, string> = {}

    if (!editData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório'
    }

    if (!editData.cpfCnpj.trim()) {
      newErrors.cpfCnpj = 'CPF/CNPJ é obrigatório'
    } else if (!validateCpfCnpj(editData.cpfCnpj)) {
      newErrors.cpfCnpj = 'CPF/CNPJ inválido'
    }

    // Participação obrigatória para sócios vindos da API
    if (
      editData.isFromApi &&
      (editData.percentualParticipacao === undefined || editData.percentualParticipacao === null)
    ) {
      newErrors.percentualParticipacao = 'Participação é obrigatória para este sócio'
    } else if (
      editData.percentualParticipacao !== undefined &&
      (editData.percentualParticipacao < 0 || editData.percentualParticipacao > 100)
    ) {
      newErrors.percentualParticipacao = 'Deve ser entre 0 e 100'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    onSave(editData)
  }

  if (isEditing) {
    return (
      <div className="p-3 border rounded-lg space-y-3 bg-muted/30">
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2 space-y-1">
            <Label className="text-xs">Nome *</Label>
            <Input
              value={editData.nome}
              onChange={(e) => {
                setEditData({ ...editData, nome: e.target.value })
                setErrors({ ...errors, nome: '' })
              }}
              placeholder="Nome completo"
              className="h-8 text-sm"
            />
            {errors.nome && <p className="text-xs text-destructive">{errors.nome}</p>}
          </div>

          <div className="space-y-1">
            <Label className="text-xs">CPF/CNPJ *</Label>
            <Input
              value={formatCpfCnpj(editData.cpfCnpj)}
              onChange={(e) => {
                const clean = e.target.value.replace(/\D/g, '').slice(0, 14)
                setEditData({ ...editData, cpfCnpj: clean })
                setErrors({ ...errors, cpfCnpj: '' })
              }}
              placeholder="000.000.000-00"
              className="h-8 text-sm font-mono"
            />
            {errors.cpfCnpj && <p className="text-xs text-destructive">{errors.cpfCnpj}</p>}
          </div>

          <div className="space-y-1">
            <Label className="text-xs">
              Participação (%) {editData.isFromApi && <span className="text-destructive">*</span>}
            </Label>
            <Input
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={editData.percentualParticipacao ?? ''}
              onChange={(e) => {
                const val = e.target.value ? parseFloat(e.target.value) : undefined
                setEditData({ ...editData, percentualParticipacao: val })
                setErrors({ ...errors, percentualParticipacao: '' })
              }}
              placeholder="0.00"
              className={cn('h-8 text-sm', errors.percentualParticipacao && 'border-destructive focus-visible:ring-destructive')}
            />
            {errors.percentualParticipacao && (
              <p className="text-xs text-destructive">{errors.percentualParticipacao}</p>
            )}
          </div>

          <div className="col-span-2 space-y-1">
            <Label className="text-xs">Qualificação</Label>
            <Input
              value={editData.qualificacao}
              onChange={(e) => setEditData({ ...editData, qualificacao: e.target.value })}
              placeholder="Ex: Sócio-Administrador"
              className="h-8 text-sm"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button size="sm" variant="ghost" onClick={onCancel}>
            <X className="h-3 w-3 mr-1" />
            Cancelar
          </Button>
          <Button size="sm" onClick={handleSave}>
            <Check className="h-3 w-3 mr-1" />
            Salvar
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="group p-3 border rounded-lg hover:bg-muted/30 transition-colors">
      <div className="flex justify-between items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium text-sm truncate">{shareholder.nome}</p>
            {shareholder.percentualParticipacao !== undefined &&
              shareholder.percentualParticipacao !== null ? (
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full shrink-0">
                  {shareholder.percentualParticipacao.toFixed(2)}%
                </span>
              ) : shareholder.isFromApi ? (
                <span className="text-xs bg-destructive/10 text-destructive px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  % obrigatório
                </span>
              ) : null}
          </div>
          <p className="text-xs text-muted-foreground">{shareholder.qualificacao || '-'}</p>
          <p className="text-xs text-muted-foreground font-mono mt-1">
            CPF/CNPJ: {maskCpfCnpj(shareholder.cpfCnpj)}
          </p>
        </div>

        {!readOnly && (
          <>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={onEdit}>
                <Edit2 className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Remover sócio?</DialogTitle>
                  <DialogDescription>
                    Esta ação removerá <strong>{shareholder.nome}</strong> do quadro societário.
                    Os dados poderão ser adicionados novamente manualmente.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                    Cancelar
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      onRemove()
                      setShowDeleteDialog(false)
                    }}
                  >
                    Remover
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        )}
      </div>
    </div>
  )
}

// ============================================
// Main Component
// ============================================

export function ShareholderEditor({
  shareholders,
  onChange,
  readOnly = false,
  className,
}: ShareholderEditorProps) {
  const [editingIndex, setEditingIndex] = React.useState<number | null>(null)
  const [isAdding, setIsAdding] = React.useState(false)
  const [newShareholder, setNewShareholder] = React.useState<Shareholder>({
    nome: '',
    cpfCnpj: '',
    qualificacao: '',
  })
  const [addErrors, setAddErrors] = React.useState<Record<string, string>>({})

  // Calculate total participation
  const totalParticipation = shareholders.reduce(
    (sum, s) => sum + (s.percentualParticipacao || 0),
    0
  )
  const hasParticipationWarning = totalParticipation > 100

  const handleEdit = (index: number, data: Shareholder) => {
    const updated = [...shareholders]
    updated[index] = data
    onChange(updated)
    setEditingIndex(null)
  }

  const handleRemove = (index: number) => {
    const updated = shareholders.filter((_, i) => i !== index)
    onChange(updated)
  }

  const handleAdd = () => {
    const newErrors: Record<string, string> = {}

    if (!newShareholder.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório'
    }

    if (!newShareholder.cpfCnpj.trim()) {
      newErrors.cpfCnpj = 'CPF/CNPJ é obrigatório'
    } else if (!validateCpfCnpj(newShareholder.cpfCnpj)) {
      newErrors.cpfCnpj = 'CPF/CNPJ inválido'
    }

    if (
      newShareholder.percentualParticipacao !== undefined &&
      (newShareholder.percentualParticipacao < 0 || newShareholder.percentualParticipacao > 100)
    ) {
      newErrors.percentualParticipacao = 'Deve ser entre 0 e 100'
    }

    if (Object.keys(newErrors).length > 0) {
      setAddErrors(newErrors)
      return
    }

    onChange([...shareholders, newShareholder])
    setNewShareholder({ nome: '', cpfCnpj: '', qualificacao: '' })
    setIsAdding(false)
    setAddErrors({})
  }

  const handleCancelAdd = () => {
    setNewShareholder({ nome: '', cpfCnpj: '', qualificacao: '' })
    setIsAdding(false)
    setAddErrors({})
  }

  return (
    <Card className={cn('p-4 space-y-4', className)}>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <Users className="h-4 w-4" />
          Quadro Societário
          <span className="text-xs text-muted-foreground font-normal">
            ({shareholders.length} {shareholders.length === 1 ? 'sócio' : 'sócios'})
          </span>
        </h3>

        {!readOnly && !isAdding && (
          <Button size="sm" variant="outline" onClick={() => setIsAdding(true)}>
            <Plus className="h-3 w-3 mr-1" />
            Adicionar
          </Button>
        )}
      </div>

      {/* Participation Warning */}
      {hasParticipationWarning && (
        <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 p-2 rounded">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>
            A soma das participações ({totalParticipation.toFixed(2)}%) excede 100%.
            Verifique os valores informados.
          </span>
        </div>
      )}

      {/* Shareholders List */}
      <div className="space-y-2">
        {shareholders.length === 0 && !isAdding ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhum sócio cadastrado.
            {!readOnly && ' Clique em "Adicionar" para incluir sócios manualmente.'}
          </p>
        ) : (
          shareholders.map((shareholder, index) => (
            <ShareholderRow
              key={`${shareholder.cpfCnpj}-${index}`}
              shareholder={shareholder}
              index={index}
              isEditing={editingIndex === index}
              onEdit={() => setEditingIndex(index)}
              onSave={(data) => handleEdit(index, data)}
              onCancel={() => setEditingIndex(null)}
              onRemove={() => handleRemove(index)}
              readOnly={readOnly}
            />
          ))
        )}

        {/* Add New Shareholder Form */}
        {isAdding && (
          <div className="p-3 border-2 border-dashed border-primary/30 rounded-lg space-y-3 bg-primary/5">
            <p className="text-xs font-medium text-primary">Novo Sócio</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1">
                <Label className="text-xs">Nome *</Label>
                <Input
                  value={newShareholder.nome}
                  onChange={(e) => {
                    setNewShareholder({ ...newShareholder, nome: e.target.value })
                    setAddErrors({ ...addErrors, nome: '' })
                  }}
                  placeholder="Nome completo"
                  className="h-8 text-sm"
                  autoFocus
                />
                {addErrors.nome && <p className="text-xs text-destructive">{addErrors.nome}</p>}
              </div>

              <div className="space-y-1">
                <Label className="text-xs">CPF/CNPJ *</Label>
                <Input
                  value={formatCpfCnpj(newShareholder.cpfCnpj)}
                  onChange={(e) => {
                    const clean = e.target.value.replace(/\D/g, '').slice(0, 14)
                    setNewShareholder({ ...newShareholder, cpfCnpj: clean })
                    setAddErrors({ ...addErrors, cpfCnpj: '' })
                  }}
                  placeholder="000.000.000-00"
                  className="h-8 text-sm font-mono"
                />
                {addErrors.cpfCnpj && <p className="text-xs text-destructive">{addErrors.cpfCnpj}</p>}
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Participação (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={newShareholder.percentualParticipacao ?? ''}
                  onChange={(e) => {
                    const val = e.target.value ? parseFloat(e.target.value) : undefined
                    setNewShareholder({ ...newShareholder, percentualParticipacao: val })
                    setAddErrors({ ...addErrors, percentualParticipacao: '' })
                  }}
                  placeholder="0.00"
                  className="h-8 text-sm"
                />
                {addErrors.percentualParticipacao && (
                  <p className="text-xs text-destructive">{addErrors.percentualParticipacao}</p>
                )}
              </div>

              <div className="col-span-2 space-y-1">
                <Label className="text-xs">Qualificação</Label>
                <Input
                  value={newShareholder.qualificacao}
                  onChange={(e) =>
                    setNewShareholder({ ...newShareholder, qualificacao: e.target.value })
                  }
                  placeholder="Ex: Sócio-Administrador"
                  className="h-8 text-sm"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button size="sm" variant="ghost" onClick={handleCancelAdd}>
                <X className="h-3 w-3 mr-1" />
                Cancelar
              </Button>
              <Button size="sm" onClick={handleAdd}>
                <Check className="h-3 w-3 mr-1" />
                Adicionar
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Total Participation Summary */}
      {shareholders.length > 0 && shareholders.some((s) => s.percentualParticipacao != null) && (
        <div className="text-xs text-muted-foreground text-right border-t pt-2">
          Participação total: <span className={cn(hasParticipationWarning && 'text-amber-600 font-medium')}>{totalParticipation.toFixed(2)}%</span>
        </div>
      )}
    </Card>
  )
}

export default ShareholderEditor
