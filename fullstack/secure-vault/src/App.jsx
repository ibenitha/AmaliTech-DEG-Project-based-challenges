import { useState, useMemo, useCallback } from 'react';
import Explorer from './components/Explorer/Explorer';
import PropertiesPanel from './components/PropertiesPanel/PropertiesPanel';
import Breadcrumbs from './components/Breadcrumbs/Breadcrumbs';
import RecentFiles from './components/RecentFiles/RecentFiles';
import StatusBar from './components/StatusBar/StatusBar';
import Icon from './components/common/Icon';
import vaultTree, { DEFAULT_EXPANDED_NODE_IDS } from './data';
import {
  findNodeById,
  getPathToNode,
  countItems,
  getFolderContentsContext,
  getAncestorIdsToReveal,
} from './utils/treeUtils';
import FolderContents from './components/FolderContents/FolderContents';
import { useRecentFiles } from './hooks/useRecentFiles';
import styles from './App.module.css';

function App() {
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [expandedNodes, setExpandedNodes] = useState(
    () => new Set(DEFAULT_EXPANDED_NODE_IDS),
  );
  const { recent, addRecent, clearRecent } = useRecentFiles();

  const selectedNode = useMemo(() => {
    if (!selectedNodeId) return null;
    return findNodeById(vaultTree, selectedNodeId);
  }, [selectedNodeId]);

  const path = useMemo(() => {
    if (!selectedNodeId) return [];
    return getPathToNode(vaultTree, selectedNodeId) || [];
  }, [selectedNodeId]);

  const { files: totalFiles, folders: totalFolders } = useMemo(() => countItems(vaultTree), []);

  const folderContext = useMemo(
    () => getFolderContentsContext(vaultTree, selectedNode, path),
    [selectedNode, path],
  );

  const handleSelect = useCallback((id) => {
    setSelectedNodeId(id);
    const node = findNodeById(vaultTree, id);
    if (node) {
      addRecent(node);
      const nodePath = getPathToNode(vaultTree, id);
      const revealIds = getAncestorIdsToReveal(nodePath, node);
      if (revealIds.length > 0) {
        setExpandedNodes((prev) => new Set([...prev, ...revealIds]));
      }
    }
  }, [addRecent]);

  const handleBreadcrumbNavigate = useCallback((id) => {
    if (id === null) setSelectedNodeId(null);
    else handleSelect(id);
  }, [handleSelect]);

  const handleClosePanel = useCallback(() => setSelectedNodeId(null), []);

  return (
    <div className={styles.appRoot}>

      {/* ── Header ─────────────────────────────────────────────────── */}
      <header className={styles.appHeader} role="banner">
        <div className={styles.headerBrand}>
          <img src="/logosecv.png" alt="SecureVault logo" className={styles.headerLogo} />
          <div className={styles.headerTitles}>
            <h1 className={styles.headerTitle}>SecureVault</h1>
            <span className={styles.headerSubtitle}>Enterprise File Explorer</span>
          </div>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.encryptedPill}>
            <Icon name="lock" size={14} color="var(--accent-color)" />
            <span>Encrypted</span>
          </div>
        </div>
      </header>

      {/* ── Body: sidebar | right panel ────────────────────────────── */}
      <div className={styles.appBody}>

        {/* Left: file tree + recent files */}
        <div className={styles.sidebarWrapper}>
          <Explorer
            data={vaultTree}
            selectedNodeId={selectedNodeId}
            setSelectedNodeId={handleSelect}
            expandedNodes={expandedNodes}
            setExpandedNodes={setExpandedNodes}
          />
          <RecentFiles
            recent={recent}
            onSelect={handleSelect}
            onClear={clearRecent}
          />
        </div>

        {/* Right: breadcrumbs bar + details panel */}
        <main className={styles.rightPanel} role="main">
          <Breadcrumbs path={path} onNavigate={handleBreadcrumbNavigate} />
          <div className={styles.detailsArea}>
            <FolderContents
              items={folderContext.items}
              folderName={folderContext.folderName}
              isRoot={folderContext.isRoot}
              selectedNodeId={selectedNodeId}
              onSelect={handleSelect}
              totalFiles={totalFiles}
              totalFolders={totalFolders}
            />
            <PropertiesPanel
              node={selectedNode}
              onClose={handleClosePanel}
              path={path}
            />
          </div>
        </main>

      </div>

      {/* ── Status bar ─────────────────────────────────────────────── */}
      <StatusBar
        selectedNode={selectedNode}
        totalFiles={totalFiles}
        totalFolders={totalFolders}
      />

    </div>
  );
}

export default App;
