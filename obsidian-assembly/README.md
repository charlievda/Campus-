# Campus+ — Marketing Site

A one-page marketing site for Campus+, the .edu-verified student marketplace and gig platform. Started life as a layout/typography recreation of a private-assembly-themed reference site, then had all copy, imagery, and structure swapped for Campus+'s actual product (Marketplace, Gigs, Messages & Meetup, Wallet/Profile) and its 179+ campus footprint. Plain HTML/CSS/JS, no build step, no dependencies.

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
│   ├── carousel.js       Campuses & Features carousel logic
│   └── menu.js           mobile menu toggle
└── assets/
    ├── favicon.svg
    └── images/
        ├── campuses/      7 campus placeholders (UCLA, USC, NYU, Michigan, UT Austin, Ohio State, Florida)
        ├── features/      4 core-tab placeholders (Marketplace, Gigs, Messages & Meetup, Wallet/Profile)
        └── updates/       3 "Updates" card placeholders
```

## Notes / what's not real yet

- **Images are placeholders.** Every image is a generated SVG labeled with what it represents — swap the files in `assets/images/` for real app screenshots, campus photography, and marketing renders.
- **Fonts are close matches, not final brand fonts.** Uses Google Fonts (Playfair Display, Cormorant Garamond, Inter) for the display serif / body serif / tracked sans. Swap in Campus+'s actual brand typefaces if different.
- **No backend.** "Get the App", "Find Your Campus", and "Explore Features" are styled links/buttons only — none of them link to the App Store, a real campus-lookup, or a signup flow yet.
- **Campus list is illustrative.** The 7 campuses shown (UCLA, USC, NYU, etc.) are placeholder examples to fill the carousel, not a confirmed list of the actual 179+ live/pre-order campuses — swap for the real list.
- **Gig categories are unconfirmed.** The Gigs feature copy is generic (tutoring, moving help, errands) per the product notes that the final category list isn't locked yet.
- **Single page.** Pricing / Support / Careers (linked from the footer) aren't built as separate pages — only the footer nav labels exist.
