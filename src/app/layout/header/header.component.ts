// header.component.ts - Add hasAvatar() helper and error handling
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { BreadcrumbsComponent } from '../breadcrumbs/breadcrumbs.component';
import { GlobalSearchComponent } from '../global-search/global-search.component';
import { NotificationsDropdownComponent } from '../notifications-dropdown/notifications-dropdown.component';
import { LucideIconComponent } from '../../shared/components/lucide-icon/lucide-icon.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    BreadcrumbsComponent,
    GlobalSearchComponent,
    NotificationsDropdownComponent,
    LucideIconComponent,
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  currentUser = this.authService.currentUserSignal;
  showUserDropdown = false;
  private avatarError = signal(false);

  getInitials(): string {
    const user = this.currentUser();
    if (!user) return 'U';

    const name = `${user.firstName} ${user.lastName}`;
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  }

  getUserName(): string {
    const user = this.currentUser();
    return user ? `${user.firstName} ${user.lastName}` : '';
  }

  hasAvatar(): boolean {
    const user = this.currentUser();
    return !!(user?.avatar && !this.avatarError());
  }

  onAvatarError(event: Event): void {
    // Fallback to initials if image fails to load
    this.avatarError.set(true);
    (event.target as HTMLImageElement).style.display = 'none';
  }

  toggleUserDropdown() {
    this.showUserDropdown = !this.showUserDropdown;
  }

  navigateToProfile() {
    this.router.navigate(['/profile/edit']);
    this.showUserDropdown = false;
  }

  navigateToSettings() {
    this.router.navigate(['/settings/edit']);
    this.showUserDropdown = false;
  }

  logout() {
    this.authService.logout().subscribe();
    this.showUserDropdown = false;
  }
}