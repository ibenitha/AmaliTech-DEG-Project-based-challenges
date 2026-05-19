import { useState, useEffect } from 'react';
import styles from './StatusBar.module.css';
import Icon from '../common/Icon';

function formatClock(date) {
  return date.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

const StatusBar = ({ selectedNode, totalFiles, totalFolders }) => {
  const [clock, setClock] = useState(() => {
    const now = new Date();
    return { display: formatClock(now), iso: now.toISOString() };
  });

  useEffect(() => {
    const id = setInterval(() => {
      const now = new Date();
      setClock({ display: formatClock(now), iso: now.toISOString() });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const isFolder = selectedNode?.type === 'folder';

  return (
    <footer className={styles.statusBar} role="contentinfo" aria-label="Status bar">
      <div className={styles.left}>
        <span className={styles.item}>
          {totalFolders} {totalFolders === 1 ? 'folder' : 'folders'}
        </span>
        <span className={styles.divider} aria-hidden="true">|</span>
        <span className={styles.item}>
          {totalFiles} {totalFiles === 1 ? 'file' : 'files'}
        </span>
        {selectedNode && (
          <>
            <span className={styles.divider} aria-hidden="true">|</span>
            <span className={styles.item}>
              <Icon
                name={isFolder ? 'folder' : 'file'}
                fileName={!isFolder ? selectedNode.name : undefined}
                size={12}
              />
              <span className={styles.selectedName} title={selectedNode.name}>
                {selectedNode.name}
              </span>
              {!isFolder && selectedNode.size && (
                <span className={styles.selectedSize}>{selectedNode.size}</span>
              )}
            </span>
          </>
        )}
      </div>
      <div className={styles.right}>
        <span className={`${styles.item} ${styles.clock}`}>
          <Icon name="clock" size={12} />
          <time dateTime={clock.iso}>{clock.display}</time>
        </span>
      </div>
    </footer>
  );
};

export default StatusBar;
