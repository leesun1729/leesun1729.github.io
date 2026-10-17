#!/usr/bin/env node
/**
 * Fails when a built page needs a font slice it should not need.
 *
 * fonts.css splits the CJK face in two: slice A holds every character the site
 * renders and is always fetched, slice B holds the rest of GB2312 level 1 and
 * is fetched only when a page really uses those characters. The intended steady
 * state is that slice A covers everything and no page ever loads slice B.
 *
 * That invariant breaks silently. Editing copy adds characters; if the fonts
 * are not rebuilt, the new characters fall outside slice A's unicode-ranges and
 * the page quietly downloads ~565 KB instead of ~137 KB. Nothing errors, the
 * page still looks right, only the transfer cost changes — so it survives
 * review indefinitely. This check is the thing that notices.
 *
 * Usage:  node scripts/check-font-coverage.mjs        (after a build)
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const DIST = 'dist';
const ASTRO = join(DIST, '_astro');

/* Third-party bundles shipped verbatim in public/ render their own HTML and
   load no webfont of ours, so their characters are not a slice-A concern.
   VagulaMap's admin.html alone contributed 7 phantom "missing" characters
   (草稿逗坐德封消) before this exclusion. */
const SKIP_DIRS = new Set(['VagulaMap']);

/** Collect every .html file under dist/, skipping third-party bundles. */
function htmlFiles(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) {
      if (SKIP_DIRS.has(name)) continue;
      out.push(...htmlFiles(p));
    } else if (name.endsWith('.html')) out.push(p);
  }
  return out;
}

/** Parse one unicode-range declaration into [lo, hi] code point pairs. */
function parseRanges(text) {
  const spans = [];
  for (const part of text.split(',')) {
    const t = part.trim().replace(/^U\+/i, '');
    if (!t) continue;
    const dash = t.indexOf('-');
    if (dash === -1) {
      const cp = parseInt(t, 16);
      if (!Number.isNaN(cp)) spans.push([cp, cp]);
    } else {
      const lo = parseInt(t.slice(0, dash), 16);
      const hi = parseInt(t.slice(dash + 1), 16);
      if (!Number.isNaN(lo) && !Number.isNaN(hi)) spans.push([lo, hi]);
    }
  }
  return spans;
}

/** Pull every @font-face block out of the emitted stylesheets. */
function readFaces() {
  let css = '';
  for (const name of readdirSync(ASTRO)) {
    if (name.endsWith('.css')) css += readFileSync(join(ASTRO, name), 'utf8');
  }
  const faces = [];
  const re = /@font-face\s*\{([^}]*)\}/g;
  let m;
  while ((m = re.exec(css)) !== null) {
    const body = m[1];
    const src = /src:\s*url\(([^)]+)\)/.exec(body);
    const family = /font-family:\s*['"]?([^'";]+)['"]?/.exec(body);
    const weight = /font-weight:\s*([^;]+)/.exec(body);
    const range = /unicode-range:\s*([^;]+)/.exec(body);
    if (!src) continue;
    faces.push({
      file: src[1].split('/').pop(),
      family: family ? family[1].trim() : '?',
      weight: weight ? weight[1].trim() : '?',
      spans: range ? parseRanges(range[1]) : [],
    });
  }
  return faces;
}

const faces = readFaces();
if (faces.length === 0) {
  console.error('FAIL  no @font-face rules found — did the build run?');
  process.exit(1);
}

// A face is part of "slice A" when its filename does not end in -b. Latin faces
// carry no slice letter at all and are always fetched, so they are ignored.
const sliceA = faces.filter((f) => !/-b\.woff2$/.test(f.file));
const sliceB = faces.filter((f) => /-b\.woff2$/.test(f.file));

/** Is this code point covered by any of the given faces' unicode-ranges? */
function covered(cp, list) {
  return list.some((f) => f.spans.some(([lo, hi]) => cp >= lo && cp <= hi));
}

const pages = htmlFiles(DIST);
const offenders = [];
const allMissing = new Set();

for (const page of pages) {
  const raw = readFileSync(page, 'utf8');
  // Strip scripts and styles: neither contains rendered copy, and both are full
  // of characters (inline SVG paths, JSON) that are not user-visible text.
  const text = raw
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&(#\d+|#x[0-9a-f]+|[a-z]+);/gi, (ent) => {
      const named = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };
      if (ent[1] === '#') {
        const cp = ent[2] === 'x' || ent[2] === 'X'
          ? parseInt(ent.slice(3, -1), 16)
          : parseInt(ent.slice(2, -1), 10);
        return Number.isNaN(cp) ? ' ' : String.fromCodePoint(cp);
      }
      return named[ent.slice(1, -1)] ?? ' ';
    });

  let needB = 0;
  for (const ch of text) {
    const cp = ch.codePointAt(0);
    // Only CJK-relevant code points matter; the Latin face has no slices.
    if (cp < 0x3000) continue;
    if (!covered(cp, sliceA) && covered(cp, sliceB)) {
      needB++;
      allMissing.add(ch);
    }
  }

  if (needB > 0) {
    offenders.push(`${relative(DIST, page)}  needs slice B for ${needB} char(s)`);
  }
}

console.log(`faces: ${faces.length}  (slice A: ${sliceA.length}, slice B: ${sliceB.length})`);
console.log(`pages scanned: ${pages.length}`);

if (offenders.length === 0) {
  console.log('\nPASS  slice A covers every built page; slice B is never fetched.');
  process.exit(0);
}

console.error(`\nFAIL  ${offenders.length} page(s) fall outside slice A:`);
for (const line of offenders) console.error('  ' + line);
console.error(`\nmissing characters (${allMissing.size}): ${[...allMissing].join('')}`);
console.error('\nFix: re-run scripts/build-fonts.py, then rebuild. Slice drift almost');
console.error('always means the fonts were generated before the copy was written.');
process.exit(1);
