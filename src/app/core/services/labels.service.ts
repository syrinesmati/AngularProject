import { Injectable, signal, inject } from '@angular/core';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { Label } from '../models/task.model';
import { BaseService } from './base.service';
import { LoggerService } from './logger.service'; // You'll need to inject LoggerService

export interface CreateLabelDto {
  name: string;
  color: string;
}

export interface UpdateLabelDto {
  name?: string;
  color?: string;
}

@Injectable({
  providedIn: 'root',
})
export class LabelsService extends BaseService {
  private logger = inject(LoggerService); // Add LoggerService injection

  // Signal for labels state
  labels = signal<Label[]>([]);

  /**
   * Create a new label and update state
   */
  createLabel(dto: CreateLabelDto): Observable<Label> {
    return this.http.post<Label>(this.buildUrl('/labels'), dto).pipe(
      tap((label) => {
        // Add new label to state
        this.labels.update(labels => [...labels, label]);
        this.logger.info(`Label created: ${label.name}`);
      }),
      catchError((error) => {
        this.logger.error('Failed to create label: ' + error.message);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get all labels and load into state
   */
  getAllLabels(forceRefresh = false): Observable<Label[]> {
    const currentLabels = this.labels();
    
    if (currentLabels.length > 0 && !forceRefresh) {
      this.logger.info('Using cached labels from state');
      return new Observable(subscriber => {
        subscriber.next(currentLabels);
        subscriber.complete();
      });
    }

    this.logger.info('Loading labels from API');
    return this.http.get<Label[]>(this.buildUrl('/labels')).pipe(
      tap((labels) => {
        // Update state with loaded labels
        this.labels.set(labels);
        this.logger.info(`Labels loaded: ${labels.length}`);
      }),
      catchError((error) => {
        this.logger.error('Failed to load labels: ' + error.message);
        return throwError(() => error);
      })
    );
  }

  /**
   * Update a label and update state
   */
  updateLabel(labelId: string, dto: UpdateLabelDto): Observable<Label> {
    return this.http.patch<Label>(this.buildUrl(`/labels/${labelId}`), dto).pipe(
      tap((updatedLabel) => {
        // Update label in state
        this.labels.update(labels => 
          labels.map(label => label.id === labelId ? updatedLabel : label)
        );
        this.logger.info(`Label updated: ${updatedLabel.name}`);
      }),
      catchError((error) => {
        this.logger.error('Failed to update label: ' + error.message);
        return throwError(() => error);
      })
    );
  }

  /**
   * Delete a label and update state
   */
  deleteLabel(labelId: string): Observable<void> {
    return this.http.delete<void>(this.buildUrl(`/labels/${labelId}`)).pipe(
      tap(() => {
        // Remove label from state
        this.labels.update(labels => 
          labels.filter(label => label.id !== labelId)
        );
        this.logger.info(`Label deleted: ${labelId}`);
      }),
      catchError((error) => {
        this.logger.error('Failed to delete label: ' + error.message);
        return throwError(() => error);
      })
    );
  }

  /**
   * Attach a label to a task
   * Note: This doesn't update the labels signal since it's about task-label relationships
   */
  attachLabelToTask(taskId: string, labelId: string): Observable<any> {
    return this.http.post(this.buildUrl(`/labels/attach/${taskId}/${labelId}`), {}).pipe(
      tap(() => {
        this.logger.info(`Label ${labelId} attached to task ${taskId}`);
      }),
      catchError((error) => {
        this.logger.error('Failed to attach label to task: ' + error.message);
        return throwError(() => error);
      })
    );
  }

  /**
   * Detach a label from a task
   */
  detachLabelFromTask(taskId: string, labelId: string): Observable<void> {
    return this.http.delete<void>(this.buildUrl(`/labels/attach/${taskId}/${labelId}`)).pipe(
      tap(() => {
        this.logger.info(`Label ${labelId} detached from task ${taskId}`);
      }),
      catchError((error) => {
        this.logger.error('Failed to detach label from task: ' + error.message);
        return throwError(() => error);
      })
    );
  }

  // ============================================
  // State Management Methods
  // ============================================

  /**
   * Clear labels state (call on logout)
   */
  clearState(): void {
    this.labels.set([]);
    this.logger.info('Labels state cleared');
  }

  /**
   * Manually add label to state (for optimistic updates)
   */
  addLabelToState(label: Label): void {
    this.labels.update(labels => {
      // Don't add if already exists
      if (labels.some(l => l.id === label.id)) {
        return labels.map(l => l.id === label.id ? label : l);
      }
      return [...labels, label];
    });
    this.logger.info(`Label ${label.name} added to state manually`);
  }

  /**
   * Manually update label in state
   */
  updateLabelState(labelId: string, updates: Partial<Label>): void {
    this.labels.update(labels => 
      labels.map(label => label.id === labelId ? { ...label, ...updates } : label)
    );
    this.logger.info(`Label ${labelId} state updated manually`);
  }

  /**
   * Manually remove label from state
   */
  removeLabelFromState(labelId: string): void {
    this.labels.update(labels => 
      labels.filter(label => label.id !== labelId)
    );
    this.logger.info(`Label ${labelId} removed from state manually`);
  }

  /**
   * Get label by ID from state
   */
  getLabelById(labelId: string): Label | null {
    return this.labels().find(label => label.id === labelId) || null;
  }

  /**
   * Pre-load labels into state (useful for initial app load)
   */
  preloadLabels(): Observable<Label[]> {
    return this.getAllLabels(true); // forceRefresh = true
  }
}