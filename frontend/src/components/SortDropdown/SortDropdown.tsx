import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { SortOption } from '../../types/todo';
import styles from './SortDropdown.module.scss';

const SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: 'Due Date (Earliest)', value: 'dueDate-asc' },
  { label: 'Due Date (Latest)', value: 'dueDate-desc' },
  { label: 'Priority (High → Low)', value: 'priority-desc' },
  { label: 'Priority (Low → High)', value: 'priority-asc' },
  { label: 'Date Created (Newest)', value: 'created-desc' },
  { label: 'Date Created (Oldest)', value: 'created-asc' },
];

interface Props {
  sort: SortOption;
  onSortChange: (s: SortOption) => void;
}

export function SortDropdown({ sort, onSortChange }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const currentLabel = SORT_OPTIONS.find((o) => o.value === sort)?.label ?? 'Sort';

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
        aria-label="Sort tasks"
      >
        <span>{currentLabel}</span>
        <ChevronDown size={14} />
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              className={styles.option}
              data-active={sort === opt.value}
              onClick={() => {
                onSortChange(opt.value);
                setIsOpen(false);
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
