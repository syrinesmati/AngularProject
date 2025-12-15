import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * PASSWORD STRENGTH VALIDATOR
 * 
 * Validates password complexity based on configurable rules.
 * 
 * Requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character (!@#$%^&*)
 * 
 * Usage:
 * ```typescript
 * password: ['', [Validators.required, passwordStrengthValidator()]]
 * ```
 * 
 * Custom options:
 * ```typescript
 * password: ['', [passwordStrengthValidator({ minLength: 10, requireSpecialChar: false })]]
 * ```
 */

export interface PasswordStrengthOptions {
  minLength?: number;
  requireUppercase?: boolean;
  requireLowercase?: boolean;
  requireNumber?: boolean;
  requireSpecialChar?: boolean;
}

export function passwordStrengthValidator(
  options: PasswordStrengthOptions = {}
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (!value) {
      return null; // Don't validate empty values (use Validators.required for that)
    }

    // Default options
    const config = {
      minLength: options.minLength ?? 8,
      requireUppercase: options.requireUppercase ?? true,
      requireLowercase: options.requireLowercase ?? true,
      requireNumber: options.requireNumber ?? true,
      requireSpecialChar: options.requireSpecialChar ?? true,
    };

    const errors: ValidationErrors = {};

    // Check minimum length
    if (value.length < config.minLength) {
      errors['minLength'] = {
        requiredLength: config.minLength,
        actualLength: value.length,
      };
    }

    // Check for uppercase letter
    if (config.requireUppercase && !/[A-Z]/.test(value)) {
      errors['requireUppercase'] = true;
    }

    // Check for lowercase letter
    if (config.requireLowercase && !/[a-z]/.test(value)) {
      errors['requireLowercase'] = true;
    }

    // Check for number
    if (config.requireNumber && !/[0-9]/.test(value)) {
      errors['requireNumber'] = true;
    }

    // Check for special character
    if (config.requireSpecialChar && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value)) {
      errors['requireSpecialChar'] = true;
    }

    // Return null if no errors, otherwise return errors object
    return Object.keys(errors).length > 0 ? { passwordStrength: errors } : null;
  };
}

/**
 * Helper function to get password strength as a percentage
 * Useful for progress bars or strength indicators
 */
export function getPasswordStrength(password: string): number {
  if (!password) return 0;

  let strength = 0;
  const checks = [
    password.length >= 8, // Length check
    /[A-Z]/.test(password), // Uppercase
    /[a-z]/.test(password), // Lowercase
    /[0-9]/.test(password), // Number
    /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password), // Special char
  ];

  checks.forEach((check) => {
    if (check) strength += 20;
  });

  return strength;
}