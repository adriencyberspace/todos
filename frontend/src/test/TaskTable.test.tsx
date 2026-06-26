import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { TaskTable } from '../components/TaskTable/TaskTable';
import type { Todo } from '../types/todo';

vi.mock('../hooks/useCompleteTodo', () => ({
  useCompleteTodo: () => ({ mutate: mockCompleteMutate }),
}));

vi.mock('../hooks/useUpdateTodo', () => ({
  useUpdateTodo: () => ({ mutate: vi.fn(), isPending: false }),
}));

vi.mock('../hooks/useCreateTodo', () => ({
  useCreateTodo: () => ({ mutate: vi.fn() }),
}));

const mockCompleteMutate = vi.fn();

const makeTodo = (overrides: Partial<Todo> = {}): Todo => ({
  id: 'todo-1',
  title: 'Test Task',
  description: null,
  isCompleted: false,
  createdAt: '2026-06-25T10:00:00',
  completedAt: null,
  dueDate: null,
  priority: 'Medium',
  ...overrides,
});

function makeWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
}

const defaultProps = {
  isLoading: false,
  statusFilter: 'all' as const,
  priorityFilter: 'all' as const,
  onEditTodo: vi.fn(),
  onDeleteTodo: vi.fn(),
  onClearFilters: vi.fn(),
};

describe('TaskTable', () => {
  beforeEach(() => {
    mockCompleteMutate.mockClear();
  });

  it('renders 5 skeleton rows while loading', () => {
    render(
      <TaskTable {...defaultProps} todos={undefined} isLoading={true} />,
      { wrapper: makeWrapper() }
    );
    expect(screen.getAllByTestId('skeleton-row')).toHaveLength(5);
  });

  it('renders todo titles when data is loaded', () => {
    const todos: Todo[] = [
      makeTodo({ id: 'todo-1', title: 'First Task' }),
      makeTodo({ id: 'todo-2', title: 'Second Task' }),
    ];
    render(
      <TaskTable {...defaultProps} todos={todos} isLoading={false} />,
      { wrapper: makeWrapper() }
    );
    expect(screen.getByText('First Task')).toBeInTheDocument();
    expect(screen.getByText('Second Task')).toBeInTheDocument();
  });

  it('calls completeTodo mutation with correct id when completion circle is clicked', async () => {
    const user = userEvent.setup();
    const todo = makeTodo({ id: 'todo-abc', title: 'Clickable Task' });
    render(
      <TaskTable {...defaultProps} todos={[todo]} isLoading={false} />,
      { wrapper: makeWrapper() }
    );
    const completeBtn = screen.getByRole('button', { name: /mark as complete/i });
    await user.click(completeBtn);
    expect(mockCompleteMutate).toHaveBeenCalledWith('todo-abc');
  });
});
