/**
 * SHARED VALIDATORS BARREL FILE
 * 
 * Exports all custom validators for easy importing.
 * 
 * Usage:
 * ```typescript
 * import { 
 *   passwordStrengthValidator,
 *   matchPasswordValidator,
 *   noSpacesValidator,
 *   dateRangeValidator
 * } from '@app/shared/validators';
 * ```
 */

// Password validators
export * from './password-strength.validator';
export * from './match-password.validator';

// Email validator
export * from './unique-email.validator';

// String validators
export * from './no-spaces.validator';

// Date validators
export * from './date-range.validator';