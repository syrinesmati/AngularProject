import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseService } from './base.service';

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  taskReminders: boolean;
  weeklyDigest: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class SettingsService extends BaseService {
  // LocalStorage keys
  private readonly PREFERENCES_KEY = 'user.preferences';
  private readonly THEME_KEY = 'app.theme';
  private readonly LANGUAGE_KEY = 'app.language';
  private readonly NOTIFICATIONS_KEY = 'app.notifications';

  /**
   * Load user preferences from localStorage
   */
  loadPreferences(): UserPreferences {
    const saved = localStorage.getItem(this.PREFERENCES_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (error) {
        console.error('Error parsing preferences from localStorage:', error);
        // Clear corrupted data and return defaults
        localStorage.removeItem(this.PREFERENCES_KEY);
        return this.getDefaultPreferences();
      }
    }
    return this.getDefaultPreferences();
  }

  /**
   * Save user preferences to localStorage
   */
  savePreferences(preferences: Partial<UserPreferences>): void {
    const current = this.loadPreferences();
    const updated = { ...current, ...preferences };
    localStorage.setItem(this.PREFERENCES_KEY, JSON.stringify(updated));
  }

  /**
   * Get current theme
   */
  getTheme(): 'light' | 'dark' | 'system' {
    return (localStorage.getItem(this.THEME_KEY) as any) || 'system';
  }

  /**
   * Set theme and apply to DOM
   */
  setTheme(theme: 'light' | 'dark' | 'system'): void {
    localStorage.setItem(this.THEME_KEY, theme);
    this.applyTheme(theme);
  }

  /**
   * Apply theme to document
   */
  private applyTheme(theme: 'light' | 'dark' | 'system'): void {
    const root = document.documentElement;
    const isDark =
      theme === 'dark' ||
      (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    root.classList.toggle('dark', isDark);
  }

  /**
   * Get language preference
   */
  getLanguage(): string {
    return localStorage.getItem(this.LANGUAGE_KEY) || 'en';
  }

  /**
   * Set language preference
   */
  setLanguage(language: string): void {
    localStorage.setItem(this.LANGUAGE_KEY, language);
  }

  /**
   * Get notification preferences
   */
  getNotificationPreferences(): Partial<UserPreferences> {
    const saved = localStorage.getItem(this.NOTIFICATIONS_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (error) {
        console.error('Error parsing notification preferences from localStorage:', error);
        // Clear corrupted data
        localStorage.removeItem(this.NOTIFICATIONS_KEY);
        return {};
      }
    }
    return {};
  }

  /**
   * Set notification preferences
   */
  setNotificationPreferences(prefs: Partial<UserPreferences>): void {
    const current = this.getNotificationPreferences();
    const updated = { ...current, ...prefs };
    localStorage.setItem(this.NOTIFICATIONS_KEY, JSON.stringify(updated));
  }

  /**
   * Clear all preferences
   */
  clearPreferences(): void {
    localStorage.removeItem(this.PREFERENCES_KEY);
    localStorage.removeItem(this.THEME_KEY);
    localStorage.removeItem(this.LANGUAGE_KEY);
    localStorage.removeItem(this.NOTIFICATIONS_KEY);
  }

  private getDefaultPreferences(): UserPreferences {
    return {
      theme: 'system',
      language: 'en',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      emailNotifications: true,
      pushNotifications: true,
      taskReminders: true,
      weeklyDigest: false,
    };
  }
}