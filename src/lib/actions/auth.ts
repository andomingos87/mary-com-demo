'use server'

/**
 * Server Actions - Authentication (BUG-001 Fix)
 * 
 * Este módulo implementa autenticação via Server Actions ao invés de API Routes,
 * conforme documentação oficial do Supabase para Next.js App Router.
 * 
 * A migração resolve o problema de persistência de cookies de sessão após login.
 * 
 * @see BUG-001-supabase-session-cookies.md
 * @see bug-001-auth-session-fix.md
 */

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { cookies, headers } from 'next/headers'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { checkRateLimit, resetRateLimit } from '@/lib/auth/rate-limit'
import {
  createSession,
  generateDeviceFingerprint,
  parseUserAgent,
  invalidateAllSessions,
} from '@/lib/auth/session'
import { isGenericEmail, GENERIC_EMAIL_ERROR_MESSAGE } from '@/lib/validation/email'
import { getGeoLocation, isKnownDevice, handleNewDevice } from '@/lib/auth/device'
import { initiateMfa, verifyMfa } from '@/lib/auth/mfa'
import { shouldExposeOtpInUi } from '@/lib/auth/mfa-test-mode'
import { logger } from '@/lib/logger'

const MARY_SESSION_COOKIE_NAME = 'mary_session_id'
const MARY_SESSION_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24

async function setMarySessionCookie(sessionId: string) {
  const cookieStore = await cookies()
  cookieStore.set(MARY_SESSION_COOKIE_NAME, sessionId, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: MARY_SESSION_COOKIE_MAX_AGE_SECONDS,
  })
}

async function clearMarySessionCookie() {
  const cookieStore = await cookies()
  cookieStore.delete(MARY_SESSION_COOKIE_NAME)
}

// ============================================
// Types
// ============================================

export interface ActionResult<T = void> {
  success: boolean
  data?: T
  error?: string
}

export interface LoginInput {
  email: string
  password: string
}

export interface SignupInput {
  email: string
  password: string
  name: string
  phone: string
  /** Profile type for organization creation during signup */
  profileType: 'investor' | 'asset' | 'advisor'
}

export interface SignupResult {
  userId: string
  email: string
}

export interface LoginResult {
  requiresMfa: boolean
  sessionId?: string
  mfaChannel?: string
  mfaExpiresAt?: string
  isNewDevice?: boolean
  countryChanged?: boolean
  user?: {
    id: string
    email: string | undefined
  }
}

export interface VerifyMfaInput {
  code: string
  sessionId: string
}

export interface VerifyMfaResult {
  redirectTo: string
}

export interface InitiateMfaResult {
  sessionId: string
  mfaChannel: string
  mfaExpiresAt: string
  testOtpCode?: string
  isNewDevice?: boolean
  countryChanged?: boolean
}

// ============================================
// Helper Functions
// ============================================

async function getClientInfo() {
  const headersList = await headers()
  
  const ip = headersList.get('x-forwarded-for')?.split(',')[0] || 
             headersList.get('x-real-ip') || 
             '127.0.0.1'
  const userAgent = headersList.get('user-agent') || ''
  const acceptLanguage = headersList.get('accept-language') || ''
  
  return { ip, userAgent, acceptLanguage }
}

// ============================================
// Login Action
// ============================================

/**
 * Realiza login do usuário com email e senha.
 * 
 * Este é um Server Action que substitui a API Route /api/auth/login.
 * Resolve o problema de persistência de cookies de sessão.
 * 
 * Funcionalidades:
 * - Rate limiting
 * - Device fingerprinting
 * - Geo-location detection
 * - New device alerts
 * - MFA initiation via WhatsApp/SMS
 * - Audit logging
 */
export async function loginAction(
  input: LoginInput
): Promise<ActionResult<LoginResult>> {
  try {
    const { email, password } = input
    
    // Validate input
    if (!email || !password) {
      return {
        success: false,
        error: 'E-mail e senha são obrigatórios',
      }
    }
    
    // Get client info
    const { ip, userAgent, acceptLanguage } = await getClientInfo()
    
    // Check rate limit
    const rateLimitResult = await checkRateLimit(email, 'login')
    if (!rateLimitResult.allowed) {
      return {
        success: false,
        error: rateLimitResult.infraFailure
          ? 'Serviço temporariamente indisponível. Tente novamente em instantes.'
          : `Muitas tentativas de login. Tente novamente em ${rateLimitResult.retryAfterSeconds || 30} segundos.`,
      }
    }
    
    // Create Supabase client (uses cookies from next/headers)
    const supabase = await createClient()

    // Attempt login
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    // Log for debugging
    logger.info('loginAction: signInWithPassword result', { 
      hasSession: !!data.session, 
      hasUser: !!data.user,
      error: error?.message,
    })
    
    if (error) {
      logger.warn('loginAction: Login failed', { email, error: error.message })
      return {
        success: false,
        error: 'E-mail ou senha incorretos',
      }
    }
    
    if (!data.user) {
      return {
        success: false,
        error: 'Falha na autenticação',
      }
    }
    
    // Reset rate limit on successful login
    await resetRateLimit(email, 'login')
    
    // Get geo-location
    const geoLocation = await getGeoLocation(ip)
    
    // Generate device fingerprint
    const deviceFingerprint = generateDeviceFingerprint(userAgent, ip, acceptLanguage)
    const deviceInfo = parseUserAgent(userAgent)
    
    // Check if this is a new device
    const knownDevice = await isKnownDevice(data.user.id, deviceFingerprint)
    
    // Create session (this will invalidate previous sessions)
    const sessionResult = await createSession(
      data.user.id,
      { fingerprint: deviceFingerprint, ...deviceInfo },
      { ip, countryCode: geoLocation.countryCode, city: geoLocation.city }
    )
    
    if (!sessionResult.success) {
      return {
        success: false,
        error: sessionResult.error || 'Falha ao criar sessão',
      }
    }

    // Do NOT set mary_session cookie here - only after verifyMfaAction succeeds

    // Handle new device notification
    if (!knownDevice) {
      await handleNewDevice(data.user.id, deviceInfo, geoLocation)
    }
    
    // Log audit event
    const adminSupabase = await createAdminClient()
    await adminSupabase.from('audit_logs').insert({
      user_id: data.user.id,
      action: 'auth.login',
      metadata: {
        email,
        is_new_device: !knownDevice,
        country: geoLocation.countryCode,
        session_id: sessionResult.sessionId,
      },
      ip_address: ip,
      user_agent: userAgent,
    })
    
    // Initiate MFA
    const mfaResult = await initiateMfa(data.user.id, 'whatsapp')
    
    logger.info('loginAction: User logged in, MFA initiated', { 
      userId: data.user.id, 
      sessionId: sessionResult.sessionId,
      mfaChannel: mfaResult.channel,
    })
    
    // Return result - page will handle redirect to MFA
    return {
      success: true,
      data: {
        requiresMfa: true,
        sessionId: sessionResult.sessionId,
        mfaChannel: mfaResult.channel,
        mfaExpiresAt: mfaResult.expiresAt?.toISOString(),
        isNewDevice: !knownDevice,
        countryChanged: sessionResult.countryChanged,
        user: {
          id: data.user.id,
          email: data.user.email,
        },
      },
    }
  } catch (error) {
    logger.error('loginAction: Unexpected error', { error })
    return {
      success: false,
      error: 'Erro interno do servidor',
    }
  }
}

// ============================================
// Initiate MFA Action (for client-side login)
// ============================================

/**
 * Inicia o fluxo de MFA após login client-side bem-sucedido.
 *
 * Este Server Action é chamado após o usuário fazer login via browser client.
 * O login client-side define os cookies automaticamente, então aqui
 * apenas verificamos a sessão e iniciamos o MFA.
 *
 * Funcionalidades:
 * - Verificação de autenticação via getUser()
 * - Rate limiting
 * - Device fingerprinting
 * - Geo-location detection
 * - New device alerts
 * - MFA initiation via WhatsApp/SMS
 * - Audit logging
 */
export async function initiateMfaAction(
  userId: string
): Promise<ActionResult<InitiateMfaResult>> {
  try {
    // Validate input
    if (!userId) {
      return {
        success: false,
        error: 'ID do usuário é obrigatório',
      }
    }

    // Verify authentication via getUser()
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      logger.warn('initiateMfaAction: User not authenticated', { error: userError?.message })
      return {
        success: false,
        error: 'Usuário não autenticado',
      }
    }

    // Verify userId matches authenticated user
    if (user.id !== userId) {
      logger.warn('initiateMfaAction: User ID mismatch', { expected: userId, actual: user.id })
      return {
        success: false,
        error: 'ID de usuário inválido',
      }
    }

    // Get client info
    const { ip, userAgent, acceptLanguage } = await getClientInfo()
    const deviceFingerprint = generateDeviceFingerprint(userAgent, ip, acceptLanguage)
    const deviceInfo = parseUserAgent(userAgent)
    const adminSupabase = await createAdminClient()

    // Reuse existing pending MFA session for the same device.
    // This prevents OTP/session churn when user refreshes /verify-mfa.
    const { data: existingPendingSession } = await adminSupabase
      .from('user_sessions')
      .select('id')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .eq('mfa_verified', false)
      .eq('device_fingerprint', deviceFingerprint)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (existingPendingSession) {
      const { data: existingValidOtp } = await adminSupabase
        .from('otp_codes')
        .select('channel, expires_at')
        .eq('user_id', user.id)
        .eq('purpose', 'mfa')
        .eq('is_used', false)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (existingValidOtp && !shouldExposeOtpInUi()) {
        logger.info('initiateMfaAction: Reusing pending session and OTP', {
          userId: user.id,
          sessionId: existingPendingSession.id,
          mfaChannel: existingValidOtp.channel,
        })

        return {
          success: true,
          data: {
            sessionId: existingPendingSession.id,
            mfaChannel: existingValidOtp.channel,
            mfaExpiresAt: existingValidOtp.expires_at,
            testOtpCode: undefined,
            isNewDevice: false,
            countryChanged: false,
          },
        }
      }
    }

    // Check rate limit
    const rateLimitResult = await checkRateLimit(user.email || userId, 'login')
    if (!rateLimitResult.allowed) {
      return {
        success: false,
        error: rateLimitResult.infraFailure
          ? 'Serviço temporariamente indisponível. Tente novamente em instantes.'
          : `Muitas tentativas de login. Tente novamente em ${rateLimitResult.retryAfterSeconds || 30} segundos.`,
      }
    }

    // Reset rate limit on successful authentication
    await resetRateLimit(user.email || userId, 'login')
    const activeSessionId = existingPendingSession?.id
    let isNewDevice = false
    let countryChanged = false

    if (!activeSessionId) {
      // Get geo-location
      const geoLocation = await getGeoLocation(ip)

      // Check if this is a new device
      const knownDevice = await isKnownDevice(user.id, deviceFingerprint)

      // Create session
      const sessionResult = await createSession(
        user.id,
        { fingerprint: deviceFingerprint, ...deviceInfo },
        { ip, countryCode: geoLocation.countryCode, city: geoLocation.city }
      )

      if (!sessionResult.success) {
        return {
          success: false,
          error: sessionResult.error || 'Falha ao criar sessão',
        }
      }

      // Do NOT set mary_session cookie here - only after verifyMfaAction succeeds

      // Handle new device notification
      if (!knownDevice) {
        await handleNewDevice(user.id, deviceInfo, geoLocation)
      }

      isNewDevice = !knownDevice
      countryChanged = !!sessionResult.countryChanged

      // Log audit event only when a new session is created
      await adminSupabase.from('audit_logs').insert({
        user_id: user.id,
        action: 'auth.login',
        metadata: {
          email: user.email,
          is_new_device: !knownDevice,
          country: geoLocation.countryCode,
          session_id: sessionResult.sessionId,
          auth_method: 'client-side',
        },
        ip_address: ip,
        user_agent: userAgent,
      })
    }

    // Initiate MFA
    const mfaResult = await initiateMfa(user.id, 'whatsapp')

    if (!mfaResult.success) {
      return {
        success: false,
        error: mfaResult.error || 'Falha ao enviar código',
      }
    }

    const sessionId = activeSessionId || (await adminSupabase
      .from('user_sessions')
      .select('id')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .eq('mfa_verified', false)
      .eq('device_fingerprint', deviceFingerprint)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()).data?.id

    logger.info('initiateMfaAction: MFA initiated', {
      userId: user.id,
      sessionId,
      mfaChannel: mfaResult.channel,
    })

    if (!sessionId) {
      return {
        success: false,
        error: 'Sessão MFA não encontrada',
      }
    }

    return {
      success: true,
      data: {
        sessionId,
        mfaChannel: mfaResult.channel!,
        mfaExpiresAt: mfaResult.expiresAt?.toISOString() || '',
        testOtpCode: mfaResult.testOtpCode,
        isNewDevice,
        countryChanged,
      },
    }
  } catch (error) {
    logger.error('initiateMfaAction: Unexpected error', { error })
    return {
      success: false,
      error: 'Erro interno do servidor',
    }
  }
}

// ============================================
// Verify MFA Action
// ============================================

/**
 * Verifica o código MFA (OTP) enviado via WhatsApp/SMS.
 * 
 * Este é um Server Action que substitui a API Route /api/auth/verify-mfa.
 * 
 * Funcionalidades:
 * - Rate limiting para tentativas de MFA
 * - Verificação do código OTP
 * - Marcação da sessão como MFA verificada
 * - Audit logging
 * - Redirect automático para dashboard
 */
export async function verifyMfaAction(
  input: VerifyMfaInput
): Promise<ActionResult<VerifyMfaResult>> {
  try {
    const { code, sessionId } = input

    // Validate input
    if (!code || !sessionId) {
      return {
        success: false,
        error: 'Código e ID da sessão são obrigatórios',
      }
    }
    
    // Get Supabase client
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    let userId: string
    
    if (user) {
      userId = user.id
    } else {
      // If user is not authenticated, get user_id from session
      // This handles the case where user logged in but MFA is pending
      const adminSupabase = await createAdminClient()
      const { data: session, error: sessionError } = await adminSupabase
        .from('user_sessions')
        .select('user_id')
        .eq('id', sessionId)
        .eq('is_active', true)
        .eq('mfa_verified', false)
        .single()
      
      if (sessionError || !session) {
        logger.warn('verifyMfaAction: Invalid session', { sessionId, error: sessionError?.message })
        return {
          success: false,
          error: 'Sessão inválida ou expirada. Faça login novamente.',
        }
      }
      
      userId = session.user_id
    }
    
    // Check rate limit for MFA attempts
    const rateLimitResult = await checkRateLimit(userId, 'mfa_attempt')
    if (!rateLimitResult.allowed) {
      return {
        success: false,
        error: rateLimitResult.infraFailure
          ? 'Serviço temporariamente indisponível. Tente novamente em instantes.'
          : 'Muitas tentativas. Solicite um novo código.',
      }
    }
    
    // Verify MFA code
    const mfaResult = await verifyMfa(userId, code, sessionId)

    if (!mfaResult.success) {
      logger.warn('verifyMfaAction: MFA verification failed', { userId, message: mfaResult.message })
      return {
        success: false,
        error: mfaResult.message,
      }
    }
    
    // Reset rate limit on success
    await resetRateLimit(userId, 'mfa_attempt')

    // Keep custom session cookie alive after MFA verification
    await setMarySessionCookie(sessionId)
    
    logger.info('verifyMfaAction: MFA verified successfully', { userId, sessionId })

    // Revalidate cache
    revalidatePath('/', 'layout')
    
    // Return success - let client handle redirect to avoid error flash
    return {
      success: true,
      data: { redirectTo: '/dashboard' },
    }
  } catch (error) {
    logger.error('verifyMfaAction: Unexpected error', { error })
    return {
      success: false,
      error: 'Erro interno do servidor',
    }
  }
}

// ============================================
// Logout Action
// ============================================

/**
 * Realiza logout do usuário.
 * 
 * Este é um Server Action que substitui a API Route /api/auth/logout.
 * 
 * Funcionalidades:
 * - Invalida sessão no Supabase Auth
 * - Invalida sessão customizada (user_sessions)
 * - Audit logging
 * - Redirect para login
 */
export async function logoutAction(): Promise<ActionResult<void>> {
  try {
    const supabase = await createClient()
    const cookieStore = await cookies()
    const marySessionId = cookieStore.get(MARY_SESSION_COOKIE_NAME)?.value
    
    // Get current user before logging out
    const { data: { user } } = await supabase.auth.getUser()
    
    // Sign out from Supabase Auth
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      logger.error('logoutAction: Supabase signOut error', { error: error.message })
      return {
        success: false,
        error: 'Erro ao fazer logout',
      }
    }
    
    // Invalidate custom session(s)
    if (marySessionId) {
      const adminSupabase = await createAdminClient()
      await adminSupabase
        .from('user_sessions')
        .update({ is_active: false })
        .eq('id', marySessionId)
    }

    if (user) {
      await invalidateAllSessions(user.id)
      
      // Log audit event
      const adminSupabase = await createAdminClient()
      await adminSupabase.from('audit_logs').insert({
        user_id: user.id,
        action: 'auth.logout',
        metadata: {},
      })
      
      logger.info('logoutAction: User logged out', { userId: user.id })
    }

    await clearMarySessionCookie()
    
    // Revalidate and redirect
    revalidatePath('/', 'layout')
    redirect('/login')
    
    // This won't be reached due to redirect
    return { success: true }
  } catch (error) {
    // Check if this is a redirect
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      throw error
    }
    
    logger.error('logoutAction: Unexpected error', { error })
    return {
      success: false,
      error: 'Erro interno do servidor',
    }
  }
}

// ============================================
// Signup Action
// ============================================

/**
 * Realiza o cadastro do usuário com email, senha, nome e telefone.
 * 
 * Este é um Server Action que substitui a API Route /api/auth/signup.
 * Resolve o problema de persistência do code_verifier PKCE em cookies.
 * 
 * Funcionalidades:
 * - Rate limiting
 * - Criação de usuário no Supabase Auth
 * - Criação de perfil do usuário
 * - Envio de email de confirmação
 * - Audit logging
 */
export async function signupAction(
  input: SignupInput
): Promise<ActionResult<SignupResult>> {
  try {
    const { email, password, name, phone, profileType } = input
    
    // Validate input
    if (!email || !password) {
      return {
        success: false,
        error: 'E-mail e senha são obrigatórios',
      }
    }
    
    if (password.length < 8) {
      return {
        success: false,
        error: 'A senha deve ter pelo menos 8 caracteres',
      }
    }

    // Validate profileType (required for new signup flow)
    if (!profileType || !['investor', 'asset', 'advisor'].includes(profileType)) {
      return {
        success: false,
        error: 'Perfil inválido. Selecione Investidor, Empresa ou Advisor.',
      }
    }

    // TASK-004: Validate corporate email (block generic email providers)
    if (isGenericEmail(email)) {
      logger.info('signupAction: Generic email blocked', { email, domain: email.split('@')[1] })
      return {
        success: false,
        error: GENERIC_EMAIL_ERROR_MESSAGE,
      }
    }

    // Get client info
    const { ip, userAgent } = await getClientInfo()
    
    // Check rate limit
    const rateLimitResult = await checkRateLimit(email, 'signup')
    if (!rateLimitResult.allowed) {
      return {
        success: false,
        error: rateLimitResult.infraFailure
          ? 'Serviço temporariamente indisponível. Tente novamente em instantes.'
          : `Muitas tentativas de cadastro. Tente novamente em ${rateLimitResult.retryAfterSeconds || 60} segundos.`,
      }
    }

    // Usar Admin API para criar usuário e gerar link de confirmação
    // Isso evita o problema de PKCE code_verifier não estar disponível no callback
    const adminSupabase = await createAdminClient()
    
    // Criar usuário via Admin API (não usa PKCE)
    // NOTA: email_confirm: true porque links de confirmação não funcionam bem
    // com cross-domain cookies (Supabase não consegue definir cookies em localhost)
    // A verificação de identidade será feita via MFA (WhatsApp/SMS)
    const { data, error } = await adminSupabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Confirmar automaticamente - MFA fará verificação
      user_metadata: {
        full_name: name,
        phone,
      },
    })

    if (error) {
      logger.warn('signupAction: Signup failed', { email, error: error.message })
      
      // Handle specific error cases
      if (error.message.includes('already registered') || error.message.includes('already been registered')) {
        return {
          success: false,
          error: 'Este e-mail já está cadastrado',
        }
      }
      
      return {
        success: false,
        error: error.message,
      }
    }
    
    if (!data.user) {
      return {
        success: false,
        error: 'Falha ao criar usuário',
      }
    }

    // Generate unique slug for organization
    const tempName = `Nova Organização - ${new Date().toLocaleDateString('pt-BR')}`
    const timestamp = Date.now().toString(36)
    const randomPart = Math.random().toString(36).slice(2, 6)
    const slug = `nova-organizacao-${timestamp}-${randomPart}`

    const initialOnboardingStep = profileType === 'investor' ? 'profile_details' : 'cnpj_input'

    // Create organization with profile_type already defined (skipping profile_selection step)
    const { data: org, error: orgError } = await adminSupabase
      .from('organizations')
      .insert({
        name: tempName,
        slug,
        profile_type: profileType,
        created_by: data.user.id,
        onboarding_step: initialOnboardingStep,
        onboarding_started_at: new Date().toISOString(),
        onboarding_data: {
          flow: {
            started_at: new Date().toISOString(),
            steps_completed: ['profile_selection'],
            profile_preselected_at_signup: true,
          }
        },
        verification_status: 'pending',
      })
      .select()
      .single()

    if (orgError || !org) {
      logger.error('signupAction: Failed to create organization', { error: orgError?.message })
      // Don't fail signup - org can be created later during onboarding
    } else {
      // Add user as owner of the organization
      const { error: memberError } = await adminSupabase
        .from('organization_members')
        .insert({
          organization_id: org.id,
          user_id: data.user.id,
          role: 'owner',
          verification_status: 'pending',
        })

      if (memberError) {
        logger.error('signupAction: Failed to add owner to organization', { error: memberError.message })
      }

      // Log onboarding started audit event
      await adminSupabase.from('audit_logs').insert({
        user_id: data.user.id,
        organization_id: org.id,
        action: 'onboarding.started',
        metadata: {
          profile_type: profileType,
          step: initialOnboardingStep,
          profile_preselected_at_signup: true,
        },
        ip_address: ip,
        user_agent: userAgent,
      })
    }

    // Enviar email de boas-vindas (não é link de confirmação)
    try {
      const { sendEmail } = await import('@/lib/email')
      const profileNames = {
        investor: 'Investidor',
        asset: 'Empresa',
        advisor: 'Advisor',
      }
      await sendEmail({
        to: { email },
        subject: 'Bem-vindo à Mary Platform!',
        htmlContent: `
          <h1>Bem-vindo à Mary Platform!</h1>
          <p>Olá ${name || 'usuário'},</p>
          <p>Sua conta foi criada com sucesso como <strong>${profileNames[profileType]}</strong>!</p>
          <p>Você já pode fazer login em:</p>
          <p><a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/login">Acessar Mary Platform</a></p>
          <p>Após o login, você precisará verificar seu número de telefone via MFA (WhatsApp/SMS) e completar seu cadastro.</p>
        `,
      })
    } catch (emailError) {
      logger.warn('signupAction: Failed to send welcome email', { email, error: String(emailError) })
      // Não falhar o signup por causa do email de boas-vindas
    }
    
    // Create user profile with phone number
    await adminSupabase.from('user_profiles').insert({
      user_id: data.user.id,
      phone_number: phone,
      whatsapp_number: phone, // Assume same number for WhatsApp
      mfa_enabled: true, // MFA is mandatory
    })
    
    // Log audit event
    await adminSupabase.from('audit_logs').insert({
      user_id: data.user.id,
      action: 'auth.signup',
      metadata: {
        email,
        has_phone: !!phone,
        profile_type: profileType,
      },
      ip_address: ip,
      user_agent: userAgent,
    })
    
    // Reset rate limit on success
    await resetRateLimit(email, 'signup')
    
    logger.info('signupAction: User signed up', { userId: data.user.id, email, profileType })
    
    return {
      success: true,
      data: {
        userId: data.user.id,
        email: data.user.email || email,
      },
    }
  } catch (error) {
    logger.error('signupAction: Unexpected error', { error })
    return {
      success: false,
      error: 'Erro interno do servidor',
    }
  }
}

// ============================================
// Resend OTP Action
// ============================================

/**
 * Reenvia o código OTP para verificação MFA.
 */
export async function resendOtpAction(
  channel: 'whatsapp' | 'sms' = 'whatsapp'
): Promise<ActionResult<{ expiresAt?: string; testOtpCode?: string }>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return {
        success: false,
        error: 'Usuário não autenticado',
      }
    }
    
    // Check rate limit
    const rateLimitResult = await checkRateLimit(user.id, 'otp_request')
    if (!rateLimitResult.allowed) {
      return {
        success: false,
        error: rateLimitResult.infraFailure
          ? 'Serviço temporariamente indisponível. Tente novamente em instantes.'
          : `Aguarde ${rateLimitResult.retryAfterSeconds || 60} segundos para solicitar um novo código.`,
      }
    }
    
    // Send new OTP
    const mfaResult = await initiateMfa(user.id, channel)
    
    if (!mfaResult.success) {
      return {
        success: false,
        error: mfaResult.error || 'Falha ao enviar código',
      }
    }
    
    logger.info('resendOtpAction: OTP resent', { userId: user.id, channel })
    
    return {
      success: true,
      data: {
        expiresAt: mfaResult.expiresAt?.toISOString(),
        testOtpCode: mfaResult.testOtpCode,
      },
    }
  } catch (error) {
    logger.error('resendOtpAction: Unexpected error', { error })
    return {
      success: false,
      error: 'Erro interno do servidor',
    }
  }
}
