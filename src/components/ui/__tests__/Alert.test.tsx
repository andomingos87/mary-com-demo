import React from 'react'
import { render, screen } from '@testing-library/react'
import { Alert, AlertTitle, AlertDescription } from '../alert'

describe('Alert Component', () => {
  // ===================
  // SNAPSHOT TESTS
  // ===================
  describe('Snapshots', () => {
    it('renders default Alert correctly', () => {
      const { container } = render(
        <Alert>
          <AlertTitle>Alert Title</AlertTitle>
          <AlertDescription>Alert Description</AlertDescription>
        </Alert>
      )
      expect(container.firstChild).toMatchSnapshot()
    })

    it('renders destructive variant correctly', () => {
      const { container } = render(
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Something went wrong</AlertDescription>
        </Alert>
      )
      expect(container.firstChild).toMatchSnapshot()
    })

    it('renders AlertTitle standalone correctly', () => {
      const { container } = render(<AlertTitle>Standalone Title</AlertTitle>)
      expect(container.firstChild).toMatchSnapshot()
    })

    it('renders AlertDescription standalone correctly', () => {
      const { container } = render(
        <AlertDescription>Standalone Description</AlertDescription>
      )
      expect(container.firstChild).toMatchSnapshot()
    })
  })

  // ===================
  // STRUCTURAL TESTS
  // ===================
  describe('Structure', () => {
    it('renders children correctly', () => {
      render(
        <Alert>
          <AlertTitle>Test Title</AlertTitle>
          <AlertDescription>Test Description</AlertDescription>
        </Alert>
      )

      expect(screen.getByText('Test Title')).toBeInTheDocument()
      expect(screen.getByText('Test Description')).toBeInTheDocument()
    })

    it('AlertTitle renders as h5', () => {
      render(<AlertTitle>Heading</AlertTitle>)
      const heading = screen.getByRole('heading', { level: 5 })
      expect(heading).toHaveTextContent('Heading')
    })

    it('supports custom content', () => {
      render(
        <Alert>
          <AlertDescription>
            <p>Paragraph 1</p>
            <p>Paragraph 2</p>
          </AlertDescription>
        </Alert>
      )

      expect(screen.getByText('Paragraph 1')).toBeInTheDocument()
      expect(screen.getByText('Paragraph 2')).toBeInTheDocument()
    })
  })

  // ===================
  // ACCESSIBILITY TESTS
  // ===================
  describe('Accessibility', () => {
    it('has role="alert"', () => {
      render(
        <Alert>
          <AlertTitle>Alert</AlertTitle>
        </Alert>
      )
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })

    it('supports custom aria attributes', () => {
      render(
        <Alert aria-live="polite" aria-atomic="true">
          <AlertTitle>Live Alert</AlertTitle>
        </Alert>
      )

      const alert = screen.getByRole('alert')
      expect(alert).toHaveAttribute('aria-live', 'polite')
      expect(alert).toHaveAttribute('aria-atomic', 'true')
    })
  })

  // ===================
  // STYLE TESTS
  // ===================
  describe('Styles', () => {
    it('Alert has base styles', () => {
      render(
        <Alert data-testid="alert">
          <AlertTitle>Alert</AlertTitle>
        </Alert>
      )
      const alert = screen.getByTestId('alert')

      expect(alert).toHaveClass('relative')
      expect(alert).toHaveClass('w-full')
      expect(alert).toHaveClass('rounded-lg')
      expect(alert).toHaveClass('border')
      expect(alert).toHaveClass('p-4')
    })

    it('default variant has correct styles', () => {
      render(
        <Alert variant="default" data-testid="alert">
          <AlertTitle>Default</AlertTitle>
        </Alert>
      )
      const alert = screen.getByTestId('alert')

      expect(alert).toHaveClass('bg-background')
      expect(alert).toHaveClass('text-foreground')
    })

    it('destructive variant has correct styles', () => {
      render(
        <Alert variant="destructive" data-testid="alert">
          <AlertTitle>Destructive</AlertTitle>
        </Alert>
      )
      const alert = screen.getByTestId('alert')

      expect(alert).toHaveClass('border-destructive/50')
      expect(alert).toHaveClass('text-destructive')
    })

    it('AlertTitle has base styles', () => {
      render(<AlertTitle>Title</AlertTitle>)
      const title = screen.getByRole('heading')

      expect(title).toHaveClass('mb-1')
      expect(title).toHaveClass('font-medium')
      expect(title).toHaveClass('leading-none')
      expect(title).toHaveClass('tracking-tight')
    })

    it('AlertDescription has base styles', () => {
      render(<AlertDescription data-testid="desc">Description</AlertDescription>)
      const desc = screen.getByTestId('desc')

      expect(desc).toHaveClass('text-sm')
    })

    it('applies custom className', () => {
      render(
        <Alert className="custom-alert" data-testid="alert">
          <AlertTitle className="custom-title">Title</AlertTitle>
          <AlertDescription className="custom-desc" data-testid="desc">
            Description
          </AlertDescription>
        </Alert>
      )

      expect(screen.getByTestId('alert')).toHaveClass('custom-alert')
      expect(screen.getByRole('heading')).toHaveClass('custom-title')
      expect(screen.getByTestId('desc')).toHaveClass('custom-desc')
    })
  })

  // ===================
  // REF FORWARDING TESTS
  // ===================
  describe('Ref Forwarding', () => {
    it('Alert forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>()
      render(
        <Alert ref={ref}>
          <AlertTitle>Alert</AlertTitle>
        </Alert>
      )
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
    })

    it('AlertTitle forwards ref correctly', () => {
      const ref = React.createRef<HTMLParagraphElement>()
      render(<AlertTitle ref={ref}>Title</AlertTitle>)
      expect(ref.current).toBeInstanceOf(HTMLHeadingElement)
    })

    it('AlertDescription forwards ref correctly', () => {
      const ref = React.createRef<HTMLParagraphElement>()
      render(<AlertDescription ref={ref}>Description</AlertDescription>)
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
    })
  })
})

