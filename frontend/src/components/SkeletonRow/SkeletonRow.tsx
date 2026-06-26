import styles from './SkeletonRow.module.scss';

export function SkeletonRow() {
  return (
    <div className={styles.row} data-testid="skeleton-row">
      <div className={styles.col}>
        <div className={`${styles.block} ${styles.circle}`} />
      </div>
      <div className={styles.col}>
        <div className={`${styles.block} ${styles.title}`} />
      </div>
      <div className={styles.col}>
        <div className={`${styles.block} ${styles.date}`} />
      </div>
      <div className={styles.col}>
        <div className={`${styles.block} ${styles.badge}`} />
      </div>
      <div className={styles.col} />
    </div>
  );
}
