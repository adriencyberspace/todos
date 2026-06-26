import styles from './EmptyState.module.scss';

type Props =
  | { variant: 'empty' | 'allDone' }
  | { variant: 'filtered'; onClearFilters: () => void };

export function EmptyState(props: Props) {
  if (props.variant === 'empty') {
    return (
      <div className={styles.container}>
        <span className={styles.text}>No tasks yet. Add one below.</span>
      </div>
    );
  }

  if (props.variant === 'filtered') {
    return (
      <div className={styles.container}>
        <span className={styles.text}>No tasks match your filters.</span>
        <button className={styles.clear} onClick={props.onClearFilters}>
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
