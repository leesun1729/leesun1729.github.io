# 自留地

个人站点：算法笔记、项目，以及一些随手写下的东西。
线上地址 <https://leesun1729.github.io/>

## 技术栈

[Astro](https://astro.build/) 静态站点，无客户端框架、无 Web 字体。

## 本地开发

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # 输出到 dist/
npm run preview  # 预览构建结果
```

## 目录结构

```
src/
  content/notes/        笔记（Markdown）
  content/projects/     项目介绍，按 <项目名>/<语言>.md 组织
  content.config.ts     内容集合 schema
  layouts/              页面布局
  pages/                路由（中文为默认，英文在 /en/ 下）
  styles/global.css     设计令牌与排版
public/                 静态资源，原样拷贝进 dist/
scripts/fetch-ranking.mjs   从 GoatCounter 拉取榜单数据
docs/                   内容契约与运维说明
```

## 写一篇笔记

在 `src/content/notes/` 新建 Markdown 文件，文件名即 URL（`trie.md` → `/notes/trie/`）：

```yaml
---
title: '字典树'
date: 2024-01-20T22:08:54+08:00
tags: ['Trie']
summary: '一句话摘要'
draft: false
---
```

`title` 与 `date` 必填，其余可选。字段定义见 `src/content.config.ts`，未知字段会导致构建失败。

## 新增一个项目

1. 建 `src/content/projects/<项目名>/zh.md` 与 `en.md`（字段见 `docs/content-interfaces.md`）
2. 复制 `src/pages/projects/paste.astro` 为 `src/pages/projects/<项目名>.astro`，英文版同理

项目列表会自动收录，但**详情页需要手动加路由**。

## 榜单数据

`/ranking/` 由 GoatCounter 提供数据，见 `docs/ranking.md`。
未配置 `GOATCOUNTER_SITE` / `GOATCOUNTER_TOKEN` 时脚本不会报错，页面显示空状态。

## 部署

推送到 `master` 即触发 `.github/workflows/deploy.yml`，构建后发布到 GitHub Pages。
旧 Hugo 版本的源码保存在 `archive` 分支。
