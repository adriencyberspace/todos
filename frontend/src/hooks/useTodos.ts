import { useQuery } from '@tanstack/react-query';
import { getTodos } from '../api/todosApi';
import type { StatusFilter, PriorityFilter } from '../types/todo';
import { queryKeys } from '../lib/queryKeys';

export function useTodos(params: { statusFilter: StatusFilter; priorityFilter: PriorityFilter }) {
  return useQuery({
    queryKey: queryKeys.todos.filtered(params),
    queryFn: () => getTodos(params),
  });
}
