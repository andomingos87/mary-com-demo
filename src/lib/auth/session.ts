/**
 * Session Management Service
 * 
 * Handles:
 * - Session creation with device fingerprinting
 * - Single session enforcement (invalidate previous sessions)
 * - 24-hour expiration
 * - Refresh token rotation
 * - Device and country detection
 */

import { createAdminClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import crypto from 'crypto';

const SESSION_CONFIG = {
  expiresInHours: 24,
  refreshTokenRotationEnabled: true,
};

interface DeviceInfo {
  fingerprint: string;
  name?: string;
  browser?: string;
  os?: string;
}

interface GeoInfo {
  ip?: string;
  countryCode?: string;
  city?: string;
}

interface CreateSessionResult {
  success: boolean;
  sessionId?: string;
  isNewDevice?: boolean;
  countryChanged?: boolean;
  previousCountry?: string;
  error?: string;
}

/**
 * Generate a device fingerprint from request headers
 */
export function generateDeviceFingerprint(
  userAgent: string,
  ip: string,
  acceptLanguage?: string
): string {
  const components = [
    userAgent,
    ip,
    acceptLanguage || '',
  ].join('|');
  
  return crypto.createHash('sha256').update(components).digest('hex').substring(0, 32);
}

/**
 * Parse user agent to extract device info
 */
export function parseUserAgent(userAgent: string): Omit<DeviceInfo, 'fingerprint'> {
  // Simple UA parsing - in production, use a library like 'ua-parser-js'
  const browser = userAgent.includes('Chrome') ? 'Chrome'
    : userAgent.includes('Firefox') ? 'Firefox'
    : userAgent.includes('Safari') ? 'Safari'
    : userAgent.includes('Edge') ? 'Edge'
    : 'Unknown';
  
  const os = userAgent.includes('Windows') ? 'Windows'
    : userAgent.includes('Mac') ? 'macOS'
    : userAgent.includes('Linux') ? 'Linux'
    : userAgent.includes('Android') ? 'Android'
    : userAgent.includes('iOS') ? 'iOS'
    : 'Unknown';
  
  const deviceType = userAgent.includes('Mobile') ? 'Mobile' : 'Desktop';
  
  return {
    name: `${deviceType} - ${browser}`,
    browser,
    os,
  };
}

/**
 * Create a new session for a user
 * This will invalidate any existing active sessions (single session enforcement)
 */
export async function createSession(
  userId: string,
  deviceInfo: DeviceInfo,
  geoInfo: GeoInfo
): Promise<CreateSessionResult> {
  const supabase = await createAdminClient();
  
  // Check if this is a known device
  const { data: knownDevice } = await supabase
    .from('known_devices')
    .select('*')
    .eq('user_id', userId)
    .eq('device_fingerprint', deviceInfo.fingerprint)
    .single();
  
  const isNewDevice = !knownDevice;
  
  // Check for country change
  const { data: userProfile } = await supabase
    .from('user_profiles')
    .select('last_known_country')
    .eq('user_id', userId)
    .single();
  
  const countryChanged = !!(userProfile?.last_known_country &&
    geoInfo.countryCode &&
    userProfile.last_known_country !== geoInfo.countryCode);
  
  // Invalidate all previous active sessions
  const { data: invalidatedCount } = await supabase
    .rpc('invalidate_user_sessions', { p_user_id: userId });
  
  if (invalidatedCount && invalidatedCount > 0) {
    logger.info('Invalidated previous sessions', { userId, count: invalidatedCount });
    
    // Log audit event for session invalidation
    await supabase.from('audit_logs').insert({
      user_id: userId,
      action: 'auth.session_invalidated',
      metadata: { count: invalidatedCount, reason: 'new_login' },
    });
  }
  
  // Create new session
  const expiresAt = new Date(Date.now() + SESSION_CONFIG.expiresInHours * 60 * 60 * 1000);
  
  const { data: session, error: sessionError } = await supabase
    .from('user_sessions')
    .insert({
      user_id: userId,
      device_fingerprint: deviceInfo.fingerprint,
      device_name: deviceInfo.name,
      browser: deviceInfo.browser,
      os: deviceInfo.os,
      ip_address: geoInfo.ip,
      country_code: geoInfo.countryCode,
      city: geoInfo.city,
      expires_at: expiresAt.toISOString(),
      mfa_verified: false,
    })
    .select()
    .single();
  
  if (sessionError || !session) {
    logger.error('Failed to create session', { sessionError, userId });
    return { success: false, error: 'Falha ao criar sessão' };
  }
  
  // Register device if new
  if (isNewDevice) {
    await supabase.from('known_devices').insert({
      user_id: userId,
      device_fingerprint: deviceInfo.fingerprint,
      device_name: deviceInfo.name,
      browser: deviceInfo.browser,
      os: deviceInfo.os,
    });
    
    // Log new device detection
    await supabase.from('audit_logs').insert({
      user_id: userId,
      action: 'auth.new_device_detected',
      metadata: {
        device_name: deviceInfo.name,
        browser: deviceInfo.browser,
        os: deviceInfo.os,
      },
      ip_address: geoInfo.ip,
    });
  } else {
    // Update last seen for known device
    await supabase
      .from('known_devices')
      .update({ last_seen_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('device_fingerprint', deviceInfo.fingerprint);
  }
  
  // Update user profile with current location
  if (geoInfo.countryCode) {
    await supabase
      .from('user_profiles')
      .update({
        last_known_country: geoInfo.countryCode,
        last_known_ip: geoInfo.ip,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);
    
    // Log country change if detected
    if (countryChanged) {
      await supabase.from('audit_logs').insert({
        user_id: userId,
        action: 'auth.country_change_detected',
        metadata: {
          previous_country: userProfile?.last_known_country,
          new_country: geoInfo.countryCode,
        },
        ip_address: geoInfo.ip,
      });
    }
  }
  
  // Log session creation
  await supabase.from('audit_logs').insert({
    user_id: userId,
    action: 'auth.session_created',
    metadata: {
      session_id: session.id,
      device_name: deviceInfo.name,
      is_new_device: isNewDevice,
    },
    ip_address: geoInfo.ip,
  });
  
  logger.info('Session created', {
    userId,
    sessionId: session.id,
    isNewDevice,
    countryChanged,
  });
  
  return {
    success: true,
    sessionId: session.id,
    isNewDevice,
    countryChanged,
    previousCountry: countryChanged ? (userProfile?.last_known_country ?? undefined) : undefined,
  };
}

/**
 * Get active session for a user
 */
export async function getActiveSession(userId: string): Promise<{
  id: string;
  mfa_verified: boolean;
  expires_at: string;
} | null> {
  const supabase = await createAdminClient();
  
  const { data } = await supabase
    .from('user_sessions')
    .select('id, mfa_verified, expires_at')
    .eq('user_id', userId)
    .eq('is_active', true)
    .gt('expires_at', new Date().toISOString())
    .single();
  
  return data;
}

/**
 * Invalidate a specific session
 */
export async function invalidateSession(sessionId: string): Promise<boolean> {
  const supabase = await createAdminClient();
  
  const { error } = await supabase
    .from('user_sessions')
    .update({ is_active: false })
    .eq('id', sessionId);
  
  return !error;
}

/**
 * Invalidate all sessions for a user
 */
export async function invalidateAllSessions(userId: string): Promise<number> {
  const supabase = await createAdminClient();
  
  const { data } = await supabase
    .rpc('invalidate_user_sessions', { p_user_id: userId });
  
  return data || 0;
}

/**
 * Update session activity timestamp
 */
export async function updateSessionActivity(sessionId: string): Promise<void> {
  const supabase = await createAdminClient();
  
  await supabase
    .from('user_sessions')
    .update({ last_activity_at: new Date().toISOString() })
    .eq('id', sessionId);
}

/**
 * Rotate refresh token for a session
 */
export async function rotateRefreshToken(
  sessionId: string,
  newTokenHash: string
): Promise<boolean> {
  if (!SESSION_CONFIG.refreshTokenRotationEnabled) {
    return true;
  }
  
  const supabase = await createAdminClient();
  
  const { error } = await supabase
    .from('user_sessions')
    .update({
      refresh_token_hash: newTokenHash,
      last_activity_at: new Date().toISOString(),
    })
    .eq('id', sessionId);
  
  return !error;
}

/**
 * Check if session is valid and not expired
 */
export async function isSessionValid(sessionId: string): Promise<boolean> {
  const supabase = await createAdminClient();
  
  const { data } = await supabase
    .from('user_sessions')
    .select('is_active, expires_at')
    .eq('id', sessionId)
    .single();
  
  if (!data) return false;
  
  return data.is_active && new Date(data.expires_at) > new Date();
}

