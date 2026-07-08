# Campus+ — Marketing Site

A marketing site for Campus+, the .edu-verified student marketplace and gig platform. Started life as a layout/typography recreation of a private-assembly-themed reference site, then had all copy and structure swapped for Campus+'s actual product (Marketplace, Gigs, Messages & Meetup, Wallet/Profile), its 200+ campus footprint, and real photography of the app in use at USC/UCLA. Plain HTML/CSS/JS, no build step, no dependencies.

## Run locally

Any static file server works:

```bash
cd obsidian-assembly
python3 -m http.server 8000
```

Then open http://localhost:8000

(Opening `index.html` directly in a browser also works, but a local server avoids any relative-path quirks.)

## Pages

- `index.html` — the main scrolling site (hero, campuses, features, testimonials, connection, updates, footer)
- `about-founder.html` — a separate About the Founder page, linked from the footer

## Structure

```
obsidian-assembly/
├── index.html
├── about-founder.html
├── css/styles.css
├── js/
│   ├── carousel.js       Campuses, Features & Testimonials carousel logic
│   └── menu.js           mobile menu toggle
└── assets/
    ├── favicon.svg
    └── images/
        ├── campuses/      5 real photos (Tommy Trojan, USC Coliseum, USC at sunset, USC move-in, UCLA Royce Hall)
        ├── testimonials/  8 real photos of students holding the app (used in the new Testimonials section)
        ├── lifestyle/     6 real study/campus-life photos, used as atmosphere in the hero, Connection bg, and Updates cards
        ├── founder/        2 real photos, used only on about-founder.html
        └── features/      4 placeholder SVGs (Marketplace, Gigs, Messages & Meetup, Wallet/Profile — no real screenshots yet)
```

## Notes / what's not real yet

- **Features carousel is still placeholders.** The 4 core-tab images (Marketplace, Gigs, Messages & Meetup, Wallet/Profile) are generated SVGs — no real app screenshots were provided for these yet.
- **Fonts are close matches, not final brand fonts.** Uses Google Fonts (Playfair Display, Cormorant Garamond, Inter) for the display serif / body serif / tracked sans. Swap in Campus+'s actual brand typefaces if different.
- **No backend.** "Get the App", "Find Your Campus", and "Explore Features" are styled links/buttons only — none of them link to the App Store, a real campus-lookup, or a signup flow yet.
- **Gig categories are unconfirmed.** The Gigs feature copy is generic (tutoring, moving help, errands) per the product notes that the final category list isn't locked yet.
- **About the Founder copy is a first draft.** The bio paragraph on `about-founder.html` was written generically from what's known (founder name, the product's origin story) — replace with the real bio/quotes.
- **Single page for most nav items.** Pricing / Support / Careers (linked from the footer) aren't built as separate pages — only About the Founder got its own page, per request.
