import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
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
})
export class SettingsComponent implements OnInit {
  private route = inject(ActivatedRoute);

  activeTab: 'profile' | 'notifications' | 'appearance' | 'security' = 'profile';

  ngOnInit() {
    // Check for tab query parameter
    this.route.queryParams.subscribe(params => {
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