import { useState } from 'react';
import type { SortOption, Todo } from './types/todo';
import { useTodos } from './hooks/useTodos';
import { useFilterState } from './hooks/useFilterState';
import { useUndoDelete } from './hooks/useUndoDelete';
import { sortTodos } from './utils/sort';
import { TaskTable } from './components/task-list/TaskTable/TaskTable';
import { FilterPopover } from './components/FilterPopover/FilterPopover';
import { SortDropdown } from './components/SortDropdown/SortDropdown';
import { EditTaskModal } from './components/EditTaskModal/EditTaskModal';
import styles from './App.module.scss';

export default function App() {
  const [sort, setSort] = useState<SortOption>('created-desc');
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);

  const { statusFilter, priorityFilter, handleStatusChange, handlePriorityChange, handleClearFilters } =
    useFilterState();
  const { handleDelete } = useUndoDelete();
  const { data: todos, isLoading } = useTodos({ statusFilter, priorityFilter });

  const sortedTodos = todos ? sortTodos(todos, sort) : undefined;

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <span className={styles.appTitle}>Tasks</span>
        <div className={styles.toolbar}>
          <FilterPopover
            statusFilter={statusFilter}
            priorityFilter={priorityFilter}
            onStatusChange={handleStatusChange}
            onPriorityChange={handlePriorityChange}
            onClear={handleClearFilters}
          />
          <SortDropdown sort={sort} onSortChange={setSort} />
        </div>
      </header>

      <main className={styles.main}>
        <TaskTable
          todos={sortedTodos}
          isLoading={isLoading}
          statusFilter={statusFilter}
          priorityFilter={priorityFilter}
          onEditTodo={setEditingTodo}
          onDeleteTodo={handleDelete}
          onClearFilters={handleClearFilters}
        />
      </main>

      {editingTodo && (
        <EditTaskModal
          todo={editingTodo}
          onClose={() => setEditingTodo(null)}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
