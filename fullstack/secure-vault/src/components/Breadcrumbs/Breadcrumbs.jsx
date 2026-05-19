import { useState, Fragment } from 'react';
import styles from './Breadcrumbs.module.css';
import Icon from '../common/Icon';
import { VAULT_NAME } from '../../data';
import { formatNodePath } from '../../utils/treeUtils';

const Breadcrumbs = ({ path, onNavigate }) => {
  const [copied, setCopied] = useState(false);

  const fullPath = formatNodePath(path, VAULT_NAME);

  const handleCopyPath = () => {
    navigator.clipboard.writeText(fullPath).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <nav className={styles.breadcrumbs} aria-label="File path">
      <button
        type="button"
        className={styles.rootItem}
        onClick={() => onNavigate(null)}
        aria-label="Go to root"
      >
        {VAULT_NAME}
      </button>

      {path.map((node, index) => (
        <Fragment key={node.id}>
          <span className={styles.sep} aria-hidden="true">›</span>
          <button
            type="button"
            className={[
              styles.item,
              index === path.length - 1 ? styles.itemActive : styles.itemInactive,
            ].join(' ')}
            onClick={() => onNavigate(node.id)}
            aria-current={index === path.length - 1 ? 'page' : undefined}
          >
            {node.name}
          </button>
        </Fragment>
      ))}

      {path.length > 0 && (
        <button
          type="button"
          className={styles.copyBtn}
          onClick={handleCopyPath}
          title={copied ? 'Copied!' : 'Copy path'}
          aria-label="Copy full path"
        >
          <Icon
            name={copied ? 'check' : 'copy'}
            size={12}
            color={copied ? 'var(--accent-color)' : undefined}
          />
        </button>
      )}
    </nav>
  );
};

export default Breadcrumbs;
