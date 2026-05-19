import { memo, Fragment } from 'react';
import styles from './TreeItem.module.css';
import Icon from '../common/Icon';

const TreeItem = memo(({
  node,
  depth = 0,
  expandedNodes,
  selectedNodeId,
  focusedNodeId,
  onToggle,
  onSelect,
  onFocus,
  onContextMenu,
  searchTerm,
}) => {
  const isFolder = node.type === 'folder';
  const isExpanded = expandedNodes.has(node.id);
  const isSelected = selectedNodeId === node.id;
  const isFocused = focusedNodeId === node.id;
  const hasChildren = isFolder && Array.isArray(node.children) && node.children.length > 0;

  const handleClick = (e) => {
    e.stopPropagation();
    onFocus(node.id);
    onSelect(node.id);
    if (isFolder) onToggle(node.id);
  };

  const handleChevronClick = (e) => {
    e.stopPropagation();
    if (isFolder) onToggle(node.id);
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    onFocus(node.id);
    onSelect(node.id);
    onContextMenu(e, node);
  };

  const renderName = () => {
    if (!searchTerm) return node.name;
    const q = searchTerm.trim();
    const idx = node.name.toLowerCase().indexOf(q.toLowerCase());
    if (idx === -1) return node.name;
    return (
      <>
        {node.name.slice(0, idx)}
        <mark className={styles.highlight}>{node.name.slice(idx, idx + q.length)}</mark>
        {node.name.slice(idx + q.length)}
      </>
    );
  };

  return (
    <Fragment>
      <div
        className={[
          styles.treeItem,
          isSelected ? styles.selected : '',
          isFocused && !isSelected ? styles.focused : '',
        ].join(' ')}
        style={{ paddingLeft: `${depth * 16 + 4}px` }}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        tabIndex={isFocused ? 0 : -1}
        role="treeitem"
        aria-expanded={isFolder ? isExpanded : undefined}
        aria-selected={isSelected}
        aria-level={depth + 1}
        aria-label={`${node.type}: ${node.name}`}
        id={`tree-node-${node.id}`}
      >
        {Array.from({ length: depth }).map((_, i) => (
          <span
            key={i}
            className={styles.indentGuide}
            style={{ left: `${i * 16 + 12}px` }}
          />
        ))}

        <span
          className={[styles.chevron, isExpanded ? styles.chevronOpen : ''].join(' ')}
          onClick={handleChevronClick}
          aria-hidden="true"
        >
          {hasChildren && <Icon name="chevronRight" size={14} />}
        </span>

        <span className={styles.icon}>
          {isFolder ? (
            <Icon
              name={isExpanded ? 'folderOpen' : 'folder'}
              size={16}
              color="var(--folder-color)"
            />
          ) : (
            <Icon name="file" fileName={node.name} size={16} />
          )}
        </span>

        <span className={styles.label}>{renderName()}</span>

        {!isFolder && node.size && (
          <span className={styles.sizeBadge}>{node.size}</span>
        )}

        {isFolder && !isExpanded && hasChildren && (
          <span className={styles.countBadge}>{node.children.length}</span>
        )}
      </div>

      {isFolder && isExpanded && hasChildren && (
        <div role="group" aria-label={`${node.name} contents`}>
          {node.children.map((child) => (
            <TreeItem
              key={child.id}
              node={child}
              depth={depth + 1}
              expandedNodes={expandedNodes}
              selectedNodeId={selectedNodeId}
              focusedNodeId={focusedNodeId}
              onToggle={onToggle}
              onSelect={onSelect}
              onFocus={onFocus}
              onContextMenu={onContextMenu}
              searchTerm={searchTerm}
            />
          ))}
        </div>
      )}
    </Fragment>
  );
});

TreeItem.displayName = 'TreeItem';
export default TreeItem;
