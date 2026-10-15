/**
 * Han–Latin spacing fallback.
 *
 * Chromium implements CSS `text-autospace`, which inserts the 0.25em gap at
 * Han/Latin boundaries natively. Safari and Firefox do not, so for them we wrap
 * Latin/numeric runs in <span class="han-latin">, whose `margin-inline: 0.125em`
 * yields the same 0.25em total gap.
 *
 * Running only when the native property is missing keeps the two mechanisms from
 * stacking and double-spacing in Chromium.
 */

const CJK = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f]/;
const LATIN = /[A-Za-z0-9\u00c0-\u024f]/;

const SKIP = new Set([
  'PRE', 'CODE', 'KBD', 'SAMP', 'SCRIPT', 'STYLE', 'TEXTAREA', 'SVG', 'MATH', 'NOSCRIPT',
]);

function supportsNativeAutospace(): boolean {
  return (
    typeof CSS !== 'undefined' &&
    typeof CSS.supports === 'function' &&
    (CSS.supports('text-autospace', 'normal') || CSS.supports('text-autospace', 'ideograph-alpha'))
  );
}

function wrap(node: Text): void {
  const text = node.nodeValue ?? '';
  if (!text || !CJK.test(text) || !LATIN.test(text)) return;

  const frag = document.createDocumentFragment();
  let buf = '';
  let mode: 'cjk' | 'latin' | null = null;

  const flush = () => {
    if (!buf) return;
    if (mode === 'latin') {
      const span = document.createElement('span');
      span.className = 'han-latin';
      span.textContent = buf;
      frag.appendChild(span);
    } else {
      frag.appendChild(document.createTextNode(buf));
    }
    buf = '';
  };

  for (const ch of text) {
    const m = LATIN.test(ch) ? 'latin' : CJK.test(ch) ? 'cjk' : 'other';
    if (m === 'other') {
      flush();
      frag.appendChild(document.createTextNode(ch));
      mode = null;
      continue;
    }
    if (mode !== null && mode !== m) flush();
    mode = m;
    buf += ch;
  }
  flush();

  node.parentNode?.replaceChild(frag, node);
}

function walk(root: Node): void {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(n) {
      const parent = (n as Text).parentElement;
      if (!parent || SKIP.has(parent.tagName) || parent.closest('[data-no-han]')) {
        return NodeFilter.FILTER_REJECT;
      }
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  const batch: Text[] = [];
  let current = walker.nextNode();
  while (current) {
    batch.push(current as Text);
    current = walker.nextNode();
  }
  for (const node of batch) wrap(node);
}

if (!supportsNativeAutospace()) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => walk(document.body), { once: true });
  } else {
    walk(document.body);
  }
}
