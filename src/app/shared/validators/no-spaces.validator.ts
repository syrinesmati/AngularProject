import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * NO SPACES VALIDATOR
 * 
 * Validates that a string has no leading or trailing whitespace.
 * Optionally can disallow all spaces.
 * 
 * Use cases:
 * - Username fields
 * - Email fields (though email validator handles this)
 * - Project names
 * - Tags
 * 
 * Usage:
 * ```typescript
 * username: ['', [Validators.required, noSpacesValidator()]]
 * projectName: ['', [noSpacesValidator({ trim: true })]]
 * tag: ['', [noSpacesValidator({ allowInternal: false })]]
 * ```
 */

export interface NoSpacesOptions {
  /**
   * If true, trim the value automatically (modifies the control value)
   * Default: false
   */
  trim?: boolean;

  /**
   * If true, allow spaces in the middle of the string
   * If false, disallow ALL spaces
   * Default: true
   */
  allowInternal?: boolean;
}

export function noSpacesValidator(options: NoSpacesOptions = {}): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (!value || typeof value !== 'string') {
      return null; // Don't validate empty values
    }

    const config = {
      trim: options.trim ?? false,
      allowInternal: options.allowInternal ?? true,
    };

    // Auto-trim if enabled
    if (config.trim && (value.startsWith(' ') || value.endsWith(' '))) {
      const trimmedValue = value.trim();
      control.setValue(trimmedValue, { emitEvent: false });
      return null; // Value is now valid after trimming
    }

    // Check for leading/trailing spaces
    if (value.startsWith(' ') || value.endsWith(' ')) {
      return { leadingOrTrailingSpaces: true };
    }

    // Check for any spaces if allowInternal is false
    if (!config.allowInternal && value.includes(' ')) {
      return { containsSpaces: true };
    }

    return null;
  };
}

/**
 * Stricter version - no spaces at all
 */
export function noSpacesAtAllValidator(): ValidatorFn {
  return noSpacesValidator({ allowInternal: false });
}

/**
 * Auto-trim version - automatically removes leading/trailing spaces
 */
export function autoTrimValidator(): ValidatorFn {
  return noSpacesValidator({ trim: true, allowInternal: true });
}