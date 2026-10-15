# 设计系统 — 参考 diygod.cc

本站视觉参考 <https://diygod.cc/>。以下数值均为**在真实浏览器中实测**得出（Chrome 155，
1280×900），不是目测估计。任何实现都必须使用这里的精确值。

## 1. 色彩令牌（灰阶，无强调色）

目标站是**纯中性灰阶 + 纯白底**，没有任何彩色强调色。这是与旧版（暖白 + 印章红 + 网格底纹）
最大的差别。

```css
:root {
  --bg: #ffffff;          /* 页面底色，纯白 */
  --fg: #000000;          /* 标题 */
  --fg-body: #171717;     /* 正文 (neutral-900) */
  --muted: #525252;       /* 摘要 (neutral-600) */
  --meta: #262626;        /* 元信息行 (neutral-800) */
  --line: #d4d4d4;        /* 虚线边框 (neutral-300) */
  --line-strong: #a3a3a3; /* 次级分隔 */
  --code-bg: #f5f5f5;     /* neutral-100 */
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg: #0a0a0a;        /* neutral-950 */
    --fg: #fafafa;
    --fg-body: #f5f5f5;   /* neutral-100 */
    --muted: #a3a3a3;     /* neutral-400 */
    --meta: #d4d4d4;      /* neutral-300 */
    --line: #525252;      /* neutral-600 */
    --line-strong: #737373;
    --code-bg: #171717;
  }
}
```

**删除**旧版这些令牌：`--paper`、`--grid`、`--rule`、`--seal`、`--frame`、`--ink*`。
旧版的 8px 笔记本网格底纹、印章红、macOS 窗口边框**全部移除**。

## 2. 字体

系统字体栈，**零 Web 字体**（与原站一致，也延续本站既有约束）。

```css
--font-sans: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
  'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Noto Sans CJK SC',
  sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji';
--font-mono: ui-monospace, 'SF Mono', SFMono-Regular, Menlo, Consolas, monospace;
```

### 字号（实测值）

| 用途 | 字号 | 字重 | 行高 | 备注 |
|---|---|---|---|---|
| 首页大标题 h1 | `60px` | 700 | `60px` | 桌面；移动端降到 `36px` |
| 区块标题 h2 | `24px` | 700 | `40px` | 「文章」「项目」 |
| 卡片标题 | `20px` | 700 | `1.25` | 移动端 `18px`；`letter-spacing: -0.025em` |
| 卡片摘要 | `14px` | 400 | `1.6` | `--muted`；最多 3 行 |
| 元信息行 | `12px` | 500 | `1.5` | `--meta` |
| 导航链接 | `14px` | 500 | — | 左右内边距 `12px` |
| 正文 prose | `17px` | 400 | `1.85` | **保留**旧版的中文排印行高 |

## 3. 布局

| 项 | 值 |
|---|---|
| 内容容器 | `max-width: 896px`（`max-w-4xl`），水平居中 |
| 容器内边距 | 移动端 `28px`（`px-7`），`lg` 及以上 `0` |
| 头部高度 | `80px` |
| 头部定位 | `absolute`（**非** sticky，与原站一致） |
| 卡片间距 | `28px`（`space-y-7`） |
| 项目网格 | `md` 及以上双列，间距 `28px` |

## 4. 标志性元素：双层虚线边框卡片 ★

**这是全站唯一的大胆设计，必须精确还原。** 它由三层组成：两张「纸」加内容层。
默认状态两纸重合；hover 时向相反方向位移 1px，像两张纸滑开。

```
默认态                    hover 态
┌──────────┐              ┌──────────┐
│┌────────┐│               ╲┌────────┐
││ 内容   ││              ┌─┤ 内容   │
│└────────┘│              │ └────────┘
└──────────┘              └──────────┘╱
```

结构（层序不可颠倒）：

```html
<article class="card" data-post-link="/notes/trie/">
  <span class="card-sheet card-sheet--fill"></span>   <!-- z-20，白底 -->
  <span class="card-sheet card-sheet--frame"></span>  <!-- z-10，虚线框 -->
  <div class="card-body">…</div>                      <!-- z-30 -->
</article>
```

```css
.card {
  position: relative;
  border: 1px dashed transparent;   /* 占位，保证布局稳定 */
  border-radius: 1rem;              /* 16px = rounded-2xl */
  padding: 20px 24px;               /* 移动端 py-5 px-6 */
  cursor: pointer;
}
@media (min-width: 768px) { .card { padding: 28px; } }

.card-sheet {
  position: absolute;
  inset: 0;
  width: 100%; height: 100%;
  border: 1px dashed var(--line);
  border-radius: 1rem;
  transition: transform .3s ease-out;
}
.card-sheet--fill  { z-index: 20; background: var(--bg); }
.card-sheet--frame { z-index: 10; }

.card-body {
  position: relative;
  z-index: 30;
  transition: transform .3s ease-out;
}

.card:hover .card-sheet--fill,
.card:focus-visible .card-sheet--fill,
.card:hover .card-body,
.card:focus-visible .card-body { transform: translate(-1px, -1px); }

.card:hover .card-sheet--frame,
.card:focus-visible .card-sheet--frame { transform: translate(1px, 1px); }
```

`prefers-reduced-motion: reduce` 下取消所有 transform 过渡。

## 5. 箭头图标

卡片标题后跟一个内联 SVG，hover 时从 `-translate-x-1` 移到 `0` 并淡入。

```html
<svg viewBox="0 0 13 15" width="10" height="10" fill="none"
     stroke="currentColor" stroke-width="2.4" stroke-linecap="round"
     stroke-linejoin="round" aria-hidden="true">
  <g transform="translate(0.666667, 2.333333)">
    <polyline points="5.33333333 0 10.8333333 5.5 5.33333333 11" />
    <line x1="10.8333333" y1="5.5" x2="0.833333333" y2="5.16666667" />
  </g>
</svg>
```

## 6. 元信息行

格式：`日期 · 分类 · #标签`，`12px`/500/`--meta`。链接用虚线点状下划线：

```css
.card-meta a { text-decoration: underline; text-decoration-style: dashed; text-underline-offset: 4px; }
```

## 7. 无配图约定（本项目特有）

目标站的视觉冲击力主要来自图片缩略图。本项目**决定不放配图**，因此：

- 卡片为**全宽纯文本**，右侧不放缩略图位
- 靠**双层虚线边框 + 层次分明的字号**建立节奏，不靠图片
- 摘要限制 3 行（`-webkit-line-clamp: 3`），保证卡片高度一致
- **不得**出现空图片占位框或破图图标

## 8. 禁止事项

- 不得使用目标站的任何**代码、图片、字体文件或文案**（其仓库无 LICENSE，源码未公开）。
  仅参考其设计语言，用本项目自己的实现重写。
- 不得引入 Tailwind 或其他 CSS 框架依赖；用原生 CSS 实现上述数值。
- 不得保留旧版的网格底纹、印章红、macOS 窗口组件（`PasteWindow.astro` 应删除）。
- 不得新增任何 Web 字体。
