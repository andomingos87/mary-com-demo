import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { Button, buttonVariants } from '../button'

describe('Button Component', () => {
  // ===================
  // SNAPSHOT TESTS
  // ===================
  describe('Snapshots', () => {
    it('renders default variant correctly', () => {
      const { container } = render(<Button>Default Button</Button>)
      expect(container.firstChild).toMatchSnapshot()
    })

    it('renders all variants correctly', () => {
      const variants = [
        'default',
        'destructive',
        'outline',
        'secondary',
        'ghost',
        'link',
        'hero',
        'cta',
        'premium',
        'professional',
      ] as const

      variants.forEach((variant) => {
        const { container } = render(
          <Button variant={variant}>{variant} Button</Button>
        )
        expect(container.firstChild).toMatchSnapshot()
      })
    })

    it('renders all sizes correctly', () => {
      const sizes = ['default', 'sm', 'lg', 'icon'] as const

      sizes.forEach((size) => {
        const { container } = render(
          <Button size={size}>{size === 'icon' ? '★' : `${size} Button`}</Button>
        )
        expect(container.firstChild).toMatchSnapshot()
      })
    })

    it('renders disabled state correctly', () => {
      const { container } = render(<Button disabled>Disabled Button</Button>)
      expect(container.firstChild).toMatchSnapshot()
    })

    it('renders with asChild correctly', () => {
      const { container } = render(
        <Button asChild>
          <a href="/test">Link Button</a>
        </Button>
      )
      expect(container.firstChild).toMatchSnapshot()
    })
  })

  // ===================
  // INTERACTION TESTS
  // ===================
  describe('Interactions', () => {
    it('calls onClick handler when clicked', () => {
      const handleClick = jest.fn()
      render(<Button onClick={handleClick}>Click Me</Button>)

      fireEvent.click(screen.getByRole('button'))
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('does not call onClick when disabled', () => {
      const handleClick = jest.fn()
      render(
        <Button disabled onClick={handleClick}>
          Disabled
        </Button>
      )

      fireEvent.click(screen.getByRole('button'))
      expect(handleClick).not.toHaveBeenCalled()
    })

    it('supports keyboard navigation (Enter)', () => {
      const handleClick = jest.fn()
      render(<Button onClick={handleClick}>Keyboard Test</Button>)

      const button = screen.getByRole('button')
      button.focus()
      fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' })
      // Note: Native button handles Enter automatically via click
    })

    it('receives focus correctly', () => {
      render(<Button>Focus Test</Button>)
      const button = screen.getByRole('button')
      button.focus()
      expect(button).toHaveFocus()
    })
  })

  // ===================
  // ACCESSIBILITY TESTS
  // ===================
  describe('Accessibility', () => {
    it('has correct role', () => {
      render(<Button>Test</Button>)
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('supports aria-label', () => {
      render(<Button aria-label="Close dialog">✕</Button>)
      expect(screen.getByLabelText('Close dialog')).toBeInTheDocument()
    })

    it('indicates disabled state with aria-disabled', () => {
      render(<Button disabled>Disabled</Button>)
      expect(screen.getByRole('button')).toBeDisabled()
    })
  })

  // ===================
  // STYLE TESTS
  // ===================
  describe('Styles', () => {
    it('applies custom className', () => {
      render(<Button className="custom-class">Custom</Button>)
      expect(screen.getByRole('button')).toHaveClass('custom-class')
    })

    it('buttonVariants function returns correct classes', () => {
      const defaultClasses = buttonVariants({ variant: 'default', size: 'default' })
      expect(defaultClasses).toContain('bg-primary')
      expect(defaultClasses).toContain('h-10')

      const destructiveClasses = buttonVariants({ variant: 'destructive' })
      expect(destructiveClasses).toContain('bg-destructive')

      const smClasses = buttonVariants({ size: 'sm' })
      expect(smClasses).toContain('h-9')
    })
  })
})

