// Local calendar date as YYYY-MM-DD.
//
// Do NOT use new Date().toISOString().split('T')[0] for a "today" default — that
// is the UTC date, which for users behind UTC (e.g. US Pacific in the evening)
// is already "tomorrow". A tomorrow default then trips "date cannot be in the
// future" validation, silently blocking saves (Log Service / Log Issue).
export function todayLocal(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// Convert an existing date value to a local YYYY-MM-DD (for editing forms),
// avoiding the same UTC off-by-one.
export function toLocalDateString(value) {
  if (!value) return '';
  const d = new Date(value);
  if (isNaN(d)) return '';
  return todayLocal(d);
}
