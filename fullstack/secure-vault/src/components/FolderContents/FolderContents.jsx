import { useMemo, useState } from 'react';
import styles from './FolderContents.module.css';
import Icon from '../common/Icon';
import { VAULT_NAME } from '../../data';
import { sortTree, getFileTypeLabel, countDirectChildren } from '../../utils/treeUtils';

function FolderContents({
  items,
  folderName,
  isRoot,
  selectedNodeId,
  onSelect,
  totalFiles,
  totalFolders,
}) {
  const [viewMode, setViewMode] = useState('list');

  const sortedItems = useMemo(() => sortTree(items, 'name-asc'), [items]);

  const folderCount = sortedItems.filter((n) => n.type === 'folder').length;
  const fileCount = sortedItems.filter((n) => n.type === 'file').length;

  const handleOpen = (node) => {
    onSelect(node.id);
  };

  if (isRoot && !selectedNodeId) {
    return (
      <section className={styles.container} aria-label="Vault home">
        <div className={styles.welcome}>
          <div className={styles.welcomeHero}>
            <img src="/logosecv.png" alt="" className={styles.welcomeLogo} aria-hidden="true" />
            <h2 className={styles.welcomeTitle}>Welcome to {VAULT_NAME}</h2>
          </div>
          <p className={styles.welcomeSubtitle}>
            Select a department or folder from the tree, or browse top-level volumes below.
          </p>
          <div className={styles.welcomeStats}>
            <div className={styles.statCard}>
              <span className={styles.statValue}>{totalFolders}</span>
              <span className={styles.statLabel}>Folders</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statValue}>{totalFiles}</span>
              <span className={styles.statLabel}>Files</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statValue}>{sortedItems.length}</span>
              <span className={styles.statLabel}>Volumes</span>
            </div>
          </div>
          <div className={styles.scrollArea}>
            <ItemGrid
              items={sortedItems}
              selectedNodeId={selectedNodeId}
              onOpen={handleOpen}
            />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.container} aria-label={`Contents of ${folderName}`}>
      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <span className={styles.folderIcon}>
            <Icon name="folder" size={18} color="var(--folder-color)" />
          </span>
          <h2 className={styles.toolbarTitle}>{folderName}</h2>
          <span className={styles.itemCount}>
            {folderCount > 0 && `${folderCount} folder${folderCount !== 1 ? 's' : ''}`}
            {folderCount > 0 && fileCount > 0 && ' · '}
            {fileCount > 0 && `${fileCount} file${fileCount !== 1 ? 's' : ''}`}
            {sortedItems.length === 0 && 'Empty'}
          </span>
        </div>
        <div className={styles.viewToggle}>
          <button
            type="button"
            className={[styles.viewBtn, viewMode === 'list' ? styles.viewBtnActive : ''].join(' ')}
            onClick={() => setViewMode('list')}
            title="List view"
            aria-label="List view"
            aria-pressed={viewMode === 'list'}
          >
            <Icon name="list" size={14} />
          </button>
          <button
            type="button"
            className={[styles.viewBtn, viewMode === 'grid' ? styles.viewBtnActive : ''].join(' ')}
            onClick={() => setViewMode('grid')}
            title="Grid view"
            aria-label="Grid view"
            aria-pressed={viewMode === 'grid'}
          >
            <Icon name="grid" size={14} />
          </button>
        </div>
      </div>

      {sortedItems.length === 0 ? (
        <div className={styles.emptyFolder}>
          <Icon name="folder" size={40} color="var(--text-muted)" />
          <p className={styles.emptyFolderTitle}>This folder is empty</p>
          <p className={styles.emptyFolderHint}>
            No files or subfolders here. Use the tree on the left to navigate elsewhere.
          </p>
        </div>
      ) : viewMode === 'list' ? (
        <div className={styles.scrollArea}>
          <div className={styles.listHeader} role="row">
            <span>Name</span>
            <span>Type</span>
            <span>Size</span>
            <span>Modified</span>
          </div>
          {sortedItems.map((node) => (
            <ListRow
              key={node.id}
              node={node}
              isSelected={selectedNodeId === node.id}
              onOpen={handleOpen}
            />
          ))}
        </div>
      ) : (
        <div className={styles.scrollArea}>
          <ItemGrid
            items={sortedItems}
            selectedNodeId={selectedNodeId}
            onOpen={handleOpen}
          />
        </div>
      )}
    </section>
  );
}

function ListRow({ node, isSelected, onOpen }) {
  const isFolder = node.type === 'folder';
  const typeLabel = isFolder ? 'Folder' : getFileTypeLabel(node.name, { short: true });

  return (
    <div
      role="row"
      className={[styles.listRow, isSelected ? styles.listRowSelected : ''].join(' ')}
      onClick={() => onOpen(node)}
      onDoubleClick={() => onOpen(node)}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter') onOpen(node);
      }}
    >
      <div className={styles.nameCell}>
        <Icon
          name={isFolder ? 'folder' : 'file'}
          fileName={!isFolder ? node.name : undefined}
          size={18}
          color={isFolder ? 'var(--folder-color)' : undefined}
        />
        <span className={styles.nameText}>{node.name}</span>
      </div>
      <span className={styles.cellMuted}>{typeLabel}</span>
      <span className={styles.cellMono}>{node.size ?? '—'}</span>
      <span className={styles.cellMono}>{node.modified ?? '—'}</span>
    </div>
  );
}

function ItemGrid({ items, selectedNodeId, onOpen }) {
  return (
    <div className={styles.grid}>
      {items.map((node) => {
        const isFolder = node.type === 'folder';
        const isSelected = selectedNodeId === node.id;
        const childStats = isFolder ? countDirectChildren(node.children ?? []) : null;
        return (
          <div
            key={node.id}
            className={[styles.gridCard, isSelected ? styles.gridCardSelected : ''].join(' ')}
            onClick={() => onOpen(node)}
            onDoubleClick={() => onOpen(node)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onOpen(node);
            }}
          >
            <Icon
              name={isFolder ? 'folder' : 'file'}
              fileName={!isFolder ? node.name : undefined}
              size={32}
              color={isFolder ? 'var(--folder-color)' : undefined}
            />
            <span className={styles.gridName}>{node.name}</span>
            {!isFolder && node.size && (
              <span className={styles.gridMeta}>{node.size}</span>
            )}
            {isFolder && childStats && (childStats.folders > 0 || childStats.files > 0) && (
              <span className={styles.gridMeta}>
                {[
                  childStats.folders > 0 && `${childStats.folders} folder${childStats.folders !== 1 ? 's' : ''}`,
                  childStats.files > 0 && `${childStats.files} file${childStats.files !== 1 ? 's' : ''}`,
                ].filter(Boolean).join(' · ')}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default FolderContents;
