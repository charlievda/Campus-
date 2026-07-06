# The Obsidian Assembly — Recreation

A visual recreation of obsidianassembly.com, built from a set of reference screenshots (the live site could not be crawled directly — see Notes below). Plain HTML/CSS/JS, no build step, no dependencies.

## Run locally

Any static file server works:

```bash
cd obsidian-assembly
python3 -m http.server 8000
```

Then open http://localhost:8000

(Opening `index.html` directly in a browser also works, but a local server avoids any relative-path quirks.)

## Structure

```
obsidian-assembly/
├── index.html          all sections, single scrolling page
├── css/styles.css       all styling
├── js/
│   ├── carousel.js       Places & Objects carousel logic
│   └── menu.js           mobile menu toggle
└── assets/
    ├── favicon.svg
    └── images/           placeholder SVGs (see Notes)
```

## Notes / what's not a real copy

- **Images are placeholders.** This environment's network policy blocked direct access to obsidianassembly.com, so the real photography/renders couldn't be downloaded. Every image is a generated SVG placeholder labeled with what it represents (e.g. "Inner Chamber", "The Fox Spirit") — swap the files in `assets/images/` with the real ones to finish it.
- **Fonts are close matches, not originals.** Uses Google Fonts (Playfair Display, Cormorant Garamond, Inter) to approximate the display serif / body serif / tracked sans seen in the reference screenshots — not necessarily the exact typefaces used on the live site.
- **No backend.** "Seek Admission", "Send Request", and "Explore Objects" are styled links/buttons only — there is no form handling or API behind them.
- **Copy is paraphrased in places.** Section structure and most lines are copied from the screenshots; some captions/labels were filled in or reworded where content extended beyond what was visible.
- **Single page.** About / Contacts / People (linked from the footer) aren't built as separate pages — only the footer nav labels were visible in the reference screenshots.
