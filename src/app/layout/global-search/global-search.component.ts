import { Component, signal, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LucideIconComponent } from '../../shared/components/lucide-icon/lucide-icon.component';

@Component({
  selector: 'app-global-search',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideIconComponent],
  templateUrl: './global-search.component.html',
  styleUrls: ['./global-search.component.css'],
})
export class GlobalSearchComponent {
  isOpen = signal(false);
  query = signal('');

  // Mock data - replace with actual service calls
  tasks: any[] = [];
  projects: any[] = [];

  constructor(private router: Router, private elementRef: ElementRef) {}

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    // Cmd/Ctrl + K to open search
    if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
      event.preventDefault();
      this.isOpen.set(true);
    }
    // Escape to close
    if (event.key === 'Escape') {
      this.isOpen.set(false);
      this.query.set('');
    }
  }

  @HostListener('document:mousedown', ['$event'])
  handleClickOutside(event: MouseEvent) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
    }
  }

  openSearch() {
    this.isOpen.set(true);
  }

  closeSearch() {
    this.isOpen.set(false);
    this.query.set('');
  }

  onQueryChange(value: string) {
    this.query.set(value);
    // TODO: Implement actual search logic
  }

  selectTask(taskId: string) {
    this.router.navigate(['/tasks']);
    this.closeSearch();
  }

  selectProject(projectId: string) {
    this.router.navigate(['/projects']);
    this.closeSearch();
  }

  get hasResults(): boolean {
    return this.tasks.length > 0 || this.projects.length > 0;
  }
}
