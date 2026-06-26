export type Priority = 'Low' | 'Medium' | 'High';

export interface Todo {
  id: string;
  title: string;
  description: string | null;
  isCompleted: boolean;
  createdAt: string;
  completedAt: string | null;
  dueDate: string | null;
  priority: Priority;
}

export interface CreateTodoRequest {
  title: string;
  description?: string;
  dueDate?: string;
  priority?: Priority;
}

export interface UpdateTodoRequest {
  title: string;
  description?: string | null;
  dueDate?: string | null;
  priority: Priority;
}

export type SortOption = 'dueDate-asc' | 'dueDate-desc' | 'priority-desc' | 'priority-asc' | 'created-desc' | 'created-asc';
export type StatusFilter = 'all' | 'active' | 'completed';
export type PriorityFilter = 'all' | 'Low' | 'Medium' | 'High';
