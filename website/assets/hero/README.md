# Hero videos

The homepage hero is a scroll-driven sequence — the phone/app video plays across a pinned
section as the visitor scrolls, one clip per "panel." Panels currently wired up in
`index.html` (see `.hero-scroll` section):

1. `01-ice-shatters.mp4` — ice block shatters around the phone ✅ in place
2. `02-ice-shards-fly-off.mp4` — ice shards fly off the phone ✅ in place
3. `03-listing-cards-rise.mp4` — listing cards rise up the sides of the phone — **drop the
   file here with this exact name and it activates automatically**, no code changes needed

To add a 4th+ panel later: drop `04-...mp4` here, duplicate one `.hero-scroll__media` /
`.hero-scroll__panel` / `.hero-scroll__tab` / `.hero-scroll__progress span` block in
`index.html` for it, and bump `--panels` in the inline style on `.hero-scroll` to match the
new total count.

Videos should be muted, loopable, and ideally under ~8MB each (they autoplay silently on
scroll, so smaller = faster first paint). Landscape or portrait both work since they're
`object-fit: cover`.
