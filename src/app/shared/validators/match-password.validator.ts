import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * MATCH PASSWORD VALIDATOR (Cross-Field Validation)
 * 
 * Validates that two password fields match.
 * This is a FORM-LEVEL validator, not a field-level validator.
 * 
 * Usage in FormGroup:
 * ```typescript
 * registerForm = this.fb.group({
 *   password: ['', [Validators.required]],
 *   confirmPassword: ['', [Validators.required]]
 * }, { validators: matchPasswordValidator('password', 'confirmPassword') });
 * ```
 * 
 * Check for error in template:
 * ```html
 * <div *ngIf="registerForm.hasError('passwordMismatch') && registerForm.get('confirmPassword')?.touched">
 *   Passwords do not match
 * </div>
 * ```
 */

export function matchPasswordValidator(
  passwordField: string = 'password',
  confirmPasswordField: string = 'confirmPassword'
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const password = control.get(passwordField);
    const confirmPassword = control.get(confirmPasswordField);

    // If controls don't exist, skip validation
    if (!password || !confirmPassword) {
      return null;
    }

    // If confirm password is empty, skip validation (let required handle it)
    if (!confirmPassword.value) {
      return null;
    }

    // Check if passwords match
    if (password.value !== confirmPassword.value) {
      // Set error on the confirmPassword field as well
      confirmPassword.setErrors({ ...confirmPassword.errors, passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      // Clear the passwordMismatch error if passwords now match
      const errors = confirmPassword.errors;
      if (errors) {
        delete errors['passwordMismatch'];
        confirmPassword.setErrors(Object.keys(errors).length > 0 ? errors : null);
      }
    }

    return null;
  };
}

/**
 * Alternative: Simple inline validator (used in existing register component)
 * Keep this for backward compatibility
 */
export function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');
  
  if (!password || !confirmPassword) {
    return null;
  }
  
  return password.value === confirmPassword.value ? null : { passwordMismatch: true };
}