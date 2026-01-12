// Base62 character set: 0-9, a-z, A-Z
const CHARSET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const BASE = CHARSET.length; // 62

/**
 * Encode a number to Base62 string
 */
export function encode(num: number): string {
  if (num === 0) return CHARSET[0];
  
  let result = '';
  let n = num;
  
  while (n > 0) {
    result = CHARSET[n % BASE] + result;
    n = Math.floor(n / BASE);
  }
  
  return result;
}

/**
 * Decode a Base62 string to number
 */
export function decode(str: string): number {
  let result = 0;
  
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    const index = CHARSET.indexOf(char);
    
    if (index === -1) {
      throw new Error(`Invalid Base62 character: ${char}`);
    }
    
    result = result * BASE + index;
  }
  
  return result;
}

/**
 * Generate a random Base62 string of specified length
 */
export function generateRandom(length: number): string {
  let result = '';
  
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * BASE);
    result += CHARSET[randomIndex];
  }
  
  return result;
}

/**
 * Validate if a string is a valid Base62 string
 */
export function isValid(str: string): boolean {
  if (!str || str.length === 0) return false;
  
  for (const char of str) {
    if (!CHARSET.includes(char)) {
      return false;
    }
  }
  
  return true;
}

/**
 * Pad a Base62 string to a minimum length
 */
export function padStart(str: string, length: number): string {
  while (str.length < length) {
    str = CHARSET[0] + str;
  }
  return str;
}
