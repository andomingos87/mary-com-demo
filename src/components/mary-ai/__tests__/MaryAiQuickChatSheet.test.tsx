import React from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MaryAiQuickChatSheet } from '../MaryAiQuickChatSheet'
import { useOrganization } from '@/components/providers/OrganizationProvider'
import { usePathname } from 'next/navigation'

jest.mock('@/components/ui/sheet', () => ({
  Sheet: ({ open, children }: { open: boolean; children: React.ReactNode }) => (open ? <div>{children}</div> : null),
  SheetContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SheetHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SheetTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
  SheetDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
}))

jest.mock('@/components/ui/scroll-area', () => ({
  ScrollArea: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

jest.mock('@/components/ui/popover', () => ({
  Popover: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  PopoverTrigger: require('react').forwardRef(
    (
      { children, asChild, ...props }: { children: React.ReactNode; asChild?: boolean },
      ref: React.ForwardedRef<HTMLButtonElement>
    ) => {
      if (asChild && require('react').isValidElement(children)) {
        return require('react').cloneElement(children, { ...props, ref })
      }
      return (
        <button type="button" ref={ref} {...props}>
          {children}
        </button>
      )
    }
  ),
  PopoverContent: require('react').forwardRef(
    (
      { children, ...props }: { children: React.ReactNode },
      ref: React.ForwardedRef<HTMLDivElement>
    ) => (
      <div ref={ref} {...props}>
        {children}
      </div>
    )
  ),
}))

jest.mock('@/components/ui/tooltip', () => ({
  TooltipProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  Tooltip: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  TooltipTrigger: require('react').forwardRef(
    (
      { children, asChild, ...props }: { children: React.ReactNode; asChild?: boolean },
      ref: React.ForwardedRef<HTMLButtonElement>
    ) => {
      if (asChild && require('react').isValidElement(children)) {
        return require('react').cloneElement(children, { ...props, ref })
      }
      return (
        <button type="button" ref={ref} {...props}>
          {children}
        </button>
      )
    }
  ),
  TooltipContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

jest.mock('@/components/providers/OrganizationProvider', () => ({
  useOrganization: jest.fn(),
}))

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}))

const mockUseOrganization = useOrganization as jest.MockedFunction<typeof useOrganization>
const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>

describe('MaryAiQuickChatSheet', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    window.sessionStorage.clear()
    mockUsePathname.mockReturnValue('/acme/dashboard')
    mockUseOrganization.mockReturnValue({
      organization: { profileType: 'investor', name: 'Acme Capital' },
    } as never)
  })

  it('renders quick chat sheet with icebreakers', () => {
    render(<MaryAiQuickChatSheet open onOpenChange={jest.fn()} />)

    expect(screen.getByText('Com o que posso te ajudar')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'O que a Mary AI pode fazer?' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Suba Q&As e obtenha respostas' })).toBeInTheDocument()
    expect(
      screen.getByText('A Mary AI pode cometer erros. A Mary não usa dados da "Acme Capital" para treinar os modelos.')
    ).toBeInTheDocument()
  })

  it('fills input when clicking an icebreaker', () => {
    render(<MaryAiQuickChatSheet open onOpenChange={jest.fn()} />)

    fireEvent.click(screen.getByRole('button', { name: 'Pergunte sobre um projeto' }))

    expect(screen.getByLabelText('Mensagem para Mary AI')).toHaveValue('Pergunte sobre um projeto')
  })

  it('shows asset CTAs when profile is asset', () => {
    mockUseOrganization.mockReturnValue({
      organization: { profileType: 'asset', name: 'Asset Co' },
    } as never)

    render(<MaryAiQuickChatSheet open onOpenChange={jest.fn()} />)

    expect(screen.getByRole('button', { name: 'Pergunte sobre este projeto' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Convide investidores para seu projeto' })).toBeInTheDocument()
  })

  it('prioriza CTA contextual quando está em rota de projeto', () => {
    mockUsePathname.mockReturnValue('/acme/projects/tiger')

    render(<MaryAiQuickChatSheet open onOpenChange={jest.fn()} />)

    expect(screen.getByRole('button', { name: 'Pergunte sobre o projeto tiger' })).toBeInTheDocument()
  })

  it('varia CTA quando está na rota de feed', () => {
    mockUsePathname.mockReturnValue('/acme/feed')

    render(<MaryAiQuickChatSheet open onOpenChange={jest.fn()} />)

    expect(screen.getByRole('button', { name: 'Resuma os eventos do feed' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Pergunte sobre um projeto' })).not.toBeInTheDocument()
  })

  it('shows advisor CTAs when profile is advisor', () => {
    mockUseOrganization.mockReturnValue({
      organization: { profileType: 'advisor', name: 'Advisor Co' },
    } as never)

    render(<MaryAiQuickChatSheet open onOpenChange={jest.fn()} />)

    expect(screen.getByRole('button', { name: 'Explique o próximo passo da transação' })).toBeInTheDocument()
  })

  it('inserts mention token from @ menu', () => {
    render(<MaryAiQuickChatSheet open onOpenChange={jest.fn()} />)

    fireEvent.click(screen.getByRole('button', { name: 'Marcar páginas ou documentos' }))
    fireEvent.click(screen.getByRole('button', { name: '@Q&A Projeto Prioritário' }))

    expect(screen.getByLabelText('Mensagem para Mary AI')).toHaveValue('@Q&A Projeto Prioritário')
  })

  it('seeds input with contextual initial message when open', () => {
    render(
      <MaryAiQuickChatSheet
        open
        onOpenChange={jest.fn()}
        initialMessage="Contexto do Passo 1 para Mary AI"
      />
    )

    expect(screen.getByLabelText('Mensagem para Mary AI')).toHaveValue('Contexto do Passo 1 para Mary AI')
  })

  it('adds file attachment and sends a message with mock reply', async () => {
    render(<MaryAiQuickChatSheet open onOpenChange={jest.fn()} />)

    const inputFile = screen.getByTestId('mary-ai-file-input') as HTMLInputElement
    const file = new File(['test-content'], 'briefing.pdf', { type: 'application/pdf' })
    fireEvent.change(inputFile, { target: { files: [file] } })

    expect(screen.getByText('briefing.pdf')).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Mensagem para Mary AI'), {
      target: { value: 'Ajuda geral' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Enviar mensagem' }))

    expect(screen.getByText('Ajuda geral')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText(/Recebi sua solicitação/i)).toBeInTheDocument()
    })
  })

  it('does not replay persisted first greeting when greeting was already consumed', async () => {
    const persistedMessages = [
      { id: 'assistant-first-greeting', role: 'assistant', content: 'Prazer, sou a Mary AI. Estarei sempre aqui!' },
      { id: 'assistant-welcome', role: 'assistant', content: 'Olá! Sou a Mary AI.' },
    ]
    window.sessionStorage.setItem('mary_ai_chat_history:acme', JSON.stringify(persistedMessages))
    window.sessionStorage.setItem('mary_ai_first_greeting_seen:acme', '1')

    render(<MaryAiQuickChatSheet open onOpenChange={jest.fn()} />)

    await waitFor(() => {
      expect(screen.queryByText('Prazer, sou a Mary AI. Estarei sempre aqui!')).not.toBeInTheDocument()
    })
  })
})

