import { Component, DestroyRef, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

type Theme = 'system' | 'light' | 'dark';
interface AppSettings {
  theme: Theme;
  notifications: boolean;
  compactMode: boolean;
  language: 'en' | 'fr';
}

const SETTINGS_KEY = 'app.settings';

@Component({
  selector: 'app-settings-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './settings-form.component.html',
})
export class SettingsFormComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  isSaving = signal(false);

  form: FormGroup = this.fb.group({
    theme: this.fb.control<Theme>('system'),
    notifications: this.fb.control<boolean>(true),
    compactMode: this.fb.control<boolean>(false),
    language: this.fb.control<'en' | 'fr'>('en'),
  });

  get theme() { return this.form.get('theme') as FormControl<Theme>; }
  get notifications() { return this.form.get('notifications') as FormControl<boolean>; }
  get compactMode() { return this.form.get('compactMode') as FormControl<boolean>; }
  get language() { return this.form.get('language') as FormControl<'en' | 'fr'>; }

  constructor() {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as AppSettings;
        this.form.patchValue(parsed);
        this.applyTheme(parsed.theme);
        this.applyCompactMode(parsed.compactMode);
      } catch {}
    }

    this.form.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(v => {
        this.applyTheme(v.theme);
        this.applyCompactMode(v.compactMode);
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(v));
      });
  }

  closeModal(): void {
    this.router.navigate(['/dashboard']);
  }

  private applyTheme(theme: Theme): void {
    const root = document.documentElement;
    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    root.classList.toggle('dark', isDark);
  }

  private applyCompactMode(enabled: boolean): void {
    document.documentElement.classList.toggle('compact', enabled);
  }

  submit(): void {
    this.isSaving.set(true);
    setTimeout(() => {
      this.isSaving.set(false);
      this.router.navigate(['/dashboard']);
    }, 400);
  }
}