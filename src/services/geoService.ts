import geoip from 'geoip-lite';

export interface GeoLocation {
  country?: string;
  city?: string;
}

/**
 * 从IP地址解析地理位置
 * @param ip IP地址
 * @returns 地理位置信息
 */
export function getLocationFromIP(ip: string): GeoLocation {
  try {
    const geo = geoip.lookup(ip);
    
    if (!geo) {
      return {};
    }
    
    return {
      country: geo.country,
      city: geo.city || undefined,
    };
  } catch (error) {
    console.error('解析IP地理位置失败:', error);
    return {};
  }
}
