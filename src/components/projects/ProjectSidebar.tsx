'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { LayoutDashboard, Users, UserCheck, FileText, Folder } from 'lucide-react'

interface ProjectSidebarProps {
  orgSlug: string
  codename: string
}

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
  disabled?: boolean
}

export function ProjectSidebar({ orgSlug, codename }: ProjectSidebarProps) {
  const pathname = usePathname()
  const baseUrl = `/${orgSlug}/projects/${codename}`

  const navItems: NavItem[] = [
    { label: 'Overview', href: baseUrl, icon: LayoutDashboard },
    { label: 'Responsáveis', href: `${baseUrl}/responsibles`, icon: UserCheck },
    { label: 'Membros', href: `${baseUrl}/members`, icon: Users },
    { label: 'Teaser', href: `${baseUrl}/teaser`, icon: FileText, disabled: true },
    { label: 'VDR', href: `${baseUrl}/vdr`, icon: Folder },
  ]

  const isActive = (href: string) => {
    if (href === baseUrl) {
      return pathname === baseUrl || pathname === `${baseUrl}/`
    }
    return pathname.startsWith(href)
  }

  return (
    <nav className="w-48 shrink-0">
      <ul className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)

          if (item.disabled) {
            return (
              <li key={item.href}>
                <span className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground/60 cursor-not-allowed rounded-md">
                  <Icon className="h-4 w-4" />
                  {item.label}
                  <span className="ml-auto text-[10px] bg-muted px-1.5 py-0.5 rounded">
                    Em breve
                  </span>
                </span>
              </li>
            )
          }

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors',
                  active
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
