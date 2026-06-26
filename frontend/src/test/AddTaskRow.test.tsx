import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AddTaskRow } from '../components/task-list/AddTaskRow/AddTaskRow';

const mockCreateMutate = vi.fn();

vi.mock('../hooks/useCreateTodo', () => ({
  useCreateTodo: () => ({ mutate: mockCreateMutate }),
}));

describe('AddTaskRow', () => {
  beforeEach(() => {
    mockCreateMutate.mockClear();
  });

  it('shows placeholder text by default, not an input', () => {
    render(<AddTaskRow />);
    expect(screen.getByText('Add task...')).toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('clicking placeholder reveals the input', async () => {
    const user = userEvent.setup();
    render(<AddTaskRow />);
    await user.click(screen.getByText('Add task...'));
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('pressing Enter with a non-empty value calls createTodo mutate', async () => {
    const user = userEvent.setup();
    render(<AddTaskRow />);
    await user.click(screen.getByText('Add task...'));
    await user.type(screen.getByRole('textbox'), 'Buy milk');
    await user.keyboard('{Enter}');
    expect(mockCreateMutate).toHaveBeenCalledWith(
      { title: 'Buy milk', priority: 'Medium' },
      expect.any(Object),
    );
  });

  it('pressing Enter with only whitespace does not call mutate', async () => {
    const user = userEvent.setup();
    render(<AddTaskRow />);
    await user.click(screen.getByText('Add task...'));
    await user.type(screen.getByRole('textbox'), '   ');
    await user.keyboard('{Enter}');
    expect(mockCreateMutate).not.toHaveBeenCalled();
  });

  it('pressing Escape hides the input', async () => {
    const user = userEvent.setup();
    render(<AddTaskRow />);
    await user.click(screen.getByText('Add task...'));
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('clears input value after successful create', async () => {
    const user = userEvent.setup();
    mockCreateMutate.mockImplementation((_vars: unknown, options: { onSuccess?: () => void }) => {
      options?.onSuccess?.();
    });
    render(<AddTaskRow />);
    await user.click(screen.getByText('Add task...'));
    await user.type(screen.getByRole('textbox'), 'Buy milk');
    await user.keyboard('{Enter}');
    expect(screen.getByRole('textbox')).toHaveValue('');
  });
});
