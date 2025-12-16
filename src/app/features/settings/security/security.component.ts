import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UsersService } from '../../../core/services/users.service';
import { passwordStrengthValidator } from '../../../shared/validators/password-strength.validator';

@Component({
  selector: 'app-security',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './security.component.html',
  styleUrls: ['./security.component.css'],
})
export class SecurityComponent {
  private fb = inject(FormBuilder);
  private usersService = inject(UsersService);

  passwordForm: FormGroup;
  isSubmitting = signal(false);
  successMessage = signal<string>('');
  errorMessage = signal<string>('');

  constructor() {
    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, passwordStrengthValidator()]],
      confirmPassword: ['', [Validators.required]],
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(group: FormGroup) {
    const newPassword = group.get('newPassword');
    const confirmPassword = group.get('confirmPassword');
    if (newPassword?.value !== confirmPassword?.value) {
      confirmPassword?.setErrors({ mismatch: true });
    } else {
      const errors = confirmPassword?.errors;
      if (errors) {
        delete errors['mismatch'];
        confirmPassword?.setErrors(Object.keys(errors).length ? errors : null);
      }
    }
    return null;
  }

  async onSubmit() {
    if (this.passwordForm.invalid) {
      this.errorMessage.set('Please fill in all required fields correctly.');
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    try {
      const formData = this.passwordForm.value;

      await this.usersService.changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      }).toPromise();

      this.passwordForm.reset();
      this.successMessage.set('Password changed successfully!');
    } catch (error: any) {
      console.error('Error changing password:', error);
      const errorMessage = error?.error?.message || error?.message || 'Failed to change password. Please try again.';
      this.errorMessage.set(errorMessage);
    } finally {
      this.isSubmitting.set(false);
    }
  }

  enable2FA() {
    console.log('Enable 2FA clicked');
  }
}