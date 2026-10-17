#!/usr/bin/env python3
"""
Build the self-hosted web fonts for this site.

Why this exists
---------------
The site's Chinese text needs a webfont, but Google Fonts is unreachable from
mainland China (fonts.googleapis.com / fonts.gstatic.com are DNS-poisoned), so
linking a CDN is not an option — the fonts must be served from this origin.

Why slicing
-----------
A full Noto Serif SC weight is ~1.5 MB, and subsetting to the whole GB2312
repertoire still costs ~681 KB per weight (~1.4 MB for regular + bold). That is
worse than the design it replaced.

So each weight is cut into two files and paired with `unicode-range`, the same
technique Google's own CSS uses for CJK:

  * slice A — the characters this site actually renders (~800 today).
              Every page needs it.
  * slice B — the rest of the GB2312 level-1 set (the 3755 most common hanzi).
              A browser downloads it only when a page contains one of those
              characters, so writing a new post can never show a blank glyph,
              yet a reader never pays for characters the page does not use.

Net effect: a typical page fetches ~128 KB per weight instead of 681 KB, and
coverage is still the full common-hanzi working set.

Output goes to public/fonts/ and is committed, so the build itself needs
neither network access nor Python.

Usage:
    python3 scripts/build-fonts.py

Requires: fontTools, plus a `brotli` module importable by it. On macOS the pip
wheel fails code-signing, so `scripts/brotli_shim.py` is copied into the lib
directory as `brotli.py` and shells out to the system `brotli` binary.
"""

from __future__ import annotations

import shutil
import subprocess
import sys
import tempfile
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "public" / "fonts"
CACHE_DIR = Path(tempfile.gettempdir()) / "dsh-font-cache"

CJK_PKG = ("@fontsource/noto-serif-sc", "5.3.1")
LATIN = [
    ("source-serif-4", "5.3.1", "source-serif-4-latin-400-normal.woff2", "source-serif-4-400.woff2"),
    ("source-serif-4", "5.3.1", "source-serif-4-latin-700-normal.woff2", "source-serif-4-700.woff2"),
    ("source-serif-4", "5.3.1", "source-serif-4-latin-400-italic.woff2", "source-serif-4-400-italic.woff2"),
]
WEIGHTS = [400, 700]
CDN = "https://cdn.jsdelivr.net/npm/{pkg}@{ver}/files/{file}"


def site_chars() -> set[str]:
    """Every character the site's own source and content can render.

    Source-only by design: this must give the same answer on a fresh clone as on
    a built tree, so it never reads `dist/`. Scanning build output made slice A
    depend on whether a build had run, which is not a property a generated
    artifact should have.

    Scans all of `src/` rather than a hand-listed set of directories — the list
    is the thing that rots when someone adds a directory.

    NOTE: slice drift is a *staleness* bug, not a scanning bug. The about page
    once needed 25 characters that this function had already collected, but the
    emitted fonts predated the copy by two minutes, so it fetched a 565 KB slice
    B for nothing. Widening the scan fixes nothing; re-running fixes it. The
    durable guard is scripts/check-font-coverage.py, which reads the built pages
    back and fails when any page needs slice B.
    """
    suffixes = {
        ".md", ".mdx", ".astro", ".ts", ".js", ".mjs", ".json",
        ".css", ".html", ".xml", ".txt", ".yml", ".yaml",
    }
    chars: set[str] = set()
    root = ROOT / "src"
    if root.exists():
        for f in root.rglob("*"):
            if f.is_file() and f.suffix in suffixes:
                chars |= set(f.read_text(encoding="utf-8", errors="ignore"))
    return chars


def gb2312_level1() -> list[str]:
    """The 3755 most common hanzi (GB2312 level 1) — the practical writing set."""
    out: list[str] = []
    for hi in range(0xB0, 0xD8):
        for lo in range(0xA1, 0xFF):
            try:
                out.append(bytes([hi, lo]).decode("gb2312"))
            except UnicodeDecodeError:
                continue
    return out


def ascii_and_punct() -> set[str]:
    """Printable ASCII plus the punctuation the site's copy actually uses.

    Note `→` (U+2192): the Paste page writes macOS menu paths as
    `系统设置 → 隐私与安全性`. Noto Serif SC has no arrow glyphs at all, so
    those fall through to the system font — that is intended and fine, but it
    means the arrows must NOT be counted as coverage this build guarantees.
    """
    ascii_chars = set(chr(c) for c in range(0x20, 0x7F))
    punct = set(
        "　、。〃々〈〉《》「」『』【】〔〕〖〗！＂＃＄％＆＇（）＊＋，－．／"
        "０１２３４５６７８９：；＜＝＞？＠［＼］＾＿｀｛｜｝～"
        "·—–…‘’“”※•‣◦×÷±≈≠≤≥∞°′″§¶†‡"
    )
    return ascii_chars | punct


def fetch(url: str, dest: Path) -> Path:
    if dest.exists() and dest.stat().st_size > 0:
        return dest
    dest.parent.mkdir(parents=True, exist_ok=True)
    print(f"  downloading {url.rsplit('/', 1)[-1]}")
    with urllib.request.urlopen(url, timeout=180) as r, open(dest, "wb") as f:
        shutil.copyfileobj(r, f)
    return dest


def to_ttf(src: Path, dst: Path) -> None:
    from fontTools.ttLib import TTFont

    font = TTFont(str(src))
    font.flavor = None
    font.save(str(dst))


def subset(src: Path, dst: Path, chars: str) -> None:
    text_file = CACHE_DIR / f"charset-{abs(hash(chars))}.txt"
    text_file.write_text("".join(sorted(set(chars))), encoding="utf-8")
    subprocess.run(
        [
            sys.executable, "-m", "fontTools.subset", str(src),
            f"--text-file={text_file}",
            f"--output-file={dst}",
            "--flavor=woff2",
            "--layout-features=*",
            "--no-hinting",
            "--desubroutinize",
            "--drop-tables+=DSIG",
        ],
        check=True, capture_output=True,
    )


def unicode_ranges(path: Path) -> str:
    """The CSS `unicode-range` value describing exactly what a font file covers.

    Generated rather than hand-written: slice A alone spans 600+ disjoint
    ranges, and any drift between a file and its declared range silently makes
    the browser fetch the wrong slice or skip a glyph.
    """
    from fontTools.ttLib import TTFont

    cps = sorted(TTFont(str(path)).getBestCmap())
    ranges: list[tuple[int, int]] = []
    start = prev = cps[0]
    for c in cps[1:]:
        if c == prev + 1:
            prev = c
        else:
            ranges.append((start, prev))
            start = prev = c
    ranges.append((start, prev))

    return ",".join(
        f"U+{a:X}" if a == b else f"U+{a:X}-{b:X}" for a, b in ranges
    )


def write_css(entries: list[dict]) -> None:
    """Emit src/styles/fonts.css so the @font-face rules track the build."""
    lines = [
        "/* GENERATED by scripts/build-fonts.py — do not edit by hand.",
        " *",
        " * Each CJK weight ships as two slices paired with `unicode-range`:",
        " *   a = characters this site renders (always fetched)",
        " *   b = rest of the GB2312 level-1 set (fetched only when needed)",
        " * Source Serif 4 covers Latin and is declared first so it wins for",
        " * Latin text and digits, with the CJK face falling through behind it.",
        " */",
        "",
    ]
    for e in entries:
        lines += [
            "@font-face {",
            f"  font-family: '{e['family']}';",
            f"  font-style: {e['style']};",
            f"  font-weight: {e['weight']};",
            "  font-display: swap;",
            f"  src: url('/fonts/{e['file']}') format('woff2');",
            f"  unicode-range: {e['range']};",
            "}",
            "",
        ]
    (ROOT / "src" / "styles" / "fonts.css").write_text("\n".join(lines), encoding="utf-8")
    print(f"  wrote src/styles/fonts.css ({len(entries)} @font-face rules)")


def main() -> int:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    CACHE_DIR.mkdir(parents=True, exist_ok=True)

    site = site_chars() | ascii_and_punct()
    lvl1 = gb2312_level1()
    rest = [c for c in lvl1 if c not in site]
    print(f"slice A (site):   {len(site)} chars")
    print(f"slice B (rest):   {len(rest)} chars")

    entries: list[dict] = []
    total = 0

    for weight in WEIGHTS:
        name = f"noto-serif-sc-chinese-simplified-{weight}-normal.woff2"
        raw = fetch(CDN.format(pkg=CJK_PKG[0], ver=CJK_PKG[1], file=name), CACHE_DIR / name)
        ttf = CACHE_DIR / f"cjk-{weight}.ttf"
        to_ttf(raw, ttf)

        for label, chars in (("a", site), ("b", rest)):
            out = OUT_DIR / f"noto-serif-sc-{weight}-{label}.woff2"
            subset(ttf, out, "".join(chars))
            size = out.stat().st_size
            total += size
            print(f"  {out.name:34} {size/1024:7.1f} KB")
            entries.append({
                "family": "Noto Serif SC",
                "style": "normal",
                "weight": weight,
                "file": out.name,
                "range": unicode_ranges(out),
            })
        ttf.unlink(missing_ok=True)

    for pkg, ver, fname, outname in LATIN:
        raw = fetch(CDN.format(pkg=pkg, ver=ver, file=fname), CACHE_DIR / fname)
        out = OUT_DIR / outname
        shutil.copyfile(raw, out)
        size = out.stat().st_size
        total += size
        print(f"  {out.name:34} {size/1024:7.1f} KB")
        entries.append({
            "family": "Source Serif 4",
            "style": "italic" if "italic" in outname else "normal",
            "weight": 700 if "700" in outname else 400,
            "file": out.name,
            "range": unicode_ranges(out),
        })

    write_css(entries)
    print(f"total on disk: {total/1024:.1f} KB (slice B is lazy-loaded per page)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
