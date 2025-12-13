import { User } from './user.model';

export enum ActivityType {
  TASK_CREATED = 'TASK_CREATED',
  TASK_UPDATED = 'TASK_UPDATED',
  TASK_DELETED = 'TASK_DELETED',
  TASK_ASSIGNED = 'TASK_ASSIGNED',
  COMMENT_ADDED = 'COMMENT_ADDED',
  ATTACHMENT_ADDED = 'ATTACHMENT_ADDED',
}

export interface Activity {
  id: string;
  type: ActivityType;
  action?: string;
  entity?: string;
  entityId?: string;
  timestamp: Date;
  userId?: string;
  userName?: string;
  taskId?: string;
  taskTitle?: string;
  details?: string;
  metadata?: any;
  projectId?: string;
  createdAt?: Date;

  // Relations
  user?: User;
}
