import { VAULT_NAME } from '../data/index.js';

/**
 * Flattens the tree into a list of visible nodes based on expansion state.
 * Attaches `level` and `path` to each node for keyboard nav and breadcrumbs.
 */
export const getVisibleNodes = (data, expandedNodes) => {
  const visibleNodes = [];

  const traverse = (nodes, level = 0, path = []) => {
    for (const node of nodes) {
      const currentPath = [...path, node];
      visibleNodes.push({
        ...node,
        level,
        path: currentPath,
        hasChildren: node.type === 'folder' && node.children && node.children.length > 0,
      });
      if (node.type === 'folder' && expandedNodes.has(node.id) && node.children) {
        traverse(node.children, level + 1, currentPath);
      }
    }
  };

  traverse(data);
  return visibleNodes;
};

/** Finds a node by ID anywhere in the tree. */
export const findNodeById = (data, id) => {
  for (const node of data) {
    if (node.id === id) return node;
    if (node.children) {
      const found = findNodeById(node.children, id);
      if (found) return found;
    }
  }
  return null;
};

/**
 * Resolves which folder's children to show in the main content pane.
 * Files show their parent folder's contents so context stays visible.
 */
/**
 * @param {import('../data/index.js').VaultTreeNode[]} data  Root array from data.json
 */
export const getFolderContentsContext = (data, selectedNode, path) => {
  const vaultRoot = { folderName: VAULT_NAME, items: data, isRoot: true };

  if (!selectedNode) {
    return vaultRoot;
  }
  if (selectedNode.type === 'folder') {
    return {
      folderName: selectedNode.name,
      items: selectedNode.children ?? [],
      isRoot: false,
    };
  }
  // File selected: show parent folder contents, or vault root for top-level files
  const parent = path.length >= 2 ? path[path.length - 2] : null;
  if (parent?.type === 'folder') {
    return {
      folderName: parent.name,
      items: parent.children ?? [],
      isRoot: false,
    };
  }
  return { ...vaultRoot, isRoot: false };
};

/** Returns the full ancestor path to a node as an array. */
export const getPathToNode = (data, id) => {
  const findPath = (nodes, targetId, currentPath = []) => {
    for (const node of nodes) {
      const newPath = [...currentPath, node];
      if (node.id === targetId) return newPath;
      if (node.children) {
        const result = findPath(node.children, targetId, newPath);
        if (result) return result;
      }
    }
    return null;
  };
  return findPath(data, id) || [];
};

/** Collects all folder IDs in the tree. */
export const getAllFolderIds = (data) => {
  const ids = new Set();
  const walk = (nodes) => {
    for (const node of nodes) {
      if (node.type === 'folder') {
        ids.add(node.id);
        if (node.children?.length) walk(node.children);
      }
    }
  };
  walk(data);
  return ids;
};

/** Counts total files and folders recursively. */
export const countItems = (data) => {
  let files = 0;
  let folders = 0;
  const walk = (nodes) => {
    for (const node of nodes) {
      if (node.type === 'folder') {
        folders++;
        if (node.children?.length) walk(node.children);
      } else {
        files++;
      }
    }
  };
  walk(data);
  return { files, folders };
};

/** Flattens ALL nodes regardless of expansion state. */
export const flattenAll = (data) => {
  const result = [];
  const walk = (nodes) => {
    for (const node of nodes) {
      result.push(node);
      if (node.children?.length) walk(node.children);
    }
  };
  walk(data);
  return result;
};

/**
 * Filters the tree keeping nodes whose name matches query,
 * or folders that contain matching descendants.
 */
export const filterTree = (nodes, query) => {
  const q = query.trim().toLowerCase();
  if (!q) return nodes;

  return nodes.reduce((acc, node) => {
    const nameMatch = node.name.toLowerCase().includes(q);
    const filteredChildren = node.children ? filterTree(node.children, q) : [];

    if (nameMatch || filteredChildren.length > 0) {
      acc.push({
        ...node,
        ...(node.type === 'folder' && node.children
          ? { children: nameMatch ? node.children : filteredChildren }
          : {}),
      });
    }
    return acc;
  }, []);
};

/**
 * Returns the set of folder IDs that must be expanded so all
 * search matches are visible.
 */
export const getFoldersToExpand = (data, query) => {
  const q = query.trim().toLowerCase();
  const ids = new Set();
  if (!q) return ids;

  const walk = (nodes) => {
    let subtreeHasMatch = false;
    for (const node of nodes) {
      const nameMatch = node.name.toLowerCase().includes(q);
      let childMatch = false;
      if (node.children?.length) {
        childMatch = walk(node.children);
      }
      if (childMatch && node.type === 'folder') ids.add(node.id);
      if (nameMatch || childMatch) subtreeHasMatch = true;
    }
    return subtreeHasMatch;
  };

  walk(data);
  return ids;
};

/**
 * Sorts a tree. Folders always come before files within each group.
 * @param {'name-asc'|'name-desc'|'size'|'modified'} sortBy
 */
export const sortTree = (nodes, sortBy) => {
  const sorted = [...nodes].sort((a, b) => {
    if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;

    if (sortBy === 'name-desc') return b.name.localeCompare(a.name);
    if (sortBy === 'size') return parseSize(b.size) - parseSize(a.size);
    if (sortBy === 'modified') {
      const da = a.modified ? new Date(a.modified) : new Date(0);
      const db = b.modified ? new Date(b.modified) : new Date(0);
      return db - da;
    }
    // default: name-asc
    return a.name.localeCompare(b.name);
  });

  return sorted.map((node) =>
    node.children ? { ...node, children: sortTree(node.children, sortBy) } : node
  );
};

const parseSize = (size) => {
  if (!size) return 0;
  const units = { KB: 1024, MB: 1024 ** 2, GB: 1024 ** 3 };
  const match = String(size).match(/^([\d.]+)\s*(KB|MB|GB|B)?$/i);
  if (!match) return 0;
  const value = parseFloat(match[1]);
  const unit = (match[2] || 'B').toUpperCase();
  return value * (units[unit] || 1);
};

/** Returns the lowercase extension of a filename, e.g. "pdf". */
export const getExtension = (name) => {
  const parts = name.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
};

/**
 * Maps a filename to a semantic category for icon/colour selection.
 * @returns {'pdf'|'doc'|'sheet'|'image'|'text'|'code'|'font'|'cert'|'archive'|'unknown'}
 */
export const getFileCategory = (name) => {
  // Handle dotfiles like .gitignore, .env, .env.production
  const basename = name.split('/').pop() || name;
  if (basename.startsWith('.')) {
    // .env, .env.production, .env.local → code
    if (/^\.env/.test(basename)) return 'code';
    // .gitignore, .gitattributes, .eslintrc, .prettierrc, .babelrc → code
    if (/^\.(git|eslint|prettier|babel|npmrc|nvmrc|editorconfig|stylelint|huskyrc|lintstagedrc)/.test(basename)) return 'code';
  }
  const ext = getExtension(name);
  if (['pdf'].includes(ext)) return 'pdf';
  if (['doc', 'docx'].includes(ext)) return 'doc';
  if (['xls', 'xlsx', 'csv'].includes(ext)) return 'sheet';
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext)) return 'image';
  if (['txt', 'md'].includes(ext)) return 'text';
  if (['js', 'jsx', 'ts', 'tsx', 'json', 'yaml', 'yml', 'conf', 'env', 'sh', 'py', 'nginx', 'gitignore', 'gitattributes', 'eslintrc', 'prettierrc', 'babelrc', 'toml', 'ini'].includes(ext)) return 'code';
  if (['ttf', 'otf', 'woff', 'woff2'].includes(ext)) return 'font';
  if (['crt', 'pem', 'key', 'p12', 'pfx'].includes(ext)) return 'cert';
  if (['zip', 'tar', 'gz', 'rar', '7z'].includes(ext)) return 'archive';
  return 'unknown';
};

/** Human-readable file type labels (short for lists, full for details). */
const FILE_TYPE_LABELS = {
  pdf:     { short: 'PDF', full: 'PDF Document' },
  doc:     { short: 'Word', full: 'Word Document' },
  sheet:   { short: 'Spreadsheet', full: 'Spreadsheet' },
  image:   { short: 'Image', full: 'Image File' },
  text:    { short: 'Text', full: 'Text / Markdown' },
  code:    { short: 'Code', full: 'Source / Config' },
  font:    { short: 'Font', full: 'Font File' },
  cert:    { short: 'Certificate', full: 'Certificate' },
  archive: { short: 'Archive', full: 'Archive' },
  unknown: { short: 'File', full: 'File' },
};

export const getFileTypeLabel = (name, { short = false } = {}) => {
  const cat = getFileCategory(name);
  const labels = FILE_TYPE_LABELS[cat] ?? FILE_TYPE_LABELS.unknown;
  return short ? labels.short : labels.full;
};

/** Counts only immediate children (not nested descendants). */
export const countDirectChildren = (children = []) => {
  let files = 0;
  let folders = 0;
  for (const node of children) {
    if (node.type === 'folder') folders++;
    else files++;
  }
  return { files, folders };
};

/** Breadcrumb-style path string for clipboard display. */
export const formatNodePath = (path, vaultName = VAULT_NAME) => {
  if (!path?.length) return vaultName;
  return [vaultName, ...path.map((n) => n.name)].join(' / ');
};

/** Folder IDs to expand in the tree so a node is visible. */
export const getAncestorIdsToReveal = (nodePath, node) => {
  if (!nodePath?.length) return [];
  if (node?.type === 'folder') return nodePath.map((n) => n.id);
  return nodePath.slice(0, -1).map((n) => n.id);
};
