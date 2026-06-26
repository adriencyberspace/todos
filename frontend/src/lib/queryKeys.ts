import type { PriorityFilter, StatusFilter } from '../types/todo';

export const queryKeys = {
  todos: {
    all: ['todos'] as const,
    filtered: (params: { statusFilter: StatusFilter; priorityFilter: PriorityFilter }) =>
      ['todos', params] as const,
  },
} as const;
