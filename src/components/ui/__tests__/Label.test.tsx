import React from 'react'
import { render, screen } from '@testing-library/react'
import { Label } from '../label'
import { Input } from '../input'

describe('Label Component', () => {
  // ===================
  // SNAPSHOT TESTS
  // ===================
  describe('Snapshots', () => {
    it('renders default label correctly', () => {
      const { container } = render(<Label>Email Address</Label>)
      expect(container.firstChild).toMatchSnapshot()
    })

    it('renders label with htmlFor correctly', () => {
      const { container } = render(<Label htmlFor="email">Email Address</Label>)
      expect(container.firstChild).toMatchSnapshot()
    })

    it('renders label with complex children correctly', () => {
      const { container } = render(
        <Label>
          Email Address <span className="text-destructive">*</span>
        </Label>
      )
      expect(container.firstChild).toMatchSnapshot()
    })
  })

  // ===================
  // STRUCTURAL TESTS
  // ===================
  describe('Structure', () => {
    it('renders children correctly', () => {
      render(<Label>Test Label</Label>)
      expect(screen.getByText('Test Label')).toBeInTheDocument()
    })

    it('renders as a label element', () => {
      render(<Label>Email</Label>)
      expect(screen.getByText('Email').tagName).toBe('LABEL')
    })

    it('supports htmlFor attribute', () => {
      render(
        <>
          <Label htmlFor="test-input">Test Label</Label>
          <Input id="test-input" />
        </>
      )

      const label = screen.getByText('Test Label')
      expect(label).toHaveAttribute('for', 'test-input')
    })
  })

  // ===================
  // ACCESSIBILITY TESTS
  // ===================
  describe('Accessibility', () => {
    it('associates with input via htmlFor', () => {
      render(
        <>
          <Label htmlFor="email-input">Email</Label>
          <Input id="email-input" />
        </>
      )

      const input = screen.getByLabelText('Email')
      expect(input).toBeInTheDocument()
    })

    it('label has correct htmlFor attribute for input association', () => {
      render(
        <>
          <Label htmlFor="focus-test">Click Me</Label>
          <Input id="focus-test" placeholder="Focus here" />
        </>
      )

      const label = screen.getByText('Click Me')
      const input = screen.getByPlaceholderText('Focus here')
      
      // Verify the label is correctly associated with the input
      expect(label).toHaveAttribute('for', 'focus-test')
      expect(input).toHaveAttribute('id', 'focus-test')
    })
  })

  // ===================
  // STYLE TESTS
  // ===================
  describe('Styles', () => {
    it('has base styles', () => {
      render(<Label data-testid="label">Label</Label>)
      const label = screen.getByTestId('label')

      expect(label).toHaveClass('text-sm')
      expect(label).toHaveClass('font-medium')
      expect(label).toHaveClass('leading-none')
    })

    it('applies custom className', () => {
      render(
        <Label className="custom-label" data-testid="label">
          Custom
        </Label>
      )
      expect(screen.getByTestId('label')).toHaveClass('custom-label')
    })

    it('handles peer-disabled styles', () => {
      render(<Label data-testid="label">Label</Label>)
      const label = screen.getByTestId('label')

      // Check that the peer-disabled classes are applied
      expect(label).toHaveClass('peer-disabled:cursor-not-allowed')
      expect(label).toHaveClass('peer-disabled:opacity-70')
    })
  })

  // ===================
  // REF FORWARDING TESTS
  // ===================
  describe('Ref Forwarding', () => {
    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLLabelElement>()
      render(<Label ref={ref}>Label</Label>)
      expect(ref.current).toBeInstanceOf(HTMLLabelElement)
    })
  })

  // ===================
  // INTEGRATION TESTS
  // ===================
  describe('Integration', () => {
    it('works correctly with Input component', () => {
      render(
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" placeholder="Enter your name" />
        </div>
      )

      expect(screen.getByLabelText('Name')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Enter your name')).toBeInTheDocument()
    })

    it('handles required indicator pattern', () => {
      render(
        <>
          <Label htmlFor="required-field">
            Required Field <span aria-hidden="true">*</span>
          </Label>
          <Input id="required-field" required />
        </>
      )

      expect(screen.getByText('*')).toBeInTheDocument()
      expect(screen.getByLabelText(/Required Field/)).toBeRequired()
    })
  })
})

