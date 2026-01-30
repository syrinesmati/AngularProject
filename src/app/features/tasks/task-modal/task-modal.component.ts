import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, OnChanges, SimpleChanges, ViewChild, ElementRef, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';

import { LabelSelectComponent } from '../label-select/label-select.component';
import { CommentSectionComponent } from '../comment-section/comment-section.component';
import { AttachmentSectionComponent } from '../attachment-section/attachment-section.component';
import { Task, TaskStatus, TaskPriority, Subtask, Label, Comment, Attachment } from '../../../core/models/task.model';
import { Project } from '../../../core/models/project.model';
import { User } from '../../../core/models/user.model';
import { TasksService } from '../../../core/services/task.service';
import { ProjectsService } from '../../../core/services/projects.service';
import { AuthService } from '../../../core/services/auth.service';
import { LucideIconComponent } from '../../../shared/components/lucide-icon/lucide-icon.component';
import { LabelsService } from '../../../core/services/labels.service';
import { UsersService } from '../../../core/services/users.service';
import { CommentsService } from '../../../core/services/comments.service';
import { AttachmentsService } from '../../../core/services/attachments.service';

@Component({
  selector: 'app-task-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    LabelSelectComponent,
    CommentSectionComponent,
    AttachmentSectionComponent,
    LucideIconComponent
  ],
  templateUrl: './task-modal.component.html',
  styleUrls: ['./task-modal.component.css']
})
export class TaskModalComponent implements OnInit, OnDestroy, OnChanges {
  @Input() task: Task | null = null;
  @Input() open = false;
  @Input() defaultProjectId?: string;
  @Output() openChange = new EventEmitter<boolean>();
  
  @ViewChild('titleInput') titleInput!: ElementRef<HTMLInputElement>;
  
  // Expose enums to template
  TaskStatus = TaskStatus;
  TaskPriority = TaskPriority;
  
  // Form
  taskForm!: FormGroup;
  
  // Subtasks, comments, attachments (not in reactive form)
  subtasks: Subtask[] = [];
  comments: Comment[] = [];
  attachments: Attachment[] = [];
  
  // Track deleted subtask IDs for backend synchronization
  deletedSubtaskIds: Set<string> = new Set();
  
  activeTab = 'details';
  
  // Services
  private fb = inject(FormBuilder);
  private tasksService = inject(TasksService);
  private projectsService = inject(ProjectsService);
  private authService = inject(AuthService);
  private labelsService = inject(LabelsService);
  private usersService = inject(UsersService);
  private commentsService = inject(CommentsService);
  private attachmentsService = inject(AttachmentsService);
  
  // Data
  availableProjects: Project[] = [];
  availableLabels: Label[] = [];
  assignees: User[] = [];
  currentUser: User | null = null;
  showAssigneeDropdown = signal(false);
  
  constructor() {
    this.initForm();
  }
  
  initForm() {
    this.taskForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      description: [''],
      status: [TaskStatus.TODO],
      priority: [TaskPriority.MEDIUM],
      startDate: [null],
      dueDate: [null],
      projectId: ['', Validators.required],
      assigneesIds: [[] as string[]],
      labels: [[] as Label[]],
      newSubtask: [''],
    });
  }
  
  // Form control getters
  get titleControl() { return this.taskForm.get('title') as FormControl; }
  get projectIdControl() { return this.taskForm.get('projectId') as FormControl; }
  get labelsControl() { return this.taskForm.get('labels') as FormControl; }
  get assigneesIdsControl() { return this.taskForm.get('assigneesIds') as FormControl; }
  get newSubtaskControl() { return this.taskForm.get('newSubtask') as FormControl; }
  
  // Form validation helpers
  get showTitleError(): boolean {
    return !!(this.titleControl.invalid && this.titleControl.touched);
  }
  
  get showProjectError(): boolean {
    return !!(this.projectIdControl.invalid && this.projectIdControl.touched);
  }
  
  get showDateRangeError(): boolean {
    const startDate = this.taskForm.get('startDate')?.value;
    const dueDate = this.taskForm.get('dueDate')?.value;
    return !!(startDate && dueDate && new Date(startDate) > new Date(dueDate));
  }
  
  setActiveTab(tab: string) {
    this.activeTab = tab;
  }
  
  onLabelsChange(labels: Label[]) {
    this.labelsControl.setValue(labels);
  }
  
  onCreateLabel(labelData: any) {
    // Handle label creation
    this.labelsService.createLabel(labelData).subscribe({
      next: (newLabel) => {
        this.availableLabels = [...this.availableLabels, newLabel];
        const currentLabels = this.labelsControl.value || [];
        this.labelsControl.setValue([...currentLabels, newLabel]);
      },
      error: (error) => {
        console.error('Failed to create label:', error);
      }
    });
  }
  
  ngOnChanges(changes: SimpleChanges) {
    if (changes['open']?.currentValue && !changes['open'].previousValue) {
      this.loadData();
      this.resetForm();
    }
    if (changes['task'] && !changes['task'].firstChange) {
      // Reset form when a new task is passed in
      this.resetForm();
    }
  }

  ngOnInit() {
    this.loadData();
    this.resetForm();
  }
  
  ngOnDestroy() {
    this.resetForm();
  }
  
  loadData() {
    // Load current user
    this.currentUser = this.authService.currentUserSignal();
    
    // Load projects
    const projects = this.projectsService.projects();
    if (projects) {
      this.availableProjects = projects;
      const currentProjectId = this.projectIdControl.value;
      if (this.availableProjects.length > 0 && !currentProjectId) {
        this.projectIdControl.setValue(this.defaultProjectId || this.availableProjects[0].id);
      }
    }
    
    // Load labels
    const labels = this.labelsService.labels();
    if (labels) {
      this.availableLabels = labels;
    } else {
      // Load labels if not already loaded
      this.labelsService.getAllLabels().subscribe({
        next: (labels) => {
          this.availableLabels = labels;
        }
      });
    }
    
    // Load users/assignees
    this.loadAssignees();
  }
  
  loadAssignees() {
    const projectId = this.taskForm.get('projectId')?.value;
    
    if (this.currentUser?.role === 'ADMIN') {
      // Load all users for admin
      this.usersService.getAllUsers().subscribe({
        next: (users) => {
          this.assignees = this.normalizeUsers(users);
        }
      });
    } else if (projectId) {
      // Load assignable users for the project
      this.usersService.getAssignableUsers(projectId).subscribe({
        next: (users) => {
          this.assignees = this.normalizeUsers(users);
          const currentAssignees = this.assigneesIdsControl.value || [];
          if (this.assignees.length > 0 && currentAssignees.length === 0) {
            this.assigneesIdsControl.setValue(this.assignees.map(u => u.id));
          }
        }
      });
    } else {
      // Default to current user
      if (this.currentUser) {
        this.assignees = [this.currentUser];
        this.assigneesIdsControl.setValue([this.currentUser.id]);
      }
    }
  }

  private normalizeUsers(users: User[]): User[] {
    return (users || []).filter(u => !!u && !!u.id);
  }
  
  resetForm() {
    if (this.task) {
      this.taskForm.patchValue({
        title: this.task.title,
        description: this.task.description || '',
        status: this.task.status,
        priority: this.task.priority,
        startDate: this.task.dueDate ? this.formatDateForInput(new Date(this.task.dueDate)) : null,
        dueDate: this.task.dueDate ? this.formatDateForInput(new Date(this.task.dueDate)) : null,
        projectId: this.task.projectId,
        assigneesIds: this.task.assignees && this.task.assignees.length > 0 
          ? this.task.assignees.map(a => a.id) 
          : (this.currentUser ? [this.currentUser.id] : []),
        labels: [...(this.task.labels || [])],
        newSubtask: '',
      });
      
      this.subtasks = [...(this.task.subtasks || [])];
      
      // Load comments and attachments from backend
      if (this.task.id) {
        this.commentsService.getCommentsByTask(this.task.id).subscribe({
          next: (comments) => {
            this.comments = comments;
          },
          error: (error) => {
            console.error('Failed to load comments:', error);
            this.comments = [];
          }
        });
        
        this.attachmentsService.getAttachmentsByTask(this.task.id).subscribe({
          next: (attachments) => {
            this.attachments = attachments;
          },
          error: (error) => {
            console.error('Failed to load attachments:', error);
            this.attachments = [];
          }
        });
      } else {
        this.comments = [];
        this.attachments = [];
      }
      
      // Load assignees for this project
      this.loadAssignees();
    } else {
      this.taskForm.reset({
        title: '',
        description: '',
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        startDate: null,
        dueDate: null,
        projectId: this.defaultProjectId || '',
        assigneesIds: this.currentUser ? [this.currentUser.id] : [],
        labels: [],
        newSubtask: '',
      });
      
      this.subtasks = [];
      this.comments = [];
      this.attachments = [];
    }
    
    this.activeTab = 'details';
    this.deletedSubtaskIds.clear();
  }
  
  formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  onProjectChange() {
    // When project changes, reload assignees for that project
    this.loadAssignees();
  }
  
  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
  
  parseDate(dateString: string): Date {
    return new Date(dateString);
  }
  
  get isEditing(): boolean {
    return !!this.task;
  }
  
  onSubmit(event: Event) {
    event.preventDefault();
    
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }
    
    const formValue = this.taskForm.value;
    const labelIds = (formValue.labels || []).map((l: Label) => l.id).filter(Boolean);

    if (this.isEditing && this.task) {
      // Prepare subtasks for update, including deleted ones
      const subtasks = this.subtasks.map(st => ({
        id: st.id,
        title: st.title,
        isComplete: st.isComplete,
        position: st.position,
      }));

      // Add deleted subtasks with null title to indicate deletion
      this.deletedSubtaskIds.forEach(id => {
        subtasks.push({
          id,
          title: null as any,
          isComplete: undefined as any,
          position: undefined as any,
        });
      });

      const taskData = {
        status: formValue.status,
        subtasks: subtasks.length > 0 ? subtasks : undefined,
        ...(!(
          (this.task?.assignees || []).some(a => a.id === this.currentUser?.id) &&
          this.currentUser?.role === 'USER'
        ) && {
          title: formValue.title,
          description: formValue.description,
          priority: formValue.priority,
          dueDate: formValue.dueDate ? new Date(formValue.dueDate) : undefined,
          labelIds: labelIds.length > 0 ? labelIds : undefined,
        }),
      };

      this.tasksService.updateTask(this.task.id, taskData).subscribe({
        next: () => {
          this.openChange.emit(false);
          this.resetForm();
        },
        error: (error) => {
          console.error('Failed to update task:', error);
        }
      });
    } else {
      const createPayload = {
        title: formValue.title,
        description: formValue.description,
        status: formValue.status,
        priority: formValue.priority,
        dueDate: formValue.dueDate ? new Date(formValue.dueDate) : undefined,
        projectId: formValue.projectId,
        assigneeIds: formValue.assigneesIds,
        labelIds,
      };

      this.tasksService.createTask(createPayload as any).subscribe({
        next: () => {
          this.openChange.emit(false);
          this.resetForm();
        },
        error: (error) => {
          console.error('Failed to create task:', error);
        }
      });
    }
  }
  
  onDelete() {
    if (this.task && confirm('Are you sure you want to delete this task?')) {
      this.tasksService.deleteTask(this.task.id).subscribe({
        next: () => {
          this.openChange.emit(false);
          this.resetForm();
        },
        error: (error) => {
          console.error('Failed to delete task:', error);
        }
      });
    }
  }
  
  onOpenChange(open: boolean) {
    this.openChange.emit(open);
    if (open) {
      setTimeout(() => {
        this.titleInput?.nativeElement?.focus();
      }, 100);
      this.loadData();
    } else {
      this.resetForm();
    }
  }
  
  addSubtask() {
    const newSubtaskValue = this.newSubtaskControl.value?.trim();
    if (newSubtaskValue) {
      const newSubtask: Subtask = {
        id: 'st-' + Date.now(),
        title: newSubtaskValue,
        position: this.subtasks.length,
        isComplete: false,
        taskId: this.task?.id || '',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      this.subtasks = [...this.subtasks, newSubtask];
      this.newSubtaskControl.setValue('');
    }
  }
  
  removeSubtask(id: string) {
    // Track deletion if it's an existing subtask (has a real ID, not a temporary one)
    if (id && !id.startsWith('st-')) {
      this.deletedSubtaskIds.add(id);
    }
    this.subtasks = this.subtasks.filter(s => s.id !== id);
  }
  
  toggleSubtask(id: string) {
    this.subtasks = this.subtasks.map(s =>
      s.id === id ? { ...s, isComplete: !s.isComplete } : s
    );
  }
  
  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.addSubtask();
    }
  }
  
  onAddComment(commentData: { content: string; mentions: string[] }) {
    if (!this.task?.id) {
      console.error('Cannot add comment: task not saved yet');
      return;
    }

    this.commentsService.createComment({
      taskId: this.task.id,
      content: commentData.content,
    }).subscribe({
      next: (newComment) => {
        this.comments = [...(this.comments || []), newComment];
      },
      error: (error) => {
        console.error('Failed to create comment:', error);
      }
    });
  }
  
  onAddAttachment(attachmentData: { fileName: string; fileUrl: string; mimeType: string; fileSize: number }) {
    if (!this.task?.id) {
      console.error('Cannot add attachment: task not saved yet');
      return;
    }

    this.attachmentsService.createAttachment({
      taskId: this.task.id,
      fileName: attachmentData.fileName,
      fileUrl: attachmentData.fileUrl,
      mimeType: attachmentData.mimeType,
      fileSize: attachmentData.fileSize,
    }).subscribe({
      next: (newAttachment) => {
        this.attachments = [...(this.attachments || []), newAttachment];
      },
      error: (error) => {
        console.error('Failed to create attachment:', error);
      }
    });
  }
  
  onRemoveAttachment(id: string) {
    this.attachmentsService.deleteAttachment(id).subscribe({
      next: () => {
        this.attachments = this.attachments.filter(a => a.id !== id);
      },
      error: (error) => {
        console.error('Failed to delete attachment:', error);
      }
    });
  }
  
  getCommentsCount(): number {
    return this.comments.length;
  }
  
  getAttachmentsCount(): number {
    return this.attachments.length;
  }

  // Assignee selection helpers
  toggleAssignee(userId: string) {
    const current = new Set(this.assigneesIdsControl.value || []);
    if (current.has(userId)) {
      current.delete(userId);
    } else {
      current.add(userId);
    }
    this.assigneesIdsControl.setValue(Array.from(current));
  }

  isAssigneeSelected(userId: string): boolean {
    return (this.assigneesIdsControl.value || []).includes(userId);
  }

  getSelectedAssigneesCount(): number {
    return (this.assigneesIdsControl.value || []).length;
  }

  getAssigneeName(userId: string): string {
    const user = this.assignees.find(u => u.id === userId);
    if (!user) return 'User';
    const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
    return fullName || user.email || 'User';
  }
  
}