'use client'

import { useId, useState } from 'react'
import { Send, UserPlus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

export function RadarInviteAssetCta({
  demoMode = false,
  variant = 'card',
}: {
  demoMode?: boolean
  /** `button`: CTA compacto para toolbar (ex.: demo Kanban). `card`: bloco tracejado no Radar. */
  variant?: 'card' | 'button'
}) {
  const formId = useId()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [site, setSite] = useState('')
  const [email, setEmail] = useState('')
  const [personalNote, setPersonalNote] = useState('')

  const handleOpen = () => {
    setName('')
    setSite('')
    setEmail('')
    setPersonalNote('')
    setOpen(true)
  }

  const handleSubmit = () => {
    const n = name.trim()
    const s = site.trim()
    const e = email.trim()
    if (!n || !s || !e) {
      toast.warning('Preencha os campos obrigatórios', {
        description: 'Informe nome da empresa, website e e-mail de contato.',
      })
      return
    }
    const note = personalNote.trim()
    if (demoMode) {
      toast.success('Convite simulado', {
        description: [
          `${n} · ${s} · ${e}`,
          note ? `Nota: ${note}` : null,
          'Demonstração: nada é enviado nem salvo.',
        ]
          .filter(Boolean)
          .join(' — '),
      })
    } else {
      toast.success('Indicação registrada', {
        description: 'Esta versão ainda não envia dados ao servidor.',
      })
    }
    setOpen(false)
  }

  return (
    <>
      {variant === 'button' ? (
        <Button
          type="button"
          size="sm"
          className="shrink-0 rounded-lg bg-primary text-primary-foreground transition-smooth hover:bg-primary/90"
          onClick={handleOpen}
        >
          <UserPlus className="mr-2 h-4 w-4" aria-hidden />
          + Convidar Ativo
        </Button>
      ) : (
        <button
          type="button"
          onClick={handleOpen}
          className={cn(
            'flex min-h-[260px] w-full flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-muted-foreground/40 bg-card p-8 text-center shadow-none transition-smooth',
            'hover:border-primary/45 hover:bg-muted/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
          )}
        >
          <UserPlus className="h-10 w-10 shrink-0 text-foreground" strokeWidth={1.5} aria-hidden />
          <div className="space-y-2">
            <p className="text-base font-semibold text-foreground">Convidar um Ativo</p>
            <p className="mx-auto max-w-[280px] text-sm leading-relaxed text-muted-foreground">
              Conhece uma empresa fora do radar? Convide para a plataforma.
            </p>
          </div>
        </button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-lg border-border bg-card text-card-foreground shadow-card sm:max-w-md">
          <DialogHeader className="space-y-2 text-left">
            <DialogTitle className="text-lg font-semibold text-foreground">
              Convidar Ativo para o Radar
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed text-muted-foreground">
              Convide uma empresa que você conhece. Mary AI analisará o site e gerará um teaser
              automaticamente.
              {demoMode ? (
                <span className="mt-2 block text-xs text-muted-foreground">
                  Demonstração: nenhum convite é enviado nem salvo.
                </span>
              ) : null}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor={`${formId}-company`} className="font-semibold text-foreground">
                Nome da Empresa <span className="text-destructive">*</span>
              </Label>
              <Input
                id={`${formId}-company`}
                autoComplete="organization"
                placeholder="Ex: TechCorp Brasil"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${formId}-website`} className="font-semibold text-foreground">
                Website <span className="text-destructive">*</span>
              </Label>
              <Input
                id={`${formId}-website`}
                type="url"
                autoComplete="url"
                placeholder="https://empresa.com.br"
                value={site}
                onChange={(e) => setSite(e.target.value)}
                required
                className="rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${formId}-email`} className="font-semibold text-foreground">
                E-mail de Contato <span className="text-destructive">*</span>
              </Label>
              <Input
                id={`${formId}-email`}
                type="email"
                autoComplete="email"
                placeholder="contato@empresa.com.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${formId}-note`} className="font-semibold text-foreground">
                Nota Pessoal <span className="font-normal text-muted-foreground">(opcional)</span>
              </Label>
              <Textarea
                id={`${formId}-note`}
                placeholder="Mensagem para o ativo..."
                value={personalNote}
                onChange={(e) => setPersonalNote(e.target.value)}
                className="min-h-[100px] resize-none rounded-lg"
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:justify-end">
            <Button type="button" variant="outline" className="rounded-lg" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button
              type="button"
              className="rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={handleSubmit}
            >
              <Send className="mr-2 h-4 w-4" aria-hidden />
              Enviar Convite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
