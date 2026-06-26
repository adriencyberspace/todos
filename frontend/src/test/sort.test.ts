import { describe, it, expect } from 'vitest';
import { sortTodos } from '../utils/sort';
import type { Todo } from '../types/todo';

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

describe('sortTodos', () => {
  it('sorts by dueDate ascending — nulls sort last', () => {
    const todos = [
      makeTodo({ id: '1', dueDate: null }),
      makeTodo({ id: '2', dueDate: '2026-07-10' }),
      makeTodo({ id: '3', dueDate: '2026-07-01' }),
    ];
    const result = sortTodos(todos, 'dueDate-asc');
    expect(result.map(t => t.id)).toEqual(['3', '2', '1']);
  });

  it('sorts by dueDate descending — nulls sort last', () => {
    const todos = [
      makeTodo({ id: '1', dueDate: null }),
      makeTodo({ id: '2', dueDate: '2026-07-01' }),
      makeTodo({ id: '3', dueDate: '2026-07-10' }),
    ];
    const result = sortTodos(todos, 'dueDate-desc');
    expect(result.map(t => t.id)).toEqual(['3', '2', '1']);
  });

  it('sorts by priority descending (High → Low)', () => {
    const todos = [
      makeTodo({ id: '1', priority: 'Low' }),
      makeTodo({ id: '2', priority: 'High' }),
      makeTodo({ id: '3', priority: 'Medium' }),
    ];
    const result = sortTodos(todos, 'priority-desc');
    expect(result.map(t => t.id)).toEqual(['2', '3', '1']);
  });

  it('sorts by priority ascending (Low → High)', () => {
    const todos = [
      makeTodo({ id: '1', priority: 'High' }),
      makeTodo({ id: '2', priority: 'Low' }),
      makeTodo({ id: '3', priority: 'Medium' }),
    ];
    const result = sortTodos(todos, 'priority-asc');
    expect(result.map(t => t.id)).toEqual(['2', '3', '1']);
  });

  it('sorts by createdAt ascending (oldest first)', () => {
    const todos = [
      makeTodo({ id: '1', createdAt: '2026-06-25T12:00:00' }),
      makeTodo({ id: '2', createdAt: '2026-06-23T08:00:00' }),
      makeTodo({ id: '3', createdAt: '2026-06-24T09:00:00' }),
    ];
    const result = sortTodos(todos, 'created-asc');
    expect(result.map(t => t.id)).toEqual(['2', '3', '1']);
  });

  it('sorts by createdAt descending (newest first)', () => {
    const todos = [
      makeTodo({ id: '1', createdAt: '2026-06-23T08:00:00' }),
      makeTodo({ id: '2', createdAt: '2026-06-25T12:00:00' }),
      makeTodo({ id: '3', createdAt: '2026-06-24T09:00:00' }),
    ];
    const result = sortTodos(todos, 'created-desc');
    expect(result.map(t => t.id)).toEqual(['2', '3', '1']);
  });
});
