import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { TaskTable } from '../components/task-list/TaskTable/TaskTable';
import type { Todo } from '../types/todo';

const mockToggleMutate = vi.fn();

vi.mock('../hooks/useToggleTodo', () => ({
  useToggleTodo: () => ({ mutate: mockToggleMutate }),
}));

vi.mock('../hooks/useUpdateTodo', () => ({
  useUpdateTodo: () => ({ mutate: vi.fn(), isPending: false }),
}));

vi.mock('../hooks/useCreateTodo', () => ({
  useCreateTodo: () => ({ mutate: vi.fn() }),
}));

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
    mockToggleMutate.mockClear();
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

  it('calls toggleTodo mutation with correct id and completed state when completion circle is clicked', async () => {
    const user = userEvent.setup();
    const todo = makeTodo({ id: 'todo-abc', title: 'Clickable Task' });
    render(
      <TaskTable {...defaultProps} todos={[todo]} isLoading={false} />,
      { wrapper: makeWrapper() }
    );
    const completeBtn = screen.getByRole('button', { name: /mark as complete/i });
    await user.click(completeBtn);
    expect(mockToggleMutate).toHaveBeenCalledWith({ id: 'todo-abc', completed: true });
  });

  it('shows empty state when todos list is empty and no filters active', () => {
    render(
      <TaskTable {...defaultProps} todos={[]} isLoading={false} />,
      { wrapper: makeWrapper() }
    );
    expect(screen.getByText('No tasks yet. Add one below.')).toBeInTheDocument();
  });

  it('shows filtered empty state and clear-filters button when filters active and no results', () => {
    render(
      <TaskTable
        {...defaultProps}
        todos={[]}
        isLoading={false}
        statusFilter="active"
      />,
      { wrapper: makeWrapper() }
    );
    expect(screen.getByText('No tasks match your filters.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Clear filters' })).toBeInTheDocument();
  });

  it('shows all-done state below task rows when all todos are completed and no status filter active', () => {
    const todos = [
      makeTodo({ id: '1', isCompleted: true }),
      makeTodo({ id: '2', isCompleted: true }),
    ];
    render(
      <TaskTable {...defaultProps} todos={todos} isLoading={false} statusFilter="all" />,
      { wrapper: makeWrapper() }
    );
    expect(screen.getByText(/you're all done/i)).toBeInTheDocument();
  });
});
