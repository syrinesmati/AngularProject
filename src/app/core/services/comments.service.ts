import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Comment } from '../models/task.model';
import { BaseService } from './base.service';

export interface CreateCommentDto {
  taskId: string;
  content: string;
}

export interface UpdateCommentDto {
  content: string;
}

interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
}

@Injectable({
  providedIn: 'root',
})
export class CommentsService extends BaseService {
  /**
   * Create a new comment on a task
   */
  createComment(dto: CreateCommentDto): Observable<Comment> {
    return this.http.post<ApiResponse<Comment>>(this.buildUrl('/comments'), dto).pipe(
      map(response => response.data)
    );
  }

  /**
   * Get all comments for a specific task
   */
  getCommentsByTask(taskId: string): Observable<Comment[]> {
    return this.http.get<ApiResponse<Comment[]>>(this.buildUrl(`/comments/task/${taskId}`)).pipe(
      map(response => response.data)
    );
  }

  /**
   * Update a comment (author only)
   */
  updateComment(commentId: string, dto: UpdateCommentDto): Observable<Comment> {
    return this.http.patch<ApiResponse<Comment>>(this.buildUrl(`/comments/${commentId}`), dto).pipe(
      map(response => response.data)
    );
  }

  /**
   * Delete a comment (author only)
   */
  deleteComment(commentId: string): Observable<void> {
    return this.http.delete<ApiResponse<void>>(this.buildUrl(`/comments/${commentId}`)).pipe(
      map(response => response.data)
    );
  }
}
