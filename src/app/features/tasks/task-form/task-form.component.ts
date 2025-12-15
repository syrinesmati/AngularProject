import { Component, DestroyRef, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  noSpacesValidator,
  futureDateValidator,
  dateRangeValidator,
} from '../../../shared/validators';
import { TasksService } from '../../../core/services/task.service';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './task-form.component.html',
})
export class TaskFormComponent {
  private fb = inject(FormBuilder);
  private tasksService = inject(TasksService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);

  isSubmitting = signal(false);
  errorMessage = signal<string | null>(null);

  taskForm: FormGroup = this.fb.group(
    {
      projectId: this.fb.control('', { validators: [Validators.required] }),
      title: this.fb.control('', {
        validators: [Validators.required, noSpacesValidator({ trim: true })],
        updateOn: 'blur',
      }),
      description: this.fb.control('', { updateOn: 'blur' }),
      status: this.fb.control<'todo' | 'in-progress' | 'done'>('todo', {
        validators: [Validators.required],
      }),
      priority: this.fb.control<'low' | 'medium' | 'high'>('medium', {
        validators: [Validators.required],
      }),
      startDate: this.fb.control<string | null>(null, { updateOn: 'blur' }),
      dueDate: this.fb.control<string | null>(null, {
        validators: [futureDateValidator(true)],
        updateOn: 'blur',
      }),
      assignees: this.fb.array<FormControl<string>>([]),
    },
    {
      validators: dateRangeValidator('startDate', 'dueDate', { 
        allowSameDate: true, 
        errorMessage: 'Due date must be after start date' 
      }),
    }
  );

  get projectIdControl() { return this.taskForm.get('projectId') as FormControl<string>; }
  get title() { return this.taskForm.get('title') as FormControl<string>; }
  get description() { return this.taskForm.get('description') as FormControl<string>; }
  get status() { return this.taskForm.get('status') as FormControl<string>; }
  get priority() { return this.taskForm.get('priority') as FormControl<string>; }
  get startDate() { return this.taskForm.get('startDate') as FormControl<string | null>; }
  get dueDate() { return this.taskForm.get('dueDate') as FormControl<string | null>; }
  get assignees() { return this.taskForm.get('assignees') as FormArray<FormControl<string>>; }

  constructor() {
    this.route.queryParams
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(params => {
        if (params['projectId']) {
          this.projectIdControl.setValue(params['projectId']);
        }
      });

    this.taskForm.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        if (this.errorMessage()) {
          this.errorMessage.set(null);
        }
      });

    this.taskForm.statusChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((status) => {
        console.log('Task form status:', status);
      });
  }

  addAssignee(): void {
    const control = this.fb.control<string>('', {
      validators: [Validators.required, Validators.email, noSpacesValidator({ allowInternal: false })],
      updateOn: 'blur',
      nonNullable: true,
    });
    this.assignees.push(control);
  }

  removeAssignee(index: number): void {
    this.assignees.removeAt(index);
  }

  closeModal(): void {
    this.router.navigate(['/tasks']);
  }

  resetForm(): void {
    this.taskForm.reset({
      status: 'todo',
      priority: 'medium',
      projectId: '',
    });
    this.assignees.clear();
    this.errorMessage.set(null);
  }

  submit(): void {
    if (this.taskForm.valid) {
      this.isSubmitting.set(true);
      this.errorMessage.set(null);

      const formValue = this.taskForm.value;

      const createTaskDto = {
        title: formValue.title,
        description: formValue.description || undefined,
        status: formValue.status,
        priority: formValue.priority,
        startDate: formValue.startDate || undefined,
        dueDate: formValue.dueDate || undefined,
        projectId: formValue.projectId,
        assigneeIds: [],
      };

      this.tasksService.createTask(createTaskDto)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (task) => {
            console.log('Task created successfully:', task);
            this.isSubmitting.set(false);
            this.router.navigate(['/tasks']);
          },
          error: (error) => {
            console.error('Failed to create task:', error);
            this.errorMessage.set(error?.error?.message || 'Failed to create task. Please try again.');
            this.isSubmitting.set(false);
          },
        });
    }
  }
}