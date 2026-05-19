import { useState, useCallback } from 'react';

const MAX_RECENT = 8;

/**
 * Wildcard Feature: Recent Files
 * Tracks the last N files/folders the user has selected, persisted in
 * sessionStorage so it survives hot-reloads during development.
 */
export const useRecentFiles = () => {
  const [recent, setRecent] = useState(() => {
    try {
      const stored = sessionStorage.getItem('sv_recent');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const addRecent = useCallback((node) => {
    if (!node) return;
    setRecent((prev) => {
      // Remove duplicate, prepend, cap at MAX_RECENT
      const filtered = prev.filter((n) => n.id !== node.id);
      const next = [{ id: node.id, name: node.name, type: node.type, size: node.size }, ...filtered].slice(0, MAX_RECENT);
      try { sessionStorage.setItem('sv_recent', JSON.stringify(next)); } catch { /* storage unavailable */ }
      return next;
    });
  }, []);

  const clearRecent = useCallback(() => {
    setRecent([]);
    try { sessionStorage.removeItem('sv_recent'); } catch { /* storage unavailable */ }
  }, []);

  return { recent, addRecent, clearRecent };
};
