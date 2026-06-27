import { useEffect, useRef, useState } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/style.css';
import { Check, X, Pencil } from 'lucide-react';
import type { Priority, Todo } from '../../../types/todo';
import { useToggleTodo } from '../../../hooks/useToggleTodo';
import { useUpdateTodo } from '../../../hooks/useUpdateTodo';
import { PriorityBadge } from '../../PriorityBadge/PriorityBadge';
import { formatDueDate, toISODateString } from '../../../utils/date';
import styles from './TaskRow.module.scss';

const PRIORITIES: Priority[] = ['Low', 'Medium', 'High'];

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
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showPriorityPicker, setShowPriorityPicker] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLInputElement>(null);
  const datePickerRef = useRef<HTMLDivElement>(null);
  const priorityPickerRef = useRef<HTMLDivElement>(null);
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

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (datePickerRef.current && !datePickerRef.current.contains(e.target as Node)) {
        setShowDatePicker(false);
      }
    }
    if (showDatePicker) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showDatePicker]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (priorityPickerRef.current && !priorityPickerRef.current.contains(e.target as Node)) {
        setShowPriorityPicker(false);
      }
    }
    if (showPriorityPicker) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showPriorityPicker]);

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

  function handleDateSelect(date: Date | undefined) {
    updateTodo.mutate({
      id: todo.id,
      data: {
        title: todo.title,
        description: todo.description,
        dueDate: date ? toISODateString(date) : null,
        priority: todo.priority,
      },
    });
    setShowDatePicker(false);
  }

  function handlePrioritySelect(priority: Priority) {
    updateTodo.mutate({
      id: todo.id,
      data: {
        title: todo.title,
        description: todo.description,
        dueDate: todo.dueDate,
        priority,
      },
    });
    setShowPriorityPicker(false);
  }

  const selectedDate = todo.dueDate
    ? new Date(todo.dueDate.split('T')[0] + 'T00:00:00')
    : undefined;

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
        <div ref={datePickerRef} className={styles.dateTrigger}>
          <button
            className={`${styles.dueDate} ${overdue ? styles.overdue : ''} ${!dueDateText ? styles.dueDateEmpty : ''}`}
            onClick={() => setShowDatePicker((o) => !o)}
            aria-label="Set due date"
          >
            {dueDateText || 'Set date'}
          </button>
          {showDatePicker && (
            <div className={styles.calendarPopover}>
              <DayPicker
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
              />
              {todo.dueDate && (
                <button
                  className={styles.clearDate}
                  onClick={() => handleDateSelect(undefined)}
                >
                  Clear date
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className={styles.priorityCol}>
        <div ref={priorityPickerRef} className={styles.priorityTrigger}>
          <button
            className={styles.priorityBadgeBtn}
            onClick={() => setShowPriorityPicker((o) => !o)}
            aria-label="Change priority"
          >
            <PriorityBadge priority={todo.priority} />
          </button>
          {showPriorityPicker && (
            <div className={styles.priorityPopover}>
              {PRIORITIES.map((p) => (
                <button
                  key={p}
                  className={styles.priorityOption}
                  data-value={p}
                  data-active={todo.priority === p}
                  onClick={() => handlePrioritySelect(p)}
                >
                  <PriorityBadge priority={p} full />
                </button>
              ))}
            </div>
          )}
        </div>
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
