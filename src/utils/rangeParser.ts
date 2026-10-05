/**
 * Parses range strings like "1-3, 5, 8-10" into sorted unique 1-indexed page numbers.
 */
export function parseRangeString(rangeStr: string, totalPages: number): number[] {
  if (!rangeStr.trim()) return [];

  const pagesSet = new Set<number>();
  const parts = rangeStr.split(/[,;\s]+/).map(p => p.trim()).filter(Boolean);

  for (const part of parts) {
    if (part.includes('-')) {
      const [startStr, endStr] = part.split('-');
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);

      if (!isNaN(start) && !isNaN(end)) {
        const from = Math.max(1, Math.min(start, end));
        const to = Math.min(totalPages, Math.max(start, end));
        for (let i = from; i <= to; i++) {
          pagesSet.add(i);
        }
      } else if (!isNaN(start) && isNaN(end)) {
        // e.g. "5-" -> from 5 to end
        const from = Math.max(1, Math.min(start, totalPages));
        for (let i = from; i <= totalPages; i++) {
          pagesSet.add(i);
        }
      }
    } else {
      const page = parseInt(part, 10);
      if (!isNaN(page) && page >= 1 && page <= totalPages) {
        pagesSet.add(page);
      }
    }
  }

  return Array.from(pagesSet).sort((a, b) => a - b);
}

/**
 * Formats an array of page numbers into a condensed range string: e.g. [1, 2, 3, 5, 8, 9] -> "1-3, 5, 8-9"
 */
export function formatPagesToRange(pages: number[]): string {
  if (!pages || pages.length === 0) return '';
  const sorted = Array.from(new Set(pages)).sort((a, b) => a - b);
  
  const ranges: string[] = [];
  let start = sorted[0];
  let end = sorted[0];

  for (let i = 1; i < sorted.length; i++) {
    const current = sorted[i];
    if (current === end + 1) {
      end = current;
    } else {
      ranges.push(start === end ? `${start}` : `${start}-${end}`);
      start = current;
      end = current;
    }
  }
  ranges.push(start === end ? `${start}` : `${start}-${end}`);

  return ranges.join(', ');
}

/**
 * Validates if the range string has any valid pages within 1..totalPages
 */
export function validateRangeString(rangeStr: string, totalPages: number): { valid: boolean; count: number; error?: string } {
  if (!rangeStr.trim()) {
    return { valid: false, count: 0, error: 'Enter page numbers or ranges (e.g. 1-3, 5)' };
  }

  const pages = parseRangeString(rangeStr, totalPages);
  if (pages.length === 0) {
    return { valid: false, count: 0, error: `No pages found within 1 to ${totalPages}` };
  }

  return { valid: true, count: pages.length };
}
