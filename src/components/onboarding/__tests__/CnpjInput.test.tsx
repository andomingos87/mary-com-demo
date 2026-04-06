/**
 * CnpjInput Component Tests
 * Phase 3.4 - Frontend: Wizard de Onboarding
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CnpjInput } from '../CnpjInput'
import { enrichFromCnpjAction } from '@/lib/actions/onboarding'
import type { EnrichedCnpjData } from '@/types/onboarding'

// Mock the server action
jest.mock('@/lib/actions/onboarding', () => ({
  enrichFromCnpjAction: jest.fn(),
}))

const mockEnrichFromCnpjAction = enrichFromCnpjAction as jest.MockedFunction<typeof enrichFromCnpjAction>

const mockEnrichedData: EnrichedCnpjData = {
  cnpj: '12345678000190',
  razaoSocial: 'Empresa Teste LTDA',
  nomeFantasia: 'Empresa Teste',
  cnaeCode: '6201-5',
  cnaeDescription: 'Desenvolvimento de software',
  situacaoCadastral: 'ATIVA',
  naturezaJuridica: '206-2 - Sociedade Empresária Limitada',
  capitalSocial: 100000,
  porte: 'PEQUENO',
  dataInicioAtividade: '2020-01-01',
  address: {
    logradouro: 'Rua Teste',
    numero: '123',
    complemento: 'Sala 1',
    bairro: 'Centro',
    cidade: 'São Paulo',
    uf: 'SP',
    cep: '01234-567',
  },
  telefone: '11999999999',
  email: 'contato@empresa.com',
  shareholders: [
    { nome: 'Sócio 1', cpfCnpj: '123.456.789-00', qualificacao: 'Sócio Administrador' },
  ],
  confidence: 'high',
  fetchedAt: new Date().toISOString(),
}

describe('CnpjInput', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('rendering', () => {
    it('renders CNPJ input field', () => {
      render(
        <CnpjInput
          organizationId="test-org"
          onEnriched={jest.fn()}
          onBack={jest.fn()}
        />
      )

      expect(screen.getByLabelText('CNPJ')).toBeInTheDocument()
    })

    it('renders search button', () => {
      render(
        <CnpjInput
          organizationId="test-org"
          onEnriched={jest.fn()}
          onBack={jest.fn()}
        />
      )

      expect(screen.getByRole('button', { name: /Buscar dados/ })).toBeInTheDocument()
    })

    it('renders back button', () => {
      render(
        <CnpjInput
          organizationId="test-org"
          onEnriched={jest.fn()}
          onBack={jest.fn()}
        />
      )

      expect(screen.getByRole('button', { name: /Voltar/ })).toBeInTheDocument()
    })

    it('disables search button initially', () => {
      render(
        <CnpjInput
          organizationId="test-org"
          onEnriched={jest.fn()}
          onBack={jest.fn()}
        />
      )

      expect(screen.getByRole('button', { name: /Buscar dados/ })).toBeDisabled()
    })

    it('disables continue button initially', () => {
      render(
        <CnpjInput
          organizationId="test-org"
          onEnriched={jest.fn()}
          onBack={jest.fn()}
        />
      )

      expect(screen.getByRole('button', { name: /Continuar/ })).toBeDisabled()
    })
  })

  describe('CNPJ formatting', () => {
    it('formats CNPJ as user types', async () => {
      const user = userEvent.setup()
      render(
        <CnpjInput
          organizationId="test-org"
          onEnriched={jest.fn()}
          onBack={jest.fn()}
        />
      )

      const input = screen.getByLabelText('CNPJ')
      await user.type(input, '12345678000190')

      expect(input).toHaveValue('12.345.678/0001-90')
    })

    it('only allows numeric input', async () => {
      const user = userEvent.setup()
      render(
        <CnpjInput
          organizationId="test-org"
          onEnriched={jest.fn()}
          onBack={jest.fn()}
        />
      )

      const input = screen.getByLabelText('CNPJ')
      await user.type(input, '12abc345def678ghi000jkl190')

      expect(input).toHaveValue('12.345.678/0001-90')
    })

    it('limits to 14 digits', async () => {
      const user = userEvent.setup()
      render(
        <CnpjInput
          organizationId="test-org"
          onEnriched={jest.fn()}
          onBack={jest.fn()}
        />
      )

      const input = screen.getByLabelText('CNPJ')
      await user.type(input, '123456780001901234567890')

      expect(input).toHaveValue('12.345.678/0001-90')
    })
  })

  describe('CNPJ validation', () => {
    it('shows valid indicator for valid CNPJ', async () => {
      const user = userEvent.setup()
      render(
        <CnpjInput
          organizationId="test-org"
          onEnriched={jest.fn()}
          onBack={jest.fn()}
        />
      )

      const input = screen.getByLabelText('CNPJ')
      // Using a valid CNPJ with correct check digits
      await user.type(input, '11222333000181')

      // Should enable search button for valid CNPJ
      expect(screen.getByRole('button', { name: /Buscar dados/ })).not.toBeDisabled()
    })

    it('shows invalid indicator for invalid CNPJ', async () => {
      const user = userEvent.setup()
      render(
        <CnpjInput
          organizationId="test-org"
          onEnriched={jest.fn()}
          onBack={jest.fn()}
        />
      )

      const input = screen.getByLabelText('CNPJ')
      await user.type(input, '11111111111111')

      expect(screen.getByText(/CNPJ inválido/)).toBeInTheDocument()
    })

    it('keeps search button disabled for invalid CNPJ', async () => {
      const user = userEvent.setup()
      render(
        <CnpjInput
          organizationId="test-org"
          onEnriched={jest.fn()}
          onBack={jest.fn()}
        />
      )

      const input = screen.getByLabelText('CNPJ')
      await user.type(input, '11111111111111')

      expect(screen.getByRole('button', { name: /Buscar dados/ })).toBeDisabled()
    })
  })

  describe('search functionality', () => {
    it('calls enrichFromCnpjAction when search is clicked', async () => {
      mockEnrichFromCnpjAction.mockResolvedValue({
        success: true,
        data: mockEnrichedData,
      })

      const user = userEvent.setup()
      render(
        <CnpjInput
          organizationId="test-org"
          onEnriched={jest.fn()}
          onBack={jest.fn()}
        />
      )

      const input = screen.getByLabelText('CNPJ')
      await user.type(input, '11222333000181')

      const searchButton = screen.getByRole('button', { name: /Buscar dados/ })
      fireEvent.click(searchButton)

      await waitFor(() => {
        expect(mockEnrichFromCnpjAction).toHaveBeenCalledWith('test-org', '11222333000181')
      })
    })

    it('shows loading state during search', async () => {
      mockEnrichFromCnpjAction.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ success: true, data: mockEnrichedData }), 100))
      )

      const user = userEvent.setup()
      render(
        <CnpjInput
          organizationId="test-org"
          onEnriched={jest.fn()}
          onBack={jest.fn()}
        />
      )

      const input = screen.getByLabelText('CNPJ')
      await user.type(input, '11222333000181')

      const searchButton = screen.getByRole('button', { name: /Buscar dados/ })
      fireEvent.click(searchButton)

      expect(await screen.findByText(/Buscando dados/)).toBeInTheDocument()
    })

    it('shows preview data after successful search', async () => {
      mockEnrichFromCnpjAction.mockResolvedValue({
        success: true,
        data: mockEnrichedData,
      })

      const user = userEvent.setup()
      render(
        <CnpjInput
          organizationId="test-org"
          onEnriched={jest.fn()}
          onBack={jest.fn()}
        />
      )

      const input = screen.getByLabelText('CNPJ')
      await user.type(input, '11222333000181')

      const searchButton = screen.getByRole('button', { name: /Buscar dados/ })
      fireEvent.click(searchButton)

      expect(await screen.findByText('Empresa Teste')).toBeInTheDocument()
      expect(screen.getByText('Empresa Teste LTDA')).toBeInTheDocument()
    })

    it('shows error message on failed search', async () => {
      mockEnrichFromCnpjAction.mockResolvedValue({
        success: false,
        error: 'CNPJ não encontrado',
      })

      const user = userEvent.setup()
      render(
        <CnpjInput
          organizationId="test-org"
          onEnriched={jest.fn()}
          onBack={jest.fn()}
        />
      )

      const input = screen.getByLabelText('CNPJ')
      await user.type(input, '11222333000181')

      const searchButton = screen.getByRole('button', { name: /Buscar dados/ })
      fireEvent.click(searchButton)

      expect(await screen.findByText(/CNPJ não encontrado/)).toBeInTheDocument()
    })
  })

  describe('navigation', () => {
    it('calls onBack when back button is clicked', () => {
      const handleBack = jest.fn()
      render(
        <CnpjInput
          organizationId="test-org"
          onEnriched={jest.fn()}
          onBack={handleBack}
        />
      )

      const backButton = screen.getByRole('button', { name: /Voltar/ })
      fireEvent.click(backButton)

      expect(handleBack).toHaveBeenCalled()
    })

    it('calls onEnriched when continue is clicked after successful search', async () => {
      mockEnrichFromCnpjAction.mockResolvedValue({
        success: true,
        data: mockEnrichedData,
      })

      const handleEnriched = jest.fn()
      const user = userEvent.setup()
      render(
        <CnpjInput
          organizationId="test-org"
          onEnriched={handleEnriched}
          onBack={jest.fn()}
        />
      )

      const input = screen.getByLabelText('CNPJ')
      await user.type(input, '11222333000181')

      const searchButton = screen.getByRole('button', { name: /Buscar dados/ })
      fireEvent.click(searchButton)

      await waitFor(() => {
        expect(screen.getByText('Empresa Teste')).toBeInTheDocument()
      })

      const continueButton = screen.getByRole('button', { name: /Continuar/ })
      fireEvent.click(continueButton)

      expect(handleEnriched).toHaveBeenCalledWith(mockEnrichedData)
    })
  })

  describe('keyboard navigation', () => {
    it('triggers search on Enter key', async () => {
      mockEnrichFromCnpjAction.mockResolvedValue({
        success: true,
        data: mockEnrichedData,
      })

      const user = userEvent.setup()
      render(
        <CnpjInput
          organizationId="test-org"
          onEnriched={jest.fn()}
          onBack={jest.fn()}
        />
      )

      const input = screen.getByLabelText('CNPJ')
      await user.type(input, '11222333000181{Enter}')

      await waitFor(() => {
        expect(mockEnrichFromCnpjAction).toHaveBeenCalled()
      })
    })
  })
})
