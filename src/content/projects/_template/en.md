---
# ═══════════════════════════════════════════════════════════════════════════
# Project template — copy BOTH files to start a new project (English version)
# ═══════════════════════════════════════════════════════════════════════════
#
# How to use:
#   1. Create src/content/projects/<your-project>/
#   2. Copy this file there as en.md, and zh.md alongside it
#   3. Fill in the fields, write the body
#   4. **Add the detail-page routes by hand** (see below)
#
# The URL comes from the DIRECTORY name:
#   src/content/projects/my-app/zh.md  →  /projects/my-app/
#   src/content/projects/my-app/en.md  →  /en/projects/my-app/
#
# Files starting with `_` are ignored by Astro and never become pages.
#
# ── Detail-page routes (easy to miss) ─────────────────────────────────────
# The project LIST picks up a new project automatically, but its DETAIL page is
# not generated for you:
#   1. Copy src/pages/projects/paste.astro → src/pages/projects/<name>.astro
#   2. Copy src/pages/en/projects/paste.astro → src/pages/en/projects/<name>.astro
#   3. In both new files, change 'paste' to your project slug
# (Articles do not need this — their detail pages are generated.)
#
# ── Fields ────────────────────────────────────────────────────────────────
#   title     required  Project name
#   tagline   required  One-line description shown on the card
#   date      required  Date
#   stack     optional  Tech stack array, rendered as tags
#   status    optional  e.g. "Released" / "In progress"
#   links     optional  Only the keys you provide are rendered (no empty links)
#     repo      source repository
#     release   download page
#     demo      live demo
#   featured  optional  Featured flag (true/false, default false)
#   order     optional  Sort order — LOWER numbers come first (default 99)
# ═══════════════════════════════════════════════════════════════════════════
title: 'Project name'
tagline: 'One line on what this project does'
date: 2026-10-16
stack: ['SwiftUI', 'macOS']
status: 'In progress'
links:
  repo: 'https://github.com/leesun1729/your-repo'
  release: 'https://github.com/leesun1729/your-repo/releases/latest'
  demo: 'https://example.com'
featured: true
order: 2
---

<!-- Body: introduce the project — background, what it solves, tech choices. -->

This project solves … (background: why you built it, who it is for, what the
existing approach gets wrong)

## What it does

Main features:

- Feature one
- Feature two

## Usage

```bash
# install or run
brew install your-app
```

## Stack

What you used and why.

<!-- Before you finish:
     1. add the detail-page routes (see the top of this file)
     2. npm run dev to preview
     3. npm run build && npm run check:fonts -->
