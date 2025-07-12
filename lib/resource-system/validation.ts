import { FieldSchema, ValidationRule } from './schemas';

// Validation result type
export interface ValidationResult {
  isValid: boolean;
  errors: Array<{
    field: string;
    message: string;
    mobileMessage?: string;
  }>;
}

// Validation context for mobile/desktop awareness
export interface ValidationContext {
  isMobile: boolean;
  formData: Record<string, any>;
  fieldSchema: FieldSchema;
}

// Composable validation rules
export const VALIDATION_RULES = {
  // Required field validation
  required: (message: string, mobileMessage?: string) => ({
    type: 'required' as const,
    message,
    mobileMessage,
    validate: (value: any, context: ValidationContext) => {
      const isEmpty = value === null || value === undefined || value === '' || 
                     (Array.isArray(value) && value.length === 0);
      
      if (isEmpty) {
        return {
          isValid: false,
          message: context.isMobile ? mobileMessage || 'Required' : message
        };
      }
      return { isValid: true };
    }
  }),

  // Minimum length validation
  minLength: (min: number, message: string, mobileMessage?: string) => ({
    type: 'minLength' as const,
    value: min,
    message,
    mobileMessage,
    validate: (value: any, context: ValidationContext) => {
      if (value && value.length < min) {
        return {
          isValid: false,
          message: context.isMobile ? mobileMessage || `Min ${min}` : message
        };
      }
      return { isValid: true };
    }
  }),

  // Maximum length validation
  maxLength: (max: number, message: string, mobileMessage?: string) => ({
    type: 'maxLength' as const,
    value: max,
    message,
    mobileMessage,
    validate: (value: any, context: ValidationContext) => {
      if (value && value.length > max) {
        return {
          isValid: false,
          message: context.isMobile ? mobileMessage || `Max ${max}` : message
        };
      }
      return { isValid: true };
    }
  }),

  // Pattern/regex validation
  pattern: (pattern: RegExp, message: string, mobileMessage?: string) => ({
    type: 'pattern' as const,
    value: pattern,
    message,
    mobileMessage,
    validate: (value: any, context: ValidationContext) => {
      if (value && !pattern.test(value)) {
        return {
          isValid: false,
          message: context.isMobile ? mobileMessage || 'Invalid format' : message
        };
      }
      return { isValid: true };
    }
  }),

  // Email validation
  email: (message: string = 'Please enter a valid email address', mobileMessage?: string) => ({
    type: 'email' as const,
    message,
    mobileMessage,
    validate: (value: any, context: ValidationContext) => {
      if (value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          return {
            isValid: false,
            message: context.isMobile ? mobileMessage || 'Invalid email' : message
          };
        }
      }
      return { isValid: true };
    }
  }),

  // URL validation
  url: (message: string = 'Please enter a valid URL', mobileMessage?: string) => ({
    type: 'url' as const,
    message,
    mobileMessage,
    validate: (value: any, context: ValidationContext) => {
      if (value) {
        try {
          new URL(value);
        } catch {
          return {
            isValid: false,
            message: context.isMobile ? mobileMessage || 'Invalid URL' : message
          };
        }
      }
      return { isValid: true };
    }
  }),

  // Number range validation
  min: (min: number, message: string, mobileMessage?: string) => ({
    type: 'min' as const,
    value: min,
    message,
    mobileMessage,
    validate: (value: any, context: ValidationContext) => {
      if (value !== null && value !== undefined && value < min) {
        return {
          isValid: false,
          message: context.isMobile ? mobileMessage || `Min ${min}` : message
        };
      }
      return { isValid: true };
    }
  }),

  max: (max: number, message: string, mobileMessage?: string) => ({
    type: 'max' as const,
    value: max,
    message,
    mobileMessage,
    validate: (value: any, context: ValidationContext) => {
      if (value !== null && value !== undefined && value > max) {
        return {
          isValid: false,
          message: context.isMobile ? mobileMessage || `Max ${max}` : message
        };
      }
      return { isValid: true };
    }
  }),

  // Custom validation function
  custom: (validator: (value: any, context: ValidationContext) => { isValid: boolean; message?: string }) => ({
    type: 'custom' as const,
    validate: validator
  })
} as const;

// Common validation patterns for mobile-first forms
export const COMMON_VALIDATIONS = {
  // Name field validation
  name: [
    VALIDATION_RULES.required('Name is required', 'Required'),
    VALIDATION_RULES.minLength(2, 'Name must be at least 2 characters', 'Too short'),
    VALIDATION_RULES.maxLength(50, 'Name must be less than 50 characters', 'Too long')
  ],

  // Identifier/slug validation
  identifier: [
    VALIDATION_RULES.required('Identifier is required', 'Required'),
    VALIDATION_RULES.minLength(2, 'Identifier must be at least 2 characters', 'Too short'),
    VALIDATION_RULES.maxLength(10, 'Identifier must be less than 10 characters', 'Too long'),
    VALIDATION_RULES.pattern(/^[A-Z0-9_-]+$/, 'Identifier must contain only uppercase letters, numbers, underscores, and hyphens', 'Invalid format')
  ],

  // Email validation
  email: [
    VALIDATION_RULES.required('Email is required', 'Required'),
    VALIDATION_RULES.email('Please enter a valid email address', 'Invalid email')
  ],

  // URL validation
  url: [
    VALIDATION_RULES.url('Please enter a valid URL', 'Invalid URL')
  ],

  // Description validation
  description: [
    VALIDATION_RULES.maxLength(500, 'Description must be less than 500 characters', 'Too long')
  ],

  // Password validation (if needed)
  password: [
    VALIDATION_RULES.required('Password is required', 'Required'),
    VALIDATION_RULES.minLength(8, 'Password must be at least 8 characters', 'Too short'),
    VALIDATION_RULES.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number', 'Weak password')
  ],

  // Phone number validation
  phone: [
    VALIDATION_RULES.pattern(/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number', 'Invalid phone')
  ]
} as const;

// Main validation function
export function validateField(
  fieldSchema: FieldSchema, 
  value: any, 
  formData: Record<string, any>,
  isMobile: boolean = false
): { isValid: boolean; message?: string } {
  if (!fieldSchema.validation || fieldSchema.validation.length === 0) {
    return { isValid: true };
  }

  const context: ValidationContext = {
    isMobile,
    formData,
    fieldSchema
  };

  // Run all validation rules for this field
  for (const rule of fieldSchema.validation) {
    const validator = createValidatorFromRule(rule);
    const result = validator.validate(value, context);
    
    if (!result.isValid) {
      return {
        isValid: false,
        message: result.message || rule.message
      };
    }
  }

  return { isValid: true };
}

// Validate entire form
export function validateForm(
  fields: FieldSchema[],
  formData: Record<string, any>,
  isMobile: boolean = false
): ValidationResult {
  const errors: Array<{ field: string; message: string; mobileMessage?: string }> = [];

  for (const field of fields) {
    const result = validateField(field, formData[field.key], formData, isMobile);
    
    if (!result.isValid && result.message) {
      errors.push({
        field: field.key,
        message: result.message,
        mobileMessage: result.message // Already mobile-optimized in validateField
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Create validator from validation rule
function createValidatorFromRule(rule: ValidationRule): any {
  switch (rule.type) {
    case 'required':
      return VALIDATION_RULES.required(rule.message, rule.mobileMessage);
    case 'minLength':
      return VALIDATION_RULES.minLength(rule.value, rule.message, rule.mobileMessage);
    case 'maxLength':
      return VALIDATION_RULES.maxLength(rule.value, rule.message, rule.mobileMessage);
    case 'pattern':
      return VALIDATION_RULES.pattern(rule.value, rule.message, rule.mobileMessage);
    case 'custom':
      return VALIDATION_RULES.custom(rule.value);
    default:
      return VALIDATION_RULES.custom(() => ({ isValid: true }));
  }
}

// Utility function to get validation error for a specific field
export function getFieldError(
  fieldKey: string,
  validationResult: ValidationResult
): string | undefined {
  const error = validationResult.errors.find(err => err.field === fieldKey);
  return error?.message;
}

// Utility function to check if a field has an error
export function hasFieldError(
  fieldKey: string,
  validationResult: ValidationResult
): boolean {
  return validationResult.errors.some(err => err.field === fieldKey);
}

// Utility function to get all errors for mobile display (shorter messages)
export function getMobileErrors(validationResult: ValidationResult): string[] {
  return validationResult.errors.map(err => err.mobileMessage || err.message);
}

// Real-time validation helper for mobile-first forms
export function createRealTimeValidator(
  fields: FieldSchema[],
  isMobile: boolean = false
) {
  return (formData: Record<string, any>, changedField?: string) => {
    // If a specific field changed, validate only that field for better UX
    if (changedField) {
      const field = fields.find(f => f.key === changedField);
      if (field) {
        const result = validateField(field, formData[changedField], formData, isMobile);
        return {
          isValid: result.isValid,
          errors: result.isValid ? [] : [{
            field: changedField,
            message: result.message || 'Invalid value',
            mobileMessage: result.message || 'Invalid'
          }]
        };
      }
    }

    // Full form validation
    return validateForm(fields, formData, isMobile);
  };
}

// Helper to create field-specific validators
export function createFieldValidator(fieldSchema: FieldSchema, isMobile: boolean = false) {
  return (value: any, formData: Record<string, any> = {}) => {
    return validateField(fieldSchema, value, formData, isMobile);
  };
}

// Export type for validator functions
export type FieldValidator = (value: any, formData?: Record<string, any>) => { isValid: boolean; message?: string };
export type FormValidator = (formData: Record<string, any>, changedField?: string) => ValidationResult; 