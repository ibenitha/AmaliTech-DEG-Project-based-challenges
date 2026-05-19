import { Fragment, useEffect, useRef } from 'react';
import styles from './ContextMenu.module.css';
import Icon from './Icon';

const ContextMenu = ({ x, y, onClose, actions }) => {
  const menuRef = useRef(null);

  // Adjust position so menu doesn't overflow viewport
  const adjustedX = Math.min(x, window.innerWidth - 200);
  const adjustedY = Math.min(y, window.innerHeight - actions.length * 38 - 16);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) onClose();
    };
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKey);
    };
  }, [onClose]);

  return (
    <div
      className={styles.contextMenu}
      style={{ top: adjustedY, left: adjustedX }}
      ref={menuRef}
      role="menu"
      aria-label="Context menu"
    >
      {actions.map((action, index) => (
        <Fragment key={index}>
          {action.separator ? (
            <div className={styles.separator} role="separator" />
          ) : (
            <button
              role="menuitem"
              className={[styles.menuItem, action.danger ? styles.danger : ''].join(' ')}
              onClick={() => { action.onClick(); onClose(); }}
            >
              <Icon name={action.icon} size={14} className={styles.icon} />
              <span>{action.label}</span>
              {action.shortcut && (
                <span className={styles.shortcut}>{action.shortcut}</span>
              )}
            </button>
          )}
        </Fragment>
      ))}
    </div>
  );
};

export default ContextMenu;
