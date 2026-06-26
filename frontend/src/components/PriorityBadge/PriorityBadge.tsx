import type { Priority } from '../../types/todo';
import styles from './PriorityBadge.module.scss';

interface Props {
  priority: Priority;
}

export function PriorityBadge({ priority }: Props) {
  return (
    <span className={styles.badge} data-priority={priority}>
      {priority}
    </span>
  );
}
