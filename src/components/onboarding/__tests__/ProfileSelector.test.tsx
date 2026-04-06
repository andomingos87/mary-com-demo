/**
 * ProfileSelector Component Tests
 * Phase 3.4 - Frontend: Wizard de Onboarding
 * Updated for CNPJ duplicate fix - includes checkExistingOnboarding
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ProfileSelector } from '../ProfileSelector'
import { startOnboarding, checkExistingOnboarding } from '@/lib/actions/onboarding'

// Mock the server actions
jest.mock('@/lib/actions/onboarding', () => ({
  startOnboarding: jest.fn(),
  checkExistingOnboarding: jest.fn(),
}))

const mockStartOnboarding = startOnboarding as jest.MockedFunction<typeof startOnboarding>
const mockCheckExistingOnboarding = checkExistingOnboarding as jest.MockedFunction<typeof checkExistingOnboarding>

describe('ProfileSelector', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Default: no existing onboarding
    mockCheckExistingOnboarding.mockResolvedValue({
      success: true,
      data: { hasIncompleteOrg: false },
    })
  })

  describe('rendering', () => {
    it('renders three profile options', async () => {
      render(<ProfileSelector onSelect={jest.fn()} />)

      await waitFor(() => {
        expect(screen.getByText('Investidor')).toBeInTheDocument()
      })
      expect(screen.getByText('Empresa / Ativo')).toBeInTheDocument()
      expect(screen.getByText('Advisor')).toBeInTheDocument()
    })

    it('renders profile descriptions', async () => {
      render(<ProfileSelector onSelect={jest.fn()} />)

      await waitFor(() => {
        expect(screen.getByText(/Private Equity, Venture Capital/)).toBeInTheDocument()
      })
      expect(screen.getByText(/Empresa buscando vender/)).toBeInTheDocument()
      expect(screen.getByText(/Boutique de M&A/)).toBeInTheDocument()
    })

    it('renders features for each profile', async () => {
      render(<ProfileSelector onSelect={jest.fn()} />)

      await waitFor(() => {
        expect(screen.getByText('Radar de oportunidades por tese')).toBeInTheDocument()
      })
      expect(screen.getByText('Virtual Data Room seguro')).toBeInTheDocument()
      expect(screen.getByText('Gestão de múltiplos projetos')).toBeInTheDocument()
    })

    it('renders continue button', async () => {
      render(<ProfileSelector onSelect={jest.fn()} />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Continuar/ })).toBeInTheDocument()
      })
    })

    it('disables continue button when no profile selected', async () => {
      render(<ProfileSelector onSelect={jest.fn()} />)

      await waitFor(() => {
        const continueButton = screen.getByRole('button', { name: /Continuar/ })
        expect(continueButton).toBeDisabled()
      })
    })

    it('shows loading spinner while checking existing onboarding', () => {
      mockCheckExistingOnboarding.mockImplementation(
        () => new Promise(() => {}) // Never resolves
      )
      render(<ProfileSelector onSelect={jest.fn()} />)

      // Should show spinner while checking
      expect(screen.queryByText('Investidor')).not.toBeInTheDocument()
    })
  })

  describe('selection', () => {
    it('selects investor profile when clicked', async () => {
      render(<ProfileSelector onSelect={jest.fn()} />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Selecionar perfil Investidor/ })).toBeInTheDocument()
      })

      const investorCard = screen.getByRole('button', { name: /Selecionar perfil Investidor/ })
      fireEvent.click(investorCard)

      expect(investorCard).toHaveAttribute('aria-pressed', 'true')
    })

    it('selects asset profile when clicked', async () => {
      render(<ProfileSelector onSelect={jest.fn()} />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Selecionar perfil Empresa/ })).toBeInTheDocument()
      })

      const assetCard = screen.getByRole('button', { name: /Selecionar perfil Empresa/ })
      fireEvent.click(assetCard)

      expect(assetCard).toHaveAttribute('aria-pressed', 'true')
    })

    it('selects advisor profile when clicked', async () => {
      render(<ProfileSelector onSelect={jest.fn()} />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Selecionar perfil Advisor/ })).toBeInTheDocument()
      })

      const advisorCard = screen.getByRole('button', { name: /Selecionar perfil Advisor/ })
      fireEvent.click(advisorCard)

      expect(advisorCard).toHaveAttribute('aria-pressed', 'true')
    })

    it('enables continue button when profile is selected', async () => {
      render(<ProfileSelector onSelect={jest.fn()} />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Selecionar perfil Investidor/ })).toBeInTheDocument()
      })

      const investorCard = screen.getByRole('button', { name: /Selecionar perfil Investidor/ })
      fireEvent.click(investorCard)

      const continueButton = screen.getByRole('button', { name: /Continuar/ })
      expect(continueButton).not.toBeDisabled()
    })

    it('deselects previous profile when new one is selected', async () => {
      render(<ProfileSelector onSelect={jest.fn()} />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Selecionar perfil Investidor/ })).toBeInTheDocument()
      })

      const investorCard = screen.getByRole('button', { name: /Selecionar perfil Investidor/ })
      const assetCard = screen.getByRole('button', { name: /Selecionar perfil Empresa/ })

      fireEvent.click(investorCard)
      expect(investorCard).toHaveAttribute('aria-pressed', 'true')

      fireEvent.click(assetCard)
      expect(investorCard).toHaveAttribute('aria-pressed', 'false')
      expect(assetCard).toHaveAttribute('aria-pressed', 'true')
    })
  })

  describe('submission without existing org', () => {
    it('calls startOnboarding when continue is clicked', async () => {
      mockStartOnboarding.mockResolvedValue({
        success: true,
        data: { orgId: 'test-org-id', step: 'cnpj_input', isResumed: false },
      })

      const handleSelect = jest.fn()
      render(<ProfileSelector onSelect={handleSelect} />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Selecionar perfil Investidor/ })).toBeInTheDocument()
      })

      const investorCard = screen.getByRole('button', { name: /Selecionar perfil Investidor/ })
      fireEvent.click(investorCard)

      const continueButton = screen.getByRole('button', { name: /Continuar/ })
      fireEvent.click(continueButton)

      await waitFor(() => {
        expect(mockStartOnboarding).toHaveBeenCalledWith('investor', { forceNew: false })
      })
    })

    it('calls onSelect with orgId and profile type on success', async () => {
      mockStartOnboarding.mockResolvedValue({
        success: true,
        data: { orgId: 'test-org-id', step: 'cnpj_input', isResumed: false },
      })

      const handleSelect = jest.fn()
      render(<ProfileSelector onSelect={handleSelect} />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Selecionar perfil Investidor/ })).toBeInTheDocument()
      })

      const investorCard = screen.getByRole('button', { name: /Selecionar perfil Investidor/ })
      fireEvent.click(investorCard)

      const continueButton = screen.getByRole('button', { name: /Continuar/ })
      fireEvent.click(continueButton)

      await waitFor(() => {
        expect(handleSelect).toHaveBeenCalledWith('test-org-id', 'investor')
      })
    })

    it('shows loading state during submission', async () => {
      mockStartOnboarding.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ 
          success: true, 
          data: { orgId: 'test', step: 'cnpj_input', isResumed: false } 
        }), 100))
      )

      render(<ProfileSelector onSelect={jest.fn()} />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Selecionar perfil Investidor/ })).toBeInTheDocument()
      })

      const investorCard = screen.getByRole('button', { name: /Selecionar perfil Investidor/ })
      fireEvent.click(investorCard)

      const continueButton = screen.getByRole('button', { name: /Continuar/ })
      fireEvent.click(continueButton)

      expect(await screen.findByText(/Criando conta/)).toBeInTheDocument()
    })

    it('shows error message on failure', async () => {
      mockStartOnboarding.mockResolvedValue({
        success: false,
        error: 'Erro ao criar organização',
      })

      render(<ProfileSelector onSelect={jest.fn()} />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Selecionar perfil Investidor/ })).toBeInTheDocument()
      })

      const investorCard = screen.getByRole('button', { name: /Selecionar perfil Investidor/ })
      fireEvent.click(investorCard)

      const continueButton = screen.getByRole('button', { name: /Continuar/ })
      fireEvent.click(continueButton)

      expect(await screen.findByText('Erro ao criar organização')).toBeInTheDocument()
    })
  })

  describe('resume modal with existing org', () => {
    const existingOrg = {
      id: 'existing-org-id',
      name: 'Empresa Teste',
      cnpj: '12345678000190',
      onboarding_step: 'cnpj_input' as const,
      profile_type: 'investor' as const,
    }

    beforeEach(() => {
      mockCheckExistingOnboarding.mockResolvedValue({
        success: true,
        data: { hasIncompleteOrg: true, organization: existingOrg },
      })
    })

    it('shows resume modal when user has existing incomplete org', async () => {
      render(<ProfileSelector onSelect={jest.fn()} />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Selecionar perfil Investidor/ })).toBeInTheDocument()
      })

      const investorCard = screen.getByRole('button', { name: /Selecionar perfil Investidor/ })
      fireEvent.click(investorCard)

      const continueButton = screen.getByRole('button', { name: /Continuar/ })
      fireEvent.click(continueButton)

      await waitFor(() => {
        expect(screen.getByText('Cadastro em andamento')).toBeInTheDocument()
      })
    })

    it('shows existing org details in modal', async () => {
      render(<ProfileSelector onSelect={jest.fn()} />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Selecionar perfil Investidor/ })).toBeInTheDocument()
      })

      const investorCard = screen.getByRole('button', { name: /Selecionar perfil Investidor/ })
      fireEvent.click(investorCard)

      const continueButton = screen.getByRole('button', { name: /Continuar/ })
      fireEvent.click(continueButton)

      await waitFor(() => {
        expect(screen.getByText('Empresa Teste')).toBeInTheDocument()
        expect(screen.getByText('12.345.678/0001-90')).toBeInTheDocument()
      })
    })

    it('calls startOnboarding with forceNew=false when resuming', async () => {
      mockStartOnboarding.mockResolvedValue({
        success: true,
        data: { orgId: 'existing-org-id', step: 'cnpj_input', isResumed: true },
      })

      const handleSelect = jest.fn()
      render(<ProfileSelector onSelect={handleSelect} />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Selecionar perfil Investidor/ })).toBeInTheDocument()
      })

      const investorCard = screen.getByRole('button', { name: /Selecionar perfil Investidor/ })
      fireEvent.click(investorCard)

      const continueButton = screen.getByRole('button', { name: /Continuar/ })
      fireEvent.click(continueButton)

      await waitFor(() => {
        expect(screen.getByText('Continuar cadastro')).toBeInTheDocument()
      })

      const resumeButton = screen.getByRole('button', { name: /Continuar cadastro/ })
      fireEvent.click(resumeButton)

      await waitFor(() => {
        expect(mockStartOnboarding).toHaveBeenCalledWith('investor', { forceNew: false })
      })
    })

    it('calls startOnboarding with forceNew=true when starting new', async () => {
      mockStartOnboarding.mockResolvedValue({
        success: true,
        data: { orgId: 'new-org-id', step: 'cnpj_input', isResumed: false },
      })

      const handleSelect = jest.fn()
      render(<ProfileSelector onSelect={handleSelect} />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Selecionar perfil Investidor/ })).toBeInTheDocument()
      })

      const investorCard = screen.getByRole('button', { name: /Selecionar perfil Investidor/ })
      fireEvent.click(investorCard)

      const continueButton = screen.getByRole('button', { name: /Continuar/ })
      fireEvent.click(continueButton)

      await waitFor(() => {
        expect(screen.getByText('Começar novo')).toBeInTheDocument()
      })

      const newButton = screen.getByRole('button', { name: /Começar novo/ })
      fireEvent.click(newButton)

      await waitFor(() => {
        expect(mockStartOnboarding).toHaveBeenCalledWith('investor', { forceNew: true })
      })
    })
  })

  describe('loading state', () => {
    it('disables profile cards when loading', async () => {
      render(<ProfileSelector onSelect={jest.fn()} isLoading />)

      await waitFor(() => {
        const investorCard = screen.getByRole('button', { name: /Selecionar perfil Investidor/ })
        expect(investorCard).toBeDisabled()
      })
    })

    it('disables continue button when loading', async () => {
      render(<ProfileSelector onSelect={jest.fn()} isLoading />)

      await waitFor(() => {
        const continueButton = screen.getByRole('button', { name: /Continuar/ })
        expect(continueButton).toBeDisabled()
      })
    })
  })

  describe('accessibility', () => {
    it('has aria-pressed on profile cards', async () => {
      render(<ProfileSelector onSelect={jest.fn()} />)

      await waitFor(() => {
        const investorCard = screen.getByRole('button', { name: /Selecionar perfil Investidor/ })
        expect(investorCard).toHaveAttribute('aria-pressed', 'false')
      })
    })

    it('has proper aria-label on profile cards', async () => {
      render(<ProfileSelector onSelect={jest.fn()} />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Selecionar perfil Investidor/ })).toBeInTheDocument()
      })
      expect(screen.getByRole('button', { name: /Selecionar perfil Empresa/ })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Selecionar perfil Advisor/ })).toBeInTheDocument()
    })
  })
})
