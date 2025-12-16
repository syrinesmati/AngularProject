import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BoardComponent } from './board.component';
import { TasksService } from '../../core/services/task.service';
import { ProjectsService } from '../../core/services/projects.service';
import { AuthService } from '../../core/services/auth.service';
import { signal } from '@angular/core';
import { TaskStatus, TaskPriority } from '../../core/models/task.model';
import { UserRole } from '../../core/models/user.model';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('BoardComponent', () => {
  let component: BoardComponent;
  let fixture: ComponentFixture<BoardComponent>;
  let tasksService: jasmine.SpyObj<TasksService>;
  let projectsService: jasmine.SpyObj<ProjectsService>;
  let authService: jasmine.SpyObj<AuthService>;

  const mockUser = {
    id: '1',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    role: UserRole.USER,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockTasks = [
    {
      id: '1',
      title: 'Task 1',
      description: 'Description 1',
      status: TaskStatus.TODO,
      priority: TaskPriority.HIGH,
      projectId: 'project-1',
      assignees: [],
    },
    {
      id: '2',
      title: 'Task 2',
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.MEDIUM,
      projectId: 'project-1',
      assignees: [],
    },
  ];

  beforeEach(async () => {
    const tasksServiceSpy = jasmine.createSpyObj('TasksService', ['updateTask'], {
      tasksSignal: signal(mockTasks),
    });

    const authServiceSpy = jasmine.createSpyObj('AuthService', [], {
      currentUserSignal: signal(mockUser),
    });

    await TestBed.configureTestingModule({
      imports: [BoardComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: TasksService, useValue: tasksServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
      ],
    }).compileComponents();

    tasksService = TestBed.inject(TasksService) as jasmine.SpyObj<TasksService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    fixture = TestBed.createComponent(BoardComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display three columns (To Do, In Progress, Done)', () => {
    expect(component.columns.length).toBe(3);
    expect(component.columns[0].title).toBe('To Do');
    expect(component.columns[1].title).toBe('In Progress');
    expect(component.columns[2].title).toBe('Done');
  });

  it('should filter tasks by status', () => {
    const todoTasks = component.getTasksByStatus(TaskStatus.TODO);
    const inProgressTasks = component.getTasksByStatus(TaskStatus.IN_PROGRESS);

    expect(todoTasks.length).toBe(1);
    expect(inProgressTasks.length).toBe(1);
  });

  it('should filter tasks by selected project', () => {
    component.selectedProjectId.set('project-1');
    const filteredTasks = component.filteredTasks();

    expect(filteredTasks.length).toBe(2);
    expect(filteredTasks.every((task) => task.projectId === 'project-1')).toBe(true);
  });

  it('should show all tasks when project filter is "all"', () => {
    component.selectedProjectId.set('all');
    const filteredTasks = component.filteredTasks();

    expect(filteredTasks.length).toBe(2);
  });

  it('should handle drag over column', () => {
    component.onDragOver(TaskStatus.IN_PROGRESS);
    expect(component.dragOverColumn()).toBe(TaskStatus.IN_PROGRESS);
  });

  it('should clear drag over state on drag leave', () => {
    component.onDragOver(TaskStatus.IN_PROGRESS);
    component.onDragLeave();
    expect(component.dragOverColumn()).toBeNull();
  });

  it('should open and close create modal', () => {
    component.openCreateModal();
    expect(component.isCreateModalOpen()).toBe(true);

    component.closeCreateModal();
    expect(component.isCreateModalOpen()).toBe(false);
  });

  it('should open and close task detail', () => {
    const task = mockTasks[0];
    component.openTaskDetail(task);
    expect(component.selectedTask()).toBe(task);

    component.closeTaskDetail();
    expect(component.selectedTask()).toBeNull();
  });
});
