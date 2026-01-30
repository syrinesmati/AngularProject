import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Attachment } from '../models/task.model';
import { BaseService } from './base.service';

export interface CreateAttachmentDto {
  taskId: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
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
export class AttachmentsService extends BaseService {
  /**
   * Add attachment metadata to a task
   * Note: Actual file upload should be handled separately (e.g., to cloud storage)
   */
  createAttachment(dto: CreateAttachmentDto): Observable<Attachment> {
    return this.http.post<ApiResponse<Attachment>>(this.buildUrl('/attachments'), dto).pipe(
      map(response => response.data)
    );
  }

  /**
   * Get all attachments for a task
   */
  getAttachmentsByTask(taskId: string): Observable<Attachment[]> {
    return this.http.get<ApiResponse<Attachment[]>>(this.buildUrl(`/attachments/task/${taskId}`)).pipe(
      map(response => response.data)
    );
  }

  /**
   * Delete an attachment
   */
  deleteAttachment(attachmentId: string): Observable<void> {
    return this.http.delete<ApiResponse<void>>(this.buildUrl(`/attachments/${attachmentId}`)).pipe(
      map(response => response.data)
    );
  }
}
