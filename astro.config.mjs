import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import expressiveCode from 'astro-expressive-code';
import sharp from 'sharp';
import { readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

// Old Hugo URLs verified against the live site's sitemap. GitHub Pages serves
// static files only — there is no server-side catch-all — so every taxonomy and
// pagination path is enumerated explicitly rather than globbed.
const ARTICLES = '/articles/';
const redirects = {
  '/post/': ARTICLES,
  '/post/001-hugo博客搭建记/': '/articles/hugo-blog-setup/',
  '/post/002-sublimt-text4/': '/articles/sublime-text-4/',
  '/post/003-c++运算符重载/': '/articles/cpp-operator-overload/',
  '/post/004-scc/': '/articles/scc/',
  '/post/005-珂朵莉树/': '/articles/chtholly-tree/',
  '/post/006-字典树/': '/articles/trie/',

  '/categories/': ARTICLES,
  '/categories/工程/': ARTICLES,
  '/categories/算法/': ARTICLES,
  '/categories/c++/': ARTICLES,

  // Only the bare /tags/ index redirects now. The per-tag redirects that used
  // to live here (hugo, 珂朵莉树, trie, …) shadowed the real tag pages added
  // later: a 301 beats a generated page, so those URLs never reached
  // /tags/<tag>/ and 6 of 11 Chinese tags were unreachable.
  '/tags/': ARTICLES,

  '/search/': ARTICLES,
  '/page/1/': ARTICLES,

  // The collection shipped as `/notes/` before the rename, so those URLs are
  // already indexed and linked from outside. They are listed one by one for the
  // same reason as the taxonomy paths above: no server-side wildcard exists.
  '/notes/': ARTICLES,
  '/notes/hugo-blog-setup/': '/articles/hugo-blog-setup/',
  '/notes/sublime-text-4/': '/articles/sublime-text-4/',
  '/notes/cpp-operator-overload/': '/articles/cpp-operator-overload/',
  '/notes/scc/': '/articles/scc/',
  '/notes/chtholly-tree/': '/articles/chtholly-tree/',
  '/notes/trie/': '/articles/trie/',
  '/en/notes/': '/en/articles/',
};

/* Anime posters are dropped into public/ at print resolution (1320px wide,
   ~600KB each, 8MB for the set) while the tile renders 215px. Astro copies
   public/ verbatim, so this integration shrinks the BUILT copies afterwards.
   The source files on disk are never touched — adding a poster stays a
   drop-a-file operation with no re-encoding step. */
function animePosterOptimizer() {
  return {
    name: 'anime-poster-optimizer',
    hooks: {
      'astro:build:done': async ({ dir }) => {
        const out = join(dir.pathname, 'images', 'anime');
        let files;
        try {
          files = readdirSync(out).filter((f) => /\.jpe?g$/i.test(f));
        } catch {
          return; // no posters on disk — nothing to optimise
        }
        let before = 0;
        let after = 0;
        for (const f of files) {
          const path = join(out, f);
          before += statSync(path).size;
          const buf = await sharp(path)
            .resize({ width: 560, withoutEnlargement: true })
            .jpeg({ quality: 78, progressive: true })
            .toBuffer();
          writeFileSync(path, buf);
          after += buf.length;
        }
        console.log(
          `  [anime posters] ${files.length} images ${(before / 1048576).toFixed(1)}MB -> ${(after / 1048576).toFixed(1)}MB`,
        );
      },
    },
  };
}

export default defineConfig({
  site: 'https://leesun1729.github.io',
  trailingSlash: 'ignore',
  build: { format: 'directory' },
  i18n: {
    defaultLocale: 'zh',
    locales: ['zh', 'en'],
    routing: { prefixDefaultLocale: false },
  },
  integrations: [
    animePosterOptimizer(),
    expressiveCode({
      // A maintained code-rendering module replaces the hand-rolled Shiki
      // setup: it brings the frame (title bar), line numbers, the copy button
      // and collapsible sections that the old hand-written CSS had to fake.
      // Coloured syntax highlighting, light/dark pair. The earlier grayscale
      // pair (src/lib/shiki-grayscale.mjs) is gone: the site's chrome stays
      // neutral, but code reads far better with real token colours.
      // `themeCssSelector` still points the module at this site's own
      // data-theme attribute — see below.
      themes: ['github-light', 'github-dark'],
      // Follow the site's own three-state theme switch. The module defaults to
      // selecting themes via `[data-theme='<theme name>']`, but this site writes
      // data-theme="light" | "dark" | "system" on <html>, so the default
      // selector never matched and the dark token set stayed active in light
      // mode (dark text on a light ground). Pointing it at the site's attribute
      // — and at the media query for the 'system' state — is the whole fix.
      themeCssSelector: (theme) => `[data-theme='${theme.type}']`,
      useDarkModeMediaQuery: true,
      // Inline the module's CSS rather than emitting an external stylesheet.
      // `astro dev` writes a <link href="/_astro/ec.<hash>.css"> but never
      // serves that route (the asset is only emitted during build), so the
      // request 404s and every code block loses its layout and token colours
      // while developing. Inlining removes the dev-only failure entirely.
      emitExternalStylesheet: false,
      defaultProps: {
        wrap: false,
        // No outer window. The frame (title bar + border + rounded shell) is
        // what made a block read as a "screenshot of an editor" rather than as
        // code in the page; the block is now just the code on a tinted ground,
        // separated from the prose by the ground itself.
        frame: 'none',
      },
      styleOverrides: {
        // No border and no radius: with `frame: 'none'` there is no window to
        // outline, so a border would just be a stray rectangle around the code.
        borderRadius: '0',
        borderWidth: '0',
        borderColor: 'transparent',
        codeBackground: 'var(--code-bg)',
        frames: {
          editorBackground: 'var(--code-bg)',
          terminalBackground: 'var(--code-bg)',
          frameBoxShadowCssValue: 'none',
          tooltipSuccessBackground: 'var(--fg)',
          tooltipSuccessForeground: 'var(--bg)',
          inlineButtonBackground: 'transparent',
          inlineButtonForeground: 'var(--muted)',
          inlineButtonBorder: 'var(--line)',
        },
        codeFontFamily: 'var(--font-mono)',
        codeFontSize: '0.8125rem',
        codeLineHeight: '1.75',
        uiFontFamily: 'var(--font-mono)',
      },
    }),
    sitemap({
      i18n: { defaultLocale: 'zh', locales: { zh: 'zh-CN', en: 'en' } },
    }),
  ],
  redirects,
});

