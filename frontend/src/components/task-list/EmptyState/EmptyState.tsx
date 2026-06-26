import styles from './EmptyState.module.scss';

interface Props {
  variant: 'empty' | 'filtered' | 'allDone';
  onClearFilters?: () => void;
}

export function EmptyState({ variant, onClearFilters }: Props) {
  if (variant === 'empty') {
    return (
      <div className={styles.container}>
        <span className={styles.text}>No tasks yet. Add one below.</span>
      </div>
    );
  }

  if (variant === 'filtered') {
    return (
      <div className={styles.container}>
        <span className={styles.text}>No tasks match your filters.</span>
        <button className={styles.clear} onClick={onClearFilters}>
          Clear filters
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <span className={styles.text}>
        You're all done! Create a new task when you're ready.
      </span>
    </div>
  );
}
