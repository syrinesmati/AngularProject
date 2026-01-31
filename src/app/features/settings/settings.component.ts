import { Component, effect, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Params } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { ProfileComponent } from './profile/profile.component';
import { PreferencesComponent } from './preferences/preferences.component';
import { SecurityComponent } from './security/security.component';
import { NotificationsComponent } from './notifications/notifications.component';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    ProfileComponent,
    PreferencesComponent,
    SecurityComponent,
    NotificationsComponent,
  ],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsComponent {
  private route = inject(ActivatedRoute);
  private queryParams = toSignal(this.route.queryParams, { initialValue: {} as Params });

  activeTab: 'profile' | 'notifications' | 'appearance' | 'security' = 'profile';

  constructor() {
    // Check for tab query parameter
    effect(() => {
      const params = this.queryParams();
      const tab = params['tab'];
      if (tab && ['profile', 'notifications', 'appearance', 'security'].includes(tab)) {
        this.activeTab = tab as 'profile' | 'notifications' | 'appearance' | 'security';
      }
    });
  }

  setActiveTab(tab: 'profile' | 'notifications' | 'appearance' | 'security') {
    this.activeTab = tab;
  }
}
