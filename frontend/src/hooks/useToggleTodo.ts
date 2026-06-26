import { useMutation, useQueryClient } from '@tanstack/react-query';
import { completeTodo, uncompleteTodo } from '../api/todosApi';
import type { Todo } from '../types/todo';
import { queryKeys } from '../lib/queryKeys';

export function useToggleTodo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, completed }: { id: string; completed: boolean }) =>
      completed ? completeTodo(id) : uncompleteTodo(id),
    onMutate: async ({ id, completed }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.todos.all });
      const snapshots = queryClient.getQueriesData<Todo[]>({ queryKey: queryKeys.todos.all });
      queryClient.setQueriesData<Todo[]>({ queryKey: queryKeys.todos.all }, (old) =>
        old?.map((t) =>
          t.id === id
            ? { ...t, isCompleted: completed, completedAt: completed ? new Date().toISOString() : null }
            : t
        ) ?? []
      );
      return { snapshots };
    },
    onError: (_err, _vars, context) => {
      context?.snapshots.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.todos.all });
    },
  });
}
