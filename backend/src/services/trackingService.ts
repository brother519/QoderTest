import geoip from 'geoip-lite';
import UAParser from 'ua-parser-js';
import { CreateClickInput } from '../types/models';

interface GeoData {
  country: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
}

interface DeviceData {
  browser: string | null;
  os: string | null;
  device_type: string | null;
}

/**
 * Get geographic location from IP address
 */
export function getGeoFromIP(ip: string): GeoData {
  // Handle localhost/private IPs
  if (ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
    return {
      country: null,
      city: null,
      latitude: null,
      longitude: null,
    };
  }

  const geo = geoip.lookup(ip);

  if (!geo) {
    return {
      country: null,
      city: null,
      latitude: null,
      longitude: null,
    };
  }

  return {
    country: geo.country || null,
    city: geo.city || null,
    latitude: geo.ll ? geo.ll[0] : null,
    longitude: geo.ll ? geo.ll[1] : null,
  };
}

/**
 * Parse User-Agent string to get device information
 */
export function parseUserAgent(userAgent: string): DeviceData {
  const parser = new UAParser(userAgent);
  const result = parser.getResult();

  // Determine device type
  let deviceType = 'desktop';
  if (result.device.type) {
    deviceType = result.device.type; // mobile, tablet, etc.
  }

  return {
    browser: result.browser.name || null,
    os: result.os.name || null,
    device_type: deviceType,
  };
}

/**
 * Get client IP from request, handling proxies
 */
export function getClientIP(req: { headers: Record<string, string | string[] | undefined>; ip?: string; socket?: { remoteAddress?: string } }): string {
  // Check for forwarded headers (when behind proxy/load balancer)
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    const ips = Array.isArray(forwarded) ? forwarded[0] : forwarded;
    return ips.split(',')[0].trim();
  }

  const realIP = req.headers['x-real-ip'];
  if (realIP) {
    return Array.isArray(realIP) ? realIP[0] : realIP;
  }

  return req.ip || req.socket?.remoteAddress || '0.0.0.0';
}

/**
 * Build click tracking data from request
 */
export function buildClickData(
  linkId: number,
  req: { headers: Record<string, string | string[] | undefined>; ip?: string; socket?: { remoteAddress?: string } }
): CreateClickInput {
  const ip = getClientIP(req);
  const userAgent = (req.headers['user-agent'] as string) || '';
  const referer = (req.headers['referer'] as string) || (req.headers['referrer'] as string) || '';

  const geoData = getGeoFromIP(ip);
  const deviceData = parseUserAgent(userAgent);

  return {
    link_id: linkId,
    ip_address: ip,
    country: geoData.country || undefined,
    city: geoData.city || undefined,
    latitude: geoData.latitude || undefined,
    longitude: geoData.longitude || undefined,
    referer: referer || undefined,
    user_agent: userAgent || undefined,
    browser: deviceData.browser || undefined,
    os: deviceData.os || undefined,
    device_type: deviceData.device_type || undefined,
  };
}
