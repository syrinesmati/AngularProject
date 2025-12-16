import { Component, signal, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { UserRole } from '../../core/models/user.model';
import { LucideIconComponent } from '../../shared/components/lucide-icon/lucide-icon.component';

interface NavItem {
  path: string;
  label: string;
  icon: string;
  badge?: number;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, LucideIconComponent],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent {
  private authService = inject(AuthService);

  collapsed = signal(false);
  @Output() collapsedChange = new EventEmitter<boolean>();

  currentUser = this.authService.currentUserSignal;
  UserRole = UserRole;

  navItems: NavItem[] = [
    { path: '/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
    { path: '/projects', label: 'Projects', icon: 'FolderOpen' },
    { path: '/tasks', label: 'Tasks', icon: 'ListTodo' },
    { path: '/board', label: 'Board', icon: 'Kanban' },
  ];

  bottomNavItems: NavItem[] = [
    { path: '/search', label: 'Search', icon: 'Search' },
    { path: '/notifications', label: 'Notifications', icon: 'Bell', badge: 2 },
    { path: '/settings', label: 'Settings', icon: 'Settings' },
  ];

  toggleCollapse() {
    this.collapsed.update((v) => !v);
    this.collapsedChange.emit(this.collapsed());
  }

  getInitials(email: string): string {
    return email?.charAt(0).toUpperCase() || 'U';
  }
}
