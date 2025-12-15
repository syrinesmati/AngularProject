import { inject, Injectable } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { Observable, of, timer } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';

/**
 * UNIQUE EMAIL ASYNC VALIDATOR
 * 
 * Validates that an email address is not already registered.
 * This is an ASYNC validator - it makes an HTTP request to the backend.
 * 
 * Features:
 * - Debounces API calls (waits 500ms after user stops typing)
 * - Shows loading state while checking
 * - Caches results to avoid duplicate API calls
 * 
 * Usage:
 * ```typescript
 * @Component({...})
 * export class RegisterComponent {
 *   private uniqueEmailValidator = inject(UniqueEmailValidator);
 * 
 *   registerForm = this.fb.group({
 *     email: ['', 
 *       [Validators.required, Validators.email],
 *       [this.uniqueEmailValidator.validate.bind(this.uniqueEmailValidator)]
 *     ]
 *   });
 * }
 * ```
 * 
 * Check validation state in template:
 * ```html
 * <input formControlName="email" />
 * <div *ngIf="email.pending">Checking availability...</div>
 * <div *ngIf="email.hasError('emailTaken')">Email is already registered</div>
 * ```
 * 
 * IMPORTANT: For this to work, you need a backend endpoint:
 * GET /auth/check-email?email=test@example.com
 * Returns: { available: boolean }
 */

@Injectable({
  providedIn: 'root',
})
export class UniqueEmailValidator {
  private authService = inject(AuthService);
  private cache = new Map<string, boolean>(); // Cache to avoid duplicate API calls

  /**
   * Create validator function
   * @param debounceTime - Milliseconds to wait before making API call (default: 500ms)
   */
  validate(debounceTime: number = 500): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      const email = control.value;

      // Skip validation if email is empty or invalid format
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return of(null);
      }

      // Check cache first
      if (this.cache.has(email)) {
        const isAvailable = this.cache.get(email)!;
        return of(isAvailable ? null : { emailTaken: true });
      }

      // Debounce the API call
      return timer(debounceTime).pipe(
        switchMap(() => this.checkEmailAvailability(email)),
        map((isAvailable) => {
          this.cache.set(email, isAvailable); // Cache the result
          return isAvailable ? null : { emailTaken: true };
        }),
        catchError(() => {
          // If API call fails, don't block the form
          console.warn('Email availability check failed');
          return of(null);
        })
      );
    };
  }

  /**
   * Mock implementation - Replace with actual API call
   * 
   * In a real application, you would call:
   * this.authService.checkEmailAvailability(email)
   */
  private checkEmailAvailability(email: string): Observable<boolean> {
    // TODO: Replace this mock with actual API call
    // return this.http.get<{ available: boolean }>(
    //   this.authService.buildUrl(`/auth/check-email?email=${encodeURIComponent(email)}`)
    // ).pipe(map(response => response.available));

    // Mock implementation for testing
    const takenEmails = ['admin@taskflow.dev', 'member@taskflow.dev', 'test@example.com'];
    const isAvailable = !takenEmails.includes(email.toLowerCase());
    
    return of(isAvailable); // Simulate API response
  }

  /**
   * Clear cache (useful when form is reset)
   */
  clearCache(): void {
    this.cache.clear();
  }
}