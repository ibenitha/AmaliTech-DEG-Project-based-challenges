/**
 * SecureVault file tree — single source of truth.
 *
 * Data lives in `/data.json` at the project root (challenge dataset).
 * This module imports it once, validates shape in development, and exports
 * it for the entire app. Do not duplicate tree data elsewhere.
 *
 * @typedef {'folder'|'file'} VaultNodeType
 *
 * @typedef {Object} VaultFileNode
 * @property {string} id          Unique stable id (used for selection, expansion, URLs)
 * @property {string} name        Display name including extension for files
 * @property {'file'} type
 * @property {string} [size]      Human-readable size, e.g. "4.2 MB"
 * @property {string} [modified]  ISO-like date string, e.g. "2024-01-15"
 *
 * @typedef {Object} VaultFolderNode
 * @property {string} id
 * @property {string} name
 * @property {'folder'} type
 * @property {VaultTreeNode[]} [children]
 *
 * @typedef {VaultFileNode|VaultFolderNode} VaultTreeNode
 *
 * Root is a flat array of top-level departments/folders and root files.
 * There is no JSON wrapper node — the virtual root label is {@link VAULT_NAME}.
 */

import vaultTreeJson from '../../data.json';

/** Display name for the virtual vault root (not a row in data.json). */
export const VAULT_NAME = 'SecureVault';

/** Department tree expanded on first load. Must match an id in data.json. */
export const DEFAULT_EXPANDED_NODE_IDS = ['root_1'];

/**
 * @param {unknown} nodes
 * @param {Set<string>} [seen]
 * @returns {VaultTreeNode[]}
 */
function validateVaultTree(nodes, seen = new Set()) {
  if (!Array.isArray(nodes)) {
    throw new Error('[data.json] Root must be a JSON array of nodes.');
  }

  for (const node of nodes) {
    if (!node || typeof node !== 'object') {
      throw new Error('[data.json] Each node must be an object.');
    }
    if (!node.id || typeof node.id !== 'string') {
      throw new Error(`[data.json] Node missing string "id": ${JSON.stringify(node)}`);
    }
    if (!node.name || typeof node.name !== 'string') {
      throw new Error(`[data.json] Node "${node.id}" missing string "name".`);
    }
    if (node.type !== 'folder' && node.type !== 'file') {
      throw new Error(`[data.json] Node "${node.id}" has invalid type "${node.type}".`);
    }
    if (seen.has(node.id)) {
      throw new Error(`[data.json] Duplicate id "${node.id}".`);
    }
    seen.add(node.id);

    if (node.type === 'folder') {
      if (node.children != null && !Array.isArray(node.children)) {
        throw new Error(`[data.json] Folder "${node.id}" children must be an array.`);
      }
      if (node.children?.length) {
        validateVaultTree(node.children, seen);
      }
    } else if (node.children != null) {
      throw new Error(`[data.json] File "${node.id}" must not have children.`);
    }
  }

  return nodes;
}

/** Validated tree from data.json (validated in dev only). */
export const vaultTree =
  import.meta.env.DEV ? validateVaultTree(vaultTreeJson) : vaultTreeJson;

export default vaultTree;
