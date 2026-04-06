/**
 * ConfidenceIndicator Component Tests
 * Phase 3.4 - Frontend: Wizard de Onboarding
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import { ConfidenceIndicator } from '../ConfidenceIndicator'

describe('ConfidenceIndicator', () => {
  describe('rendering', () => {
    it('renders high confidence indicator correctly', () => {
      render(<ConfidenceIndicator confidence="high" />)
      
      const indicator = screen.getByRole('status')
      expect(indicator).toBeInTheDocument()
      expect(indicator).toHaveAttribute('aria-label', 'Alta confiança: Dado verificado automaticamente')
      expect(indicator).toHaveClass('bg-green-50')
    })

    it('renders medium confidence indicator correctly', () => {
      render(<ConfidenceIndicator confidence="medium" />)
      
      const indicator = screen.getByRole('status')
      expect(indicator).toBeInTheDocument()
      expect(indicator).toHaveAttribute('aria-label', 'Média confiança: Verifique se os dados estão corretos')
      expect(indicator).toHaveClass('bg-yellow-50')
    })

    it('renders low confidence indicator correctly', () => {
      render(<ConfidenceIndicator confidence="low" />)
      
      const indicator = screen.getByRole('status')
      expect(indicator).toBeInTheDocument()
      expect(indicator).toHaveAttribute('aria-label', 'Confirmar dados: Este dado precisa de confirmação manual')
      expect(indicator).toHaveClass('bg-gray-50')
    })
  })

  describe('label display', () => {
    it('shows label when showLabel is true', () => {
      render(<ConfidenceIndicator confidence="high" showLabel />)
      
      expect(screen.getByText('Alta confiança')).toBeInTheDocument()
    })

    it('hides label when showLabel is false', () => {
      render(<ConfidenceIndicator confidence="high" showLabel={false} />)
      
      expect(screen.queryByText('Alta confiança')).not.toBeInTheDocument()
    })

    it('shows correct label for medium confidence', () => {
      render(<ConfidenceIndicator confidence="medium" showLabel />)
      
      expect(screen.getByText('Média confiança')).toBeInTheDocument()
    })

    it('shows correct label for low confidence', () => {
      render(<ConfidenceIndicator confidence="low" showLabel />)
      
      expect(screen.getByText('Confirmar dados')).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('has correct aria-label for high confidence', () => {
      render(<ConfidenceIndicator confidence="high" />)
      
      const indicator = screen.getByRole('status')
      expect(indicator).toHaveAttribute(
        'aria-label',
        'Alta confiança: Dado verificado automaticamente'
      )
    })

    it('has correct aria-label for medium confidence', () => {
      render(<ConfidenceIndicator confidence="medium" />)
      
      const indicator = screen.getByRole('status')
      expect(indicator).toHaveAttribute(
        'aria-label',
        'Média confiança: Verifique se os dados estão corretos'
      )
    })

    it('has correct aria-label for low confidence', () => {
      render(<ConfidenceIndicator confidence="low" />)
      
      const indicator = screen.getByRole('status')
      expect(indicator).toHaveAttribute(
        'aria-label',
        'Confirmar dados: Este dado precisa de confirmação manual'
      )
    })
  })

  describe('size variants', () => {
    it('applies sm size classes by default', () => {
      render(<ConfidenceIndicator confidence="high" />)
      
      const indicator = screen.getByRole('status')
      expect(indicator).toHaveClass('text-xs')
    })

    it('applies md size classes when specified', () => {
      render(<ConfidenceIndicator confidence="high" size="md" />)
      
      const indicator = screen.getByRole('status')
      expect(indicator).toHaveClass('text-sm')
    })
  })

  describe('styling', () => {
    it('applies correct background color for high confidence', () => {
      render(<ConfidenceIndicator confidence="high" />)
      
      const indicator = screen.getByRole('status')
      expect(indicator).toHaveClass('bg-green-50')
      expect(indicator).toHaveClass('border-green-200')
    })

    it('applies correct background color for medium confidence', () => {
      render(<ConfidenceIndicator confidence="medium" />)
      
      const indicator = screen.getByRole('status')
      expect(indicator).toHaveClass('bg-yellow-50')
      expect(indicator).toHaveClass('border-yellow-200')
    })

    it('applies correct background color for low confidence', () => {
      render(<ConfidenceIndicator confidence="low" />)
      
      const indicator = screen.getByRole('status')
      expect(indicator).toHaveClass('bg-gray-50')
      expect(indicator).toHaveClass('border-gray-200')
    })

    it('accepts custom className', () => {
      render(<ConfidenceIndicator confidence="high" className="custom-class" />)
      
      const indicator = screen.getByRole('status')
      expect(indicator).toHaveClass('custom-class')
    })
  })
})
