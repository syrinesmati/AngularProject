import { TaskStatus } from '../../../core/models/task.model';

export interface BoardColumn {
  id: TaskStatus;
  title: string;
  className: string;
}

export const BOARD_COLUMNS: BoardColumn[] = [
  {
    id: TaskStatus.TODO,
    title: 'To Do',
    className: 'bg-grey-50 border-grey-200',
  },
  {
    id: TaskStatus.IN_PROGRESS,
    title: 'In Progress',
    className: 'bg-blue-50 border-blue-200',
  },
  {
    id: TaskStatus.DONE,
    title: 'Done',
    className: 'bg-green-50 border-green-200',
  },
];
