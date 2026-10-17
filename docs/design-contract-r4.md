# R4 设计合同（冻结版）

本文件是第 4 轮「在 diygod.cc 复刻基础上做设计精修」的**唯一接口约定**。
三个执行单元并行改文件，任何人不得偏离本文件；偏离即返工。

## 0. 硬边界（违反即失败）

- **纯灰阶**。不得引入任何彩色（含 accent、渐变、彩色阴影）。`--line` / `--line-strong` 永远不作文字色。
- **不加字体**。继续用 `--font-serif`（Source Serif 4 + Noto Serif SC）与 `--font-mono`。不得新增 `@font-face`，不得改 `src/styles/fonts.css`、`public/fonts/**`。
- **不加图片**。不得引入位图、不得用 `<img>` 装饰。
- **不加评论系统**。
- **不新增中文字符**。字体切片 A（873 字）是必载集，切片 B 按需加载。任何新增汉字都会让该页多拉 ~565 KB。
  确有必要新增时，**必须在回报里逐字列出**，由调度者重建字体切片。
- **不运行构建**。`dist/` 与 `.astro/` 由调度者独占，并行构建会互相污染。执行单元只改源码 + 静态自检。
- **不改内容**。`src/content/**`、`src/data/**`、`src/lib/site.ts` 的文案与结构不动。
- **不碰 `docs/**`**（本文件除外，只读）。

## 1. 文件所有权（互斥）

| 单元 | 独占文件 |
|---|---|
| **W1 设计基础层** | `src/styles/global.css` |
| **W2 站点外壳** | `src/components/Header.astro`、`Footer.astro`、`ThemeToggle.astro`、`src/layouts/BaseLayout.astro` |
| **W3 页面层** | `src/pages/**`、`src/layouts/NoteLayout.astro`、`ProjectLayout.astro`、`src/components/PostCard.astro`、`Toc.astro`、`ArrowIcon.astro` |

越界写别人的文件 = 失败。

## 2. 令牌契约（W1 定义，W2/W3 只消费）

保留现有名字（已被 `NoteLayout`/`ProjectLayout`/`about` 引用），只做精修：

```css
/* 色彩：不变 */
--bg --fg --fg-body --muted --meta --line --line-strong --code-bg

/* 字体：不变 */
--font-serif --font-mono

/* 版式 */
--header-h: 80px;
--container: 896px;
--gutter: 28px;
--card-gap: 28px;
--measure: 40em;
--rail: 9rem;
--gap: 2rem;

/* 字阶：新增 --step-3 为 clamp，其余保持数值 */
--step--2: 0.6875rem;   /* 11px 微标签 */
--step--1: 0.75rem;     /* 12px meta */
--step-0:  1.0625rem;   /* 17px 正文 */
--step-1:  1.3125rem;   /* 21px lede */
--step-2:  1.5rem;      /* 24px h2/h3 带 */
--step-3:  clamp(2.25rem, 1.5rem + 3vw, 3.75rem); /* h1：36 → 60px，单一连续坡道 */
```

**h1 必须只有一条坡道**：删掉 `@media (min-width: 768px)` 里的 h1 覆盖。
现状缺陷：`/` 的 h1 是 60px，`/notes/` 的 h1 是 48px，同一层级的标题宽度不一致 —— 本轮修掉。

## 3. 类契约

### 3.1 卡片外壳（W1 定义在 global.css；W3 从 PostCard.astro 删除同名块）

```css
.card            /* 定位上下文 + 内边距 + 圆角 + 光标；border:1px dashed transparent 占位 */
.card-sheet      /* 绝对定位 inset:0，1px dashed var(--line)，圆角，transform 过渡 */
.card-sheet--fill  /* z-index:20 + background:var(--bg) */
.card-sheet--frame /* z-index:10 */
.card-body       /* z-index:30 + 同一 transform 过渡 */
```
悬停/聚焦：`--fill` 与 `.card-body` 位移 `translate(-1px,-1px)`，`--frame` 位移 `translate(1px,1px)`。
触发条件保持三条：`.card:hover`、`.card:focus-visible`、`.card:has(.card-link:focus-visible)`。
`prefers-reduced-motion: reduce` 下过渡置 `none`。

**W3 只保留**：`.card-title`、`.card-link`、`.card-summary`、`.card-meta`、`.card-sep` 与焦点环。

### 3.2 页面工具类（W1 定义在 global.css；W3 删除各页同名副本）

```css
.page-head      /* 页头容器：padding-block 与节奏 */
.page-head h1   /* 不再设 font-size —— 继承全局 h1 坡道 */
.lede           /* 导语：max-width:34em, font-size:var(--step-1), color:var(--muted), text-wrap:pretty */
.page-meta      /* mono, var(--step--1), color:var(--meta), 数字 tabular-nums */
.empty          /* 空状态：虚线框 + var(--muted)，与卡片语言一致 */
.band-heading   /* 首页分区标题 */
.hero           /* 首页 hero 容器 */
.hero-title     /* 不再设 font-size —— 继承全局 h1 坡道 */
.hero-tagline   /* hero 副题 */
.more           /* 「全部 N 篇」链接行 */
.link-dashed    /* 全站唯一的虚线内联链接：underline dashed, offset 4px, thickness 1px → hover 2px */
```

`.page-head` / `.lede` / `.page-meta` / `.empty` 目前**在 10 个页面里各写了一遍**（值还略有出入）。
W3 负责删除副本；W1 负责给出唯一定义。Astro 局部样式带 `[data-astro-cid-*]`，比全局类**优先级更高**，
所以「忘了删」只会退回旧外观、不会崩 —— 但那就是没完成。

### 3.3 内联链接（全站统一）

所有虚线内联链接统一走 `.link-dashed`：`text-decoration: underline; text-decoration-style: dashed;
text-underline-offset: 4px; text-decoration-thickness: 1px;`，hover 时 `text-decoration-thickness: 2px`。
现状是 `.card-meta a`、`.foot-line a`、`.project-links a`、`.tags a` 各写一套，值不统一。

## 4. 可测量的精修项（验收就看这些）

1. **光学字距**：h1 `-0.03em`、h2 `-0.02em`、h3 `-0.015em`、正文 `0`。
2. **等宽数字**：`.page-meta`、`.rail`、`.meta`、`.card-meta` 加 `font-variant-numeric: tabular-nums`，日期与计数对齐。
3. **中文排版不回退**：正文仍 `17px / 1.85`、`.prose > p` 首行缩进 `2em`、`line-break: strict`、`text-spacing-trim: space-first`、`text-autospace: normal`。
4. **焦点环唯一**：`2px solid var(--fg)`、`outline-offset: 3px`、圆角 `2px`。
5. **无横向溢出**：390px 视口下 `document.scrollWidth <= 390`，两种主题都要过。
6. **对比度不降**：任何文字色对背景 ≥ 4.5:1（当前最低 5.05:1，不得跌破）。
7. **动效可关**：`prefers-reduced-motion: reduce` 下所有 transform/transition 归零。

## 5. 回报格式（每个单元必须给）

1. 改了哪些文件（逐文件列，含增删行数）。
2. 每条精修项「做了什么 / 在哪个文件哪一行」。
3. **新增汉字清单**（没有就写「无」）。
4. 静态自检结果：`grep` 证明自己删掉的重复定义确实没了、引用的类名都在契约里。
5. 未完成项与原因。

禁止用「已完成」「优化了排版」这类无证据陈述。给行号、给 grep 输出。
