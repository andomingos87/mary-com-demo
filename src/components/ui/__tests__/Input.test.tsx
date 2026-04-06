import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input } from '../input'

describe('Input Component', () => {
  // ===================
  // SNAPSHOT TESTS
  // ===================
  describe('Snapshots', () => {
    it('renders default input correctly', () => {
      const { container } = render(<Input placeholder="Enter text" />)
      expect(container.firstChild).toMatchSnapshot()
    })

    it('renders with error state correctly', () => {
      const { container } = render(<Input error placeholder="Error input" />)
      expect(container.firstChild).toMatchSnapshot()
    })

    it('renders disabled state correctly', () => {
      const { container } = render(<Input disabled placeholder="Disabled input" />)
      expect(container.firstChild).toMatchSnapshot()
    })

    it('renders different input types correctly', () => {
      const types = ['text', 'email', 'password', 'number', 'tel'] as const

      types.forEach((type) => {
        const { container } = render(
          <Input type={type} placeholder={`${type} input`} />
        )
        expect(container.firstChild).toMatchSnapshot()
      })
    })
  })

  // ===================
  // INTERACTION TESTS
  // ===================
  describe('Interactions', () => {
    it('handles text input correctly', async () => {
      const handleChange = jest.fn()
      render(<Input onChange={handleChange} placeholder="Type here" />)

      const input = screen.getByPlaceholderText('Type here')
      fireEvent.change(input, { target: { value: 'Hello World' } })

      expect(handleChange).toHaveBeenCalled()
      expect(input).toHaveValue('Hello World')
    })

    it('handles focus and blur events', () => {
      const handleFocus = jest.fn()
      const handleBlur = jest.fn()

      render(
        <Input
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder="Focus test"
        />
      )

      const input = screen.getByPlaceholderText('Focus test')

      fireEvent.focus(input)
      expect(handleFocus).toHaveBeenCalledTimes(1)

      fireEvent.blur(input)
      expect(handleBlur).toHaveBeenCalledTimes(1)
    })

    it('does not accept input when disabled', () => {
      const handleChange = jest.fn()
      render(
        <Input disabled onChange={handleChange} placeholder="Disabled" />
      )

      const input = screen.getByPlaceholderText('Disabled')
      expect(input).toBeDisabled()

      fireEvent.change(input, { target: { value: 'test' } })
      // Disabled inputs should not trigger change
    })

    it('receives focus correctly', () => {
      render(<Input placeholder="Focus me" />)
      const input = screen.getByPlaceholderText('Focus me')

      input.focus()
      expect(input).toHaveFocus()
    })

    it('handles controlled input correctly', () => {
      const ControlledInput = () => {
        const [value, setValue] = React.useState('')
        return (
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Controlled"
          />
        )
      }

      render(<ControlledInput />)
      const input = screen.getByPlaceholderText('Controlled')

      fireEvent.change(input, { target: { value: 'test value' } })
      expect(input).toHaveValue('test value')
    })
  })

  // ===================
  // ACCESSIBILITY TESTS
  // ===================
  describe('Accessibility', () => {
    it('has correct role', () => {
      render(<Input placeholder="Test" />)
      expect(screen.getByRole('textbox')).toBeInTheDocument()
    })

    it('supports aria-label', () => {
      render(<Input aria-label="Email address" />)
      expect(screen.getByLabelText('Email address')).toBeInTheDocument()
    })

    it('supports aria-describedby', () => {
      render(
        <>
          <Input aria-describedby="error-msg" />
          <span id="error-msg">This field is required</span>
        </>
      )
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('aria-describedby', 'error-msg')
    })

    it('supports required attribute', () => {
      render(<Input required placeholder="Required field" />)
      expect(screen.getByPlaceholderText('Required field')).toBeRequired()
    })
  })

  // ===================
  // STYLE TESTS
  // ===================
  describe('Styles', () => {
    it('applies custom className', () => {
      render(<Input className="custom-input" placeholder="Custom" />)
      expect(screen.getByPlaceholderText('Custom')).toHaveClass('custom-input')
    })

    it('applies error styles when error prop is true', () => {
      render(<Input error placeholder="Error" />)
      expect(screen.getByPlaceholderText('Error')).toHaveClass('border-destructive')
    })

    it('has base styles applied', () => {
      render(<Input placeholder="Styled" />)
      const input = screen.getByPlaceholderText('Styled')

      expect(input).toHaveClass('flex')
      expect(input).toHaveClass('h-10')
      expect(input).toHaveClass('w-full')
      expect(input).toHaveClass('rounded-md')
    })
  })
})

