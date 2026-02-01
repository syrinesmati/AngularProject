import {
  Component,
  signal,
  HostListener,
  ElementRef,
  OnInit,
  ChangeDetectionStrategy,
  inject,
  DestroyRef,
  AfterViewInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of, timer } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  switchMap,
  tap,
  catchError,
  finalize,
} from 'rxjs/operators';
import { LucideIconComponent } from '../../shared/components/lucide-icon/lucide-icon.component';
import { SearchService, GlobalSearchResults } from '../../core/services/search.service';
import { LoggerService } from '../../core/services/logger.service';
import { Task } from '../../core/models/task.model';
import { Project } from '../../core/models/project.model';
import { Comment } from '../../core/models/task.model';

@Component({
  selector: 'app-global-search',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideIconComponent],
  templateUrl: './global-search.component.html',
  styleUrls: ['./global-search.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GlobalSearchComponent implements OnInit, AfterViewInit {
  // Inject services
  private searchService = inject(SearchService);
  private router = inject(Router);
  private elementRef = inject(ElementRef);
  private logger = inject(LoggerService);
  private destroyRef = inject(DestroyRef);

  // Reactive Form Control for search input
  searchControl = new FormControl('');

  // Signals for state management
  isOpen = signal(false);
  isLoading = signal(false);
  error = signal<string | null>(null);

  // Results signals
  tasks = signal<Task[]>([]);
  projects = signal<Project[]>([]);
  comments = signal<Comment[]>([]);

  ngOnInit() {
    this.setupSearchSubscription();
  }

  ngAfterViewInit() {
    // Setup is done in ngOnInit
  }

  /**
   * Setup reactive search with RxJS operators
   */
  private setupSearchSubscription(): void {
    this.searchControl.valueChanges
      .pipe(
        tap(() => {
          this.isLoading.set(true);
          this.error.set(null);
        }),
        debounceTime(300), // Wait 300ms after user stops typing
        distinctUntilChanged(), // Only emit when value actually changes
        switchMap((query) => {
          // Cancel previous requests and only process latest
          if (!query || query.trim().length < 2) {
            this.clearResults();
            return of({
              tasks: [],
              projects: [],
              comments: [],
              loading: false,
              error: null,
            } as GlobalSearchResults);
          }

          this.logger.info('Performing search for: ' + query);
          return this.searchService.globalSearch(query).pipe(
            catchError((error) => {
              this.logger.error('Search error: ' + error.message);
              this.error.set('Failed to search. Please try again.');
              return of({
                tasks: [],
                projects: [],
                comments: [],
                loading: false,
                error: 'Failed to search. Please try again.',
              } as GlobalSearchResults);
            }),
          );
        }),
        finalize(() => this.isLoading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((results: GlobalSearchResults) => {
        this.tasks.set(results.tasks);
        this.projects.set(results.projects);
        this.comments.set(results.comments);
        this.error.set(results.error);
        this.isLoading.set(false);
      });
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    // Cmd/Ctrl + K to open search
    if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
      event.preventDefault();
      this.openSearch();
    }
    // Escape to close
    if (event.key === 'Escape' && this.isOpen()) {
      this.closeSearch();
    }
  }

  @HostListener('document:mousedown', ['$event'])
  handleClickOutside(event: MouseEvent) {
    if (this.isOpen() && !this.elementRef.nativeElement.contains(event.target)) {
      this.closeSearch();
    }
  }

  openSearch() {
    this.isOpen.set(true);
    this.logger.info('Global search opened');

    // Focus input after a brief delay to ensure DOM is ready
    timer(100)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        const input = this.elementRef.nativeElement.querySelector('input');
        if (input) {
          input.focus();
        }
      });
  }

  closeSearch() {
    this.isOpen.set(false);
    this.searchControl.setValue('', { emitEvent: false });
    this.clearResults();
    this.error.set(null);
    this.logger.info('Global search closed');
  }

  private clearResults() {
    this.tasks.set([]);
    this.projects.set([]);
    this.comments.set([]);
  }

  selectTask(task: Task) {
    this.logger.info('Task selected: ' + task.id);
    this.router.navigate(['/tasks']);
    this.closeSearch();
  }

  selectProject(project: Project) {
    this.logger.info('Project selected: ' + project.id);
    this.router.navigate(['/projects']);
    this.closeSearch();
  }

  selectComment(comment: Comment) {
    this.logger.info('Comment selected: ' + comment.id);
    // Navigate to tasks page
    this.router.navigate(['/tasks']);
    this.closeSearch();
  }

  get hasResults(): boolean {
    return this.tasks().length > 0 || this.projects().length > 0 || this.comments().length > 0;
  }

  get showDropdown(): boolean {
    return this.isOpen() && (this.searchControl.value?.length ?? 0) > 1;
  }

  get showNoResults(): boolean {
    return !this.isLoading() && !this.hasResults && (this.searchControl.value?.length ?? 0) >= 2;
  }
}
