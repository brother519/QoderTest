import validator from 'validator';

/**
 * 验证URL是否有效
 * @param url URL字符串
 * @returns 是否有效
 */
export function isValidUrl(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }
  
  // URL长度限制
  if (url.length > 2048) {
    return false;
  }
  
  // 使用validator库验证URL格式
  if (!validator.isURL(url, {
    protocols: ['http', 'https'],
    require_protocol: true,
  })) {
    return false;
  }
  
  return true;
}

/**
 * 规范化URL（添加协议、移除末尾斜杠等）
 * @param url URL字符串
 * @returns 规范化后的URL
 */
export function normalizeUrl(url: string): string {
  let normalized = url.trim();
  
  // 如果没有协议，默认添加https://
  if (!/^https?:\/\//i.test(normalized)) {
    normalized = `https://${normalized}`;
  }
  
  // 移除末尾斜杠（除非是根路径）
  if (normalized.endsWith('/') && normalized.split('/').length > 3) {
    normalized = normalized.slice(0, -1);
  }
  
  return normalized;
}

/**
 * 检查URL是否在黑名单中（简单示例，实际应使用外部黑名单服务）
 * @param url URL字符串
 * @returns 是否在黑名单中
 */
export function isBlacklistedUrl(url: string): boolean {
  const blacklist = [
    'example-malware.com',
    'phishing-site.com',
  ];
  
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    
    return blacklist.some(domain => hostname.includes(domain));
  } catch {
    return false;
  }
}
