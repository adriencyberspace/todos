import { useEffect, useRef, useState } from 'react';
import { Check, X, Pencil } from 'lucide-react';
import type { Todo } from '../../../types/todo';
import { useToggleTodo } from '../../../hooks/useToggleTodo';
import { useUpdateTodo } from '../../../hooks/useUpdateTodo';
import { PriorityBadge } from '../../PriorityBadge/PriorityBadge';
import { formatDueDate } from '../../../utils/date';
import styles from './TaskRow.module.scss';

interface Props {
  todo: Todo;
  onEdit: (todo: Todo) => void;
  onDelete: (todo: Todo) => void;
}

export function TaskRow({ todo, onEdit, onDelete }: Props) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(todo.title);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [descriptionValue, setDescriptionValue] = useState(todo.description ?? '');
  const inputRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLInputElement>(null);
  const toggleTodo = useToggleTodo();
  const updateTodo = useUpdateTodo();
  const { text: dueDateText, overdue } = formatDueDate(todo.dueDate);

  useEffect(() => {
    if (isEditingTitle) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditingTitle]);

  useEffect(() => {
    if (isEditingDescription) {
      descriptionRef.current?.focus();
      descriptionRef.current?.select();
    }
  }, [isEditingDescription]);

  // Keep local values in sync if todo changes externally
  useEffect(() => {
    if (!isEditingTitle) setTitleValue(todo.title);
  }, [todo.title, isEditingTitle]);

  useEffect(() => {
    if (!isEditingDescription) setDescriptionValue(todo.description ?? '');
  }, [todo.description, isEditingDescription]);

  function startEditingTitle() {
    setTitleValue(todo.title);
    setIsEditingTitle(true);
  }

  function saveTitle() {
    const trimmed = titleValue.trim();
    if (!trimmed || trimmed === todo.title) {
      setTitleValue(todo.title);
      setIsEditingTitle(false);
      return;
    }
    updateTodo.mutate(
      {
        id: todo.id,
        data: {
          title: trimmed,
          description: todo.description,
          dueDate: todo.dueDate,
          priority: todo.priority,
        },
      },
      { onSettled: () => setIsEditingTitle(false) }
    );
  }

  function handleTitleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      saveTitle();
    } else if (e.key === 'Escape') {
      setTitleValue(todo.title);
      setIsEditingTitle(false);
    }
  }

  function saveDescription() {
    const trimmed = descriptionValue.trim();
    if (trimmed === (todo.description ?? '')) {
      setIsEditingDescription(false);
      return;
    }
    updateTodo.mutate(
      {
        id: todo.id,
        data: {
          title: todo.title,
          description: trimmed || null,
          dueDate: todo.dueDate,
          priority: todo.priority,
        },
      },
      { onSettled: () => setIsEditingDescription(false) }
    );
  }

  function handleDescriptionKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') saveDescription();
    else if (e.key === 'Escape') {
      setDescriptionValue(todo.description ?? '');
      setIsEditingDescription(false);
    }
  }

  function handleComplete() {
    toggleTodo.mutate({ id: todo.id, completed: !todo.isCompleted });
  }

  return (
    <div className={`${styles.row} ${todo.isCompleted ? styles.completed : ''}`}>
      <div className={styles.completeCol}>
        <button
          className={styles.circle}
          onClick={handleComplete}
          aria-label={todo.isCompleted ? 'Completed' : 'Mark as complete'}
          data-completed={todo.isCompleted}
        >
          {todo.isCompleted && <Check size={11} strokeWidth={2.5} />}
        </button>
      </div>

      <div className={styles.titleCol}>
        {isEditingTitle ? (
          <input
            ref={inputRef}
            className={styles.titleInput}
            value={titleValue}
            onChange={(e) => setTitleValue(e.target.value)}
            onKeyDown={handleTitleKeyDown}
            onBlur={saveTitle}
          />
        ) : (
          <>
            <span
              className={styles.title}
              onClick={startEditingTitle}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && startEditingTitle()}
            >
              {todo.title}
            </span>
            {isEditingDescription ? (
              <input
                ref={descriptionRef}
                className={styles.descriptionInput}
                value={descriptionValue}
                placeholder="Add description"
                onChange={(e) => setDescriptionValue(e.target.value)}
                onKeyDown={handleDescriptionKeyDown}
                onBlur={saveDescription}
              />
            ) : todo.description ? (
              <span
                className={styles.description}
                onClick={() => setIsEditingDescription(true)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setIsEditingDescription(true)}
              >
                {todo.description}
              </span>
            ) : (
              <span
                className={styles.descriptionPlaceholder}
                onClick={() => setIsEditingDescription(true)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setIsEditingDescription(true)}
              >
                Add description
              </span>
            )}
          </>
        )}
      </div>

      <div className={styles.dateCol}>
        {dueDateText && (
          <span className={`${styles.dueDate} ${overdue ? styles.overdue : ''}`}>
            {dueDateText}
          </span>
        )}
      </div>

      <div className={styles.priorityCol}>
        <PriorityBadge priority={todo.priority} />
      </div>

      <div className={styles.actionsCol}>
        <button
          className={styles.editBtn}
          onClick={() => onEdit(todo)}
          aria-label="Edit task"
        >
          <Pencil size={14} />
        </button>
        <button
          className={styles.deleteBtn}
          onClick={() => onDelete(todo)}
          aria-label="Delete task"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
