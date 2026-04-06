'use client'

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ImgHTMLAttributes, ReactNode } from 'react'
import { MfaForm } from '../mfa-form'
import { resendOtpAction } from '@/lib/actions/auth'

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ priority: _priority, ...props }: ImgHTMLAttributes<HTMLImageElement> & { priority?: boolean }) => (
    <img {...props} alt={props.alt || ''} />
  ),
}))

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: { children: ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

jest.mock('@/lib/actions/auth', () => ({
  verifyMfaAction: jest.fn(),
  resendOtpAction: jest.fn(),
}))

const mockedResendOtpAction = resendOtpAction as jest.MockedFunction<typeof resendOtpAction>

describe('MfaForm test OTP display', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders test OTP banner when testOtpCode is provided', () => {
    render(<MfaForm sessionId="session-1" channel="whatsapp" testOtpCode="123456" />)

    expect(screen.getByText(/Código de teste/i)).toBeInTheDocument()
    expect(screen.getByText('123456')).toBeInTheDocument()
  })

  it('does not render test OTP banner when testOtpCode is not provided', () => {
    render(<MfaForm sessionId="session-1" channel="whatsapp" />)

    expect(screen.queryByText(/Código de teste/i)).not.toBeInTheDocument()
  })

  it('updates visible test OTP after resend', async () => {
    mockedResendOtpAction.mockResolvedValue({
      success: true,
      data: {
        expiresAt: new Date().toISOString(),
        testOtpCode: '654321',
      },
    })

    const user = userEvent.setup()
    render(<MfaForm sessionId="session-1" channel="whatsapp" testOtpCode="123456" />)

    await user.click(screen.getByRole('button', { name: /Reenviar código/i }))

    await waitFor(() => {
      expect(screen.getByText('654321')).toBeInTheDocument()
    })
  })
})

