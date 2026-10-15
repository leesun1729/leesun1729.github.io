# Click ranking (GoatCounter)

The ranking page reads `src/data/ranking.json`, which is regenerated from the
GoatCounter stats API by `scripts/fetch-ranking.mjs` and committed back to
`master` by `.github/workflows/update-ranking.yml`.

This replaces the old `scripts/UpdateClicks.py` pipeline, which scraped a
third-party page-view counter by forging a `Referer` header per sitemap URL.
That approach depended on undocumented third-party behaviour, needed a Hugo
build first just to produce the sitemap, and broke whenever the upstream
endpoint changed.

## Data-file contract

`src/data/ranking.json` is the interface between the pipeline and the page.
The shape is fixed:

```json
{
  "generatedAt": "2026-10-15T00:00:00.000Z",
  "source": "goatcounter",
  "site": "https://leesun1729.goatcounter.com",
  "entries": [
    { "path": "/notes/trie/", "title": "字典树", "count": 123 }
  ]
}
```

| Field | Type | Meaning |
| --- | --- | --- |
| `generatedAt` | string \| null | ISO 8601 timestamp of the run, `null` in the empty state |
| `source` | string | Always `"goatcounter"` |
| `site` | string \| null | GoatCounter origin the data came from, `null` in the empty state |
| `entries` | array | Ranking rows, sorted by `count` descending |
| `entries[].path` | string | Site-internal path, always starts with `/` |
| `entries[].title` | string | Page title from GoatCounter, `""` when the API omits it |
| `entries[].count` | number | Hit count |

A consumer must tolerate `entries: []` and `generatedAt: null`; that is the
state shipped in the repository and the state left behind by every failure
path. Never assume the array is non-empty.

## Fail-soft behaviour

GoatCounter is an external service and is currently unavailable, so the script
treats every failure as non-fatal: it prints a `[ranking]` warning to stderr,
exits `0`, and leaves `src/data/ranking.json` byte-identical. If the file does
not exist at all, it writes the empty state above instead. It never writes
zeros or partial data.

That covers:

- `GOATCOUNTER_SITE` or `GOATCOUNTER_TOKEN` missing or empty
- network failure, DNS failure or timeout (15s per request)
- a non-2xx HTTP response
- a non-JSON response body
- a response with no `hits` or `stats` array
- an entry missing a string `path` or a numeric `count`

The last two are deliberate hard errors: a renamed API field aborts the run
with a message naming the field and the entry index, rather than producing a
plausible-looking ranking of zeros.

## One-time setup

### 1. Register the GoatCounter site

1. Create an account at <https://www.goatcounter.com/signup>.
2. Pick a code; the site lives at `https://<code>.goatcounter.com`. For this
   site the code is `leesun1729`.
3. Add the tracking snippet to the site layout (the page-side integration is
   owned elsewhere; this document only covers the data pipeline).

### 2. Create an API token

1. Sign in to GoatCounter.
2. Open the user menu, then **Settings → API tokens**
   (direct link: `https://<code>.goatcounter.com/settings/tokens`).
3. Create a token with read access to the stats API and copy it. GoatCounter
   shows it once.

### 3. Set the two GitHub secrets

In the repository, go to **Settings → Secrets and variables → Actions → New
repository secret** and add:

| Secret | Value | Example |
| --- | --- | --- |
| `GOATCOUNTER_SITE` | Site origin, no trailing slash | `https://leesun1729.goatcounter.com` |
| `GOATCOUNTER_TOKEN` | The API token from step 2 | `abc123...` |

`GOATCOUNTER_SITE` may be given without a scheme; the script prepends
`https://`. A trailing slash is stripped.

## Running locally

```bash
export GOATCOUNTER_SITE=https://leesun1729.goatcounter.com
export GOATCOUNTER_TOKEN=<your token>
node scripts/fetch-ranking.mjs
```

Preview the result without touching the data file:

```bash
node scripts/fetch-ranking.mjs --dry-run
```

`--dry-run` prints the JSON it would write to stdout and writes nothing.
`--limit=N` overrides the default of 100 rows fetched from the API.

Running with the environment variables unset is safe and is the expected
behaviour in a fork without secrets: it warns and exits `0`.

The script has no dependencies outside the Node standard library and requires
Node 22 or newer (it uses the global `fetch`).

## Scheduled workflow

`.github/workflows/update-ranking.yml` runs on demand (`workflow_dispatch`) and
monthly (`17 3 1 * *`). It checks out `master`, runs the script with the two
secrets, and commits `src/data/ranking.json` back to `master` only when the
file actually changed. It declares `permissions: contents: write` and uses
`actions/checkout@v4` and `actions/setup-node@v4`.

If the secrets are not configured, the job still succeeds: the script warns,
leaves the file alone, and the commit step finds no diff.
