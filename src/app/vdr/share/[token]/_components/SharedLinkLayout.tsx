import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface SharedLinkLayoutProps {
  children: React.ReactNode
  fullWidth?: boolean
}

export function SharedLinkLayout({ children, fullWidth }: SharedLinkLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header com Logo */}
      <header className="py-6 px-4 flex justify-center border-b">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logotipo.png"
            alt="Mary"
            width={120}
            height={40}
            className="h-10 w-auto"
            priority
          />
        </Link>
      </header>

      {/* Conteúdo Principal */}
      <main className={cn(
        "flex-1 flex items-center justify-center py-12 px-4",
        fullWidth && "items-start pt-6"
      )}>
        {children}
      </main>

      {/* Footer */}
      <footer className="py-4 px-4 border-t text-center text-sm text-muted-foreground">
        <p>
          Powered by{' '}
          <Link href="/" className="hover:underline">
            Mary AI
          </Link>
          {' • '}
          <Link href="/terms" className="hover:underline">
            Termos
          </Link>
          {' • '}
          <Link href="/privacy" className="hover:underline">
            Privacidade
          </Link>
        </p>
      </footer>
    </div>
  )
}
