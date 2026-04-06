import React from 'react'
import { render, screen } from '@testing-library/react'
import { Spinner, spinnerVariants } from '../spinner'

describe('Spinner Component', () => {
  // ===================
  // SNAPSHOT TESTS
  // ===================
  describe('Snapshots', () => {
    it('renders default spinner correctly', () => {
      const { container } = render(<Spinner />)
      expect(container.firstChild).toMatchSnapshot()
    })

    it('renders all size variants correctly', () => {
      const sizes = ['default', 'sm', 'lg', 'xl'] as const

      sizes.forEach((size) => {
        const { container } = render(<Spinner size={size} />)
        expect(container.firstChild).toMatchSnapshot()
      })
    })

    it('renders all color variants correctly', () => {
      const variants = ['default', 'secondary', 'muted', 'destructive', 'white'] as const

      variants.forEach((variant) => {
        const { container } = render(<Spinner variant={variant} />)
        expect(container.firstChild).toMatchSnapshot()
      })
    })
  })

  // ===================
  // ACCESSIBILITY TESTS
  // ===================
  describe('Accessibility', () => {
    it('has sr-only loading text', () => {
      render(<Spinner />)
      expect(screen.getByText('Carregando...')).toBeInTheDocument()
    })

    it('sr-only text is visually hidden', () => {
      render(<Spinner />)
      const srText = screen.getByText('Carregando...')
      expect(srText).toHaveClass('sr-only')
    })
  })

  // ===================
  // STYLE TESTS
  // ===================
  describe('Styles', () => {
    it('has base styles', () => {
      render(<Spinner data-testid="spinner" />)
      const spinner = screen.getByTestId('spinner')

      expect(spinner).toHaveClass('animate-spin')
      expect(spinner).toHaveClass('rounded-full')
      expect(spinner).toHaveClass('border-2')
      expect(spinner).toHaveClass('border-current')
      expect(spinner).toHaveClass('border-t-transparent')
    })

    it('default size has correct styles', () => {
      render(<Spinner data-testid="spinner" size="default" />)
      const spinner = screen.getByTestId('spinner')

      expect(spinner).toHaveClass('h-5')
      expect(spinner).toHaveClass('w-5')
    })

    it('sm size has correct styles', () => {
      render(<Spinner data-testid="spinner" size="sm" />)
      const spinner = screen.getByTestId('spinner')

      expect(spinner).toHaveClass('h-4')
      expect(spinner).toHaveClass('w-4')
    })

    it('lg size has correct styles', () => {
      render(<Spinner data-testid="spinner" size="lg" />)
      const spinner = screen.getByTestId('spinner')

      expect(spinner).toHaveClass('h-8')
      expect(spinner).toHaveClass('w-8')
    })

    it('xl size has correct styles', () => {
      render(<Spinner data-testid="spinner" size="xl" />)
      const spinner = screen.getByTestId('spinner')

      expect(spinner).toHaveClass('h-12')
      expect(spinner).toHaveClass('w-12')
    })

    it('default variant has correct color', () => {
      render(<Spinner data-testid="spinner" variant="default" />)
      const spinner = screen.getByTestId('spinner')

      expect(spinner).toHaveClass('text-primary')
    })

    it('destructive variant has correct color', () => {
      render(<Spinner data-testid="spinner" variant="destructive" />)
      const spinner = screen.getByTestId('spinner')

      expect(spinner).toHaveClass('text-destructive')
    })

    it('white variant has correct color', () => {
      render(<Spinner data-testid="spinner" variant="white" />)
      const spinner = screen.getByTestId('spinner')

      expect(spinner).toHaveClass('text-white')
    })

    it('applies custom className', () => {
      render(<Spinner data-testid="spinner" className="custom-spinner" />)
      expect(screen.getByTestId('spinner')).toHaveClass('custom-spinner')
    })
  })

  // ===================
  // VARIANTS FUNCTION TESTS
  // ===================
  describe('spinnerVariants function', () => {
    it('returns correct classes for default options', () => {
      const classes = spinnerVariants({ size: 'default', variant: 'default' })
      expect(classes).toContain('h-5')
      expect(classes).toContain('text-primary')
    })

    it('returns correct classes for sm size', () => {
      const classes = spinnerVariants({ size: 'sm' })
      expect(classes).toContain('h-4')
      expect(classes).toContain('w-4')
    })

    it('returns correct classes for muted variant', () => {
      const classes = spinnerVariants({ variant: 'muted' })
      expect(classes).toContain('text-muted-foreground')
    })
  })

  // ===================
  // REF FORWARDING TESTS
  // ===================
  describe('Ref Forwarding', () => {
    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>()
      render(<Spinner ref={ref} />)
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
    })
  })
})

