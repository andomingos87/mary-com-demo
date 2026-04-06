import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { ProtectedLayoutClient } from '@/app/(protected)/ProtectedLayoutClient'
import { useMaryAiToggle } from '@/components/providers/MaryAiProvider'
import { usePathname } from 'next/navigation'

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}))

jest.mock('@/components/providers/MaryAiProvider', () => ({
  useMaryAiToggle: jest.fn(),
}))

jest.mock('@/components/navigation/Sidebar', () => ({
  Sidebar: () => <div data-testid="desktop-nav-sidebar">Sidebar</div>,
  MobileSidebar: ({ isOpen }: { isOpen: boolean }) => (isOpen ? <div>Mobile Sidebar</div> : null),
  MobileMenuButton: ({ onClick }: { onClick: () => void }) => <button onClick={onClick}>Menu</button>,
}))

jest.mock('@/components/navigation/Header', () => ({
  Header: () => <header data-testid="main-header">Header</header>,
}))

jest.mock('@/components/mary-ai/MaryAiSidebar', () => ({
  MaryAiSidebar: () => <div data-testid="mary-push-sidebar">Mary Push Sidebar</div>,
}))

jest.mock('@/components/mary-ai/MaryAiQuickChatSheet', () => ({
  MaryAiQuickChatSheet: ({ open }: { open: boolean }) => (open ? <div data-testid="mary-sheet">Mary Sheet</div> : null),
}))

jest.mock('@/components/mary-ai/MaryAiEntryFallback', () => ({
  MaryAiEntryFallback: () => <button data-testid="mary-fallback">Mary Fallback</button>,
}))

const mockUseMaryAiToggle = useMaryAiToggle as jest.MockedFunction<typeof useMaryAiToggle>
const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>

function setViewportWidth(width: number) {
  Object.defineProperty(window, 'innerWidth', {
    configurable: true,
    writable: true,
    value: width,
  })
  window.dispatchEvent(new Event('resize'))
}

describe('ProtectedLayoutClient', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseMaryAiToggle.mockReturnValue({
      isOpen: true,
      toggle: jest.fn(),
      setOpen: jest.fn(),
    })
    mockUsePathname.mockReturnValue('/acme/dashboard')
  })

  it('renderiza somente push sidebar em desktop (>=1024)', async () => {
    setViewportWidth(1440)
    render(<ProtectedLayoutClient><div>Conteudo</div></ProtectedLayoutClient>)

    await waitFor(() => {
      expect(screen.getByTestId('mary-push-sidebar')).toBeInTheDocument()
    })

    expect(screen.queryByTestId('mary-sheet')).not.toBeInTheDocument()
  })

  it('renderiza somente sheet em mobile/tablet pequeno (<1024)', async () => {
    setViewportWidth(768)
    render(<ProtectedLayoutClient><div>Conteudo</div></ProtectedLayoutClient>)

    await waitFor(() => {
      expect(screen.getByTestId('mary-sheet')).toBeInTheDocument()
    })

    expect(screen.queryByTestId('mary-push-sidebar')).not.toBeInTheDocument()
  })

  it('exibe fallback da Mary quando a rota oculta o header', async () => {
    setViewportWidth(1440)
    mockUsePathname.mockReturnValue('/acme/validacao-epicos')

    render(<ProtectedLayoutClient><div>Conteudo</div></ProtectedLayoutClient>)

    await waitFor(() => {
      expect(screen.getByTestId('mary-fallback')).toBeInTheDocument()
    })

    expect(screen.queryByTestId('main-header')).not.toBeInTheDocument()
  })
})
