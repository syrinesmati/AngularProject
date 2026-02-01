import {
  Component,
  OnInit,
  signal,
  inject,
  ChangeDetectionStrategy,
  computed,
  DestroyRef,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin, mergeMap, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, tap, catchError, finalize } from 'rxjs/operators';
import { LucideIconComponent } from '../../shared/components/lucide-icon/lucide-icon.component';
import { LoggerService } from '../../core/services/logger.service';
import { TasksService } from '../../core/services/task.service';
import { ProjectsService } from '../../core/services/projects.service';
import { CommentsService } from '../../core/services/comments.service';
import { AuthService } from '../../core/services/auth.service';
import { Task } from '../../core/models/task.model';
import { Project } from '../../core/models/project.model';
import { Comment } from '../../core/models/task.model';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideIconComponent],
  templateUrl: './search.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./search.component.css'],
})
export class SearchComponent implements OnInit {
  private router = inject(Router);
  private logger = inject(LoggerService);
  private tasksService = inject(TasksService);
  private projectsService = inject(ProjectsService);
  private commentsService = inject(CommentsService);
  private authService = inject(AuthService);
  private destroyRef = inject(DestroyRef);

  // Reactive Form Control for search input
  searchControl = new FormControl('');

  // Signals for state management
  isLoading = signal(false);
  initialLoading = signal(true);
  error = signal<string | null>(null);

  // All user content signals
  allTasks = signal<Task[]>([]);
  allProjects = signal<Project[]>([]);
  allComments = signal<Comment[]>([]);

  // Filtered results signals (based on search)
  filteredTasks = signal<Task[]>([]);
  filteredProjects = signal<Project[]>([]);
  filteredComments = signal<Comment[]>([]);

  // Computed properties
  hasAllContent = computed(
    () =>
      this.allTasks().length > 0 || this.allProjects().length > 0 || this.allComments().length > 0,
  );

  hasFilteredResults = computed(
    () =>
      this.filteredTasks().length > 0 ||
      this.filteredProjects().length > 0 ||
      this.filteredComments().length > 0,
  );

  isSearchActive = computed(() => (this.searchControl.value?.length ?? 0) >= 2);

  ngOnInit() {
    this.loadAllUserContent();
    this.setupSearchSubscription();
    this.logger.info('Search page initialized');
  }

  /**
   * Load all user's projects, all tasks from those projects, and comments
   */
  private loadAllUserContent(): void {
    this.initialLoading.set(true);
    this.error.set(null);

    // First load projects, then load all tasks for each project
    this.projectsService
      .loadProjects()
      .pipe(
        mergeMap((projects: Project[]) => {
          // For each project, load all its tasks
          const taskObservables = projects.map((project) =>
            this.tasksService.getTasksByProject(project.id).pipe(
              catchError((error) => {
                this.logger.error(
                  'Failed to load tasks for project ' + project.name + ': ' + error.message,
                );
                return of({ data: [] });
              }),
            ),
          );

          // Combine projects with all tasks
          if (taskObservables.length === 0) {
            return of({ projects, tasksResults: [] });
          }

          return forkJoin(taskObservables).pipe(
            mergeMap((tasksResults) => {
              // Flatten all tasks
              const allTasks: Task[] = tasksResults.flatMap((result: any) => result.data || []);

              // Now load comments for each task
              const commentObservables = allTasks.map((task) =>
                this.commentsService.getCommentsByTask(task.id).pipe(
                  tap((comments) => {
                    task.comments = comments;
                  }),
                  catchError((error) => {
                    this.logger.error(
                      'Failed to load comments for task ' + task.title + ': ' + error.message,
                    );
                    return of([]);
                  }),
                ),
              );

              if (commentObservables.length === 0) {
                return of({ projects, allTasks });
              }

              return forkJoin(commentObservables).pipe(
                mergeMap(() => of({ projects, allTasks })),
                catchError((error) => {
                  this.logger.error('Failed to load all comments: ' + error.message);
                  return of({ projects, allTasks });
                }),
              );
            }),
            catchError((error) => {
              this.logger.error('Failed to load all tasks: ' + error.message);
              return of({ projects, allTasks: [] });
            }),
          );
        }),
        finalize(() => this.initialLoading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(
        (data: any) => {
          const projects = data.projects || [];
          const allTasks: Task[] = data.allTasks || [];

          // Get all comments from all tasks
          const allComments: Comment[] = allTasks.flatMap((task: Task) => task.comments || []);

          this.allTasks.set(allTasks);
          this.allProjects.set(projects);
          this.allComments.set(allComments);

          // Initially show all content
          this.filteredTasks.set(allTasks);
          this.filteredProjects.set(projects);
          this.filteredComments.set(allComments);

          this.logger.info(
            'Loaded content - Projects: ' +
              projects.length +
              ', Tasks: ' +
              allTasks.length +
              ', Comments: ' +
              allComments.length,
          );
        },
        (error) => {
          this.logger.error('Failed to load user content: ' + error.message);
          this.error.set('Failed to load your content. Please refresh the page.');
          this.initialLoading.set(false);
        },
      );
  }

  /**
   * Setup reactive search that filters the all-content signals
   */
  private setupSearchSubscription(): void {
    this.searchControl.valueChanges
      .pipe(
        tap(() => {
          this.isLoading.set(true);
          this.error.set(null);
        }),
        debounceTime(300),
        distinctUntilChanged(),
        tap((query) => {
          this.filterContent(query ?? '');
        }),
        finalize(() => this.isLoading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        this.isLoading.set(false);
      });
  }

  /**
   * Filter all content based on search query
   */
  private filterContent(query: string): void {
    const searchQuery = query.trim().toLowerCase();

    if (searchQuery.length < 2) {
      // Show all content if search is empty or too short
      this.filteredTasks.set(this.allTasks());
      this.filteredProjects.set(this.allProjects());
      this.filteredComments.set(this.allComments());
      return;
    }

    // Filter tasks by name, description, or status
    const filtered_tasks = this.allTasks().filter(
      (task) =>
        task.title?.toLowerCase().includes(searchQuery) ||
        task.description?.toLowerCase().includes(searchQuery) ||
        task.status?.toLowerCase().includes(searchQuery),
    );

    // Filter projects by name or description
    const filtered_projects = this.allProjects().filter(
      (project) =>
        project.name?.toLowerCase().includes(searchQuery) ||
        project.description?.toLowerCase().includes(searchQuery),
    );

    // Filter comments by content
    const filtered_comments = this.allComments().filter((comment) =>
      comment.content?.toLowerCase().includes(searchQuery),
    );

    this.filteredTasks.set(filtered_tasks);
    this.filteredProjects.set(filtered_projects);
    this.filteredComments.set(filtered_comments);

    this.logger.info(
      'Filter results - Tasks: ' +
        filtered_tasks.length +
        ', Projects: ' +
        filtered_projects.length +
        ', Comments: ' +
        filtered_comments.length,
    );
  }

  navigateToTask(task: Task) {
    if (!this.isMyTask(task)) {
      return; // Don't navigate if not user's task
    }
    this.logger.info('Navigating to task: ' + task.id);
    this.router.navigate(['/tasks']);
  }

  navigateToProject(project: Project) {
    this.logger.info('Navigating to project: ' + project.id);
    this.router.navigate(['/projects']);
  }

  isMyTask(task: Task): boolean {
    const currentUserId = this.authService.currentUserSignal()?.id;
    if (!currentUserId) return false;

    // Check if current user is in assignedTo array or is the owner
    return task.assignedTo?.includes(currentUserId) || task.ownerId === currentUserId;
  }

  getProjectName(projectId: string): string {
    const project = this.allProjects().find((p) => p.id === projectId);
    return project ? project.name : 'Unknown Project';
  }

  getProjectColor(projectId: string): string {
    const project = this.allProjects().find((p) => p.id === projectId);
    return project?.color || '#6366f1';
  }

  navigateToComment(comment: Comment) {
    this.logger.info('Navigating to comment: ' + comment.id);
    this.router.navigate(['/tasks', comment.taskId]);
  }

  get showEmptyState(): boolean {
    return !this.initialLoading() && !this.hasAllContent();
  }

  get showNoResults(): boolean {
    return this.isSearchActive() && !this.isLoading() && !this.hasFilteredResults();
  }

  get totalResults(): number {
    return (
      this.filteredTasks().length + this.filteredProjects().length + this.filteredComments().length
    );
  }

  get projectCount(): number {
    return this.filteredProjects().length;
  }

  get taskCount(): number {
    return this.filteredTasks().length;
  }

  get commentCount(): number {
    return this.filteredComments().length;
  }
}
