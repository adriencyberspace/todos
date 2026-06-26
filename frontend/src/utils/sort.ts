import type { SortOption, Todo } from '../types/todo';

const PRIORITY_WEIGHT: Record<string, number> = { High: 2, Medium: 1, Low: 0 };

export function sortTodos(todos: Todo[], sort: SortOption): Todo[] {
  return [...todos].sort((a, b) => {
    switch (sort) {
      case 'dueDate-asc':
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.localeCompare(b.dueDate);
      case 'dueDate-desc':
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return b.dueDate.localeCompare(a.dueDate);
      case 'priority-desc':
        return (PRIORITY_WEIGHT[b.priority] ?? 0) - (PRIORITY_WEIGHT[a.priority] ?? 0);
      case 'priority-asc':
        return (PRIORITY_WEIGHT[a.priority] ?? 0) - (PRIORITY_WEIGHT[b.priority] ?? 0);
      case 'created-desc':
        return b.createdAt.localeCompare(a.createdAt);
      case 'created-asc':
        return a.createdAt.localeCompare(b.createdAt);
      default:
        return 0;
    }
  });
}
