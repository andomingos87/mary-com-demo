'use client'

import { useTransition } from 'react'
import { LogOut, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { logoutAction } from '@/lib/actions/auth'
import { cn } from '@/lib/utils'

interface LogoutButtonProps {
  /** Se deve mostrar apenas o ícone (para sidebar colapsada) */
  iconOnly?: boolean
  /** Classes CSS adicionais */
  className?: string
  /** Variant do botão */
  variant?: 'default' | 'ghost' | 'outline' | 'destructive' | 'secondary' | 'link'
  /** Se deve aplicar estilos específicos de sidebar */
  useSidebarStyles?: boolean
}

/**
 * Botão de logout que usa Server Action.
 * 
 * Funcionalidades:
 * - Chama logoutAction (Server Action)
 * - Mostra loading state durante logout
 * - Redireciona automaticamente para /login
 */
export function LogoutButton({ 
  iconOnly = false, 
  className,
  variant = 'ghost',
  useSidebarStyles = true,
}: LogoutButtonProps) {
  const [isPending, startTransition] = useTransition()

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAction()
    })
  }

  return (
    <Button
      variant={variant}
      onClick={handleLogout}
      disabled={isPending}
      className={cn(
        useSidebarStyles
          ? 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
          : 'text-muted-foreground hover:text-foreground',
        iconOnly
          ? 'justify-center'
          : useSidebarStyles
            ? 'justify-start gap-3 w-full'
            : 'justify-start gap-2',
        className
      )}
      aria-label="Sair da conta"
    >
      {isPending ? (
        <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
      ) : (
        <LogOut className="h-5 w-5" aria-hidden="true" />
      )}
      {!iconOnly && <span>{isPending ? 'Saindo...' : 'Sair'}</span>}
    </Button>
  )
}
