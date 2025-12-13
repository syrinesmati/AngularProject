import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { User } from '../models/user.model';
import { AuthService } from '../services/auth.service';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

/**
 * UserResolver - Pre-loads current user profile data before route activation
 * Used for: Protected routes that need user context
 *
 * Benefits:
 * - User data is available to all child components
 * - Can display user info in navbar/sidenav immediately
 * - Prevents flash of null user state
 */
export const userResolver: ResolveFn<User | null> = () => {
  const authService = inject(AuthService);

  // Get current user from signal (doesn't make API call, just accesses state)
  const currentUser = authService.getCurrentUser();

  if (!currentUser) {
    console.warn('No user found in resolver');
    return of(null);
  }

  return of(currentUser);
};
