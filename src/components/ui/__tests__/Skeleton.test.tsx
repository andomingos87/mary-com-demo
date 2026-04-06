import React from 'react'
import { render, screen } from '@testing-library/react'
import { Skeleton } from '../skeleton'

describe('Skeleton Component', () => {
  // ===================
  // SNAPSHOT TESTS
  // ===================
  describe('Snapshots', () => {
    it('renders default skeleton correctly', () => {
      const { container } = render(<Skeleton />)
      expect(container.firstChild).toMatchSnapshot()
    })

    it('renders skeleton with custom dimensions correctly', () => {
      const { container } = render(<Skeleton className="h-12 w-12" />)
      expect(container.firstChild).toMatchSnapshot()
    })

    it('renders skeleton card layout correctly', () => {
      const { container } = render(
        <div className="space-y-3">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
          <Skeleton className="h-4 w-[150px]" />
        </div>
      )
      expect(container.firstChild).toMatchSnapshot()
    })
  })

  // ===================
  // STRUCTURAL TESTS
  // ===================
  describe('Structure', () => {
    it('renders as a div element', () => {
      render(<Skeleton data-testid="skeleton" />)
      expect(screen.getByTestId('skeleton').tagName).toBe('DIV')
    })

    it('renders children if provided', () => {
      render(<Skeleton data-testid="skeleton">Content</Skeleton>)
      expect(screen.getByTestId('skeleton')).toHaveTextContent('Content')
    })
  })

  // ===================
  // STYLE TESTS
  // ===================
  describe('Styles', () => {
    it('has base styles', () => {
      render(<Skeleton data-testid="skeleton" />)
      const skeleton = screen.getByTestId('skeleton')

      expect(skeleton).toHaveClass('animate-pulse')
      expect(skeleton).toHaveClass('rounded-md')
      expect(skeleton).toHaveClass('bg-muted')
    })

    it('applies custom className', () => {
      render(<Skeleton className="h-4 w-[200px]" data-testid="skeleton" />)
      const skeleton = screen.getByTestId('skeleton')

      expect(skeleton).toHaveClass('h-4')
      expect(skeleton).toHaveClass('w-[200px]')
    })

    it('custom className merges with base styles', () => {
      render(<Skeleton className="h-8 w-8 rounded-full" data-testid="skeleton" />)
      const skeleton = screen.getByTestId('skeleton')

      // Base styles
      expect(skeleton).toHaveClass('animate-pulse')
      expect(skeleton).toHaveClass('bg-muted')

      // Custom styles (rounded-full should override rounded-md)
      expect(skeleton).toHaveClass('h-8')
      expect(skeleton).toHaveClass('w-8')
      expect(skeleton).toHaveClass('rounded-full')
    })
  })

  // ===================
  // PATTERN TESTS
  // ===================
  describe('Common Patterns', () => {
    it('renders text placeholder correctly', () => {
      const { container } = render(
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" data-testid="line1" />
          <Skeleton className="h-4 w-3/4" data-testid="line2" />
        </div>
      )

      expect(screen.getByTestId('line1')).toBeInTheDocument()
      expect(screen.getByTestId('line2')).toBeInTheDocument()
      expect(container.firstChild).toMatchSnapshot()
    })

    it('renders card skeleton correctly', () => {
      const { container } = render(
        <div className="flex flex-col space-y-3">
          <Skeleton className="h-[125px] w-[250px] rounded-xl" data-testid="image" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" data-testid="title" />
            <Skeleton className="h-4 w-[200px]" data-testid="description" />
          </div>
        </div>
      )

      expect(screen.getByTestId('image')).toHaveClass('h-[125px]')
      expect(screen.getByTestId('title')).toBeInTheDocument()
      expect(screen.getByTestId('description')).toBeInTheDocument()
      expect(container.firstChild).toMatchSnapshot()
    })

    it('renders avatar skeleton correctly', () => {
      render(<Skeleton className="h-12 w-12 rounded-full" data-testid="avatar" />)
      const avatar = screen.getByTestId('avatar')

      expect(avatar).toHaveClass('h-12')
      expect(avatar).toHaveClass('w-12')
      expect(avatar).toHaveClass('rounded-full')
    })

    it('renders button skeleton correctly', () => {
      render(<Skeleton className="h-10 w-24" data-testid="button" />)
      const button = screen.getByTestId('button')

      expect(button).toHaveClass('h-10')
      expect(button).toHaveClass('w-24')
    })
  })

  // ===================
  // ACCESSIBILITY TESTS
  // ===================
  describe('Accessibility', () => {
    it('supports aria-label for screen readers', () => {
      render(<Skeleton aria-label="Loading content" data-testid="skeleton" />)
      expect(screen.getByLabelText('Loading content')).toBeInTheDocument()
    })

    it('supports role attribute', () => {
      render(<Skeleton role="progressbar" data-testid="skeleton" />)
      expect(screen.getByRole('progressbar')).toBeInTheDocument()
    })

    it('can be hidden from screen readers', () => {
      render(<Skeleton aria-hidden="true" data-testid="skeleton" />)
      const skeleton = screen.getByTestId('skeleton')
      expect(skeleton).toHaveAttribute('aria-hidden', 'true')
    })
  })
})

