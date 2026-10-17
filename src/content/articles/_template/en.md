---
# ═══════════════════════════════════════════════════════════════════════════
# Article template — copy this file to start a new article (English version)
# ═══════════════════════════════════════════════════════════════════════════
#
# How to use:
#   1. Create src/content/articles/<your-slug>/
#   2. Copy this file there as en.md, and write zh.md next to it
#   3. Fill in the fields below, write the body, then `npm run dev`
#
# The URL comes from the DIRECTORY name, not from this file:
#   src/content/articles/my-post/zh.md  →  /articles/my-post/
#   src/content/articles/my-post/en.md  →  /en/articles/my-post/
#
# Files starting with `_` (like this template) are ignored by Astro and never
# become pages.
#
# ── Fields ────────────────────────────────────────────────────────────────
#   title    required  Article title
#   date     required  Publication date; drives ordering and display
#   tags     optional  Array, any number of labels, e.g. ['c++', 'AI', 'deepseek'].
#                      Use [] or drop the line. Never use ''.
#   category optional  The article's single subject area. Allowed values:
#                        'algorithms'  算法
#                        'diary'       日记
#                        'tools'       工具
#                        'thoughts'    碎碎念
#                      An unknown value does not fail the build, but the
#                      category page will not list it. To add one, edit
#                      CATEGORIES in src/lib/site.ts.
#   summary  optional  One-line summary shown on the list card (clamped to 3 lines)
#   updated  optional  Revision date; shows "rev." in the article's side rail
#   draft    optional  true = excluded from every list and from the build
#
# A wrong field name or type fails the build (strict schema) — which is the
# point: typos surface before publishing rather than silently doing nothing.
#
# Date format: 2026-10-16T20:00:00+08:00 (with timezone), or just 2026-10-16
# ═══════════════════════════════════════════════════════════════════════════
title: 'Article title'
date: 2026-10-16T20:00:00+08:00
tags: ['c++', 'AI', 'deepseek']
category: 'algorithms'
summary: 'One-line summary shown on the list card'
draft: false
---

<!-- Body starts here. The examples below are a reference — delete them. -->

Write the body here. Chinese typography is handled automatically for CJK text:
first-line indents, spacing between CJK and Latin, and line-break rules all
apply without any markup on your part.

## Second-level heading

Body paragraph. Second-level headings appear in the article's side rail.

### Third-level heading

Third-level headings also reach the rail, indented one level.

## Lists

- Bullet one
- Bullet two

1. Numbered one
2. Numbered two

## Code

Inline code uses backticks: `const x = 1`.

Fenced blocks need a language for highlighting. A block with no language
is rendered as plain text (no highlighting):

```cpp
// Comments render italic and grey.
#include <bits/stdc++.h>
using namespace std;

int main() {
    int n;
    cin >> n;
    cout << n * 2 << endl;
    return 0;
}
```

Supported: `cpp` `c` `python` `js` `ts` `bash` `json` `yaml` `html` `css`
`sql` `go` `rust` and more.

## Quotes and tables

> A blockquote.

| Column A | Column B |
|---|---|
| value 1 | value 2 |

## Links and images

An [internal link](/en/articles/) and an [external one](https://example.com).

Images live in `public/` and are referenced by absolute path:

```markdown
![alt text](/images/your-image.png)
```

## Math

Inline: $O(n \log n)$

Block:

$$
T(n) = 2T(n/2) + O(n)
$$
