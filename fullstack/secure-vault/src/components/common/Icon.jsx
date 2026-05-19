import { getFileCategory } from '../../utils/treeUtils';

/* ─── SVG path data ─────────────────────────────────────────────────────── */
const PATHS = {
  folder:       <path d="M20 6h-8l-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-1 12H5c-.55 0-1-.45-1-1V8c0-.55.45-1 1-1h5.17l2 2H19c.55 0 1 .45 1 1v7c0 .55-.45 1-1 1z" />,
  folderOpen:   <path d="M20 6h-8l-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h5.17l2 2H20v8z" />,
  file:         <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />,
  // File type variants
  filePdf:      <><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6z" opacity=".3"/><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 7V3.5L18.5 9H13zm-3.5 5.5c0 .83-.67 1.5-1.5 1.5H7v2H5.5v-6H8c.83 0 1.5.67 1.5 1.5v1zm5 2c0 .83-.67 1.5-1.5 1.5h-2.5v-6H13c.83 0 1.5.67 1.5 1.5v3zm4-3.5h-1.5v1H19v1.5h-1.5V19H16v-6h4.5v1.5z"/></>,
  fileDoc:      <><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6z" opacity=".3"/><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 7V3.5L18.5 9H13zM8 16h8v1.5H8V16zm0-3h8v1.5H8V13zm0-3h5v1.5H8V10z"/></>,
  fileSheet:    <><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6z" opacity=".3"/><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 7V3.5L18.5 9H13zM8 11h2.5v2H8v-2zm0 3.5h2.5v2H8v-2zm3.5-3.5H14v2h-2.5v-2zm0 3.5H14v2h-2.5v-2zm3.5-3.5H17v2h-2v-2zm0 3.5H17v2h-2v-2z"/></>,
  fileImage:    <><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6z" opacity=".3"/><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 7V3.5L18.5 9H13zm-5 8l2.5-3.21 1.79 2.15 2.5-3.22L17 17H8z"/></>,
  fileCode:     <><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6z" opacity=".3"/><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 7V3.5L18.5 9H13zm-2 8l-2-2 2-2-1.06-1.06L7.88 17l3.06 3.06L12 19zm4 0 1.06 1.06L20.12 17l-3.06-3.06L16 15l2 2-2 2z"/></>,
  fileText:     <><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6z" opacity=".3"/><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 7V3.5L18.5 9H13zM8 16h8v1.5H8V16zm0-3h8v1.5H8V13zm0-3h5v1.5H8V10z"/></>,
  fileCert:     <><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6z" opacity=".3"/><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 7V3.5L18.5 9H13zm-1 5.5c0 1.38-1.12 2.5-2.5 2.5S7 15.88 7 14.5 8.12 12 9.5 12s2.5 1.12 2.5 2.5zm-2.5 4c-1.5 0-4.5.75-4.5 2.25V20h9v-1.25c0-1.5-3-2.25-4.5-2.25z"/></>,
  chevronRight: <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />,
  search:       <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />,
  more:         <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />,
  download:     <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />,
  delete:       <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />,
  shield:       <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />,
  clock:        <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z" />,
  copy:         <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />,
  check:        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />,
  sortAsc:      <path d="M3 18h6v-2H3v2zM3 6v2h18V6H3zm0 7h12v-2H3v2z" />,
  sortDesc:     <path d="M3 6h6v2H3V6zm0 5h12v2H3v-2zm0 5h18v2H3v-2z" />,
  grid:         <path d="M3 3h8v8H3zm10 0h8v8h-8zM3 13h8v8H3zm10 0h8v8h-8z" />,
  list:         <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z" />,
  expandAll:    <path d="M12 5.83L15.17 9l1.41-1.41L12 3 7.41 7.59 8.83 9 12 5.83zm0 12.34L8.83 15l-1.41 1.41L12 21l4.59-4.59L15.17 15 12 18.17z" />,
  collapseAll:  <path d="M7.41 18.59L8.83 20 12 16.83 15.17 20l1.41-1.41L12 14l-4.59 4.59zm9.18-13.18L15.17 4 12 7.17 8.83 4 7.41 5.41 12 10l4.59-4.59z" />,
  bell:         <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />,
  wifi:         <path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4 2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z" />,
  home:         <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />,
  recent:       <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z" />,
  info:         <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />,
};

/* ─── File-type colour map ──────────────────────────────────────────────── */
const CATEGORY_COLORS = {
  pdf:     '#f87171',   // red-400
  doc:     '#60a5fa',   // blue-400
  sheet:   '#34d399',   // emerald-400
  image:   '#c084fc',   // purple-400
  text:    '#94a3b8',   // slate-400
  code:    '#fbbf24',   // amber-400
  font:    '#f472b6',   // pink-400
  cert:    '#10b981',   // emerald-500
  archive: '#fb923c',   // orange-400
  unknown: '#64748b',   // slate-500
};

const CATEGORY_ICON = {
  pdf:     'filePdf',
  doc:     'fileDoc',
  sheet:   'fileSheet',
  image:   'fileImage',
  text:    'fileText',
  code:    'fileCode',
  font:    'file',
  cert:    'fileCert',
  archive: 'file',
  unknown: 'file',
};

/* ─── Component ─────────────────────────────────────────────────────────── */
const Icon = ({ name, size = 20, color, className = '', fileName }) => {
  // If fileName is provided, derive icon + colour from file category
  let resolvedName = name;
  let resolvedColor = color || 'currentColor';

  if (fileName && name === 'file') {
    const cat = getFileCategory(fileName);
    resolvedName = CATEGORY_ICON[cat] || 'file';
    if (!color) resolvedColor = CATEGORY_COLORS[cat] || 'currentColor';
  }

  if (resolvedName === 'lock') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={resolvedColor}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-hidden="true"
      >
        <path d="M7 11V8a5 5 0 0 1 10 0v3" />
        <rect x="5" y="11" width="14" height="10" rx="2" />
      </svg>
    );
  }

  const icon = PATHS[resolvedName];
  if (!icon) return null;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={resolvedColor}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {icon}
    </svg>
  );
};

export default Icon;
