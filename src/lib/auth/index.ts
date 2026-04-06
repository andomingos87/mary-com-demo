/**
 * Authentication Module - Main Entry Point
 * 
 * Re-exports all auth-related functionality for easy imports
 */

// OTP
export { createOtp, verifyOtp, generateOtpCode, getOtpRemainingAttempts } from './otp';

// MFA
export {
  initiateMfa,
  verifyMfa,
  resendMfaCode,
  isMfaEnabled,
  isSessionMfaVerified,
  type MfaChannel,
} from './mfa';

// Session
export {
  createSession,
  getActiveSession,
  invalidateSession,
  invalidateAllSessions,
  updateSessionActivity,
  isSessionValid,
  generateDeviceFingerprint,
  parseUserAgent,
} from './session';

// Rate Limiting
export {
  checkRateLimit,
  resetRateLimit,
  getRateLimitStatus,
  withRateLimit,
  getRateLimitMessage,
} from './rate-limit';

// Device & Geo
export {
  getGeoLocation,
  isKnownDevice,
  registerDevice,
  getUserDevices,
  removeDevice,
  checkCountryChange,
  handleNewDevice,
  getCountryName,
} from './device';

// WhatsApp
export {
  sendOtpViaWhatsApp,
  sendNewDeviceAlert,
  sendCountryChangeAlert,
  isWhatsAppAvailable,
  getWhatsAppStatus,
} from './whatsapp';

// SMS
export { sendOtpViaSms, getSmsProviderStatus } from './sms';

