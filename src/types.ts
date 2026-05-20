export type Priority = 'low' | 'medium' | 'high';

export interface Task {
  id: number;
  title: string;
  completed: boolean;
  priority: Priority;
  tags: string[];
  tag?: string;
  createdAt: string;
  dueDate?: string;
}
