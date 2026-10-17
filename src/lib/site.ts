export type Lang = 'zh' | 'en';

export const SITE = {
  url: 'https://leesun1729.github.io',
  /* The site name is a proper noun, so it is NOT translated — both locales
     print "Leesun". It used to be 自留地 / Kept Plot. */
  name: { zh: 'Leesun', en: 'Leesun' } as Record<Lang, string>,
  description: {
    zh: '一些零碎的记录......',
    en: 'Some Fragmentary Records...',
  } as Record<Lang, string>,
  author: 'Leesun',
  email: 'leesun1729@gmail.com',
  github: 'https://github.com/leesun1729',
  startYear: 2024,
};

/** BCP-47 tag written into <html lang> and hreflang alternates. */
export const localeTag: Record<Lang, string> = { zh: 'zh-CN', en: 'en' };

export const NAV: Record<Lang, { href: string; label: string }[]> = {
  zh: [
    { href: '/', label: '首页' },
    { href: '/articles/', label: '文章' },
    { href: '/projects/', label: '项目' },
    { href: '/ranking/', label: '榜单' },
    { href: '/about/', label: '关于' },
    { href: '/links/', label: '友链' },
  ],
  en: [
    { href: '/en/', label: 'Home' },
    { href: '/en/articles/', label: 'Articles' },
    { href: '/en/projects/', label: 'Projects' },
    { href: '/en/ranking/', label: 'Ranking' },
    { href: '/en/about/', label: 'About' },
  ],
};

/**
 * Article categories.
 *
 * The frontmatter stores a stable ASCII key (`category: 'algorithms'`) rather
 * than a display string, because one article directory holds both `zh.md` and
 * `en.md` — storing 算法 there would print Chinese on the English site. The
 * label is resolved per locale here, the same way NAV works.
 *
 * Adding a category: add the key to this object and start using it in
 * frontmatter. Order here is the order they appear in the filter bar.
 */
export const CATEGORIES = [
  { key: 'algorithms', zh: '算法', en: 'Algorithms' },
  { key: 'diary', zh: '日记', en: 'Diary' },
  { key: 'tools', zh: '工具', en: 'Tools' },
  { key: 'thoughts', zh: '碎碎念', en: 'Musings' },
] as const;

export type CategoryKey = (typeof CATEGORIES)[number]['key'];

/** Human label for a category key; falls back to the raw key if unknown. */
export function categoryLabel(key: string | undefined, lang: Lang): string {
  if (!key) return lang === 'zh' ? '未分类' : 'Uncategorised';
  const found = CATEGORIES.find((c) => c.key === key);
  return found ? found[lang] : key;
}

/* Fixed pages that exist at a different path in each locale. Everything with a
   predictable prefix (/articles/<slug>/, /articles/category/<key>/, /tags/<tag>/)
   is handled by the prefix rules in counterpart() instead of being enumerated
   here — enumerating them is what made the switch fall back to the home page. */
const ZH_TO_EN: Record<string, string> = {
  '/': '/en/',
  '/about/': '/en/about/',
  '/articles/': '/en/articles/',
  '/projects/': '/en/projects/',
  '/projects/paste/': '/en/projects/paste/',
  '/ranking/': '/en/ranking/',
  // /links/ has no English page, so it keeps falling back to /en/ — but the
  // rule lives here so the intent is visible rather than implicit.
};

const EN_TO_ZH: Record<string, string> = Object.fromEntries(
  Object.entries(ZH_TO_EN).map(([zh, en]) => [en, zh]),
);

export interface Counterpart {
  lang: Lang;
  href: string;
  /** True when the target is a real translation, false when we fell back to the locale home. */
  exact: boolean;
}

/**
 * The equivalent page in the other locale.
 *
 * Articles are bilingual, so a detail page maps to its sibling one-for-one:
 * `/articles/<slug>/` ↔ `/en/articles/<slug>/`. Both directions are handled by
 * the same prefix swap, which is why they are not in ZH_TO_EN — the map only
 * holds the fixed pages. `/links/` has no translation at all, so it falls back
 * to the other locale's home with `exact: false`.
 */
export function counterpart(pathname: string): Counterpart {
  const p = pathname.endsWith('/') ? pathname : `${pathname}/`;

  if (p === '/en/' || p.startsWith('/en/')) {
    /* Look up the FULL path first: EN_TO_ZH is keyed by the English url
       (/en/about/), not by the stripped remainder. Using only the remainder
       here meant every fixed page — about, projects, ranking — silently fell
       back to the home page. `rest` is the Chinese twin, used by the prefix
       rules below. */
    const rest = `/${p.slice(4)}`;
    const back =
      EN_TO_ZH[p] ??
      (rest.startsWith('/articles/') || rest.startsWith('/tags/') ? rest : undefined);
    return { lang: 'zh', href: back ?? '/', exact: Boolean(back) };
  }

  const fwd =
    ZH_TO_EN[p] ??
    (p.startsWith('/articles/') || p.startsWith('/tags/') ? `/en${p}` : undefined);
  return { lang: 'en', href: fwd ?? '/en/', exact: Boolean(fwd) };
}

export function formatDate(date: Date, lang: Lang): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return lang === 'zh' ? `${y} 年 ${m} 月 ${d} 日` : `${y}-${m}-${d}`;
}

export function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Tags carried over from the old site include empty strings; drop them. */
export function cleanTags(tags: string[] | undefined): string[] {
  return (tags ?? []).map((t) => t.trim()).filter(Boolean);
}
