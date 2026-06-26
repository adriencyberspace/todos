import styles from './DeleteToast.module.scss';

interface Props {
  title: string;
  visible: boolean;
  onUndo: () => void;
}

export function DeleteToast({ title, visible, onUndo }: Props) {
  return (
    <div className={`${styles.container} ${visible ? styles.visible : ''}`}>
      <span>"{title}" deleted</span>
      <button onClick={onUndo} className={styles.undoBtn}>
        Undo
      </button>
    </div>
  );
}
