import { useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import type { CSSProperties } from 'react';
import type { Todo } from '../types/todo';
import { useDeleteTodo } from './useDeleteTodo';
import { queryKeys } from '../lib/queryKeys';

const UNDO_DELAY_MS = 4000;

const toastContainerStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  background: '#323438',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '6px',
  padding: '10px 14px',
  color: '#fff',
  fontSize: '14px',
};

const undoButtonStyle: CSSProperties = {
  background: '#B05A36',
  color: '#FEF9EF',
  fontWeight: 500,
  flexShrink: 0,
  borderRadius: '100px',
  padding: '3px 10px',
  fontSize: '12px',
};

export function useUndoDelete() {
  const queryClient = useQueryClient();
  const deleteMutation = useDeleteTodo();
  const deleteMutationRef = useRef(deleteMutation);
  deleteMutationRef.current = deleteMutation;
  const pendingDelete = useRef<{
    todo: Todo;
    timeoutId: ReturnType<typeof setTimeout>;
  } | null>(null);

  useEffect(() => {
    return () => {
      if (pendingDelete.current) {
        clearTimeout(pendingDelete.current.timeoutId);
        deleteMutationRef.current.mutate(pendingDelete.current.todo.id);
      }
    };
  }, []);

  function removeFromCache(id: string) {
    queryClient.setQueriesData<Todo[]>({ queryKey: queryKeys.todos.all }, (old) =>
      old?.filter((t) => t.id !== id) ?? []
    );
  }

  function handleUndo(toastId: string, todo: Todo) {
    if (!pendingDelete.current || pendingDelete.current.todo.id !== todo.id) return;
    clearTimeout(pendingDelete.current.timeoutId);
    pendingDelete.current = null;
    toast.dismiss(toastId);
    queryClient.setQueriesData<Todo[]>({ queryKey: queryKeys.todos.all }, (old) =>
      old ? [...old, todo] : [todo]
    );
  }

  function handleDelete(todo: Todo) {
    if (pendingDelete.current) {
      clearTimeout(pendingDelete.current.timeoutId);
      deleteMutation.mutate(pendingDelete.current.todo.id);
      pendingDelete.current = null;
    }

    removeFromCache(todo.id);

    const toastId = `delete-${todo.id}`;
    toast.custom(
      (t) => (
        <div style={{ ...toastContainerStyle, opacity: t.visible ? 1 : 0, transition: 'opacity 0.2s' }}>
          <span>"{todo.title}" deleted</span>
          <button onClick={() => handleUndo(toastId, todo)} style={undoButtonStyle}>
            Undo
          </button>
        </div>
      ),
      { id: toastId, duration: UNDO_DELAY_MS }
    );

    const timeoutId = setTimeout(() => {
      pendingDelete.current = null;
      deleteMutation.mutate(todo.id, {
        onError: () => {
          queryClient.invalidateQueries({ queryKey: queryKeys.todos.all });
          toast.error(`Couldn't delete "${todo.title}" — it has been restored.`);
        },
      });
    }, UNDO_DELAY_MS);

    pendingDelete.current = { todo, timeoutId };
  }

  return { handleDelete };
}
