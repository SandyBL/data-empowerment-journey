#!/usr/bin/env python3
"""Builds the self-hosted Font Awesome subset in assets/.

Why this exists
---------------
Every page on this site loaded Font Awesome from cdnjs: a render-blocking
stylesheet on a third-party origin, which costs a DNS lookup, a TCP connection
and a TLS handshake before the first byte of CSS arrives, and then pulls a
150 KB solid webfont for the icons on the page. Real-user p75 LCP was 3062 ms
against a 2500 ms budget, and that chain sat in front of it.

The site uses 106 of Font Awesome's 2000-odd Free icons. This script fetches
the exact release the site already pinned, works out which icons the markup
actually references, and writes a stylesheet and three webfonts containing only
those -- served from this origin, on the connection the page already has open.

This is NOT part of `npm run build`
-----------------------------------
It needs network access to cdnjs and it needs fontTools, which is not a
dependency of this project and should not become one: subsetting a webfont is
something that happens when the icon set changes, not on every deploy. The
output is committed, and `scripts/check-asset-integrity.mjs` no longer has a
third-party Font Awesome URL to pin because there no longer is one.

Run it after adding an icon to the markup:

    pip install fonttools brotli
    python3 scripts/build-font-awesome-subset.py

It reports the icons it found, and fails loudly if the markup references an
icon name Font Awesome Free does not have -- which is the typo this whole
class of bug is usually made of, and which the CDN build failed silently on.
"""

from __future__ import annotations

import base64
import hashlib
import io
import re
import subprocess
import sys
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

RELEASE = "6.5.2"
CDN = f"https://cdnjs.cloudflare.com/ajax/libs/font-awesome/{RELEASE}"

# The release this subset is cut from, hashed, so a rerun against a tampered or
# moved CDN copy stops rather than shipping it.
#
# 6.5.2 rather than the 6.4.0 the site used to load from cdnjs. `fa-x-twitter`
# was added in 6.4.2, and scripts/lib/share.mjs has been asking every article
# page for it since -- the share bar's X button rendered an empty box on 6.4.0
# and nothing in the build noticed, because a CDN stylesheet with a missing
# glyph is indistinguishable from one with it. This script is what noticed.
#
# Deliberately not 6.7.x: that build moved icon definitions from
# `.fa-name:before{content:"\f0c1"}` to a `--fa` custom property resolved by the
# base rule, which the hand-written stylesheet below does not implement. The
# upgrade is a separate piece of work with its own visual check.
STYLESHEET_SRI = "sha384-PPIZEGYM1v8zp5Py7UjFb79S58UeqCL9pYVnVPURKEqvioPROaVAJKKLzvH2rDnI"

# Where the markup lives. Everything that can carry a class attribute or build
# one in JavaScript, which is how `fa-volume-xmark` and `fa-spinner` reach the
# page -- they appear in no HTML file at all.
SOURCE_DIRECTORIES = ["src", "scripts", "assets", "content", "admin", "workspace", "simulators"]
SOURCE_FILES = ["thank-you.html", "404.html"]
SOURCE_SUFFIXES = {".html", ".mjs", ".js", ".md", ".css"}

# Font Awesome's own utility and family classes, which look exactly like icon
# names to a regular expression and are not icons.
NOT_ICONS = {
    "fa-solid", "fa-regular", "fa-brands", "fa-classic", "fa-sharp", "fa-light",
    "fa-thin", "fa-duotone", "fa-fw", "fa-spin", "fa-spin-pulse", "fa-spin-reverse",
    "fa-pulse", "fa-beat", "fa-beat-fade", "fa-bounce", "fa-fade", "fa-flip",
    "fa-shake", "fa-border", "fa-li", "fa-ul", "fa-stack", "fa-stack-1x",
    "fa-stack-2x", "fa-inverse", "fa-rotate-by", "fa-flip-horizontal",
    "fa-flip-vertical", "fa-flip-both", "fa-pull-left", "fa-pull-right",
    "fa-lg", "fa-sm", "fa-xs", "fa-2xs", "fa-xl", "fa-2xl", "fa-1x", "fa-2x",
    "fa-3x", "fa-4x", "fa-5x", "fa-6x", "fa-7x", "fa-8x", "fa-9x", "fa-10x",
    "fa-style-family", "fa-display", "fa-style",
}

# The subset's own output, which would otherwise be scanned as a source and
# keep every icon it already contains alive forever.
OUTPUT_CSS = ROOT / "assets" / "css" / "font-awesome.css"

FONTS = {
    "solid": ("fa-solid-900.woff2", "free"),
    "regular": ("fa-regular-400.woff2", "free"),
    "brands": ("fa-brands-400.woff2", "brands"),
}


def fetch(path: str) -> bytes:
    with urllib.request.urlopen(f"{CDN}/{path}", timeout=60) as response:
        return response.read()


def sri(payload: bytes) -> str:
    return "sha384-" + base64.b64encode(hashlib.sha384(payload).digest()).decode("ascii")


def source_files() -> list[Path]:
    files = [ROOT / name for name in SOURCE_FILES]
    for directory in SOURCE_DIRECTORIES:
        for path in (ROOT / directory).rglob("*"):
            if path.is_file() and path.suffix in SOURCE_SUFFIXES:
                files.append(path)
    return [path for path in files if path.exists() and path != OUTPUT_CSS]


def used_icons() -> set[str]:
    pattern = re.compile(r"\bfa-[a-z0-9]+(?:-[a-z0-9]+)*\b")
    found: set[str] = set()
    for path in source_files():
        found |= set(pattern.findall(path.read_text(encoding="utf-8", errors="ignore")))
    return found - NOT_ICONS


def icon_table(css: str) -> tuple[dict[str, str], set[str]]:
    """Maps every icon name to its codepoint, and reports which are brands.

    Brand names are the ones defined after the Brands @font-face block and
    before the next one; Font Awesome groups them that way and nothing else in
    the file distinguishes a brand from a solid glyph.
    """
    brands_start = css.index('@font-face{font-family:"Font Awesome 6 Brands"')
    brands_end = css.index("@font-face", brands_start + 1)

    table: dict[str, str] = {}
    brands: set[str] = set()
    for match in re.finditer(r"((?:\.fa-[a-z0-9-]+:before,?)+)\{content:\"\\([0-9a-f]+)\"\}", css):
        for selector in match.group(1).split(","):
            name = selector.strip().removeprefix(".").removesuffix(":before")
            table[name] = match.group(2)
            if brands_start < match.start() < brands_end:
                brands.add(name)
    return table, brands


def subset(font: bytes, codepoints: set[str], destination: Path) -> int:
    from fontTools import subset as fontsubset

    options = fontsubset.Options()
    options.flavor = "woff2"
    options.with_zopfli = True
    options.desubroutinize = True
    options.drop_tables += ["FFTM"]
    options.layout_features = []
    options.notdef_outline = True
    options.ignore_missing_glyphs = True

    source = fontsubset.load_font(io.BytesIO(font), options)
    subsetter = fontsubset.Subsetter(options=options)
    subsetter.populate(unicodes=[int(code, 16) for code in codepoints])
    subsetter.subset(source)
    fontsubset.save_font(source, destination, options)
    source.close()
    return destination.stat().st_size


def main() -> int:
    print(f"font awesome {RELEASE}: fetching from cdnjs")
    css_bytes = fetch("css/all.min.css")
    if sri(css_bytes) != STYLESHEET_SRI:
        print(f"  stylesheet hash is {sri(css_bytes)}, expected {STYLESHEET_SRI}", file=sys.stderr)
        return 1
    css = css_bytes.decode("utf-8")

    table, brand_names = icon_table(css)
    wanted = used_icons()

    unknown = sorted(name for name in wanted if name not in table)
    if unknown:
        print("\nthese icon names are not in Font Awesome Free:", file=sys.stderr)
        for name in unknown:
            print(f"  {name}", file=sys.stderr)
            for path in source_files():
                if name in path.read_text(encoding="utf-8", errors="ignore"):
                    print(f"    {path.relative_to(ROOT)}", file=sys.stderr)
        return 1

    brands = {name for name in wanted if name in brand_names}
    free = wanted - brands
    print(f"  {len(wanted)} icons used: {len(free)} free, {len(brands)} brands")

    free_codes = {table[name] for name in free}
    brand_codes = {table[name] for name in brands}

    written = {}
    for family, (filename, kind) in FONTS.items():
        codes = brand_codes if kind == "brands" else free_codes
        destination = ROOT / "assets" / "fonts" / filename.replace(".woff2", "-subset.woff2")
        size = subset(fetch(f"webfonts/{filename}"), codes, destination)
        written[family] = destination
        print(f"  {destination.relative_to(ROOT)}: {size / 1024:.1f} KB")

    rules = "".join(
        f'.{name}:before{{content:"\\{table[name]}"}}\n'
        for name in sorted(wanted)
    )

    OUTPUT_CSS.write_text(
        f"""/*
 * Font Awesome Free {RELEASE} -- subset, self-hosted.
 *
 * Generated by scripts/build-font-awesome-subset.py. Do not edit by hand: add
 * the icon to the markup and rerun the script, which is also the only thing
 * that puts the glyph into the webfonts next to this file.
 *
 * {len(wanted)} of the release's icons, in place of all of them, and served from
 * this origin in place of cdnjs -- see the script's header for why.
 *
 * Font Awesome Free by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license/free
 *   Icons: CC BY 4.0 - Fonts: SIL OFL 1.1 - Code: MIT
 * Copyright 2023 Fonticons, Inc.
 */

@font-face {{
  font-family: "Font Awesome 6 Free";
  font-style: normal;
  font-weight: 900;
  font-display: block;
  src: url(/assets/fonts/fa-solid-900-subset.woff2) format("woff2");
}}

@font-face {{
  font-family: "Font Awesome 6 Free";
  font-style: normal;
  font-weight: 400;
  font-display: block;
  src: url(/assets/fonts/fa-regular-400-subset.woff2) format("woff2");
}}

@font-face {{
  font-family: "Font Awesome 6 Brands";
  font-style: normal;
  font-weight: 400;
  font-display: block;
  src: url(/assets/fonts/fa-brands-400-subset.woff2) format("woff2");
}}

.fa,
.fa-brands,
.fa-regular,
.fa-solid,
.fab,
.far,
.fas {{
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  display: var(--fa-display, inline-block);
  font-style: normal;
  font-variant: normal;
  line-height: 1;
  text-rendering: auto;
}}

.fa,
.fa-regular,
.fa-solid,
.far,
.fas {{
  font-family: "Font Awesome 6 Free";
}}

.fa,
.fa-solid,
.fas {{
  font-weight: 900;
}}

.fa-regular,
.far {{
  font-weight: 400;
}}

.fa-brands,
.fab {{
  font-family: "Font Awesome 6 Brands";
  font-weight: 400;
}}

/* The two modifier classes the markup uses. The rest of Font Awesome's
   utilities -- sizing, stacking, rotation, the other animations -- are not
   referenced anywhere here, and Tailwind's text-* classes do the sizing. */
.fa-fw {{
  width: 1.25em;
  text-align: center;
}}

.fa-spin {{
  animation-name: fa-spin;
  animation-delay: var(--fa-animation-delay, 0s);
  animation-direction: var(--fa-animation-direction, normal);
  animation-duration: var(--fa-animation-duration, 2s);
  animation-iteration-count: var(--fa-animation-iteration-count, infinite);
  animation-timing-function: var(--fa-animation-timing, linear);
}}

@media (prefers-reduced-motion: reduce) {{
  .fa-spin {{
    animation-delay: -1ms;
    animation-duration: 1ms;
    animation-iteration-count: 1;
  }}
}}

@keyframes fa-spin {{
  0% {{
    transform: rotate(0deg);
  }}
  to {{
    transform: rotate(1turn);
  }}
}}

{rules}""",
        encoding="utf-8",
    )
    print(f"  {OUTPUT_CSS.relative_to(ROOT)}: {OUTPUT_CSS.stat().st_size / 1024:.1f} KB")
    return 0


if __name__ == "__main__":
    sys.exit(main())
