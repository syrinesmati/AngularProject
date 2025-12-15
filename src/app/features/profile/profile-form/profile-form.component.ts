// profile-form.component.ts - CORRECTED with better error handling and logging
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UsersService, UpdateProfileDto } from '../../../core/services/users.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-profile-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile-form.component.html',
})
export class ProfileFormComponent {
  private fb = inject(FormBuilder);
  private users = inject(UsersService);
  private auth = inject(AuthService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  isSubmitting = signal(false);
  errorMessage = signal<string | null>(null);
  avatarPreview = signal<string | null>(null);
  selectedFileName = signal<string>('');
  selectedFileSize = signal<number>(0);
  uploadError = signal<string | null>(null);
  isLoading = signal(true);

  private readonly MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
  private readonly ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'];

  form: FormGroup = this.fb.group({
    firstName: ['', [Validators.required, Validators.minLength(1)]],
    lastName: ['', [Validators.required, Validators.minLength(1)]],
    avatar: [null],
  });

  get firstName() { return this.form.get('firstName') as FormControl<string>; }
  get lastName() { return this.form.get('lastName') as FormControl<string>; }
  get avatar() { return this.form.get('avatar') as FormControl<string | null>; }

  constructor() {
    // Auto-fill form with current user data
    this.users.getProfile()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (user) => {
          console.log('Profile loaded from API:', user);
          
          // Set the values WITHOUT triggering validators
          this.firstName.setValue(user.firstName ?? '', { emitEvent: false });
          this.lastName.setValue(user.lastName ?? '', { emitEvent: false });
          this.avatar.setValue(user.avatar ?? null, { emitEvent: false });

          console.log('Form values set to:', {
            firstName: this.firstName.value,
            lastName: this.lastName.value,
            avatar: this.avatar.value
          });

          // Mark form as pristine and untouched so it appears clean on load
          this.form.markAsPristine();
          this.form.markAsUntouched();
          
          // Show existing avatar if present
          if (user.avatar) {
            this.avatarPreview.set(user.avatar);
            this.selectedFileName.set('Current avatar');
          }

          this.isLoading.set(false);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set(err?.error?.message || 'Failed to load profile');
          console.error('Profile load error:', err);
        },
      });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    
    if (!file) return;

    this.uploadError.set(null);

    // Validate file type
    if (!this.ALLOWED_TYPES.includes(file.type)) {
      this.uploadError.set('Please select a PNG, JPG, or GIF image');
      return;
    }

    // Validate file size
    if (file.size > this.MAX_FILE_SIZE) {
      this.uploadError.set('Image must be less than 2MB');
      return;
    }

    this.selectedFileName.set(file.name);
    this.selectedFileSize.set(file.size);

    // Convert to base64 data URL
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      this.avatarPreview.set(dataUrl);
      this.avatar.setValue(dataUrl);
      this.avatar.markAsDirty();
    };
    reader.onerror = () => {
      this.uploadError.set('Failed to read image file');
    };
    reader.readAsDataURL(file);
  }

  removeAvatar(): void {
    this.avatarPreview.set(null);
    this.avatar.setValue(null);
    this.selectedFileName.set('');
    this.selectedFileSize.set(0);
    this.uploadError.set(null);
    this.avatar.markAsDirty();
  }

  getFileSize(): string {
    const size = this.selectedFileSize();
    if (size === 0) return '';
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }

  closeModal(): void {
    this.router.navigate(['/dashboard']);
  }

  submit(): void {
    console.log('Submit called');
    console.log('Form valid:', this.form.valid);
    console.log('Form value:', this.form.value);
    
    if (this.form.invalid) {
      console.error('Form is invalid');
      return;
    }

    this.isSubmitting.set(true);
    const v = this.form.value;
    
    const dto: UpdateProfileDto = {
      firstName: v.firstName?.trim() || '',
      lastName: v.lastName?.trim() || '',
      avatar: v.avatar || undefined,
    };

    console.log('Sending update DTO:', dto);

    this.users.updateProfile(dto)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updatedUser) => {
          console.log('Update response received:', updatedUser);
          console.log('Updated user firstName:', updatedUser.firstName);
          console.log('Updated user lastName:', updatedUser.lastName);
          console.log('Updated user avatar:', updatedUser.avatar);
          
          // Refresh the current user signal to update the header immediately
          this.auth.refreshCurrentUser(updatedUser);
          
          console.log('Current user signal after refresh:', this.auth.currentUserSignal());
          
          this.isSubmitting.set(false);
          
          // Small delay to ensure signal update is processed before navigation
          setTimeout(() => {
            this.router.navigate(['/dashboard']);
          }, 100);
        },
        error: (err) => {
          console.error('Profile update error:', err);
          this.isSubmitting.set(false);
          this.errorMessage.set(err?.error?.message || 'Failed to update profile');
        },
      });
  }
}