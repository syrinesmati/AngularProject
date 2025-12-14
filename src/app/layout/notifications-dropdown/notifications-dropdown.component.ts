import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { formatDistanceToNow } from 'date-fns';
import { LucideIconComponent } from '../../shared/components/lucide-icon/lucide-icon.component';

interface Notification {
  id: string;
  type: 'task_assigned' | 'comment' | 'due_soon' | 'member_added';
  title: string;
  description: string;
  read: boolean;
  createdAt: string;
}

@Component({
  selector: 'app-notifications-dropdown',
  standalone: true,
  imports: [CommonModule, LucideIconComponent],
  templateUrl: './notifications-dropdown.component.html',
  styleUrls: ['./notifications-dropdown.component.css'],
})
export class NotificationsDropdownComponent {
  showDropdown = signal(false);

  notifications = signal<Notification[]>([
    {
      id: '1',
      type: 'task_assigned',
      title: 'New task assigned',
      description: 'You have been assigned to "Design homepage mockups"',
      read: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min ago
    },
    {
      id: '2',
      type: 'comment',
      title: 'New comment',
      description: 'John commented on "API Integration"',
      read: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    },
    {
      id: '3',
      type: 'due_soon',
      title: 'Task due soon',
      description: '"Update documentation" is due tomorrow',
      read: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
    },
    {
      id: '4',
      type: 'member_added',
      title: 'Added to project',
      description: 'You were added to "Website Redesign"',
      read: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    },
  ]);

  get unreadCount(): number {
    return this.notifications().filter((n) => !n.read).length;
  }

  toggleDropdown() {
    this.showDropdown.update((v) => !v);
  }

  markAsRead(id: string) {
    this.notifications.update((notifications) =>
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }

  markAllAsRead() {
    this.notifications.update((notifications) => notifications.map((n) => ({ ...n, read: true })));
  }

  getTimeAgo(date: string): string {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  }

  getNotificationIcon(type: string): string {
    const icons: Record<string, string> = {
      task_assigned: 'Check',
      comment: 'MessageSquare',
      due_soon: 'Calendar',
      member_added: 'UserPlus',
    };
    return icons[type] || 'Bell';
  }

  getNotificationColor(type: string): string {
    const colors: Record<string, string> = {
      task_assigned: 'bg-primary/10 text-primary',
      comment: 'bg-blue-500/10 text-blue-500',
      due_soon: 'bg-amber-500/10 text-amber-500',
      member_added: 'bg-green-500/10 text-green-500',
    };
    return colors[type] || 'bg-muted text-muted-foreground';
  }
}
