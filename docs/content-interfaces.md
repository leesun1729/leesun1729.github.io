# Interfaces for content authors

Everything below is owned by this workstream and is **stable**. If you need a
change, ask — two other agents write files against these contracts.

## Content collections

Schemas live in `src/content.config.ts` (Astro 7 glob loader). Do not add fields
without coordinating; the schema is strict and an unknown key fails the build.

### `notes`

- **Files:** `src/content/notes/**/*.md` — one file per note, any depth.
- **Entry id:** the file path relative to `src/content/notes/`, minus `.md`.
  `src/content/notes/trie.md` → id `trie` → URL `/notes/trie/`.
- **Frontmatter:**

  | Field | Type | Required | Default |
  | --- | --- | --- | --- |
  | `title` | string | yes | — |
  | `date` | date | yes | — |
  | `updated` | date | no | — |
  | `tags` | string[] | no | `[]` |
  | `summary` | string | no | — |
  | `draft` | boolean | no | `false` |

- `draft: true` removes the note from every list and from the build entirely.

### `projects`

- **Files:** `src/content/projects/<project>/<locale>.md` — exactly two path
  segments, so the glob `*/*.md` matches.
- **Entry id:** `<project>/<locale>`. `src/content/projects/paste/zh.md` → id
  `paste/zh`.
- **Frontmatter:**

  | Field | Type | Required | Default |
  | --- | --- | --- | --- |
  | `title` | string | yes | — |
  | `tagline` | string | yes | — |
  | `date` | date | yes | — |
  | `stack` | string[] | no | `[]` |
  | `status` | string | no | — |
  | `links` | object | no | `{}` |
  | `featured` | boolean | no | `false` |
  | `order` | number | no | `99` |

- `links` accepts only `repo`, `release`, `demo` — each an optional string.
- `order` sorts the project lists ascending; ties fall back to newest `date`.

## URL scheme

Chinese is unprefixed, English lives under `/en/`.

| Page | zh | en |
| --- | --- | --- |
| home | `/` | `/en/` |
| about | `/about/` | `/en/about/` |
| notes index | `/notes/` | `/en/notes/` |
| note detail | `/notes/<id>/` | — (Chinese only) |
| projects index | `/projects/` | `/en/projects/` |
| project detail | `/projects/<project>/` | `/en/projects/<project>/` |
| ranking | `/ranking/` | `/en/ranking/` |
| links | `/links/` | — |

A new project at `src/content/projects/foo/zh.md` + `foo/en.md` is picked up by
the index pages automatically, but its **detail page needs a route file**:
`src/pages/projects/foo.astro` and `src/pages/en/projects/foo.astro`. The two
Paste pages are the template — they call `getEntry('projects', 'foo/zh')` and
render `<Content />` inside `ProjectLayout`.

## Ranking data file

`src/data/ranking.json` is owned by the analytics workstream; the contract is
documented in `docs/ranking.md` and consumed by `src/lib/ranking.ts`. The page
renders a real empty state when `entries` is `[]`, so the file is safe to leave
empty and safe to regenerate.
