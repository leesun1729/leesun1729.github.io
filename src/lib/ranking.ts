import raw from '../data/ranking.json';

export interface RankingEntry {
  path: string;
  title: string;
  count: number;
}

export interface RankingData {
  generatedAt: string | null;
  source: string | null;
  site: string | null;
  entries: RankingEntry[];
}

/**
 * Click-ranking data contract — see `docs/ranking.md`, owned by the analytics
 * workstream and written by `scripts/fetch-ranking.mjs`.
 *
 *   {
 *     "generatedAt": "2026-10-15T00:00:00.000Z" | null,
 *     "source": "goatcounter",
 *     "site": "https://leesun1729.goatcounter.com" | null,
 *     "entries": [{ "path": "/notes/trie/", "title": "字典树", "count": 123 }]
 *   }
 *
 * The shipped state is `entries: []` with `generatedAt: null`, and every failure
 * path in the pipeline leaves that empty state behind — so this page must render
 * a real empty state rather than assume rows exist. Malformed rows are dropped
 * instead of throwing, so a bad refresh can never break the build.
 */
export function loadRanking(): RankingData {
  const data = raw as Record<string, unknown>;
  const rows = Array.isArray(data.entries) ? data.entries : [];

  const entries = rows
    .filter((r): r is Record<string, unknown> => typeof r === 'object' && r !== null)
    .map((r) => ({
      path: typeof r.path === 'string' ? r.path : '',
      title: typeof r.title === 'string' ? r.title : '',
      count: typeof r.count === 'number' && Number.isFinite(r.count) ? r.count : 0,
    }))
    .filter((r) => r.path.startsWith('/'))
    .sort((a, b) => b.count - a.count);

  return {
    generatedAt: typeof data.generatedAt === 'string' ? data.generatedAt : null,
    source: typeof data.source === 'string' ? data.source : null,
    site: typeof data.site === 'string' ? data.site : null,
    entries,
  };
}

/** A readable label for a row whose GoatCounter title came back empty. */
export function labelFor(entry: RankingEntry): string {
  if (entry.title.trim()) return entry.title;
  if (entry.path === '/') return '/';
  const seg = entry.path.replace(/\/$/, '').split('/').filter(Boolean).pop();
  return seg ? decodeURIComponent(seg).replace(/-/g, ' ') : entry.path;
}

/** A relative scale for the bar, so the top row always fills the track. */
export function share(count: number, max: number): number {
  if (max <= 0) return 0;
  return Math.max(count / max, 0.02);
}
