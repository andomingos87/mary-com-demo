import React from 'react'
import { render, screen } from '@testing-library/react'
import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from '../card'

describe('Card Component', () => {
  // ===================
  // SNAPSHOT TESTS
  // ===================
  describe('Snapshots', () => {
    it('renders Card correctly', () => {
      const { container } = render(<Card>Card Content</Card>)
      expect(container.firstChild).toMatchSnapshot()
    })

    it('renders full Card structure correctly', () => {
      const { container } = render(
        <Card>
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>Card Description</CardDescription>
          </CardHeader>
          <CardContent>Card Content</CardContent>
          <CardFooter>Card Footer</CardFooter>
        </Card>
      )
      expect(container.firstChild).toMatchSnapshot()
    })

    it('renders CardHeader correctly', () => {
      const { container } = render(
        <CardHeader>
          <CardTitle>Title</CardTitle>
        </CardHeader>
      )
      expect(container.firstChild).toMatchSnapshot()
    })

    it('renders CardTitle correctly', () => {
      const { container } = render(<CardTitle>Test Title</CardTitle>)
      expect(container.firstChild).toMatchSnapshot()
    })

    it('renders CardDescription correctly', () => {
      const { container } = render(
        <CardDescription>Test Description</CardDescription>
      )
      expect(container.firstChild).toMatchSnapshot()
    })

    it('renders CardContent correctly', () => {
      const { container } = render(<CardContent>Test Content</CardContent>)
      expect(container.firstChild).toMatchSnapshot()
    })

    it('renders CardFooter correctly', () => {
      const { container } = render(<CardFooter>Test Footer</CardFooter>)
      expect(container.firstChild).toMatchSnapshot()
    })
  })

  // ===================
  // STRUCTURAL TESTS
  // ===================
  describe('Structure', () => {
    it('renders children correctly', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>My Title</CardTitle>
            <CardDescription>My Description</CardDescription>
          </CardHeader>
          <CardContent>My Content</CardContent>
          <CardFooter>My Footer</CardFooter>
        </Card>
      )

      expect(screen.getByText('My Title')).toBeInTheDocument()
      expect(screen.getByText('My Description')).toBeInTheDocument()
      expect(screen.getByText('My Content')).toBeInTheDocument()
      expect(screen.getByText('My Footer')).toBeInTheDocument()
    })

    it('CardTitle renders as h3 by default', () => {
      render(<CardTitle>Heading</CardTitle>)
      const heading = screen.getByRole('heading', { level: 3 })
      expect(heading).toHaveTextContent('Heading')
    })
  })

  // ===================
  // STYLE TESTS
  // ===================
  describe('Styles', () => {
    it('Card has base styles', () => {
      render(<Card data-testid="card">Content</Card>)
      const card = screen.getByTestId('card')

      expect(card).toHaveClass('rounded-lg')
      expect(card).toHaveClass('border')
      expect(card).toHaveClass('bg-card')
      expect(card).toHaveClass('shadow-sm')
    })

    it('CardHeader has base styles', () => {
      render(<CardHeader data-testid="header">Header</CardHeader>)
      const header = screen.getByTestId('header')

      expect(header).toHaveClass('flex')
      expect(header).toHaveClass('flex-col')
      expect(header).toHaveClass('space-y-1.5')
      expect(header).toHaveClass('p-6')
    })

    it('CardTitle has base styles', () => {
      render(<CardTitle>Title</CardTitle>)
      const title = screen.getByRole('heading')

      expect(title).toHaveClass('text-2xl')
      expect(title).toHaveClass('font-semibold')
      expect(title).toHaveClass('tracking-tight')
    })

    it('CardDescription has base styles', () => {
      render(<CardDescription data-testid="desc">Description</CardDescription>)
      const desc = screen.getByTestId('desc')

      expect(desc).toHaveClass('text-sm')
      expect(desc).toHaveClass('text-muted-foreground')
    })

    it('CardContent has base styles', () => {
      render(<CardContent data-testid="content">Content</CardContent>)
      const content = screen.getByTestId('content')

      expect(content).toHaveClass('p-6')
      expect(content).toHaveClass('pt-0')
    })

    it('CardFooter has base styles', () => {
      render(<CardFooter data-testid="footer">Footer</CardFooter>)
      const footer = screen.getByTestId('footer')

      expect(footer).toHaveClass('flex')
      expect(footer).toHaveClass('items-center')
      expect(footer).toHaveClass('p-6')
      expect(footer).toHaveClass('pt-0')
    })

    it('applies custom className to Card', () => {
      render(
        <Card className="custom-card" data-testid="card">
          Content
        </Card>
      )
      expect(screen.getByTestId('card')).toHaveClass('custom-card')
    })

    it('applies custom className to all subcomponents', () => {
      render(
        <Card>
          <CardHeader className="custom-header" data-testid="header">
            <CardTitle className="custom-title">Title</CardTitle>
            <CardDescription className="custom-desc" data-testid="desc">
              Desc
            </CardDescription>
          </CardHeader>
          <CardContent className="custom-content" data-testid="content">
            Content
          </CardContent>
          <CardFooter className="custom-footer" data-testid="footer">
            Footer
          </CardFooter>
        </Card>
      )

      expect(screen.getByTestId('header')).toHaveClass('custom-header')
      expect(screen.getByRole('heading')).toHaveClass('custom-title')
      expect(screen.getByTestId('desc')).toHaveClass('custom-desc')
      expect(screen.getByTestId('content')).toHaveClass('custom-content')
      expect(screen.getByTestId('footer')).toHaveClass('custom-footer')
    })
  })

  // ===================
  // REF FORWARDING TESTS
  // ===================
  describe('Ref Forwarding', () => {
    it('Card forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>()
      render(<Card ref={ref}>Content</Card>)
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
    })

    it('CardHeader forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>()
      render(<CardHeader ref={ref}>Header</CardHeader>)
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
    })

    it('CardTitle forwards ref correctly', () => {
      const ref = React.createRef<HTMLParagraphElement>()
      render(<CardTitle ref={ref}>Title</CardTitle>)
      expect(ref.current).toBeInstanceOf(HTMLHeadingElement)
    })
  })
})

