import { existsSync, readdirSync } from 'node:fs';

import type { Lang } from './site';

export interface AnimeEntry {
  /** Stable key for the entry. */
  slug: string;
  /** Show title. Chinese always — these are Chinese productions, and the
      English page keeps them untranslated rather than inventing titles. */
  title: string;
  /** Premiere year of the first season, or the theatrical release year. */
  year: number;
  /** Streaming platform, or 影院 / Cinema for theatrical releases. */
  platform: string;
  /** Theatrical film rather than a series. Marks the meta line. */
  film?: boolean;
  /** Poster filename (without extension) when it differs from the title. */
  poster?: string;
  href: string;
  note: Record<Lang, string>;
}

/* Series link to each platform's search page rather than a specific season
   url: platforms reshuffle cover paths between seasons and a deep link rots,
   while a search entry keeps working. Films link to Baidu Baike, since a
   theatrical release has no streaming home to point at.
   To pin one season, replace its href with that season's play page. */
export const ANIME: AnimeEntry[] = [
  /* --- 仙侠 / 修真 ----------------------------------------------------- */
  {
    slug: 'fanren',
    title: '凡人修仙传',
    year: 2020,
    platform: '哔哩哔哩',
    href: 'https://search.bilibili.com/anime?keyword=%E5%87%A1%E4%BA%BA%E4%BF%AE%E4%BB%99%E4%BC%A0',
    note: {
      zh: '韩立的谨慎与朴素，把修仙写成了一个人的长期主义。',
      en: 'Han Li’s caution turns cultivation into one man’s long game.',
    },
  },
  {
    slug: 'xianyi',
    title: '仙逆',
    year: 2023,
    platform: '腾讯视频',
    href: 'https://v.qq.com/x/search/?q=%E4%BB%99%E9%80%86',
    note: {
      zh: '王林的狠与孤。顺为凡、逆则仙，最贴题的一句。',
      en: 'Compliance makes a mortal; defiance makes an immortal.',
    },
  },
  {
    slug: 'cangyuantu',
    title: '沧元图',
    year: 2023,
    platform: '优酷',
    href: 'https://so.youku.com/search_video/q_%E6%B2%A7%E5%85%83%E5%9B%BE',
    note: {
      zh: '孟川一刀破万法，打斗分镜是近年国漫的天花板。',
      en: 'The best fight choreography in recent Chinese animation.',
    },
  },
  {
    slug: 'wanmei',
    title: '完美世界',
    year: 2021,
    platform: '腾讯视频',
    href: 'https://v.qq.com/x/search/?q=%E5%AE%8C%E7%BE%8E%E4%B8%96%E7%95%8C',
    note: {
      zh: '石昊从大荒里走出来，荒塔一役的调度至今少见。',
      en: 'Shi Hao walks out of the wasteland; the staging is still rare.',
    },
  },
  {
    slug: 'zhuxian',
    title: '诛仙',
    year: 2022,
    platform: '腾讯视频',
    href: 'https://v.qq.com/x/search/?q=%E8%AF%9B%E4%BB%99',
    note: {
      zh: '张小凡与那口烧火棍，青云门的山雾做得很足。',
      en: 'Zhang Xiaofan and his iron staff; the Qingyun mists are gorgeous.',
    },
  },
  {
    slug: 'dazhuzai',
    title: '大主宰',
    year: 2020,
    platform: '爱奇艺',
    href: 'https://www.iqiyi.com/search/?keyword=%E5%A4%A7%E4%B8%BB%E5%AE%B0',
    note: {
      zh: '牧尘从北灵院一路打进大千世界，少年气写得很正。',
      en: 'Mu Chen climbs from Beiling Academy into the Greater World.',
    },
  },
  {
    slug: 'yuanzun',
    title: '元尊',
    year: 2024,
    platform: '腾讯视频',
    href: 'https://v.qq.com/x/search/?q=%E5%85%83%E5%B0%8A',
    note: {
      zh: '周元背负天源诀复国，节奏比原著更紧凑。',
      en: 'Zhou Yuan carries the Tianyuan script; tighter than the novel.',
    },
  },
  {
    slug: 'wudong',
    title: '武动乾坤',
    year: 2019,
    platform: '腾讯视频',
    href: 'https://v.qq.com/x/search/?q=%E6%AD%A6%E5%8A%A8%E4%B9%BE%E5%9D%A4',
    note: {
      zh: '林动的祖符之路，动作戏是真人先演再做的。',
      en: 'Lin Dong’s rune road; the fights were performed live first.',
    },
  },
  {
    slug: 'lianshi',
    title: '练气十万年',
    year: 2023,
    platform: '腾讯视频',
    href: 'https://v.qq.com/x/search/?q=%E7%82%BC%E6%B0%94%E5%8D%81%E4%B8%87%E5%B9%B4',
    note: {
      zh: '徐阳练气十万年出山，扮猪吃虎的极致样本。',
      en: 'Ten thousand years of breath training, played for maximal payoff.',
    },
  },
  {
    slug: 'shixiong',
    title: '师兄啊师兄',
    year: 2023,
    platform: '优酷',
    href: 'https://so.youku.com/search_video/q_%E5%B8%88%E5%85%84%E5%95%8A%E5%B8%88%E5%85%84',
    note: {
      zh: '李长寿把苟字修成大道，笑点和稳妥同时在线。',
      en: 'Playing it safe as a philosophy, and the jokes land.',
    },
  },
  {
    slug: 'yizhan',
    title: '一斩苍穹',
    year: 2026,
    platform: '优酷',
    href: 'https://so.youku.com/search_video/q_%E4%B8%80%E6%96%A9%E8%8B%8D%E7%A9%B9',
    note: {
      zh: '把大逃杀塞进正统修仙，规则感是它最新的地方。',
      en: 'Battle royale inside orthodox cultivation; the rules do the work.',
    },
  },
  {
    slug: 'zhanshen',
    title: '斩神',
    year: 2024,
    platform: '腾讯视频',
    href: 'https://v.qq.com/x/search/?q=%E6%96%A9%E7%A5%9E',
    note: {
      zh: '林七夜在都市里斩神，现代设定与神话题材咬合得紧。',
      en: 'Godslayer in a modern city; the two genres actually mesh.',
    },
  },

  /* --- 玄幻 / 热血 ----------------------------------------------------- */
  {
    slug: 'douluo',
    title: '斗罗大陆',
    year: 2018,
    platform: '腾讯视频',
    href: 'https://v.qq.com/x/search/?q=%E6%96%97%E7%BD%97%E5%A4%A7%E9%99%86',
    note: {
      zh: '唐三与史莱克七怪，年番把国漫的更新节奏定下来了。',
      en: 'The annual series that set the release cadence for the industry.',
    },
  },
  {
    slug: 'doupo',
    title: '斗破苍穹',
    year: 2017,
    platform: '腾讯视频',
    href: 'https://v.qq.com/x/search/?q=%E6%96%97%E7%A0%B4%E8%8B%8D%E7%A9%B9',
    note: {
      zh: '三十年河东。萧炎的逆袭模板，被它写到了极致。',
      en: 'The underdog template, pushed to its limit.',
    },
  },
  {
    slug: 'tunshi',
    title: '吞噬星空',
    year: 2020,
    platform: '腾讯视频',
    href: 'https://v.qq.com/x/search/?q=%E5%90%9E%E5%99%AC%E6%98%9F%E7%A9%BA',
    note: {
      zh: '东方叙事包着硬科幻，罗峰的宇宙尺度一路升级。',
      en: 'Hard sci-fi told with an Eastern sense of scale.',
    },
  },
  {
    slug: 'wugengji',
    title: '武庚纪',
    year: 2016,
    platform: '腾讯视频',
    href: 'https://v.qq.com/x/search/?q=%E6%AD%A6%E5%BA%9A%E7%BA%AA',
    note: {
      zh: '子辛以奴隶之身逆天，玄机的神族美术是独一份。',
      en: 'Defiance against heaven; Xianji’s god-city art is unmatched.',
    },
  },
  {
    slug: 'xingchenbian',
    title: '星辰变',
    year: 2018,
    platform: '腾讯视频',
    href: 'https://v.qq.com/x/search/?q=%E6%98%9F%E8%BE%B0%E5%8F%98',
    note: {
      zh: '秦羽练到无法练，从凡人一路劈开星辰。',
      en: 'Qin Yu trains past the limit and splits the stars.',
    },
  },
  {
    slug: 'xueying',
    title: '雪鹰领主',
    year: 2018,
    platform: '腾讯视频',
    href: 'https://v.qq.com/x/search/?q=%E9%9B%AA%E9%B9%B0%E9%A2%86%E4%B8%BB',
    note: {
      zh: '东伯雪鹰的骑士与血脉，异世界设定做得干净。',
      en: 'Knighthood and bloodline, with a cleanly built other world.',
    },
  },
  {
    slug: 'xixingji',
    title: '西行纪',
    year: 2018,
    platform: '腾讯视频',
    href: 'https://v.qq.com/x/search/?q=%E8%A5%BF%E8%A1%8C%E7%BA%AA',
    note: {
      zh: '取经之后的暗黑重述，唐三藏这一版最硬。',
      en: 'A dark retelling after the scriptures; its Sanzang is the toughest.',
    },
  },

  /* --- 武侠 / 国风 ----------------------------------------------------- */
  {
    slug: 'jianlai',
    title: '剑来',
    year: 2024,
    platform: '腾讯视频',
    href: 'https://v.qq.com/x/cover/mzc0020072zgk61.html',
    note: {
      zh: '陈平安讲道理。国风美学最浓的一版，台词值得逐句看。',
      en: 'The most painterly of the list; every line is worth reading.',
    },
  },
  {
    slug: 'buliangren',
    title: '画江湖之不良人',
    year: 2014,
    platform: '腾讯视频',
    href: 'https://v.qq.com/x/search/?q=%E7%94%BB%E6%B1%9F%E6%B9%96%E4%B9%8B%E4%B8%8D%E8%89%AF%E4%BA%BA',
    note: {
      zh: '李星云在乱世里做选择，若森把武侠拍成了权谋。',
      en: 'Wuxia shot as court intrigue; every choice costs something.',
    },
  },
  {
    slug: 'shaoniangexing',
    title: '少年歌行',
    year: 2018,
    platform: '优酷',
    href: 'https://so.youku.com/search_video/q_%E5%B0%91%E5%B9%B4%E6%AD%8C%E8%A1%8C',
    note: {
      zh: '雷无桀与萧瑟的江湖路，少年气是它的全部主题。',
      en: 'A road through jianghu, and youth is the entire subject.',
    },
  },
  {
    slug: 'tianxing',
    title: '天行九歌',
    year: 2016,
    platform: '优酷',
    href: 'https://so.youku.com/search_video/q_%E5%A4%A9%E8%A1%8C%E4%B9%9D%E6%AD%8C',
    note: {
      zh: '韩非与流沙，秦时前传里最会写棋局的一部。',
      en: 'Han Fei and the Quick Sand; the best chessboard writer of them.',
    },
  },
  {
    slug: 'modao',
    title: '魔道祖师',
    year: 2018,
    platform: '腾讯视频',
    href: 'https://v.qq.com/x/search/?q=%E9%AD%94%E9%81%93%E7%A5%96%E5%B8%88',
    note: {
      zh: '魏无羡与蓝忘机，水墨片头至今被人反复截帧。',
      en: 'The ink-wash opening is still screenshotted years on.',
    },
  },

  /* --- 都市 / 异闻 ----------------------------------------------------- */
  {
    slug: 'yiren',
    title: '一人之下',
    year: 2016,
    platform: '腾讯视频',
    href: 'https://v.qq.com/x/search/?q=%E4%B8%80%E4%BA%BA%E4%B9%8B%E4%B8%8B',
    note: {
      zh: '冯宝宝与张楚岚，把道家术语写进了现代日常。',
      en: 'Taoist vocabulary dropped into the modern everyday, and it sings.',
    },
  },
  {
    slug: 'zhenhunjie',
    title: '镇魂街',
    year: 2016,
    platform: '优酷',
    href: 'https://so.youku.com/search_video/q_%E9%95%87%E9%AD%82%E8%A1%97',
    note: {
      zh: '曹焱兵与许褚，罗刹街的设定又野又浪漫。',
      en: 'Guardians on Luosha Street — feral and romantic at once.',
    },
  },

  /* --- 院线动画电影 ---------------------------------------------------- */
  {
    slug: 'dsheng',
    title: '西游记之大圣归来',
    year: 2015,
    platform: '影院',
    film: true,
    href: 'https://baike.baidu.com/search?word=%E8%A5%BF%E6%B8%B8%E8%AE%B0%E4%B9%8B%E5%A4%A7%E5%9C%A3%E5%BD%92%E6%9D%A5',
    note: {
      zh: '孙悟空的封印被江流儿解开，也是国漫电影的封印。',
      en: 'It unsealed the Monkey King, and unblocked Chinese animated film.',
    },
  },
  {
    slug: 'dayu',
    title: '大鱼海棠',
    year: 2016,
    platform: '影院',
    film: true,
    href: 'https://baike.baidu.com/search?word=%E5%A4%A7%E9%B1%BC%E6%B5%B7%E6%A3%A0',
    note: {
      zh: '椿与鲲，福建土楼进了动画，美术值回票价。',
      en: 'Fujian tulou animated; the art alone pays the ticket.',
    },
  },
  {
    slug: 'nezha1',
    title: '哪吒之魔童降世',
    year: 2019,
    platform: '影院',
    film: true,
    href: 'https://baike.baidu.com/search?word=%E5%93%AA%E5%90%92%E4%B9%8B%E9%AD%94%E7%AB%A5%E9%99%8D%E4%B8%96',
    note: {
      zh: '我命由我不由天。丑萌哪吒把票房天花板顶穿了。',
      en: '“My fate is mine to decide” — and it broke the box-office ceiling.',
    },
  },
  {
    slug: 'changansanwanli',
    title: '长安三万里',
    year: 2023,
    platform: '影院',
    film: true,
    href: 'https://baike.baidu.com/search?word=%E9%95%BF%E5%AE%89%E4%B8%89%E4%B8%87%E9%87%8C',
    note: {
      zh: '高适看李白。唐诗在银幕上被念了一遍，看哭很多人。',
      en: 'Gao Shi watching Li Bai; the Tang poems read aloud on screen.',
    },
  },
  {
    slug: 'yangjian',
    title: '新神榜：杨戬',
    year: 2022,
    platform: '影院',
    film: true,
    href: 'https://baike.baidu.com/search?word=%E6%96%B0%E7%A5%9E%E6%A6%9C%EF%BC%9A%E6%9D%A8%E6%88%AC',
    note: {
      zh: '追光的蒸汽朋克天庭，杨戬的落魄写得有味道。',
      en: 'Light Chaser’s steampunk heaven, with a washed-out Erlang Shen.',
    },
  },
  {
    slug: 'nezha2',
    title: '哪吒之魔童闹海',
    // The image on disk is named 哪吒之魔童脑海; keep them linked here rather
    // than renaming the owner's file.
    poster: '哪吒之魔童脑海',
    year: 2025,
    platform: '影院',
    film: true,
    href: 'https://baike.baidu.com/search?word=%E5%93%AA%E5%90%92%E4%B9%8B%E9%AD%94%E7%AB%A5%E9%97%B9%E6%B5%B7',
    note: {
      zh: '哪吒与敖丙重铸肉身，海战规模是国漫没到过的量级。',
      en: 'The sea battle reaches a scale Chinese animation had never touched.',
    },
  },
  {
    slug: 'langlangshan',
    title: '浪浪山小妖怪',
    year: 2025,
    platform: '影院',
    film: true,
    href: 'https://baike.baidu.com/search?word=%E6%B5%AA%E6%B5%AA%E5%B1%B1%E5%B0%8F%E5%A6%96%E6%80%AA',
    note: {
      zh: '西游缝隙里的小猪妖。打工人照镜子，票房却登顶了。',
      en: 'A nobody demon from the cracks of the classic; a box-office number one.',
    },
  },
];

/* Disk path is under public/, but Astro serves that directory at the site
   root — so the url must NOT carry the public/ prefix. */
const ANIME_DIR = 'public/images/anime';
const ANIME_URL = '/images/anime';

/* Posters are matched by SHOW NAME, not by slug — the images on disk are named
   in Chinese, so adding public/images/anime/剑来.jpg is all it takes to publish
   that entry. Matching is exact-or-contains, which covers the shortened file
   names on disk (不良人 for 画江湖之不良人, 大圣归来 for 西游记之大圣归来).

   Read at build time, so an entry with no image never emits a request that
   would 404 — and the page filters those entries out entirely. */
const posterFiles = existsSync(ANIME_DIR)
  ? readdirSync(ANIME_DIR).filter((f) => /\.(jpe?g|png|webp|avif)$/i.test(f))
  : [];

const norm = (s: string) => s.replace(/\s+/g, '').toLowerCase();

export function animePoster(a: Pick<AnimeEntry, 'title' | 'poster'>): string | undefined {
  const names = [a.poster, a.title].filter(Boolean).map(norm);
  const hit = posterFiles.find((f) => {
    const stem = norm(f.replace(/\.[^.]+$/, ''));
    return names.some((n) => stem === n || stem.includes(n) || n.includes(stem));
  });
  return hit ? `${ANIME_URL}/${encodeURIComponent(hit)}` : undefined;
}
