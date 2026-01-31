import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationsComponent {
  emailNotifications = signal(true);
  pushNotifications = signal(true);
  taskReminders = signal(true);
  weeklyDigest = signal(false);

  toggleEmail() {
    this.emailNotifications.set(!this.emailNotifications());
  }

  togglePush() {
    this.pushNotifications.set(!this.pushNotifications());
  }

  toggleReminders() {
    this.taskReminders.set(!this.taskReminders());
  }

  toggleDigest() {
    this.weeklyDigest.set(!this.weeklyDigest());
  }
}
