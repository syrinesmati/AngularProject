import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsService } from '../../../core/services/settings.service';

@Component({
  selector: 'app-preferences',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './preferences.component.html',
  styleUrls: ['./preferences.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PreferencesComponent {
  private settingsService = inject(SettingsService);

  darkMode = signal(false);
  preferences = this.settingsService.loadPreferences();

  constructor() {
    this.darkMode.set(this.settingsService.getTheme() === 'dark');
  }

  toggleDarkMode() {
    const newTheme = this.darkMode() ? 'light' : 'dark';
    this.settingsService.setTheme(newTheme);
    this.darkMode.set(!this.darkMode());
  }

  savePreferences() {
    // Save preferences logic
    console.log('Preferences saved');
  }
}
