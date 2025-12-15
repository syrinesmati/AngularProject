import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * DATE RANGE VALIDATOR (Cross-Field Validation)
 * 
 * Validates that a start date is before an end date.
 * 
 * Usage in FormGroup:
 * ```typescript
 * taskForm = this.fb.group({
 *   startDate: [''],
 *   dueDate: ['']
 * }, { validators: dateRangeValidator('startDate', 'dueDate') });
 * ```
 * 
 * With custom error message:
 * ```html
 * <div *ngIf="taskForm.hasError('dateRange')">
 *   {{ taskForm.getError('dateRange').message }}
 * </div>
 * ```
 */

export interface DateRangeOptions {
  /**
   * Allow start and end dates to be the same
   * Default: true
   */
  allowSameDate?: boolean;

  /**
   * Custom error message
   */
  errorMessage?: string;
}

export function dateRangeValidator(
  startDateField: string,
  endDateField: string,
  options: DateRangeOptions = {}
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const startDate = control.get(startDateField);
    const endDate = control.get(endDateField);

    // If controls don't exist, skip validation
    if (!startDate || !endDate) {
      return null;
    }

    const startValue = startDate.value;
    const endValue = endDate.value;

    // If either date is empty, skip validation
    if (!startValue || !endValue) {
      return null;
    }

    // Convert to Date objects if they're strings
    const start = startValue instanceof Date ? startValue : new Date(startValue);
    const end = endValue instanceof Date ? endValue : new Date(endValue);

    // Check if dates are valid
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return null; // Let other validators handle invalid dates
    }

    const config = {
      allowSameDate: options.allowSameDate ?? true,
      errorMessage: options.errorMessage ?? 'End date must be after start date',
    };

    // Compare dates
    if (config.allowSameDate) {
      if (end < start) {
        return {
          dateRange: {
            message: config.errorMessage,
            startDate: start,
            endDate: end,
          },
        };
      }
    } else {
      if (end <= start) {
        return {
          dateRange: {
            message: config.errorMessage,
            startDate: start,
            endDate: end,
          },
        };
      }
    }

    return null;
  };
}

/**
 * DUE DATE VALIDATOR
 * Validates that a due date is not in the past
 */
export function futureDateValidator(allowToday: boolean = true): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (!value) {
      return null;
    }

    const selectedDate = value instanceof Date ? value : new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day

    if (isNaN(selectedDate.getTime())) {
      return null; // Let other validators handle invalid dates
    }

    selectedDate.setHours(0, 0, 0, 0);

    if (allowToday) {
      if (selectedDate < today) {
        return { pastDate: { message: 'Date cannot be in the past' } };
      }
    } else {
      if (selectedDate <= today) {
        return { pastDate: { message: 'Date must be in the future' } };
      }
    }

    return null;
  };
}