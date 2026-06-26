import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { EmptyState } from '../components/task-list/EmptyState/EmptyState';

describe('EmptyState', () => {
  it('renders "no tasks yet" copy for empty variant', () => {
    render(<EmptyState variant="empty" />);
    expect(screen.getByText('No tasks yet. Add one below.')).toBeInTheDocument();
  });

  it('renders "no matches" copy and a clear-filters button for filtered variant', () => {
    render(<EmptyState variant="filtered" onClearFilters={vi.fn()} />);
    expect(screen.getByText('No tasks match your filters.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Clear filters' })).toBeInTheDocument();
  });

  it('calls onClearFilters when the clear-filters button is clicked', async () => {
    const user = userEvent.setup();
    const onClearFilters = vi.fn();
    render(<EmptyState variant="filtered" onClearFilters={onClearFilters} />);
    await user.click(screen.getByRole('button', { name: 'Clear filters' }));
    expect(onClearFilters).toHaveBeenCalledOnce();
  });

  it('renders "all done" copy for allDone variant', () => {
    render(<EmptyState variant="allDone" />);
    expect(screen.getByText(/you're all done/i)).toBeInTheDocument();
  });
});
