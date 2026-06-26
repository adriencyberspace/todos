import { useEffect, useRef, useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import type { StatusFilter, PriorityFilter } from '../../types/todo';
import styles from './FilterPopover.module.scss';

const STATUS_OPTIONS: { label: string; value: StatusFilter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Incomplete', value: 'active' },
  { label: 'Completed', value: 'completed' },
];

const PRIORITY_OPTIONS: { label: string; value: PriorityFilter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Low', value: 'Low' },
  { label: 'Medium', value: 'Medium' },
  { label: 'High', value: 'High' },
];

interface Props {
  statusFilter: StatusFilter;
  priorityFilter: PriorityFilter;
  onStatusChange: (s: StatusFilter) => void;
  onPriorityChange: (p: PriorityFilter) => void;
  onClear: () => void;
}

export function FilterPopover({ statusFilter, priorityFilter, onStatusChange, onPriorityChange, onClear }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasActiveFilter = statusFilter !== 'all' || priorityFilter !== 'all';

  useEffect(() => {
    if (!isOpen) return;
    function handleMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [isOpen]);

  return (
    <div className={styles.container} ref={containerRef}>
      <button
        className={styles.trigger}
        onClick={() => setIsOpen((o) => !o)}
        aria-label="Filter tasks"
      >
        <SlidersHorizontal size={16} />
        {hasActiveFilter && <span className={styles.dot} />}
      </button>

      {isOpen && (
        <div className={styles.popover}>
          <div className={styles.section}>
            <p className={styles.label}>Status</p>
            <div className={styles.options}>
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  className={styles.option}
                  data-active={statusFilter === opt.value}
                  data-value={opt.value}
                  onClick={() => onStatusChange(opt.value)}
                  aria-pressed={statusFilter === opt.value}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.section}>
            <p className={styles.label}>Priority</p>
            <div className={styles.options}>
              {PRIORITY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  className={styles.option}
                  data-active={priorityFilter === opt.value}
                  data-value={opt.value}
                  onClick={() => onPriorityChange(opt.value)}
                  aria-pressed={priorityFilter === opt.value}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {hasActiveFilter && (
            <button
              className={styles.clearBtn}
              onClick={() => {
                onClear();
                setIsOpen(false);
              }}
            >
              Clear
            </button>
          )}
        </div>
      )}
    </div>
  );
}
