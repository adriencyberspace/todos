import { useEffect, useRef, useState } from 'react';
import { useCreateTodo } from '../../../hooks/useCreateTodo';
import styles from './AddTaskRow.module.scss';

export function AddTaskRow() {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const createTodo = useCreateTodo();

  useEffect(() => {
    if (isEditing) inputRef.current?.focus();
  }, [isEditing]);

  function startEditing() {
    setIsEditing(true);
  }

  function submit() {
    const title = value.trim();
    if (!title) {
      setIsEditing(false);
      setValue('');
      return;
    }
    createTodo.mutate(
      { title, priority: 'Medium' },
      {
        onSuccess: () => {
          setValue('');
          inputRef.current?.focus();
        },
      }
    );
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      submit();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setValue('');
    }
  }

  function handleBlur() {
    if (!value.trim()) {
      setIsEditing(false);
      setValue('');
    }
  }

  return (
    <div className={styles.row} onClick={!isEditing ? startEditing : undefined}>
      <div className={styles.circle} />
      <div className={styles.titleCol}>
        {isEditing ? (
          <input
            ref={inputRef}
            className={styles.input}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            placeholder="Task title..."
          />
        ) : (
          <span className={styles.placeholder}>Add task...</span>
        )}
      </div>
      <div className={styles.dateCol} />
      <div className={styles.priorityCol} />
      <div className={styles.actionsCol} />
    </div>
  );
}
