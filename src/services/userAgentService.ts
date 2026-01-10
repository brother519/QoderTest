import UAParser from 'ua-parser-js';

export interface UserAgentInfo {
  deviceType?: string;
  browser?: string;
  os?: string;
}

/**
 * 解析User-Agent字符串
 * @param userAgent User-Agent字符串
 * @returns 解析后的信息
 */
export function parseUserAgent(userAgent: string): UserAgentInfo {
  try {
    const parser = new UAParser(userAgent);
    const result = parser.getResult();
    
    // 判断设备类型
    let deviceType = 'desktop';
    if (result.device.type === 'mobile') {
      deviceType = 'mobile';
    } else if (result.device.type === 'tablet') {
      deviceType = 'tablet';
    } else if (result.cpu.architecture === undefined && result.browser.name === undefined) {
      deviceType = 'bot';
    }
    
    return {
      deviceType,
      browser: result.browser.name,
      os: result.os.name,
    };
  } catch (error) {
    console.error('解析User-Agent失败:', error);
    return {};
  }
}
