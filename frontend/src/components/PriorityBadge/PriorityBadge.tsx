import type { Priority } from '../../types/todo';
import styles from './PriorityBadge.module.scss';

interface Props {
  priority: Priority;
  full?: boolean;
}

export function PriorityBadge({ priority, full }: Props) {
  return (
    <span className={`${styles.badge} ${full ? styles.full : ''}`} data-priority={priority}>
      {priority}
    </span>
  );
}
