#!/usr/bin/env node
/**
 * Fetch per-path hit counts from the GoatCounter API and write src/data/ranking.json.
 *
 * GoatCounter is a third party we do not control, so every failure path here is
 * fail-soft: warn, exit 0, and leave the existing data file untouched. A broken
 * ranking feed must never break the site build.
 */

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const DATA_PATH = fileURLToPath(new URL('../src/data/ranking.json', import.meta.url));
const SOURCE = 'goatcounter';
const DEFAULT_LIMIT = 100;
const REQUEST_TIMEOUT_MS = 15_000;

const EMPTY_STATE = { generatedAt: null, source: SOURCE, site: null, entries: [] };

const warn = (message) => process.stderr.write(`[ranking] ${message}\n`);
const log = (message) => process.stdout.write(`[ranking] ${message}\n`);

function parseArgs(argv) {
  const args = { dryRun: false, limit: DEFAULT_LIMIT };
  for (const raw of argv) {
    if (raw === '--dry-run') {
      args.dryRun = true;
    } else if (raw.startsWith('--limit=')) {
      const parsed = Number.parseInt(raw.slice('--limit='.length), 10);
      if (!Number.isInteger(parsed) || parsed <= 0) {
        throw new Error(`--limit expects a positive integer, got "${raw.slice('--limit='.length)}"`);
      }
      args.limit = parsed;
    } else {
      throw new Error(`unknown argument "${raw}" (supported: --dry-run, --limit=N)`);
    }
  }
  return args;
}

function normalizeSite(raw) {
  const value = raw.trim().replace(/\/+$/, '');
  const withScheme = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  const url = new URL(withScheme);
  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    throw new Error(`GOATCOUNTER_SITE must be an http(s) URL, got "${raw}"`);
  }
  return url.origin;
}

async function fetchHits(site, token, limit) {
  const endpoint = `${site}/api/v0/stats/hits?limit=${limit}`;
  log(`GET ${endpoint}`);
  const response = await fetch(endpoint, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  if (!response.ok) {
    throw new Error(`GoatCounter responded ${response.status} ${response.statusText}`);
  }
  const body = await response.text();
  try {
    return JSON.parse(body);
  } catch {
    throw new Error(`GoatCounter returned a non-JSON body: ${body.slice(0, 200)}`);
  }
}

/**
 * `Number(null)`, `Number('')` and `Number([])` are all 0, which would turn a
 * missing count into a plausible-looking zero. Only accept a real number or a
 * numeric string.
 */
function parseCount(raw, index) {
  const fail = () => {
    throw new Error(`unexpected API response: entry #${index} has no numeric "count" (got ${JSON.stringify(raw)})`);
  };
  if (typeof raw === 'number') {
    if (!Number.isFinite(raw)) fail();
    return raw;
  }
  if (typeof raw === 'string' && raw.trim() !== '') {
    const parsed = Number(raw);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fail();
}

/**
 * The API is documented to return { hits: [{ path, title, count }] }. It is down
 * while this is written, so accept `stats` as an alias but refuse to guess any
 * further: a renamed or missing field is an error, never a silent zero.
 */
function toEntries(payload) {
  if (payload === null || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new Error(`unexpected API response: expected a JSON object, got ${Array.isArray(payload) ? 'array' : typeof payload}`);
  }
  const rows = Array.isArray(payload.hits) ? payload.hits : Array.isArray(payload.stats) ? payload.stats : null;
  if (rows === null) {
    const keys = Object.keys(payload).join(', ') || '(none)';
    throw new Error(`unexpected API response: no array at "hits" or "stats" (top-level keys: ${keys})`);
  }

  const entries = rows.map((row, index) => {
    if (row === null || typeof row !== 'object' || Array.isArray(row)) {
      throw new Error(`unexpected API response: entry #${index} is not an object`);
    }
    if (typeof row.path !== 'string' || row.path === '') {
      throw new Error(`unexpected API response: entry #${index} has no string "path" (got ${JSON.stringify(row.path)})`);
    }
    const count = parseCount(row.count, index);
    return {
      path: row.path,
      title: typeof row.title === 'string' ? row.title : '',
      count,
    };
  });

  // GoatCounter also reports outbound links and campaign paths; keep internal pages only.
  return entries
    .filter((entry) => entry.path.startsWith('/') && !entry.path.startsWith('//'))
    .sort((a, b) => b.count - a.count || a.path.localeCompare(b.path));
}

async function readCurrent() {
  try {
    return await readFile(DATA_PATH, 'utf8');
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
}

async function failSoft(reason) {
  warn(reason);
  const current = await readCurrent();
  if (current === null) {
    await writeFile(DATA_PATH, `${JSON.stringify(EMPTY_STATE, null, 2)}\n`, 'utf8');
    warn(`fail-soft: no data file existed, wrote an empty state to ${DATA_PATH}`);
  } else {
    warn(`fail-soft: leaving ${DATA_PATH} unchanged`);
  }
  warn('fail-soft: exiting 0 so the build is never broken');
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  const rawSite = process.env.GOATCOUNTER_SITE ?? '';
  const token = (process.env.GOATCOUNTER_TOKEN ?? '').trim();
  const missing = [
    rawSite.trim() === '' ? 'GOATCOUNTER_SITE' : null,
    token === '' ? 'GOATCOUNTER_TOKEN' : null,
  ].filter(Boolean);
  if (missing.length > 0) {
    return failSoft(`missing environment variable(s): ${missing.join(', ')}`);
  }

  const site = normalizeSite(rawSite);
  const payload = await fetchHits(site, token, args.limit);
  const entries = toEntries(payload);

  const output = {
    generatedAt: new Date().toISOString(),
    source: SOURCE,
    site,
    entries,
  };
  const serialized = `${JSON.stringify(output, null, 2)}\n`;

  if (args.dryRun) {
    log(`dry-run: would write ${entries.length} entries to ${DATA_PATH}`);
    process.stdout.write(serialized);
    return;
  }

  await writeFile(DATA_PATH, serialized, 'utf8');
  log(`wrote ${entries.length} entries to ${DATA_PATH}`);
}

try {
  await main();
} catch (error) {
  await failSoft(`error: ${error instanceof Error ? error.message : String(error)}`);
}
