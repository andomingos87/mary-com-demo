import React from 'react'
import { render, screen } from '@testing-library/react'
import { MaryAiSidebar } from '@/components/mary-ai/MaryAiSidebar'
import { useMaryAi, useMaryAiToggle } from '@/components/providers/MaryAiProvider'
import { useOrganization } from '@/components/providers/OrganizationProvider'

jest.mock('@/components/providers/MaryAiProvider', () => ({
  useMaryAi: jest.fn(),
  useMaryAiToggle: jest.fn(),
}))

jest.mock('@/components/providers/OrganizationProvider', () => ({
  useOrganization: jest.fn(),
}))

jest.mock('@/components/mary-ai/MaryAiChatContent', () => ({
  getMaryAiIcebreakers: (
    profile: 'investor' | 'asset' | 'advisor' | null,
    context?: { currentPage?: string; projectCodename?: string }
  ) => {
    const codename = context?.projectCodename
    const isProjectPage = Boolean(context?.currentPage?.includes('/projects/'))
    if (profile === 'asset') {
      const projectPrompt = isProjectPage && codename ? `Pergunte sobre o projeto ${codename}` : 'Pergunte sobre este projeto'
      return [
        'O que a Mary AI pode fazer?',
        projectPrompt,
        'Suba Q&As e obtenha respostas',
        'Convide investidores para seu projeto',
      ]
    }
    if (profile === 'investor') {
      const projectPrompt = isProjectPage && codename ? `Pergunte sobre o projeto ${codename}` : 'Pergunte sobre um projeto'
      return [
        'O que a Mary AI pode fazer?',
        projectPrompt,
        'Suba Q&As e obtenha respostas',
        'Convide novos Ativos',
      ]
    }
    return [
      'O que a Mary AI pode fazer?',
      'Pergunte sobre um projeto',
      'Suba Q&As e obtenha respostas',
      'Explique o próximo passo da transação',
    ]
  },
  buildMaryAiDisclaimer: (organizationName: string) =>
    `A Mary AI pode cometer erros. A Mary não usa dados da "${organizationName}" para treinar os modelos.`,
  MaryAiChatContent: ({
    icebreakers,
    disclaimerText,
    assistantWelcomeMessage,
  }: {
    icebreakers: string[]
    disclaimerText?: string
    assistantWelcomeMessage: string
  }) => (
    <div>
      <p>{assistantWelcomeMessage}</p>
      {icebreakers.map((item) => (
        <button key={item} type="button">
          {item}
        </button>
      ))}
      {disclaimerText && <p>{disclaimerText}</p>}
    </div>
  ),
}))

const mockUseMaryAi = useMaryAi as jest.MockedFunction<typeof useMaryAi>
const mockUseMaryAiToggle = useMaryAiToggle as jest.MockedFunction<typeof useMaryAiToggle>
const mockUseOrganization = useOrganization as jest.MockedFunction<typeof useOrganization>

describe('MaryAiSidebar', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseMaryAi.mockReturnValue({
      isOpen: true,
      toggle: jest.fn(),
      setOpen: jest.fn(),
      currentPage: '/acme/projects/tiger',
      currentProfile: 'investor',
      projectCodename: 'tiger',
      showFirstGreeting: true,
      consumeFirstGreeting: jest.fn(),
    })
    mockUseMaryAiToggle.mockReturnValue({
      isOpen: true,
      toggle: jest.fn(),
      setOpen: jest.fn(),
    })
    mockUseOrganization.mockReturnValue({
      currentUser: { fullName: 'Ana' },
      organization: { name: 'Acme Capital' },
    } as never)
  })

  it('renders investor CTAs', () => {
    render(<MaryAiSidebar />)

    expect(screen.getByRole('button', { name: 'Pergunte sobre o projeto tiger' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Convide novos Ativos' })).toBeInTheDocument()
  })

  it('renders asset CTAs', () => {
    mockUseMaryAi.mockReturnValue({
      isOpen: true,
      toggle: jest.fn(),
      setOpen: jest.fn(),
      currentPage: '/acme/projects/tiger',
      currentProfile: 'asset',
      projectCodename: 'tiger',
      showFirstGreeting: true,
      consumeFirstGreeting: jest.fn(),
    })

    render(<MaryAiSidebar />)

    expect(screen.getByRole('button', { name: 'Pergunte sobre o projeto tiger' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Convide investidores para seu projeto' })).toBeInTheDocument()
  })

  it('renders advisor CTAs', () => {
    mockUseMaryAi.mockReturnValue({
      isOpen: true,
      toggle: jest.fn(),
      setOpen: jest.fn(),
      currentPage: '/acme/projects',
      currentProfile: 'advisor',
      projectCodename: undefined,
      showFirstGreeting: true,
      consumeFirstGreeting: jest.fn(),
    })

    render(<MaryAiSidebar />)

    expect(screen.getByRole('button', { name: 'Explique o próximo passo da transação' })).toBeInTheDocument()
  })

  it('renders greeting and disclaimer with company name', () => {
    render(<MaryAiSidebar />)

    expect(screen.getByText('Olá Ana, vamos começar?')).toBeInTheDocument()
    expect(
      screen.getByText('A Mary AI pode cometer erros. A Mary não usa dados da "Acme Capital" para treinar os modelos.')
    ).toBeInTheDocument()
  })
})

