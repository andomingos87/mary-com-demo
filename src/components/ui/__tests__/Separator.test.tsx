import React from 'react'
import { render, screen } from '@testing-library/react'
import { Separator } from '../separator'

describe('Separator Component', () => {
  // ===================
  // SNAPSHOT TESTS
  // ===================
  describe('Snapshots', () => {
    it('renders horizontal separator correctly', () => {
      const { container } = render(<Separator />)
      expect(container.firstChild).toMatchSnapshot()
    })

    it('renders vertical separator correctly', () => {
      const { container } = render(<Separator orientation="vertical" />)
      expect(container.firstChild).toMatchSnapshot()
    })

    it('renders non-decorative separator correctly', () => {
      const { container } = render(<Separator decorative={false} />)
      expect(container.firstChild).toMatchSnapshot()
    })
  })

  // ===================
  // STRUCTURAL TESTS
  // ===================
  describe('Structure', () => {
    it('renders as a div element', () => {
      render(<Separator data-testid="separator" />)
      expect(screen.getByTestId('separator').tagName).toBe('DIV')
    })

    it('defaults to horizontal orientation', () => {
      render(<Separator data-testid="separator" />)
      const separator = screen.getByTestId('separator')

      expect(separator).toHaveClass('h-[1px]')
      expect(separator).toHaveClass('w-full')
    })

    it('supports vertical orientation', () => {
      render(<Separator orientation="vertical" data-testid="separator" />)
      const separator = screen.getByTestId('separator')

      expect(separator).toHaveClass('h-full')
      expect(separator).toHaveClass('w-[1px]')
    })
  })

  // ===================
  // ACCESSIBILITY TESTS
  // ===================
  describe('Accessibility', () => {
    it('has role="none" when decorative (default)', () => {
      render(<Separator data-testid="separator" />)
      const separator = screen.getByTestId('separator')

      expect(separator).toHaveAttribute('role', 'none')
    })

    it('has role="separator" when not decorative', () => {
      render(<Separator decorative={false} />)
      const separator = screen.getByRole('separator')

      expect(separator).toBeInTheDocument()
    })

    it('has aria-orientation when not decorative (horizontal)', () => {
      render(<Separator decorative={false} orientation="horizontal" />)
      const separator = screen.getByRole('separator')

      expect(separator).toHaveAttribute('aria-orientation', 'horizontal')
    })

    it('has aria-orientation when not decorative (vertical)', () => {
      render(<Separator decorative={false} orientation="vertical" />)
      const separator = screen.getByRole('separator')

      expect(separator).toHaveAttribute('aria-orientation', 'vertical')
    })

    it('does not have aria-orientation when decorative', () => {
      render(<Separator decorative={true} data-testid="separator" />)
      const separator = screen.getByTestId('separator')

      expect(separator).not.toHaveAttribute('aria-orientation')
    })
  })

  // ===================
  // STYLE TESTS
  // ===================
  describe('Styles', () => {
    it('has base styles', () => {
      render(<Separator data-testid="separator" />)
      const separator = screen.getByTestId('separator')

      expect(separator).toHaveClass('shrink-0')
      expect(separator).toHaveClass('bg-border')
    })

    it('horizontal has correct dimensions', () => {
      render(<Separator orientation="horizontal" data-testid="separator" />)
      const separator = screen.getByTestId('separator')

      expect(separator).toHaveClass('h-[1px]')
      expect(separator).toHaveClass('w-full')
    })

    it('vertical has correct dimensions', () => {
      render(<Separator orientation="vertical" data-testid="separator" />)
      const separator = screen.getByTestId('separator')

      expect(separator).toHaveClass('h-full')
      expect(separator).toHaveClass('w-[1px]')
    })

    it('applies custom className', () => {
      render(<Separator className="my-4" data-testid="separator" />)
      expect(screen.getByTestId('separator')).toHaveClass('my-4')
    })
  })

  // ===================
  // REF FORWARDING TESTS
  // ===================
  describe('Ref Forwarding', () => {
    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>()
      render(<Separator ref={ref} />)
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
    })
  })
})

