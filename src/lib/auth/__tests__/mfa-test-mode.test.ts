import { shouldExposeOtpInUi } from '@/lib/auth/mfa-test-mode'

describe('shouldExposeOtpInUi', () => {
  const originalShowMfaCode = process.env.SHOW_MFA_CODE
  const originalNodeEnv = process.env.NODE_ENV
  const originalVercelEnv = process.env.VERCEL_ENV

  afterEach(() => {
    process.env.SHOW_MFA_CODE = originalShowMfaCode
    process.env.NODE_ENV = originalNodeEnv
    process.env.VERCEL_ENV = originalVercelEnv
  })

  it('returns true in local development with SHOW_MFA_CODE=true', () => {
    process.env.SHOW_MFA_CODE = 'true'
    process.env.NODE_ENV = 'development'
    delete process.env.VERCEL_ENV

    expect(shouldExposeOtpInUi()).toBe(true)
  })

  it('returns true in Vercel preview even with NODE_ENV=production', () => {
    process.env.SHOW_MFA_CODE = 'true'
    process.env.NODE_ENV = 'production'
    process.env.VERCEL_ENV = 'preview'

    expect(shouldExposeOtpInUi()).toBe(true)
  })

  it('returns false when SHOW_MFA_CODE is not true (including preview)', () => {
    process.env.SHOW_MFA_CODE = 'false'
    process.env.NODE_ENV = 'production'
    process.env.VERCEL_ENV = 'preview'

    expect(shouldExposeOtpInUi()).toBe(false)
  })

  it('returns false in Vercel production even with SHOW_MFA_CODE=true', () => {
    process.env.SHOW_MFA_CODE = 'true'
    process.env.NODE_ENV = 'development'
    process.env.VERCEL_ENV = 'production'

    expect(shouldExposeOtpInUi()).toBe(false)
  })

  it('returns false in production outside Vercel', () => {
    process.env.SHOW_MFA_CODE = 'true'
    process.env.NODE_ENV = 'production'
    delete process.env.VERCEL_ENV

    expect(shouldExposeOtpInUi()).toBe(false)
  })
})

