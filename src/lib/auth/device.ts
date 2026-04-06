/**
 * Device Detection and Geo-location Service
 * 
 * Handles:
 * - Device fingerprinting
 * - New device detection
 * - Country/location change detection
 * - Sending alerts for security events
 */

import { createAdminClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import { sendNewDeviceAlert, sendCountryChangeAlert } from './whatsapp';

// Country code to name mapping (common countries)
const COUNTRY_NAMES: Record<string, string> = {
  BR: 'Brasil',
  US: 'Estados Unidos',
  PT: 'Portugal',
  ES: 'Espanha',
  AR: 'Argentina',
  MX: 'México',
  CO: 'Colômbia',
  CL: 'Chile',
  PE: 'Peru',
  GB: 'Reino Unido',
  DE: 'Alemanha',
  FR: 'França',
  IT: 'Itália',
  CA: 'Canadá',
  AU: 'Austrália',
  JP: 'Japão',
  CN: 'China',
};

interface GeoLocation {
  ip: string;
  countryCode?: string;
  countryName?: string;
  city?: string;
  region?: string;
  timezone?: string;
}

/**
 * Get geo-location from IP address
 * Uses free ip-api.com service - for production, consider ipinfo.io or similar
 */
export async function getGeoLocation(ip: string): Promise<GeoLocation> {
  // Skip for localhost/private IPs
  if (isPrivateIp(ip)) {
    return {
      ip,
      countryCode: 'BR', // Default to Brazil for development
      countryName: 'Brasil',
      city: 'Local',
    };
  }
  
  try {
    const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,countryCode,region,city,timezone`);
    
    if (!response.ok) {
      throw new Error('Geo-location API error');
    }
    
    const data = await response.json();
    
    if (data.status !== 'success') {
      throw new Error('Geo-location lookup failed');
    }
    
    return {
      ip,
      countryCode: data.countryCode,
      countryName: data.country,
      city: data.city,
      region: data.region,
      timezone: data.timezone,
    };
  } catch (error) {
    logger.warn('Geo-location lookup failed', { error, ip });
    return { ip };
  }
}

/**
 * Check if IP is private/local
 */
function isPrivateIp(ip: string): boolean {
  if (ip === '127.0.0.1' || ip === 'localhost' || ip === '::1') {
    return true;
  }
  
  // Check for private IP ranges
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4) return true;
  
  // 10.0.0.0 - 10.255.255.255
  if (parts[0] === 10) return true;
  
  // 172.16.0.0 - 172.31.255.255
  if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
  
  // 192.168.0.0 - 192.168.255.255
  if (parts[0] === 192 && parts[1] === 168) return true;
  
  return false;
}

/**
 * Check if device is known for a user
 */
export async function isKnownDevice(
  userId: string,
  deviceFingerprint: string
): Promise<boolean> {
  const supabase = await createAdminClient();
  
  const { data } = await supabase
    .from('known_devices')
    .select('id')
    .eq('user_id', userId)
    .eq('device_fingerprint', deviceFingerprint)
    .single();
  
  return !!data;
}

/**
 * Register a new device for a user
 */
export async function registerDevice(
  userId: string,
  deviceFingerprint: string,
  deviceInfo: {
    name?: string;
    browser?: string;
    os?: string;
  }
): Promise<void> {
  const supabase = await createAdminClient();
  
  await supabase.from('known_devices').upsert({
    user_id: userId,
    device_fingerprint: deviceFingerprint,
    device_name: deviceInfo.name,
    browser: deviceInfo.browser,
    os: deviceInfo.os,
    last_seen_at: new Date().toISOString(),
  }, {
    onConflict: 'user_id,device_fingerprint',
  });
}

/**
 * Get user's known devices
 */
export async function getUserDevices(userId: string): Promise<Array<{
  id: string;
  device_name: string | null;
  browser: string | null;
  os: string | null;
  first_seen_at: string;
  last_seen_at: string;
  is_trusted: boolean;
}>> {
  const supabase = await createAdminClient();
  
  const { data } = await supabase
    .from('known_devices')
    .select('id, device_name, browser, os, first_seen_at, last_seen_at, is_trusted')
    .eq('user_id', userId)
    .order('last_seen_at', { ascending: false });
  
  return data || [];
}

/**
 * Remove a device from user's known devices
 */
export async function removeDevice(
  userId: string,
  deviceId: string
): Promise<boolean> {
  const supabase = await createAdminClient();
  
  const { error } = await supabase
    .from('known_devices')
    .delete()
    .eq('id', deviceId)
    .eq('user_id', userId);
  
  return !error;
}

/**
 * Check for country change and send alert if needed
 */
export async function checkCountryChange(
  userId: string,
  newCountryCode: string
): Promise<{ changed: boolean; previousCountry?: string }> {
  const supabase = await createAdminClient();
  
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('last_known_country, whatsapp_number, phone_number')
    .eq('user_id', userId)
    .single();
  
  if (!profile?.last_known_country) {
    return { changed: false };
  }
  
  if (profile.last_known_country === newCountryCode) {
    return { changed: false };
  }
  
  const previousCountry = profile.last_known_country;
  const newCountryName = COUNTRY_NAMES[newCountryCode] || newCountryCode;
  
  // Send alert
  const phoneNumber = profile.whatsapp_number || profile.phone_number;
  if (phoneNumber) {
    await sendCountryChangeAlert(userId, phoneNumber, newCountryName);
  }
  
  // Log audit event
  await supabase.from('audit_logs').insert({
    user_id: userId,
    action: 'auth.country_change_detected',
    metadata: {
      previous_country: previousCountry,
      new_country: newCountryCode,
      new_country_name: newCountryName,
    },
  });
  
  logger.warn('Country change detected', {
    userId,
    previousCountry,
    newCountry: newCountryCode,
  });
  
  return { changed: true, previousCountry };
}

/**
 * Handle new device detection and send alert
 */
export async function handleNewDevice(
  userId: string,
  deviceInfo: {
    name?: string;
    browser?: string;
    os?: string;
  },
  geoLocation: GeoLocation
): Promise<void> {
  const supabase = await createAdminClient();
  
  // Get user's phone number for alert
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('whatsapp_number, phone_number')
    .eq('user_id', userId)
    .single();
  
  const phoneNumber = profile?.whatsapp_number || profile?.phone_number;
  
  if (phoneNumber) {
    const deviceDescription = deviceInfo.name || `${deviceInfo.browser} em ${deviceInfo.os}`;
    const location = geoLocation.city && geoLocation.countryName
      ? `${geoLocation.city}, ${geoLocation.countryName}`
      : geoLocation.countryName || 'Localização desconhecida';
    
    await sendNewDeviceAlert(userId, phoneNumber, {
      device: deviceDescription,
      location,
    });
  }
  
  // Log audit event
  await supabase.from('audit_logs').insert({
    user_id: userId,
    action: 'auth.new_device_detected' as const,
    metadata: {
      device_name: deviceInfo.name,
      browser: deviceInfo.browser,
      os: deviceInfo.os,
      location: {
        ip: geoLocation.ip,
        country: geoLocation.countryCode,
        city: geoLocation.city,
      },
    },
    ip_address: geoLocation.ip,
  });
  
  logger.info('New device detected', { userId, deviceInfo, geoLocation });
}

/**
 * Get country name from code
 */
export function getCountryName(countryCode: string): string {
  return COUNTRY_NAMES[countryCode] || countryCode;
}

