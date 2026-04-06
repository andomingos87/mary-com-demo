/**
 * StepIndicator Component Tests
 * Phase 3.4 - Frontend: Wizard de Onboarding
 */

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { StepIndicator, type StepConfig } from '../StepIndicator'
import type { OnboardingStep } from '@/types/database'

const mockSteps: StepConfig[] = [
  { id: 'profile_selection', label: 'Perfil', description: 'Escolha seu tipo' },
  { id: 'cnpj_input', label: 'CNPJ', description: 'Dados da empresa' },
  { id: 'data_confirmation', label: 'Confirmar', description: 'Verifique os dados' },
  { id: 'profile_details', label: 'Detalhes', description: 'Informações adicionais' },
]

describe('StepIndicator', () => {
  describe('rendering', () => {
    it('renders all steps', () => {
      render(
        <StepIndicator
          steps={mockSteps}
          currentStep="profile_selection"
          completedSteps={[]}
        />
      )

      expect(screen.getByText('Perfil')).toBeInTheDocument()
      expect(screen.getByText('CNPJ')).toBeInTheDocument()
      expect(screen.getByText('Confirmar')).toBeInTheDocument()
      expect(screen.getByText('Detalhes')).toBeInTheDocument()
    })

    it('shows step numbers', () => {
      render(
        <StepIndicator
          steps={mockSteps}
          currentStep="profile_selection"
          completedSteps={[]}
        />
      )

      expect(screen.getByText('1')).toBeInTheDocument()
      expect(screen.getByText('2')).toBeInTheDocument()
      expect(screen.getByText('3')).toBeInTheDocument()
      expect(screen.getByText('4')).toBeInTheDocument()
    })

    it('shows progress percentage', () => {
      render(
        <StepIndicator
          steps={mockSteps}
          currentStep="cnpj_input"
          completedSteps={['profile_selection']}
        />
      )

      expect(screen.getByText(/50% concluído/)).toBeInTheDocument()
    })
  })

  describe('step states', () => {
    it('marks current step correctly', () => {
      render(
        <StepIndicator
          steps={mockSteps}
          currentStep="cnpj_input"
          completedSteps={['profile_selection']}
        />
      )

      const currentStepButton = screen.getByRole('button', { name: /Step 2.*current/ })
      expect(currentStepButton).toBeInTheDocument()
    })

    it('marks completed steps with check icon', () => {
      render(
        <StepIndicator
          steps={mockSteps}
          currentStep="data_confirmation"
          completedSteps={['profile_selection', 'cnpj_input']}
        />
      )

      // Completed steps should not show numbers
      expect(screen.queryByText('1')).not.toBeInTheDocument()
      expect(screen.queryByText('2')).not.toBeInTheDocument()
      // Current and pending steps should show numbers
      expect(screen.getByText('3')).toBeInTheDocument()
      expect(screen.getByText('4')).toBeInTheDocument()
    })

    it('marks pending steps correctly', () => {
      render(
        <StepIndicator
          steps={mockSteps}
          currentStep="profile_selection"
          completedSteps={[]}
        />
      )

      const pendingStepButton = screen.getByRole('button', { name: /Step 4.*pending/ })
      expect(pendingStepButton).toBeInTheDocument()
    })
  })

  describe('navigation', () => {
    it('calls onStepClick when clicking completed step', () => {
      const handleStepClick = jest.fn()
      
      render(
        <StepIndicator
          steps={mockSteps}
          currentStep="data_confirmation"
          completedSteps={['profile_selection', 'cnpj_input']}
          onStepClick={handleStepClick}
        />
      )

      const completedStepButton = screen.getByRole('button', { name: /Step 1.*completed/ })
      fireEvent.click(completedStepButton)

      expect(handleStepClick).toHaveBeenCalledWith('profile_selection')
    })

    it('calls onStepClick when clicking current step', () => {
      const handleStepClick = jest.fn()
      
      render(
        <StepIndicator
          steps={mockSteps}
          currentStep="cnpj_input"
          completedSteps={['profile_selection']}
          onStepClick={handleStepClick}
        />
      )

      const currentStepButton = screen.getByRole('button', { name: /Step 2.*current/ })
      fireEvent.click(currentStepButton)

      expect(handleStepClick).toHaveBeenCalledWith('cnpj_input')
    })

    it('does not call onStepClick when clicking pending step', () => {
      const handleStepClick = jest.fn()
      
      render(
        <StepIndicator
          steps={mockSteps}
          currentStep="profile_selection"
          completedSteps={[]}
          onStepClick={handleStepClick}
        />
      )

      const pendingStepButton = screen.getByRole('button', { name: /Step 4.*pending/ })
      fireEvent.click(pendingStepButton)

      expect(handleStepClick).not.toHaveBeenCalled()
    })

    it('disables pending steps', () => {
      render(
        <StepIndicator
          steps={mockSteps}
          currentStep="profile_selection"
          completedSteps={[]}
          onStepClick={jest.fn()}
        />
      )

      const pendingStepButton = screen.getByRole('button', { name: /Step 4.*pending/ })
      expect(pendingStepButton).toBeDisabled()
    })
  })

  describe('vertical orientation', () => {
    it('renders in vertical layout', () => {
      render(
        <StepIndicator
          steps={mockSteps}
          currentStep="profile_selection"
          completedSteps={[]}
          orientation="vertical"
        />
      )

      // In vertical mode, descriptions should be visible
      expect(screen.getByText('Escolha seu tipo')).toBeInTheDocument()
      expect(screen.getByText('Dados da empresa')).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('has aria-current on current step', () => {
      render(
        <StepIndicator
          steps={mockSteps}
          currentStep="cnpj_input"
          completedSteps={['profile_selection']}
        />
      )

      const currentStepButton = screen.getByRole('button', { name: /Step 2.*current/ })
      expect(currentStepButton).toHaveAttribute('aria-current', 'step')
    })

    it('does not have aria-current on non-current steps', () => {
      render(
        <StepIndicator
          steps={mockSteps}
          currentStep="cnpj_input"
          completedSteps={['profile_selection']}
        />
      )

      const completedStepButton = screen.getByRole('button', { name: /Step 1.*completed/ })
      expect(completedStepButton).not.toHaveAttribute('aria-current')
    })
  })
})
