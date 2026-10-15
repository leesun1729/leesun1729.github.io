export type Lang = 'zh' | 'en';

export const SITE = {
  url: 'https://leesun1729.github.io',
  name: { zh: '自留地', en: 'Kept Plot' } as Record<Lang, string>,
  description: {
    zh: 'leesun 的自留地：算法笔记、一个叫 Paste 的 macOS 应用，以及零碎的记录。',
    en: 'Notes on algorithms, a macOS app called Paste, and assorted writing.',
  } as Record<Lang, string>,
  author: 'leesun',
  email: 'leesun1729@gmail.com',
  github: 'https://github.com/leesun1729',
  startYear: 2024,
};

/** BCP-47 tag written into <html lang> and hreflang alternates. */
export const localeTag: Record<Lang, string> = { zh: 'zh-CN', en: 'en' };

export const NAV: Record<Lang, { href: string; label: string }[]> = {
  zh: [
    { href: '/notes/', label: '笔记' },
    { href: '/projects/', label: '项目' },
    { href: '/ranking/', label: '榜单' },
    { href: '/about/', label: '关于' },
    { href: '/links/', label: '友链' },
  ],
  en: [
    { href: '/en/notes/', label: 'Notes' },
    { href: '/en/projects/', label: 'Projects' },
    { href: '/en/ranking/', label: 'Ranking' },
    { href: '/en/about/', label: 'About' },
  ],
};

const ZH_TO_EN: Record<string, string> = {
  '/': '/en/',
  '/about/': '/en/about/',
  '/notes/': '/en/notes/',
  '/projects/': '/en/projects/',
  '/projects/paste/': '/en/projects/paste/',
  '/ranking/': '/en/ranking/',
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
 * The equivalent page in the other locale. Note detail pages exist in Chinese
 * only, so every `/notes/<slug>/` points at the English notes index; pages with
 * no translation at all (`/links/`) fall back to the other locale's home.
 */
export function counterpart(pathname: string): Counterpart {
  const p = pathname.endsWith('/') ? pathname : `${pathname}/`;

  if (p === '/en/' || p.startsWith('/en/')) {
    const back = EN_TO_ZH[`/${p.slice(4)}`];
    return { lang: 'zh', href: back ?? '/', exact: Boolean(back) };
  }

  const fwd = ZH_TO_EN[p] ?? (p.startsWith('/notes/') && p !== '/notes/' ? '/en/notes/' : undefined);
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
