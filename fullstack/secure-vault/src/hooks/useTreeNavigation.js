import { useCallback, useMemo } from 'react';
import { getVisibleNodes } from '../utils/treeUtils';

export const useTreeNavigation = ({
  data,
  expandedNodes,
  toggleFolder,
  setSelectedNodeId,
  focusedNodeId,
  setFocusedNodeId,
}) => {
  const visibleNodes = useMemo(
    () => getVisibleNodes(data, expandedNodes),
    [data, expandedNodes]
  );

  const handleKeyDown = useCallback(
    (e) => {
      // Don't intercept when typing in inputs
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      const activeFocusId =
        focusedNodeId && visibleNodes.some((n) => n.id === focusedNodeId)
          ? focusedNodeId
          : visibleNodes[0]?.id ?? null;

      const currentIndex = visibleNodes.findIndex((n) => n.id === activeFocusId);
      const currentNode = visibleNodes[currentIndex];

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          if (currentIndex < visibleNodes.length - 1) {
            setFocusedNodeId(visibleNodes[currentIndex + 1].id);
          }
          break;

        case 'ArrowUp':
          e.preventDefault();
          if (currentIndex > 0) {
            setFocusedNodeId(visibleNodes[currentIndex - 1].id);
          }
          break;

        case 'ArrowRight':
          e.preventDefault();
          if (currentNode?.type === 'folder') {
            if (!expandedNodes.has(currentNode.id)) {
              toggleFolder(currentNode.id);
            } else if (currentIndex < visibleNodes.length - 1) {
              setFocusedNodeId(visibleNodes[currentIndex + 1].id);
            }
          }
          break;

        case 'ArrowLeft':
          e.preventDefault();
          if (currentNode?.type === 'folder' && expandedNodes.has(currentNode.id)) {
            toggleFolder(currentNode.id);
          } else {
            // Jump to parent folder
            const parent = currentNode?.path?.[currentNode.path.length - 2];
            if (parent) setFocusedNodeId(parent.id);
          }
          break;

        case 'Enter':
          e.preventDefault();
          if (currentNode) {
            setSelectedNodeId(currentNode.id);
            if (currentNode.type === 'folder') toggleFolder(currentNode.id);
          }
          break;

        case ' ':
          e.preventDefault();
          if (currentNode?.type === 'folder') toggleFolder(currentNode.id);
          break;

        default:
          break;
      }
    },
    [visibleNodes, focusedNodeId, expandedNodes, toggleFolder, setFocusedNodeId, setSelectedNodeId]
  );

  return { handleKeyDown, visibleNodes };
};
