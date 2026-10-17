---
# ═══════════════════════════════════════════════════════════════════════════
# 项目模版 — 复制这两个文件开始写新项目
# ═══════════════════════════════════════════════════════════════════════════
#
# 怎么用：
#   1. 建目录 src/content/projects/<你的项目名>/
#   2. 把本文件复制成该目录下的 zh.md，再复制一份改成 en.md
#   3. 改下面的字段，写正文
#   4. **还需要手动加详情页路由**（见下方说明）
#
# 网址由目录名决定：
#   src/content/projects/my-app/zh.md  →  /projects/my-app/
#   src/content/projects/my-app/en.md  →  /en/projects/my-app/
#
# 以 `_` 开头的文件会被 Astro 忽略，不会变成页面。
#
# ── 详情页路由（容易漏，必看）─────────────────────────────────────────────
# 项目列表会自动收录新项目，但**详情页不会自动生成**，需要手动加：
#   1. 复制 src/pages/projects/paste.astro → src/pages/projects/<项目名>.astro
#   2. 复制 src/pages/en/projects/paste.astro → src/pages/en/projects/<项目名>.astro
#   3. 打开这两个新文件，把里面的 'paste' 改成你的项目名
# （文章不需要这步——文章的详情页是自动生成的。）
#
# ── 字段说明 ───────────────────────────────────────────────────────────────
#   title     必填  项目名
#   tagline   必填  一句话简介，显示在卡片上
#   date      必填  日期
#   stack     可选  技术栈数组，显示为标签
#   status    可选  如「已发布」「开发中」
#   links     可选  只写你要显示的，没写的不显示（不会出现空链接）
#     repo      源码仓库地址
#     release   下载地址
#     demo      在线演示地址
#   featured  可选  是否精选（true/false，默认 false）
#   order     可选  排序，**数字小的在前**（默认 99）
# ═══════════════════════════════════════════════════════════════════════════
title: '项目名'
tagline: '一句话介绍这个项目做什么'
date: 2026-10-16
stack: ['SwiftUI', 'macOS']
status: '开发中'
links:
  repo: 'https://github.com/leesun1729/your-repo'
  release: 'https://github.com/leesun1729/your-repo/releases/latest'
  demo: 'https://example.com'
featured: true
order: 2
---

<!-- 正文：介绍这个项目。可以写背景、解决什么问题、技术选型、用法等。 -->

这个项目解决的是……（写背景：为什么做它、谁会用、原来的做法有什么问题）

## 它做什么

主要功能：

- 功能一
- 功能二

## 用法

```bash
# 安装或运行的命令
brew install your-app
```

## 技术栈

用了什么、为什么这么选。

<!-- 写完记得：
     1. 加详情页路由（见文件顶部说明）
     2. npm run dev 预览
     3. npm run build && npm run check:fonts -->
