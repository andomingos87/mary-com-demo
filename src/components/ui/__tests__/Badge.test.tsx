import React from 'react'
import { render, screen } from '@testing-library/react'
import { Badge, badgeVariants } from '../badge'

describe('Badge Component', () => {
  // ===================
  // SNAPSHOT TESTS
  // ===================
  describe('Snapshots', () => {
    it('renders default badge correctly', () => {
      const { container } = render(<Badge>Default</Badge>)
      expect(container.firstChild).toMatchSnapshot()
    })

    it('renders all variants correctly', () => {
      const variants = ['default', 'secondary', 'destructive', 'outline'] as const

      variants.forEach((variant) => {
        const { container } = render(<Badge variant={variant}>{variant}</Badge>)
        expect(container.firstChild).toMatchSnapshot()
      })
    })
  })

  // ===================
  // STRUCTURAL TESTS
  // ===================
  describe('Structure', () => {
    it('renders children correctly', () => {
      render(<Badge>Test Badge</Badge>)
      expect(screen.getByText('Test Badge')).toBeInTheDocument()
    })

    it('renders as a div element', () => {
      render(<Badge data-testid="badge">Badge</Badge>)
      expect(screen.getByTestId('badge').tagName).toBe('DIV')
    })
  })

  // ===================
  // STYLE TESTS
  // ===================
  describe('Styles', () => {
    it('has base styles', () => {
      render(<Badge data-testid="badge">Badge</Badge>)
      const badge = screen.getByTestId('badge')

      expect(badge).toHaveClass('inline-flex')
      expect(badge).toHaveClass('items-center')
      expect(badge).toHaveClass('rounded-full')
      expect(badge).toHaveClass('border')
      expect(badge).toHaveClass('px-2.5')
      expect(badge).toHaveClass('py-0.5')
      expect(badge).toHaveClass('text-xs')
      expect(badge).toHaveClass('font-semibold')
    })

    it('default variant has correct styles', () => {
      render(<Badge data-testid="badge" variant="default">Default</Badge>)
      const badge = screen.getByTestId('badge')

      expect(badge).toHaveClass('bg-primary')
      expect(badge).toHaveClass('text-primary-foreground')
    })

    it('secondary variant has correct styles', () => {
      render(<Badge data-testid="badge" variant="secondary">Secondary</Badge>)
      const badge = screen.getByTestId('badge')

      expect(badge).toHaveClass('bg-secondary')
      expect(badge).toHaveClass('text-secondary-foreground')
    })

    it('destructive variant has correct styles', () => {
      render(<Badge data-testid="badge" variant="destructive">Destructive</Badge>)
      const badge = screen.getByTestId('badge')

      expect(badge).toHaveClass('bg-destructive')
      expect(badge).toHaveClass('text-destructive-foreground')
    })

    it('outline variant has correct styles', () => {
      render(<Badge data-testid="badge" variant="outline">Outline</Badge>)
      const badge = screen.getByTestId('badge')

      expect(badge).toHaveClass('text-foreground')
    })

    it('applies custom className', () => {
      render(
        <Badge className="custom-badge" data-testid="badge">
          Custom
        </Badge>
      )
      expect(screen.getByTestId('badge')).toHaveClass('custom-badge')
    })
  })

  // ===================
  // VARIANTS FUNCTION TESTS
  // ===================
  describe('badgeVariants function', () => {
    it('returns correct classes for default variant', () => {
      const classes = badgeVariants({ variant: 'default' })
      expect(classes).toContain('bg-primary')
      expect(classes).toContain('text-primary-foreground')
    })

    it('returns correct classes for secondary variant', () => {
      const classes = badgeVariants({ variant: 'secondary' })
      expect(classes).toContain('bg-secondary')
      expect(classes).toContain('text-secondary-foreground')
    })

    it('returns correct classes for destructive variant', () => {
      const classes = badgeVariants({ variant: 'destructive' })
      expect(classes).toContain('bg-destructive')
    })

    it('returns correct classes for outline variant', () => {
      const classes = badgeVariants({ variant: 'outline' })
      expect(classes).toContain('text-foreground')
    })
  })

  // ===================
  // ACCESSIBILITY TESTS
  // ===================
  describe('Accessibility', () => {
    it('supports aria-label', () => {
      render(<Badge aria-label="Status: Active">Active</Badge>)
      expect(screen.getByLabelText('Status: Active')).toBeInTheDocument()
    })

    it('has focus styles defined', () => {
      render(<Badge data-testid="badge">Focusable</Badge>)
      const badge = screen.getByTestId('badge')

      expect(badge).toHaveClass('focus:outline-none')
      expect(badge).toHaveClass('focus:ring-2')
      expect(badge).toHaveClass('focus:ring-ring')
    })
  })
})

