/**
 * Escape user-supplied text before interpolating into generated HTML
 * (PDF reports, shared snapshots). These HTML strings are opened in a browser
 * / WebView on share, so unescaped free-text fields (notes, nickname, vendor)
 * are an XSS vector — especially from a restored backup.
 */
export const escapeHtml = (str) => {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

export default { escapeHtml };
