import styles from './RecentFiles.module.css';
import Icon from '../common/Icon';

/**
 * Wildcard Feature — Recent Files
 *
 * Displays the last N files/folders the user has selected.
 * Clicking a recent item re-selects it in the explorer.
 * This is a significant UX improvement for power users who frequently
 * jump between deeply nested files across different branches.
 */
const RecentFiles = ({ recent, onSelect, onClear }) => {
  if (recent.length === 0) return null;

  return (
    <section className={styles.container} aria-label="Recently accessed files">
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <Icon name="recent" size={13} color="var(--text-muted)" />
          <span className={styles.title}>Recent</span>
        </div>
        <button
          type="button"
          className={styles.clearBtn}
          onClick={onClear}
          aria-label="Clear recent files"
          title="Clear history"
        >
          Clear
        </button>
      </div>

      <ul className={styles.list} role="list">
        {recent.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              className={styles.item}
              onClick={() => onSelect(item.id)}
              title={item.name}
            >
              <Icon
                name={item.type === 'folder' ? 'folder' : 'file'}
                fileName={item.type === 'file' ? item.name : undefined}
                size={14}
                color={item.type === 'folder' ? 'var(--folder-color)' : undefined}
              />
              <span className={styles.itemName}>{item.name}</span>
              {item.size && (
                <span className={styles.itemSize}>{item.size}</span>
              )}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default RecentFiles;
