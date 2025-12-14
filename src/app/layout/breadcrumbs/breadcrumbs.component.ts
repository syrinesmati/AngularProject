import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterLink } from '@angular/router';
import { filter } from 'rxjs';
import { LucideIconComponent } from '../../shared/components/lucide-icon/lucide-icon.component';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

@Component({
  selector: 'app-breadcrumbs',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideIconComponent],
  templateUrl: './breadcrumbs.component.html',
  styleUrls: ['./breadcrumbs.component.css'],
})
export class BreadcrumbsComponent implements OnInit {
  breadcrumbs: BreadcrumbItem[] = [];

  private routeLabels: Record<string, string> = {
    dashboard: 'Dashboard',
    projects: 'Projects',
    tasks: 'Tasks',
    board: 'Board',
    admin: 'Admin',
    settings: 'Settings',
    notifications: 'Notifications',
    search: 'Search',
  };

  constructor(private router: Router) {}

  ngOnInit() {
    this.updateBreadcrumbs();

    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      this.updateBreadcrumbs();
    });
  }

  private updateBreadcrumbs() {
    const url = this.router.url.split('?')[0]; // Remove query params
    const pathnames = url.split('/').filter((x) => x);

    this.breadcrumbs = pathnames.map((segment, index) => {
      const path = `/${pathnames.slice(0, index + 1).join('/')}`;
      const label = this.routeLabels[segment] || this.capitalize(segment);
      return { label, path };
    });
  }

  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}
