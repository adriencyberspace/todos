import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/style.css';
import { CalendarDays, X } from 'lucide-react';
import type { Priority, Todo } from '../../types/todo';
import { useUpdateTodo } from '../../hooks/useUpdateTodo';
import { PriorityBadge } from '../PriorityBadge/PriorityBadge';
import { toISODateString } from '../../utils/date';
import styles from './EditTaskModal.module.scss';

const PRIORITIES: Priority[] = ['Low', 'Medium', 'High'];

interface Props {
  todo: Todo;
  onClose: () => void;
  onDelete: (todo: Todo) => void;
}

export function EditTaskModal({ todo, onClose, onDelete }: Props) {
  const [title, setTitle] = useState(todo.title);
  const [description, setDescription] = useState(todo.description ?? '');
  const [dueDate, setDueDate] = useState<Date | undefined>(() => {
    if (!todo.dueDate) return undefined;
    const parts = todo.dueDate.split('T')[0].split('-');
    return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  });
  const [priority, setPriority] = useState<Priority>(todo.priority);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);
  const updateTodo = useUpdateTodo();

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  function handleSave() {
    const trimmed = title.trim();
    if (!trimmed) return;
    updateTodo.mutate(
      {
        id: todo.id,
        data: {
          title: trimmed,
          description: description.trim() || null,
          dueDate: dueDate ? toISODateString(dueDate) : null,
          priority,
        },
      },
      { onSuccess: onClose }
    );
  }

  function handleDelete() {
    onDelete(todo);
    onClose();
  }

  const dueDateLabel = dueDate
    ? dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'No due date';

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
          <X size={16} />
        </button>

        <div className={styles.fields}>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>Title</label>
            <input
              ref={titleRef}
              className={styles.input}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              placeholder="Task title"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel}>Description</label>
            <textarea
              className={styles.textarea}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={1000}
              rows={3}
              placeholder="Optional description..."
            />
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel}>Due Date</label>
            <div className={styles.calendarWrapper}>
              <button
                className={styles.dateBtn}
                onClick={() => setIsCalendarOpen((o) => !o)}
              >
                <CalendarDays size={14} />
                <span>{dueDateLabel}</span>
              </button>
              {isCalendarOpen && (
                <div
                  className={styles.calendarPopover}
                  style={{ '--rdp-accent-color': '#B05A36' } as CSSProperties}
                >
                  <DayPicker
                    mode="single"
                    selected={dueDate}
                    onSelect={(date) => {
                      setDueDate(date);
                      setIsCalendarOpen(false);
                    }}
                  />
                  {dueDate && (
                    <button
                      className={styles.clearDate}
                      onClick={() => {
                        setDueDate(undefined);
                        setIsCalendarOpen(false);
                      }}
                    >
                      Clear date
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel}>Priority</label>
            <div className={styles.priorityOptions}>
              {PRIORITIES.map((p) => (
                <button
                  key={p}
                  className={styles.priorityBtn}
                  data-priority={p}
                  data-active={priority === p}
                  onClick={() => setPriority(p)}
                  aria-pressed={priority === p}
                >
                  <PriorityBadge priority={p} />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <button className={styles.deleteBtn} onClick={handleDelete}>
            Delete
          </button>
          <div className={styles.footerRight}>
            <button className={styles.cancelBtn} onClick={onClose}>
              Cancel
            </button>
            <button
              className={styles.saveBtn}
              onClick={handleSave}
              disabled={!title.trim() || updateTodo.isPending}
            >
              {updateTodo.isPending ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
