import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { updateTodo } from '../api/todosApi';
import type { UpdateTodoRequest } from '../types/todo';
import { queryKeys } from '../lib/queryKeys';

export function useUpdateTodo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTodoRequest }) => updateTodo(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.todos.all });
    },
    onError: () => {
      toast.error('Failed to update task.');
    },
  });
}
