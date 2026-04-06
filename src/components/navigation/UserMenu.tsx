'use client'

import Link from 'next/link'
import { useTransition } from 'react'
import { ChevronDown, LogOut, Settings, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { logoutAction } from '@/lib/actions/auth'
import { useOrganization } from '@/components/providers/OrganizationProvider'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

type UserMenuVariant = 'sidebar-expanded' | 'sidebar-collapsed'

interface UserMenuProps {
  variant?: UserMenuVariant
  className?: string
}

function getProfileLabel(profileType: string | null | undefined): 'Investor' | 'Advisor' | 'Company' | null {
  if (profileType === 'investor') return 'Investor'
  if (profileType === 'advisor') return 'Advisor'
  if (profileType === 'asset') return 'Company'
  return null
}

function getInitials(nameOrEmail: string): string {
  const value = nameOrEmail.trim()
  if (!value) return 'U'

  if (value.includes(' ')) {
    return value
      .split(' ')
      .filter(Boolean)
      .map(part => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()
  }

  return value.slice(0, 2).toUpperCase()
}

function buildRoutes(profileType: string | null | undefined, orgSlug: string | null | undefined) {
  if (profileType === 'advisor') {
    return {
      profileHref: '/advisor/profile',
      accountHref: '/advisor/settings',
    }
  }

  if (orgSlug) {
    return {
      profileHref: `/${orgSlug}/profile`,
      accountHref: `/${orgSlug}/settings`,
    }
  }

  return {
    profileHref: '/dashboard',
    accountHref: '/dashboard',
  }
}

export function UserMenu({ variant = 'sidebar-expanded', className }: UserMenuProps) {
  const [isPending, startTransition] = useTransition()
  const { currentUser, organization } = useOrganization()

  const profileLabel = currentUser?.profileTypeLabel || getProfileLabel(organization?.profileType)
  const displayName = currentUser?.fullName || currentUser?.email || 'Usuário'
  const displayEmail = currentUser?.email || 'Email não disponível'
  const avatarUrl = currentUser?.avatarUrl || undefined
  const initials = getInitials(displayName)

  const { profileHref, accountHref } = buildRoutes(organization?.profileType, organization?.slug)

  const triggerClasses = cn(
    variant === 'sidebar-expanded' &&
      'w-full h-auto px-2 py-2 justify-between text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
    variant === 'sidebar-collapsed' &&
      'h-10 w-10 p-0 justify-center text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
    className
  )

  const contentClasses = cn('w-64', 'mb-1')

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAction()
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className={triggerClasses} aria-label="Menu do usuário" data-testid="user-menu-trigger">
          <div className="flex items-center gap-2 min-w-0">
            <Avatar className={cn(variant === 'sidebar-collapsed' ? 'h-8 w-8' : 'h-7 w-7')}>
              <AvatarImage src={avatarUrl} alt={displayName} />
              <AvatarFallback className="bg-muted text-muted-foreground">
                {avatarUrl ? (
                  <span className="text-xs">{initials}</span>
                ) : (
                  <User className="h-4 w-4" data-testid="user-avatar-placeholder" />
                )}
              </AvatarFallback>
            </Avatar>

            {variant !== 'sidebar-collapsed' && (
              <div className="flex flex-col items-start min-w-0">
                <span className="text-sm font-medium truncate max-w-[140px]">
                  {displayName}
                </span>
                {variant === 'sidebar-expanded' && profileLabel && (
                  <span className="text-xs text-muted-foreground">{profileLabel}</span>
                )}
              </div>
            )}
          </div>

          {variant !== 'sidebar-collapsed' && <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        side="top"
        className={contentClasses}
      >
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none truncate">{displayName}</p>
            <p className="text-xs leading-none text-muted-foreground truncate">{displayEmail}</p>
            {profileLabel && <p className="text-xs leading-none text-muted-foreground">{profileLabel}</p>}
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href={profileHref} className="cursor-pointer">
            <User className="h-4 w-4" />
            Perfil
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href={accountHref} className="cursor-pointer">
            <Settings className="h-4 w-4" />
            Minha conta
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onSelect={handleLogout}
          disabled={isPending}
          className="text-destructive focus:text-destructive"
        >
          <LogOut className="h-4 w-4" />
          {isPending ? 'Saindo...' : 'Sair'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
