import type { Todo, StatusFilter, PriorityFilter } from '../../types/todo';
import { TaskRow } from '../TaskRow/TaskRow';
import { SkeletonRow } from '../SkeletonRow/SkeletonRow';
import { EmptyState } from '../EmptyState/EmptyState';
import { AddTaskRow } from '../AddTaskRow/AddTaskRow';
import styles from './TaskTable.module.scss';

interface Props {
  todos: Todo[] | undefined;
  isLoading: boolean;
  statusFilter: StatusFilter;
  priorityFilter: PriorityFilter;
  onEditTodo: (todo: Todo) => void;
  onDeleteTodo: (todo: Todo) => void;
  onClearFilters: () => void;
}

export function TaskTable({
  todos,
  isLoading,
  statusFilter,
  priorityFilter,
  onEditTodo,
  onDeleteTodo,
  onClearFilters,
}: Props) {
  const hasActiveFilters = statusFilter !== 'all' || priorityFilter !== 'all';

  if (isLoading) {
    return (
      <div className={styles.table}>
        {[0, 1, 2, 3, 4].map((i) => (
          <SkeletonRow key={i} />
        ))}
        <AddTaskRow />
      </div>
    );
  }

  const list = todos ?? [];

  if (list.length === 0 && !hasActiveFilters) {
    return (
      <div className={styles.table}>
        <EmptyState variant="empty" />
        <AddTaskRow />
      </div>
    );
  }

  if (list.length === 0 && hasActiveFilters) {
    return (
      <div className={styles.table}>
        <EmptyState variant="filtered" onClearFilters={onClearFilters} />
        <AddTaskRow />
      </div>
    );
  }

  const allDone = list.length > 0 && list.every((t) => t.isCompleted) && statusFilter === 'all';

  return (
    <div className={styles.table}>
      {list.map((todo) => (
        <TaskRow
          key={todo.id}
          todo={todo}
          onEdit={onEditTodo}
          onDelete={onDeleteTodo}
        />
      ))}
      {allDone && <EmptyState variant="allDone" />}
      <AddTaskRow />
    </div>
  );
}
