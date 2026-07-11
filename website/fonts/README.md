# Fonts

Two of the four brand fonts are wired up already and load from a CDN — no action needed:

- **Manrope** (UI text) — Google Fonts, linked in every page `<head>`.
- **Switzer** (body text) — Fontshare, linked in every page `<head>`.

The other two are premium/niche fonts not available on a public CDN. `css/style.css` already
has `@font-face` rules pointing at the filenames below — just drop the files in this folder
(`website/fonts/`) with these exact names and they'll activate automatically, site-wide, no
other changes needed:

| Font | Expected filenames |
|---|---|
| OTJubilee-Platinum (headings) | `OTJubilee-Platinum.woff2`, `.woff`, and/or `.otf` |
| Voyage-Regular (decorative accents) | `Voyage-Regular.woff2`, `.woff`, and/or `.otf` |

You only need to provide one format per font (woff2 is smallest/preferred; the others are
fallbacks). Until these are added, headings fall back to a serif system font (Georgia) and
accents fall back the same way, so the site still looks intentional in the meantime.
