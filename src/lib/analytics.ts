/**
 * Analytics Module
 * 
 * Provides tracking functions for key user actions.
 * Currently logs to console in development and can be expanded
 * to integrate with analytics providers (Mixpanel, Amplitude, etc.)
 * 
 * Created as part of ADR-001: Profile Selection on Landing
 */

import type { OrganizationProfile } from '@/types/database'

// Analytics event types
export type AnalyticsEvent = 
  | 'profile_preselected'
  | 'signup_started'
  | 'signup_completed'
  | 'onboarding_step_completed'
  | 'onboarding_completed'
  | 'onboarding_abandoned'

// Event properties interfaces
interface ProfilePreselectedProps {
  profile_type: OrganizationProfile
  selection_method: 'landing_page_cta' | 'direct_url'
}

interface SignupProps {
  profile_type: OrganizationProfile
  email_domain?: string
}

interface OnboardingStepProps {
  step: string
  profile_type: OrganizationProfile
  duration_seconds?: number
}

// Generic event props type
type EventProps = 
  | ProfilePreselectedProps 
  | SignupProps 
  | OnboardingStepProps
  | Record<string, unknown>

/**
 * Track an analytics event
 * 
 * In development, logs to console.
 * In production, can be configured to send to analytics provider.
 */
export function track(event: AnalyticsEvent, properties?: EventProps): void {
  const timestamp = new Date().toISOString()
  
  // Log in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics]', { event, properties, timestamp })
  }
  
  // TODO: Integrate with analytics provider (Mixpanel, Amplitude, etc.)
  // Example:
  // if (typeof window !== 'undefined' && window.mixpanel) {
  //   window.mixpanel.track(event, { ...properties, timestamp })
  // }
}

/**
 * Track profile preselection from landing page CTA
 */
export function trackProfilePreselected(
  profileType: OrganizationProfile,
  selectionMethod: 'landing_page_cta' | 'direct_url' = 'landing_page_cta'
): void {
  track('profile_preselected', {
    profile_type: profileType,
    selection_method: selectionMethod,
  })
}

/**
 * Track signup started
 */
export function trackSignupStarted(
  profileType: OrganizationProfile,
  email?: string
): void {
  track('signup_started', {
    profile_type: profileType,
    email_domain: email ? email.split('@')[1] : undefined,
  })
}

/**
 * Track signup completed
 */
export function trackSignupCompleted(
  profileType: OrganizationProfile
): void {
  track('signup_completed', {
    profile_type: profileType,
  })
}

/**
 * Track onboarding step completed
 */
export function trackOnboardingStepCompleted(
  step: string,
  profileType: OrganizationProfile,
  durationSeconds?: number
): void {
  track('onboarding_step_completed', {
    step,
    profile_type: profileType,
    duration_seconds: durationSeconds,
  })
}

/**
 * Track onboarding completed
 */
export function trackOnboardingCompleted(
  profileType: OrganizationProfile,
  totalDurationMinutes?: number
): void {
  track('onboarding_completed', {
    profile_type: profileType,
    total_duration_minutes: totalDurationMinutes,
  })
}

// Export default object for convenience
const analytics = {
  track,
  trackProfilePreselected,
  trackSignupStarted,
  trackSignupCompleted,
  trackOnboardingStepCompleted,
  trackOnboardingCompleted,
}

export default analytics
