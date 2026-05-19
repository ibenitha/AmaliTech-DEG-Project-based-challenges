import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import styles from './Explorer.module.css';
import TreeItem from './TreeItem';
import { useTreeNavigation } from '../../hooks/useTreeNavigation';
import Icon from '../common/Icon';
import ContextMenu from '../common/ContextMenu';
import {
  filterTree,
  getFoldersToExpand,
  getAllFolderIds,
  sortTree,
  getPathToNode,
  formatNodePath,
} from '../../utils/treeUtils';

const SORT_OPTIONS = [
  { value: 'name-asc',  label: 'Name A→Z',  icon: 'sortAsc'  },
  { value: 'name-desc', label: 'Name Z→A',  icon: 'sortDesc' },
  { value: 'size',      label: 'Size',       icon: 'list'     },
  { value: 'modified',  label: 'Modified',   icon: 'clock'    },
];

const Explorer = ({
  data,
  selectedNodeId,
  setSelectedNodeId,
  expandedNodes,
  setExpandedNodes,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [focusedNodeId, setFocusedNodeId] = useState(null);
  const [contextMenu, setContextMenu]   = useState(null);
  const [sortBy, setSortBy]             = useState('name-asc');
  const [viewMode, setViewMode]         = useState('tree'); // 'tree' | 'grid'
  const [showSortMenu, setShowSortMenu] = useState(false);
  const containerRef = useRef(null);
  const searchRef    = useRef(null);

  const toggleFolder = useCallback((id) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, [setExpandedNodes]);

  const expandAll = useCallback(() => {
    setExpandedNodes(getAllFolderIds(data));
  }, [data, setExpandedNodes]);

  const collapseAll = useCallback(() => {
    setExpandedNodes(new Set());
  }, [setExpandedNodes]);

  const handleSearchChange = useCallback((e) => {
    const term = e.target.value;
    setSearchTerm(term);
    if (term.trim()) {
      const ids = getFoldersToExpand(data, term);
      if (ids.size > 0) {
        setExpandedNodes((prev) => new Set([...prev, ...ids]));
      }
    }
  }, [data, setExpandedNodes]);

  // Sort → filter pipeline
  const processedData = useMemo(() => {
    const sorted = sortTree(data, sortBy);
    return filterTree(sorted, searchTerm);
  }, [data, sortBy, searchTerm]);

  const { handleKeyDown, visibleNodes } = useTreeNavigation({
    data: processedData,
    expandedNodes,
    toggleFolder,
    setSelectedNodeId,
    focusedNodeId,
    setFocusedNodeId,
  });

  const effectiveFocusedId =
    focusedNodeId && visibleNodes.some((n) => n.id === focusedNodeId)
      ? focusedNodeId
      : visibleNodes[0]?.id ?? null;

  // Scroll focused node into view
  useEffect(() => {
    if (effectiveFocusedId) {
      const el = document.getElementById(`tree-node-${effectiveFocusedId}`);
      el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [effectiveFocusedId]);

  // Keyboard shortcut: Alt+S focuses search; Escape closes sort dropdown
  useEffect(() => {
    const handler = (e) => {
      if (e.altKey && e.key === 's') {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setShowSortMenu(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleContextMenu = (e, node) => {
    setContextMenu({ x: e.clientX, y: e.clientY, node });
  };

  const menuActions = useMemo(() => {
    if (!contextMenu) return [];
    const { node } = contextMenu;
    const isFolder = node.type === 'folder';
    return [
      {
        label: isFolder ? (expandedNodes.has(node.id) ? 'Collapse' : 'Expand') : 'Select',
        icon: isFolder ? 'folder' : 'file',
        onClick: () => isFolder ? toggleFolder(node.id) : setSelectedNodeId(node.id),
      },
      {
        label: 'Copy Path',
        icon: 'copy',
        onClick: () => {
          const nodePath = getPathToNode(data, contextMenu.node.id);
          navigator.clipboard.writeText(formatNodePath(nodePath)).catch(() => {});
        },
      },
      {
        label: 'Download (Secure)',
        icon: 'download',
        onClick: () => {},
      },
      { separator: true },
      {
        label: 'Secure Delete',
        icon: 'delete',
        danger: true,
        onClick: () => {},
      },
    ];
  }, [contextMenu, expandedNodes, toggleFolder, setSelectedNodeId, data]);

  const matchCount = useMemo(() => {
    if (!searchTerm.trim()) return 0;
    let count = 0;
    const walk = (nodes) => {
      for (const n of nodes) {
        if (n.name.toLowerCase().includes(searchTerm.toLowerCase())) count++;
        if (n.children) walk(n.children);
      }
    };
    walk(processedData);
    return count;
  }, [processedData, searchTerm]);

  const currentSort = SORT_OPTIONS.find((o) => o.value === sortBy);

  return (
    <aside className={styles.explorer}>
      <div className={styles.scanline} aria-hidden="true" />

      {/* Search */}
      <div className={styles.searchBox}>
        <Icon name="search" size={14} className={styles.searchIcon} />
        <input
          ref={searchRef}
          type="search"
          className={styles.searchInput}
          placeholder="Search files..."
          value={searchTerm}
          onChange={handleSearchChange}
          aria-label="Search files and folders"
        />
        {searchTerm ? (
          <button className={styles.clearBtn} onClick={() => setSearchTerm('')} aria-label="Clear search">×</button>
        ) : (
          <span className={styles.searchShortcut}>Alt+S</span>
        )}
      </div>

      {searchTerm && (
        <div className={styles.searchMeta}>
          <span className={styles.matchCount}>{matchCount} match{matchCount !== 1 ? 'es' : ''}</span>
          <span className={styles.searchHint}>· branches expanded</span>
        </div>
      )}

      {/* Toolbar */}
      <div className={styles.toolbar}>
        {/* Sort */}
        <div className={styles.toolbarGroup}>
          <div className={styles.sortWrapper}>
            <button
              className={styles.toolbarBtn}
              onClick={() => setShowSortMenu((v) => !v)}
              title={`Sort: ${currentSort?.label}`}
              aria-label="Change sort order"
            >
              <Icon name={currentSort?.icon || 'sortAsc'} size={14} />
              <span className={styles.toolbarBtnLabel}>{currentSort?.label}</span>
              <Icon name="chevronRight" size={12} className={styles.sortChevron} />
            </button>
            {showSortMenu && (
              <div className={styles.sortDropdown}>
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    className={[styles.sortOption, sortBy === opt.value ? styles.sortOptionActive : ''].join(' ')}
                    onClick={() => { setSortBy(opt.value); setShowSortMenu(false); }}
                  >
                    <Icon name={opt.icon} size={13} />
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className={styles.toolbarSpacer} />

        {/* Expand / Collapse all */}
        <button className={styles.toolbarIconBtn} onClick={expandAll} title="Expand all" aria-label="Expand all folders">
          <Icon name="expandAll" size={15} />
        </button>
        <button className={styles.toolbarIconBtn} onClick={collapseAll} title="Collapse all" aria-label="Collapse all folders">
          <Icon name="collapseAll" size={15} />
        </button>

        {/* View toggle */}
        <div className={styles.viewToggle}>
          <button
            className={[styles.viewBtn, viewMode === 'tree' ? styles.viewBtnActive : ''].join(' ')}
            onClick={() => setViewMode('tree')}
            title="Tree view"
            aria-label="Tree view"
            aria-pressed={viewMode === 'tree'}
          >
            <Icon name="list" size={14} />
          </button>
          <button
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

      {/* Tree / Grid */}
      <div
        className={[styles.treeContainer, viewMode === 'grid' ? styles.gridContainer : ''].join(' ')}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="tree"
        aria-label="File Explorer"
        ref={containerRef}
      >
        {visibleNodes.length > 0 ? (
          viewMode === 'tree' ? (
            processedData.map((node) => (
              <TreeItem
                key={node.id}
                node={node}
                depth={0}
                expandedNodes={expandedNodes}
                selectedNodeId={selectedNodeId}
                focusedNodeId={effectiveFocusedId}
                onToggle={toggleFolder}
                onSelect={(id) => setSelectedNodeId(id)}
                onFocus={setFocusedNodeId}
                onContextMenu={handleContextMenu}
                searchTerm={searchTerm}
              />
            ))
          ) : (
            <GridView
              nodes={visibleNodes}
              selectedNodeId={selectedNodeId}
              expandedNodes={expandedNodes}
              onSelect={(id) => setSelectedNodeId(id)}
              onToggle={toggleFolder}
              searchTerm={searchTerm}
            />
          )
        ) : (
          <div className={styles.noResults}>
            <Icon name="search" size={32} color="var(--text-muted)" />
            <p>No results for &ldquo;{searchTerm}&rdquo;</p>
            <button className={styles.clearSearchBtn} onClick={() => setSearchTerm('')}>
              Clear search
            </button>
          </div>
        )}
      </div>

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          actions={menuActions}
          onClose={() => setContextMenu(null)}
        />
      )}

      {/* Close sort dropdown on outside click */}
      {showSortMenu && (
        <div className={styles.sortOverlay} onClick={() => setShowSortMenu(false)} />
      )}
    </aside>
  );
};

/* ─── Inline Grid View ──────────────────────────────────────────────────── */
function GridView({ nodes, selectedNodeId, expandedNodes, onSelect, onToggle, searchTerm }) {
  // Only show top-level (level 0) items in grid
  const topLevel = nodes.filter((n) => n.level === 0);

  const highlight = (name) => {
    if (!searchTerm) return name;
    const idx = name.toLowerCase().indexOf(searchTerm.toLowerCase());
    if (idx === -1) return name;
    return (
      <>
        {name.slice(0, idx)}
        <mark style={{ background: 'var(--accent-bg)', color: 'var(--accent-color)', borderRadius: 2 }}>
          {name.slice(idx, idx + searchTerm.length)}
        </mark>
        {name.slice(idx + searchTerm.length)}
      </>
    );
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', padding: '8px' }}>
      {topLevel.map((node) => {
        const isSelected = selectedNodeId === node.id;
        const isFolder = node.type === 'folder';
        return (
          <div
            key={node.id}
            onClick={() => { onSelect(node.id); if (isFolder) onToggle(node.id); }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
              padding: '12px 8px',
              borderRadius: 'var(--radius-md)',
              border: `1px solid ${isSelected ? 'var(--accent-color)' : 'var(--border-color)'}`,
              background: isSelected ? 'var(--accent-bg)' : 'var(--bg-color)',
              cursor: 'pointer',
              transition: 'all 0.15s',
              textAlign: 'center',
            }}
          >
            <Icon
              name={isFolder ? (expandedNodes.has(node.id) ? 'folderOpen' : 'folder') : 'file'}
              fileName={!isFolder ? node.name : undefined}
              size={28}
              color={isFolder ? 'var(--folder-color)' : undefined}
            />
            <span style={{
              fontSize: '11px',
              fontWeight: 500,
              color: isSelected ? 'var(--accent-color)' : 'var(--text-primary)',
              wordBreak: 'break-all',
              lineHeight: 1.3,
            }}>
              {highlight(node.name)}
            </span>
            {!isFolder && node.size && (
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                {node.size}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default Explorer;
