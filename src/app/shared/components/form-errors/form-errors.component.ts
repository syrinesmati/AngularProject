import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl } from '@angular/forms';

/**
 * REUSABLE FORM ERROR DISPLAY COMPONENT
 * 
 * Displays validation errors for a form control with proper styling.
 * Supports all built-in validators + custom validators.
 * 
 * Usage:
 * ```html
 * <input formControlName="email" />
 * <app-form-errors [control]="email" [fieldName]="'Email'"></app-form-errors>
 * ```
 * 
 * Features:
 * - Only shows errors after field is touched
 * - Supports custom error messages
 * - Clean, consistent styling
 * - Handles all validator types
 */

@Component({
  selector: 'app-form-errors',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="shouldShowErrors()" class="mt-1 text-sm text-red-600">
      <!-- Required -->
      <p *ngIf="control?.hasError('required')">
        {{ fieldName }} is required
      </p>

      <!-- Email -->
      <p *ngIf="control?.hasError('email')">
        Please enter a valid email address
      </p>

      <!-- Min Length -->
      <p *ngIf="control?.hasError('minlength')">
        {{ fieldName }} must be at least {{ control?.errors?.['minlength'].requiredLength }} characters
        (current: {{ control?.errors?.['minlength'].actualLength }})
      </p>

      <!-- Max Length -->
      <p *ngIf="control?.hasError('maxlength')">
        {{ fieldName }} cannot exceed {{ control?.errors?.['maxlength'].requiredLength }} characters
      </p>

      <!-- Password Strength -->
      <div *ngIf="control?.hasError('passwordStrength')">
        <p class="font-semibold">Password must contain:</p>
        <ul class="list-disc list-inside ml-2">
          <li *ngIf="control?.errors?.['passwordStrength'].minLength">
            At least {{ control?.errors?.['passwordStrength'].minLength.requiredLength }} characters
          </li>
          <li *ngIf="control?.errors?.['passwordStrength'].requireUppercase">
            At least one uppercase letter
          </li>
          <li *ngIf="control?.errors?.['passwordStrength'].requireLowercase">
            At least one lowercase letter
          </li>
          <li *ngIf="control?.errors?.['passwordStrength'].requireNumber">
            At least one number
          </li>
          <li *ngIf="control?.errors?.['passwordStrength'].requireSpecialChar">
            At least one special character (!@#$%^&*)
          </li>
        </ul>
      </div>

      <!-- Password Mismatch -->
      <p *ngIf="control?.hasError('passwordMismatch')">
        Passwords do not match
      </p>

      <!-- Email Taken (Async Validator) -->
      <p *ngIf="control?.hasError('emailTaken')">
        This email is already registered
      </p>

      <!-- Leading/Trailing Spaces -->
      <p *ngIf="control?.hasError('leadingOrTrailingSpaces')">
        {{ fieldName }} cannot have leading or trailing spaces
      </p>

      <!-- Contains Spaces -->
      <p *ngIf="control?.hasError('containsSpaces')">
        {{ fieldName }} cannot contain spaces
      </p>

      <!-- Past Date -->
      <p *ngIf="control?.hasError('pastDate')">
        {{ control?.errors?.['pastDate'].message }}
      </p>

      <!-- Date Range -->
      <p *ngIf="control?.hasError('dateRange')">
        {{ control?.errors?.['dateRange'].message }}
      </p>

      <!-- Pattern -->
      <p *ngIf="control?.hasError('pattern')">
        Invalid format for {{ fieldName }}
      </p>

      <!-- Custom Error Message (if provided) -->
      <p *ngIf="customErrorMessage">
        {{ customErrorMessage }}
      </p>
    </div>

    <!-- Async Validator Pending State -->
    <div *ngIf="control?.pending" class="mt-1 text-sm text-blue-600">
      <span class="inline-flex items-center">
        <svg class="animate-spin h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Checking...
      </span>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class FormErrorsComponent {
  @Input() control: AbstractControl | null = null;
  @Input() fieldName: string = 'This field';
  @Input() customErrorMessage: string = '';

  /**
   * Only show errors if:
   * 1. Control exists
   * 2. Control is invalid
   * 3. Control has been touched OR form was submitted
   */
  shouldShowErrors(): boolean {
  return !!(this.control && this.control.invalid && this.control.touched);
    }
}