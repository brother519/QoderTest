import baseX from 'base-x';

const BASE62 = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const base62 = baseX(BASE62);

/**
 * 将数字ID编码为Base62字符串
 * @param id 数字ID
 * @returns Base62编码的字符串
 */
export function encodeId(id: number): string {
  if (id <= 0) {
    throw new Error('ID必须大于0');
  }
  
  const buffer = Buffer.alloc(8);
  buffer.writeBigUInt64BE(BigInt(id));
  
  // 移除前导零字节
  let start = 0;
  while (start < buffer.length && buffer[start] === 0) {
    start++;
  }
  
  const encoded = base62.encode(buffer.slice(start));
  return encoded;
}

/**
 * 将Base62字符串解码为数字ID
 * @param code Base62编码的字符串
 * @returns 数字ID
 */
export function decodeShortCode(code: string): number {
  if (!code || code.length === 0) {
    throw new Error('短代码不能为空');
  }
  
  try {
    const decoded = base62.decode(code);
    const buffer = Buffer.alloc(8);
    decoded.copy(buffer, 8 - decoded.length);
    return Number(buffer.readBigUInt64BE());
  } catch (error) {
    throw new Error('无效的短代码格式');
  }
}

/**
 * 验证短代码格式
 * @param code 短代码
 * @returns 是否有效
 */
export function isValidShortCode(code: string): boolean {
  if (!code || typeof code !== 'string') {
    return false;
  }
  
  // 短代码长度应在2-10之间
  if (code.length < 2 || code.length > 10) {
    return false;
  }
  
  // 只包含Base62字符
  const base62Regex = /^[0-9a-zA-Z]+$/;
  return base62Regex.test(code);
}

/**
 * 生成随机短代码
 * @param length 短代码长度（默认6）
 * @returns 随机短代码
 */
export function generateRandomShortCode(length: number = 6): string {
  if (length < 2 || length > 10) {
    throw new Error('短代码长度必须在2-10之间');
  }
  
  let result = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * BASE62.length);
    result += BASE62[randomIndex];
  }
  
  return result;
}
