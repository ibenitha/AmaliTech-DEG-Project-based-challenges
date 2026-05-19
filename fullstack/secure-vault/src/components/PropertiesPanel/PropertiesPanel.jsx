import { useState } from 'react';
import styles from './PropertiesPanel.module.css';
import Icon from '../common/Icon';
import { VAULT_NAME } from '../../data';
import { getFileTypeLabel, countDirectChildren } from '../../utils/treeUtils';

function CopyButton({ text, label = 'Copy' }) {
  const [copied, setCopied] = useState(false);
  const handle = () => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <button className={styles.copyBtn} onClick={handle} title={copied ? 'Copied!' : label} aria-label={label}>
      <Icon name={copied ? 'check' : 'copy'} size={12} color={copied ? 'var(--accent-color)' : undefined} />
    </button>
  );
}

const PropertiesPanel = ({ node, onClose, path = [] }) => {
  /* ── Empty state ── */
  if (!node) {
    return (
      <aside className={styles.panel} aria-label="Details panel">
        <div className={styles.emptyState}>
          <img src="/logosecv.png" alt="" className={styles.emptyLogo} aria-hidden="true" />
          <p className={styles.emptyTitle}>No item selected</p>
          <p className={styles.emptyHint}>Select a file or folder from the list or tree to view metadata and actions.</p>
        </div>
      </aside>
    );
  }

  const isFolder = node.type === 'folder';
  const typeLabel = isFolder ? 'Folder' : getFileTypeLabel(node.name);
  const folderStats = isFolder ? countDirectChildren(node.children ?? []) : null;

  // Build location string from path
  const locationPath = path.length > 0
    ? '/' + path.map((n) => n.name).join('/')
    : `/${VAULT_NAME}`;

  // Deterministic mock hash
  const mockHash = [...node.id]
    .map((c) => c.charCodeAt(0).toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 40)
    .padEnd(40, '0');

  return (
    <aside className={styles.panel} aria-label={`Details for ${node.name}`}>
      {/* ── Panel header — "Details" + close × ── */}
      <div className={styles.panelHeader}>
        <div className={styles.panelHeaderLeft}>
          <Icon name="info" size={15} color="var(--accent-color)" />
          <span className={styles.panelHeaderTitle}>Details</span>
        </div>
        <button
          className={styles.closeBtn}
          onClick={onClose}
          aria-label="Close details panel"
          title="Close"
        >
          ×
        </button>
      </div>

      {/* ── File / folder identity ── */}
      <div className={styles.identity}>
        <div className={styles.identityIcon}>
          {isFolder ? (
            <Icon name="folder" size={36} color="var(--folder-color)" />
          ) : (
            <Icon name="file" fileName={node.name} size={36} />
          )}
        </div>
        <div className={styles.identityText}>
          <div className={styles.identityName} title={node.name}>{node.name}</div>
          <div className={styles.identityType}>{typeLabel}</div>
        </div>
      </div>

      {/* ── Metadata rows ── */}
      <div className={styles.metaRows}>
        <Row label="NAME"     value={node.name}  copyable />
        <Row label="TYPE"     value={typeLabel} />
        {isFolder && folderStats && (
          <Row label="CONTAINS" value={`${folderStats.files} files, ${folderStats.folders} folders`} />
        )}
        {!isFolder && node.size && (
          <Row label="SIZE" value={node.size} />
        )}
        {!isFolder && node.modified && (
          <Row label="MODIFIED" value={node.modified} />
        )}
        <Row
          label="LOCATION"
          value={locationPath}
          mono
          copyable
        />
        {!isFolder && (
          <Row label="SHA-1" value={mockHash} mono copyable />
        )}
      </div>

      {/* ── Security badge ── */}
      <div className={styles.secBadge}>
        <Icon name="lock" size={13} color="var(--accent-color)" />
        <span>AES-256 Encrypted</span>
      </div>

      {/* ── Action buttons ── */}
      <div className={styles.actions}>
        <button className={styles.btnPrimary}>
          {isFolder ? (
            <><Icon name="folder" size={15} color="var(--bg-color)" />Open Folder</>
          ) : (
            <><Icon name="shield" size={15} color="var(--bg-color)" />Decrypt &amp; Open</>
          )}
        </button>
        <button className={styles.btnSecondary}>
          <Icon name="download" size={15} />
          {isFolder ? 'Export' : 'Download'}
        </button>
      </div>
    </aside>
  );
};

function Row({ label, value, mono, copyable }) {
  return (
    <div className={styles.row}>
      <span className={styles.rowLabel}>{label}</span>
      <span className={styles.rowValue}>
        <span className={mono ? styles.rowValueMono : styles.rowValueText}>{value ?? '—'}</span>
        {copyable && value && <CopyButton text={String(value)} label={`Copy ${label}`} />}
      </span>
    </div>
  );
}

export default PropertiesPanel;
