import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Old Hugo URLs verified against the live site's sitemap. GitHub Pages serves
// static files only — there is no server-side catch-all — so every taxonomy and
// pagination path is enumerated explicitly rather than globbed.
const NOTE = '/notes/';
const redirects = {
  '/post/': NOTE,
  '/post/001-hugo博客搭建记/': '/notes/hugo-blog-setup/',
  '/post/002-sublimt-text4/': '/notes/sublime-text-4/',
  '/post/003-c++运算符重载/': '/notes/cpp-operator-overload/',
  '/post/004-scc/': '/notes/scc/',
  '/post/005-珂朵莉树/': '/notes/chtholly-tree/',
  '/post/006-字典树/': '/notes/trie/',

  '/categories/': NOTE,
  '/categories/工程/': NOTE,
  '/categories/算法/': NOTE,
  '/categories/c++/': NOTE,

  '/tags/': NOTE,
  '/tags/优先队列/': NOTE,
  '/tags/博客/': NOTE,
  '/tags/珂朵莉树/': NOTE,
  '/tags/线段树/': NOTE,
  '/tags/运算符重载/': NOTE,
  '/tags/fastolympiccode/': NOTE,
  '/tags/hugo/': NOTE,
  '/tags/scc/': NOTE,
  '/tags/sublimt-text4/': NOTE,
  '/tags/tarjan/': NOTE,
  '/tags/trie/': NOTE,

  '/search/': NOTE,
  '/page/1/': NOTE,
};

export default defineConfig({
  site: 'https://leesun1729.github.io',
  trailingSlash: 'ignore',
  build: { format: 'directory' },
  i18n: {
    defaultLocale: 'zh',
    locales: ['zh', 'en'],
    routing: { prefixDefaultLocale: false },
  },
  markdown: {
    shikiConfig: { theme: 'github-light-default', wrap: true },
  },
  integrations: [
    sitemap({
      i18n: { defaultLocale: 'zh', locales: { zh: 'zh-CN', en: 'en' } },
    }),
  ],
  redirects,
});
