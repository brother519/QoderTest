/**
 * 模板变量解析器
 * 支持语法:
 * - {{name}} - 简单变量
 * - {{user.name}} - 嵌套对象访问
 * - {{name|'默认值'}} - 默认值
 */

export interface ParsedVariable {
  fullMatch: string;
  path: string;
  defaultValue?: string;
}

const VARIABLE_REGEX = /\{\{\s*([^}|]+?)(?:\s*\|\s*'([^']*)')?\s*\}\}/g;

/**
 * 从模板中提取所有变量
 */
export function extractVariables(template: string): string[] {
  const variables = new Set<string>();
  let match;
  
  while ((match = VARIABLE_REGEX.exec(template)) !== null) {
    variables.add(match[1].trim());
  }
  
  // Reset regex lastIndex
  VARIABLE_REGEX.lastIndex = 0;
  
  return Array.from(variables);
}

/**
 * 获取嵌套对象的值
 */
function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  const keys = path.split('.');
  let current: unknown = obj;
  
  for (const key of keys) {
    if (current === null || current === undefined) {
      return undefined;
    }
    
    // 处理数组索引 (e.g., items.0.name)
    if (Array.isArray(current) && /^\d+$/.test(key)) {
      current = current[parseInt(key, 10)];
    } else if (typeof current === 'object') {
      current = (current as Record<string, unknown>)[key];
    } else {
      return undefined;
    }
  }
  
  return current;
}

/**
 * 渲染模板，替换所有变量
 */
export function renderTemplate(
  template: string,
  variables: Record<string, unknown>
): string {
  return template.replace(VARIABLE_REGEX, (fullMatch, path, defaultValue) => {
    const trimmedPath = path.trim();
    const value = getNestedValue(variables, trimmedPath);
    
    if (value === undefined || value === null) {
      if (defaultValue !== undefined) {
        return defaultValue;
      }
      // 保留原始占位符如果没有值且没有默认值
      return fullMatch;
    }
    
    // 转换值为字符串
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    
    return String(value);
  });
}

/**
 * 验证所有必需变量是否已提供
 */
export function validateVariables(
  template: string,
  variables: Record<string, unknown>
): { valid: boolean; missing: string[] } {
  const requiredVariables = extractVariables(template);
  const missing: string[] = [];
  
  for (const varPath of requiredVariables) {
    // 检查模板中是否有默认值
    const hasDefault = new RegExp(`\\{\\{\\s*${varPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\|`).test(template);
    
    if (!hasDefault) {
      const value = getNestedValue(variables, varPath);
      if (value === undefined || value === null) {
        missing.push(varPath);
      }
    }
  }
  
  return {
    valid: missing.length === 0,
    missing,
  };
}

/**
 * 转义 HTML 特殊字符以防止 XSS
 */
export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * 安全渲染模板（对变量值进行 HTML 转义）
 */
export function renderTemplateSafe(
  template: string,
  variables: Record<string, unknown>
): string {
  return template.replace(VARIABLE_REGEX, (fullMatch, path, defaultValue) => {
    const trimmedPath = path.trim();
    const value = getNestedValue(variables, trimmedPath);
    
    if (value === undefined || value === null) {
      if (defaultValue !== undefined) {
        return escapeHtml(defaultValue);
      }
      return fullMatch;
    }
    
    if (typeof value === 'object') {
      return escapeHtml(JSON.stringify(value));
    }
    
    return escapeHtml(String(value));
  });
}
