import { useMutation } from '@tanstack/react-query';
import { deleteTodo } from '../api/todosApi';

export function useDeleteTodo() {
  return useMutation({
    mutationFn: deleteTodo,
  });
}
