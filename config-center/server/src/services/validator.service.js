class ValidatorService {
  // Validate config value against rules
  validate(value, valueType, rules) {
    const errors = [];
    
    if (!rules) return { valid: true, errors: [] };
    
    // Type validation
    const typeError = this.validateType(value, valueType);
    if (typeError) {
      errors.push(typeError);
      return { valid: false, errors };
    }
    
    // Rule-specific validation
    switch (valueType) {
      case 'string':
        errors.push(...this.validateString(value, rules));
        break;
      case 'number':
        errors.push(...this.validateNumber(value, rules));
        break;
      case 'boolean':
        errors.push(...this.validateBoolean(value, rules));
        break;
      case 'json':
      case 'array':
        errors.push(...this.validateJson(value, rules));
        break;
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
  
  // Validate type
  validateType(value, expectedType) {
    if (value === null || value === undefined) {
      return null; // Allow null/undefined
    }
    
    switch (expectedType) {
      case 'number':
        if (isNaN(Number(value))) {
          return `Value must be a number`;
        }
        break;
      case 'boolean':
        if (value !== 'true' && value !== 'false' && value !== true && value !== false) {
          return `Value must be a boolean (true/false)`;
        }
        break;
      case 'json':
      case 'array':
        try {
          const parsed = typeof value === 'string' ? JSON.parse(value) : value;
          if (expectedType === 'array' && !Array.isArray(parsed)) {
            return `Value must be an array`;
          }
        } catch {
          return `Value must be valid JSON`;
        }
        break;
    }
    
    return null;
  }
  
  // Validate string rules
  validateString(value, rules) {
    const errors = [];
    const strValue = String(value);
    
    if (rules.minLength !== undefined && strValue.length < rules.minLength) {
      errors.push(`String length must be at least ${rules.minLength}`);
    }
    
    if (rules.maxLength !== undefined && strValue.length > rules.maxLength) {
      errors.push(`String length must not exceed ${rules.maxLength}`);
    }
    
    if (rules.pattern) {
      try {
        const regex = new RegExp(rules.pattern);
        if (!regex.test(strValue)) {
          errors.push(`Value does not match pattern: ${rules.pattern}`);
        }
      } catch {
        errors.push(`Invalid pattern: ${rules.pattern}`);
      }
    }
    
    if (rules.enum && Array.isArray(rules.enum)) {
      if (!rules.enum.includes(strValue)) {
        errors.push(`Value must be one of: ${rules.enum.join(', ')}`);
      }
    }
    
    return errors;
  }
  
  // Validate number rules
  validateNumber(value, rules) {
    const errors = [];
    const numValue = Number(value);
    
    if (rules.min !== undefined && numValue < rules.min) {
      errors.push(`Value must be at least ${rules.min}`);
    }
    
    if (rules.max !== undefined && numValue > rules.max) {
      errors.push(`Value must not exceed ${rules.max}`);
    }
    
    if (rules.integer && !Number.isInteger(numValue)) {
      errors.push(`Value must be an integer`);
    }
    
    if (rules.multipleOf !== undefined && numValue % rules.multipleOf !== 0) {
      errors.push(`Value must be a multiple of ${rules.multipleOf}`);
    }
    
    return errors;
  }
  
  // Validate boolean rules
  validateBoolean(value, rules) {
    // Boolean doesn't have additional rules
    return [];
  }
  
  // Validate JSON/array rules
  validateJson(value, rules) {
    const errors = [];
    
    try {
      const parsed = typeof value === 'string' ? JSON.parse(value) : value;
      
      if (Array.isArray(parsed)) {
        if (rules.minItems !== undefined && parsed.length < rules.minItems) {
          errors.push(`Array must have at least ${rules.minItems} items`);
        }
        
        if (rules.maxItems !== undefined && parsed.length > rules.maxItems) {
          errors.push(`Array must not exceed ${rules.maxItems} items`);
        }
      }
      
      if (rules.required && Array.isArray(rules.required)) {
        for (const field of rules.required) {
          if (parsed[field] === undefined) {
            errors.push(`Required field missing: ${field}`);
          }
        }
      }
    } catch {
      errors.push('Invalid JSON format');
    }
    
    return errors;
  }
}

module.exports = new ValidatorService();
