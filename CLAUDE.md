# Rex Walrond — personal site

Static HTML/CSS/JS site hosted free on GitHub Pages. No build step, no framework,
no bundler — every page is a plain .html file that links to one shared
assets/style.css. Keep it that way unless explicitly asked to add tooling.

## Who this is for

Rex Walrond — co-founder of Norr Wellness (a prestige oral care startup,
early-stage/pre-launch), former neuroscience researcher (McKnight Brain
Institute, Romark Labs), with healthcare equity research experience. Site needs
to be professional enough to link from LinkedIn and job applications, while
still having real personality (music, backpacking, diving, training data).

**Do not name a school, degree programme, or employer on this site.** The
résumé PDF was removed from the repo for this reason rather than just unlinked
— GitHub Pages serves any file in the tree, so an unlinked PDF is still a
public URL. Don't re-add one without checking what its text says. Rex asked
for his former programme and the student fund he worked with to come off
entirely, and this file is checked in and public, so don't restate them here
either. The equity research experience can be described as the work it is,
never attributed to a named organisation. If a rewrite seems to need an
affiliation, ask rather than reaching for the old one.

**Positioning goal (important, still being refined):** the site should read as
pointing toward venture/growth investing in healthcare — WITHOUT ever claiming
that identity directly, since Rex isn't there yet professionally. The signal
should come from the combination of experience already on the page (equity
research + hands-on startup operating + hard science background), not from
adding a label like "aspiring VC." Note that the research leg is now described
without naming where it happened, which makes it carry less weight than it did
— worth revisiting with Rex rather than compensating with stronger claims. Be very cautious with any copy that
edges toward claiming investing credentials he doesn't have. Check with Rex
before changing index.html's tagline copy; three rewrites were drafted and none
chosen.

**The hub has no bio paragraph, on purpose.** There was one under the tagline
and Rex asked for it gone — he wanted the front page cleaner. So the header is
now eyebrow, name, rule, tagline, and straight into the four rows. Don't add
prose back to fill the space; if the hub ever needs more, it is a question for
Rex, not a gap to patch. (`.intro` is still in the stylesheet because 404.html
uses it.)

## File structure

- `index.html` — hub page, links out to the four sub-pages below
- `trips.html` ("Field Notes") — backpacking, dive and ski trip reports, plus
  the interactive map (see below). Real content, not a stub.
- `music.html` ("On Repeat") — Zach Bryan ranking + listening history, fully
  built (see below)
- `kit.html` ("The Kit") — the products actually in rotation, in two lists
  (Health, Hiking), each with a drawn tile, price and a link to the maker
- `longevity.html` ("The Log") — nutrition/training/sleep tracking, real
  charted data from a MyFitnessPal export, with a live Supabase path
- `404.html` — served automatically by GitHub Pages on a bad URL
- `quant.html` ("The Work") — healthcare equity research + personal quant
  projects. Structurally built; the coverage rows are still clearly-labelled
  placeholders waiting on real calls. **The page opens on "Coming soon." and
  nothing else, on purpose.** It used to describe a specific project (diet and
  sleep data "pulled apart the way I'd pull apart a 10-K") that did not exist,
  and a longer coming-soon sentence was tried and cut too — Rex wanted it
  short. Don't expand it back out: no named projects, methods or findings here
  until one actually ships.

### assets/

- `style.css` — the whole design system, one file, ~3,200 lines
- `chrome.js` — shared page chrome: background scenes, theme, parallax. Loaded
  first on every page.
- `reveal.js` — the reveal-on-scroll IntersectionObserver
- `places.js` — every place on the site (trips, dive sites, ski mountains,
  wishlists) as one array. Source of truth for the map.
- `geo.js` — baked coastline + US state geometry for the map. Generated, not
  hand-edited (see below).
- `map.js` — the Field Notes map
- `log-data.js` — the MyFitnessPal export, for The Log
- `favicon.svg` — the ridgeline-as-chart mark
- `hub.js` — the hub's live row figures
- `kit-data.js` — every product on The Kit, as one array. Source of truth for
  kit.html and for the hub's row figure
- `kit.js` — builds The Kit, including the drawn product tiles
- `listen-data.js` — the Spotify listening snapshot, shared by music.html and
  the hub so the two can't drift
- `sky.js` — solar and lunar position, and the phase the whole palette hangs off
- `og.png` — the social share card (see below)

There is no `assets/topo-bg.svg` and none is needed — all background art is
generated in CSS and JS. Do not re-add an external background image reference.
`assets/parallax.js` was folded into `chrome.js`; don't bring it back.

## Design system (don't redesign from scratch)

- **Palette**: bg `#eef0ea`, paper `#f6f7f2`, ink `#1e2b26`, ink-soft
  `#52605a`, ink-faint `#8a9791`, hairline `#cdd3c6`, accent blue `#3c5a73`,
  accent ember `#b5652f`, accent pine `#2f5c4a`, accent gold `#c99a35`. Still
  only 4 accents — spend them deliberately rather than scattering.
- **Type**: Fraunces (display/headlines), Inter (body), IBM Plex Mono
  (labels/eyebrows/data/numerals) — loaded via Google Fonts import at the top
  of style.css
- **Signature motif**: an animated "elevation profile" SVG line (draws in on
  load) used as a section divider — doubles as a trail chart and a stock
  chart. Reused at smaller scale (`.elevation--sm`) between sections.
- **Restraint**: this is a minimal, editorial, hairline-rule aesthetic, not a
  maximalist one. Spend visual boldness in one place per page, not scattered.
  Avoid generic "AI-generated" defaults (cream+terracotta with no other point
  of view, unnecessary card/shadow treatments, numbered-marker sequences that
  don't represent real sequence).

### Themes: the sky over St. Petersburg

**The palette is a function of where the sun actually is**, right now, at
27.7676°N 82.6403°W. `assets/sky.js` computes solar position (NOAA) and lunar
position and phase (abridged Meeus), picks one of ten phases, and writes
`data-sky` and `data-dark` onto `<html>`. It loads in the `<head>` of every
page so the right sky is up on the first frame, and re-runs every minute.

Phases are cut on **solar altitude**, not clock time:

| altitude | rising | falling |
|---|---|---|
| below −18° | `night` | `night` |
| −18° to −6° | `dawn` | `nightfall` |
| −6° to −0.833° | `first-light` | `twilight` |
| −0.833° to +6° | `sunrise` | `sunset` |
| above +6°, under 62% of the day's max | `morning` | `afternoon` |
| above +6°, over that | `midday` |  |

This is deliberate and worth preserving. Clock bands would call 18:00 "sunset"
in both June and December, and those are two completely different skies here.
Altitude bands track the seasons for free, and because the maths runs in UTC
there is no DST rule to get wrong. "62% of the day's max" rather than a fixed
angle because noon reaches 85° in June and 39° in December, and both should
read as midday.

The sun and moon are **placed where they actually are**: `chrome.js` maps
azimuth to horizontal position (due east at the left edge, due west at the
right) and altitude to height. The moon is hidden when it is genuinely below
the horizon — a night with no moon in the sky is correct, not a bug.

**The moon's phase is a drawn shape, not an overlay.** `moonPath()` in
`chrome.js` builds the lit limb from two arcs: the outer circle, then the
terminator, which projects to an ellipse of horizontal semi-axis r(1−2k) for
illuminated fraction k. Positive bows toward the lit limb (crescent), negative
away (gibbous), zero is the straight line at quarter; waning is the same shape
mirrored. An earlier version slid an opaque CSS circle across a soft radial
gradient — the maths was right, but a hard edge over a blurred glow has no
crisp limb to cut, so every phase looked like the same smudge. If you change
this, render a strip of phases from 0 to 100 in both directions and look at it.

Two gotchas, both of which bit during the build:
- The trig helpers `sin()`/`cos()` take **degrees**. Passing a
  radian-converted value into them fails silently — it pinned the moon near
  new for an entire month before anyone noticed.
- Elongation needs the moon's and sun's positions in the **same frame**.
  Comparing lunar ecliptic longitude against solar right ascension looks
  plausible and is wrong.

Verify any change to this file against published sunrise/sunset times for St.
Petersburg and against a full lunation, not by eye. The `suncalc` npm package
is a good independent reference and is worth pulling in for a one-off check;
note that the published fork returns **degrees**, not the radians the original
library documents, which will silently wreck a comparison harness. Current
agreement against it: sun altitude within 0.5°, moon altitude within 2.2°, moon
azimuth within 2.2°, illuminated fraction within 1.1 percentage points, and the
waxing flag never disagrees.

**CSS structure:** two base blocks carry text and surfaces
(`[data-dark="true"|"false"]`); ten `[data-sky="…"]` blocks carry atmosphere
(sky gradient, ridges, glow, stars, celestial, veil, scrim). Keep them
separate — a text colour inside a sky block is in the wrong place. Scene
overrides for Dive and Ski key off `data-dark` only, so they don't need ten
variants each. All ten phases are checked for WCAG AA body contrast; the
tightest are twilight at about 4.9:1 and sunset at about 5.1:1, so there is very
little headroom to spend.

**The reading-column scrim outranks everything in the background.** `.wrap` is
`z-index: 1` and the whole `.topo-bg` layer is `z-index: 0`, so `.wrap::before`
paints over the sky no matter what z-index a background element claims —
raising the moon inside `.topo-bg` cannot lift it above the scrim. That is why
the dark phases carry deliberately *light* scrims (0.26–0.52): the palette is
already near-black and the text sits at 6–8.5:1 without help, while a heavy
scrim turns the lunar disc grey and the phase stops reading. Twilight is the
exception and needs more, because it has the brightest sky of the dark phases.

**Daylight is deliberately cool.** Morning, midday and afternoon were warmer and
brighter and read as glare; midday in particular. If you brighten them again,
re-run the contrast check — they now sit at 5.1–5.3:1.

**The toggle** in the top right cycles auto → day → night, stored under
`rw-theme`. "auto" is the live sky; the other two pin midday and night. Values
saved by the older light/dusk toggle are migrated on read rather than
discarded. With JS off there is no `data-sky`, so a `prefers-color-scheme`
fallback scoped to `:root:not([data-sky])` keeps the site readable.

**All colour must go through tokens.** A literal like `rgba(30,43,38,.045)`
is a tint of ink that darkens the dark theme instead of lifting it. Use
`var(--shade)`, `var(--shadow)`, or `color-mix(in srgb, var(--token) N%,
transparent)`.

### Background scenes

`chrome.js` builds the fixed `.topo-bg` layer from `<body data-scene="...">`,
so the markup lives in one place instead of being copied into five files.
Four scenes: `alpine` (index, trips, music), `depth`, `snow`, `plot`
(quant, longevity). Scenes cross-fade, so a page can change weather without a
reload — Field Notes swaps alpine/depth/snow as you move between Backcountry,
Dive and Ski via `Chrome.setScene()`.

The active scene is mirrored onto `<html data-scene>`, which lets the veil and
the reading-column scrim take the scene's cast. That's what makes switching to
Dive feel like the whole page went underwater rather than just the strip behind
it.

Ridge silhouettes are **generated**, not hand-drawn: fractal midpoint
displacement from a fixed seed, smoothed through Catmull-Rom beziers. Same
shape every load, with the irregularity real skylines have. Change a seed and
you get a different mountain.

**Readability rule:** art stays at full strength out in the margins; the
reading column carries its own scrim (`.wrap::before`) that tracks the column
at any viewport width. Don't solve a contrast problem by flattening the whole
background — that's what made the first pass look washed out.

**Anything that bleeds past its container must be clamped to the viewport**
(`left: max(-13vw, calc(-50vw + 50%))`). An absolutely positioned overhang
still counts toward scrollable overflow, and the symptom is a sideways scroll
on every page at narrow widths. Same for the map's full-bleed: use negative
margins, never a `transform`, because a transform moves the box visually but
leaves its layout width where it was.

All motion is wrapped in `@media (prefers-reduced-motion: no-preference)` —
never remove that guard. Reduced motion must also skip the map's fly-to
animation and leave every reveal element fully visible.

## trips.html: the map

"The Ground Covered" — an interactive SVG map of all 32 places, built by
`map.js` from `places.js` + `geo.js`. No mapping library, no tiles, no network.

- **Projection**: equidistant cylindrical with a standard parallel — plate
  carrée with x compressed by cos(lat0). That makes it an affine transform of
  one set of lon/lat paths, so geometry is built once and every view change
  (and every fly-to frame) is just a new transform string on one `<g>`.
- **The antimeridian has to be handled explicitly.** Three rings in `geo.js`
  cross it — Antarctica, Afro-Eurasia and Fiji — and their longitudes jump from
  +179 to −180 between consecutive points. Drawn naively that jump is a straight
  segment back across the whole plate: a cream band over the Arctic, a green
  line at 16°S and a slab along the bottom, on every load. `ringsToPath` unwraps
  each ring first (add or subtract a turn to keep it continuous), then does two
  things that follow from unwrapping. A ring that unwraps a full turn encircles
  a pole, so it gets two points at the pole itself or the cap is sliced off by
  the closing segment. And an unwrapped ring lives in one 360° window, so it is
  drawn again a turn either side — only where that copy can actually land on the
  globe, otherwise the path data triples for nothing. Don't "simplify" this back
  to a plain M/L/Z per ring.
- **The plate and the world view are fitted to each other**, in that order.
  `layout()` picks the plate shape the breakpoint wants (squarer on a phone,
  wide on a desktop), `worldFrame()` grows the places' own bounding box to that
  shape, and then the plate takes its real height back from the frame. So the
  default view fills the plate and there is never a band of empty sea above or
  below the map. Past ~300° of longitude the frame snaps to the whole globe
  rather than cutting a slice out of one side, which is why the desktop view is
  a complete world map and the phone view stops either side of the Atlantic —
  every place is still inside it. The sea rect is resized here too: it used to
  be built at the desktop height and left there, which put the gradient's last
  stop a quarter of the way up every phone map.
- **Clustering, then displacement.** Two problems at two zooms. At world scale
  32 markers can't each have a spot, so points within `CLUSTER_R` collapse into
  a disc with a count; clicking it flies in until the group resolves. Once
  zoomed, the few pins still overlapping get nudged apart with a leader line
  back to true position. `CLUSTER_R` must stay *below* `SEP` or there's no band
  where displacement can apply. `boundsOf`'s `minSpan` floor must stay small
  (~0.06°) or a two-marker cluster can never be zoomed apart and clicking it
  does nothing.
- Only points inside the frame take part in clustering — an off-canvas cluster
  is invisible but still focusable, and its count describes places you can't see.
- **Navigation**: drag to pan, double-click or the +/- buttons to zoom, and the
  reset button returns to the world view. The reset matters — drilling into a
  cluster used to be a one-way trip with no way back out. Panning only starts
  once the pointer passes a 4px threshold, and the click that ends a drag is
  swallowed, so a drag can't fire a marker underneath it. Escape clears the
  selection. There is no wheel zoom on purpose: it hijacks page scroll.
- Markers carry `id="place-<id>"` counterparts on the trip cards and site rows;
  "Read the write-up" dispatches `fieldmap:jump`, which trips.html uses to open
  the right tab before scrolling.
- **Touch sizing.** Marker glyphs, hit areas and the clustering and separation
  distances are authored in CSS pixels and multiplied by `UI` at use, so they
  stay the same size under a finger as under a cursor. `HIT_R` widens on narrow
  screens — a pin's glyph is ~16px, a fine mouse target and a poor thumb one.
  The zoom cluster goes to a horizontal row on a phone: stacked, three 40px
  buttons were 132px of a 256px plate and sat on top of two markers.
- Adding a place: add it to `places.js` and it appears on the map immediately.
  Add the card/row by hand with the matching `id` to wire the two together.

`geo.js` is generated from the `world-atlas` (land, 110m) and `us-atlas`
(states, 10m) npm packages — public-domain Natural Earth data, decoded from
TopoJSON, Douglas-Peucker simplified and quantised to 2dp. Regenerate only if
the source atlases change; don't hand-edit it.

## music.html specifics

Fully built, not a stub. Two tabs:

**Zach Bryan, ranked** — a drag-and-reorder ranked list of 247 tracks, styled
like an analyst's coverage sheet: live "Current No. 1" hero, column header row,
serif ember rank numerals for the top 3, reordering by drag / arrow buttons /
typing a rank directly (FLIP-animated so rows visibly resettle), search +
Studio/Live filter, an "add a track that's missing" form, and a plain-text
export.

**Listening history** — a baked snapshot from Rex's Spotify Extended Streaming
History (hours, artists, distinct tracks, share that's Zach Bryan), held inline
in music.html as `LISTEN_SUMMARY`.

Ranking has a real backend: a single-row `ranking_state` table
(`supabase/schema.sql`) holding the canonical order as JSONB, public-read /
owner-write via RLS. Only a session signed in as `EDITOR_EMAIL`
(`rexwalrond@gmail.com`) can push reorders; everyone else gets a read-only view.
Sign-in is a passwordless Supabase magic link. If Supabase is unreachable the
page degrades to the original everyone-reorders-their-own-copy `localStorage`
sandbox (key `zb-ranking-v1`) — **don't remove that fallback path.**

The stored ranking is the source of truth for *order*; the code's catalog is the
source of truth for *what exists*, so new tracks land at the bottom rather than
going missing, with no migration.

## kit.html specifics

Two lists from `assets/kit-data.js` — Health and Hiking — rendered by `kit.js`.
Add an item to the data file and it appears on the page and in the hub's count;
nothing is hardcoded in the markup.

**The product tiles are drawn, not photographed.** This was a deliberate call
and it is worth not undoing. Every other piece of art here is generated (the
ridges, the clouds, the moon's terminator, the social card), and ten brand
JPEGs pulled off ten CDNs would be the one place that stopped being true: they
age badly as those URLs rot, none of them agree on background, crop or colour,
and the grid starts to look like an affiliate page. Instead `kit.js` holds a
silhouette per container — `tub`, `bar`, `stick`, `bottle`, `dropper`, `jar`,
`soap`, `bag`, `packet` — drawn in a 100x100 box with the object standing on a
shelf line at `y=86`. Keep new forms on that line or the row stops reading as a
shelf, and keep accent bands clear of rounded corners (a square-cornered band
over an `rx` body pokes out at the bottom).

**Prices are a snapshot, and the page says so.** `asOf` in the data file is
stamped into the intro. A price that cannot be confirmed is `null`, which
renders as "see site" rather than a number that reads real — the same rule the
rest of the site follows. Two are currently null (the Barebells bar and the
VanMan soap); the rest were checked against the makers' own listings.

**Links go to the maker's own store** wherever one exists, and the destination
host is printed under the price so the reader knows where they are being sent
before they click. None are affiliate links and nothing is sponsored; the page
says that too, so keep it true.

**Nothing on this page uses `--ink-faint`.** Elsewhere that token labels things
a reader can skip and is decorative-grade on purpose — measured, about 2.6:1 on
the light background, well under AA. Here the small mono carries the category,
the price and the destination, which is the entire content of the page, so it
all sits on `--ink-soft` instead. All ten sky phases then pass AA on both a
phone and a desktop; sunset is tightest at 4.6:1.

**`reveal.js` observes once at load**, so anything `kit.js` builds afterwards is
never seen by the observer and would sit at `opacity: 0` for good. The
`data-reveal` lives on the static `#kitBody` wrapper, the same way trips.html
wraps the map. Don't put it on generated markup.

## longevity.html specifics

Real nutrition data (MyFitnessPal export, Jan–Jun 2026) in `assets/log-data.js`,
charted by range (week/month/year/all). Reads the live `daily_log` Supabase
table when it has rows and falls back to the baked export otherwise, so the page
is never empty. Sleep columns exist but are null until the AutoSleep → Apple
Health feed is connected; `supabase/functions/ingest-health/` is the intended
ingestion path.

## The hub

`index.html` is the front door, and its job is to send people to the five
pages. Two things follow from that:

- **Each link row carries a live figure** from its own page's data, via
  `hub.js`. The Work has no real coverage yet, so it gets a status tag instead
  of an invented number. Keep it that way until there are real calls to count.
- **No charts here.** There used to be an elevation profile of every
  backcountry high point. It was accurate and it was pretty, and it still went:
  it over-weighted one of the pages, and it asked a first-time visitor to
  interpret something before they had any context for it. If you want to add a
  visual to the hub, it should not be a data graphic.

### The hub is the only page that moves

`<body data-ambient="live">` on index.html opts into weather; nothing else does.
`chrome.js` builds it — clouds on three depth bands crossing the sky, and a near
treeline whose trees each sway on their own clock so the row reads as wind
moving through rather than one object rocking. Both are generated from a seed,
like the ridges.

The rest of the site stays still on purpose: a page someone is *reading* should
not have weather. Measured, the hub changes about 6-7% of its pixels over four
seconds; the sub-pages change 0.00%.

**The gate is easy to get wrong.** `animation-name` for the clouds lives in the
stylesheet, inside the `prefers-reduced-motion: no-preference` block. An earlier
version set it inline from JS along with duration and delay, which beats the
media query — the clouds kept drifting for readers who had asked for stillness,
and nothing in the markup looked wrong. Only duration, delay and the resting
position go inline. The test is to diff two screenshots a few seconds apart
under `reducedMotion: 'reduce'` and require 0.000%.

Clouds and the windbreak sit at `z-index: 4`, above the readability veil at 3,
with the grain moved to 5. Below the veil they get washed out and flatten into
the distant ridges. The daytime `--sky-top` values are deliberately a deeper
blue than the rest of the palette would suggest: white clouds on a near-white
sky are invisible, and the deeper sky is what makes them read at all.

## Social cards

Every page carries Open Graph and Twitter meta so the site unfurls properly in
Slack, LinkedIn and iMessage. The image is `assets/og.png`, 1200x630.

It is **generated, not drawn**: a temporary `_og.html` at the repo root reuses
`style.css` and `chrome.js`, so the card is literally the site's own ridge art.
It hides the toggle, the clouds and the windbreak — it is a still image, not a
frame of an animation. Render it at 1200x630 and delete the temp
file. Regenerate it if the palette, the name or the trip data changes.

Note for whoever regenerates it: the sandbox blocks `fonts.googleapis.com` from
the browser but not from curl, so screenshots fall back to system fonts unless
the real font files are fetched and injected as data URIs first. A card rendered
without that step will look wrong in a way that is easy to miss.

## Typography

Fraunces is a variable face. `font-variation-settings: 'opsz' 144` on display
headings is doing real work — it swaps to the display cut, with tighter
apertures and finer hairlines than the text cut it otherwise renders at.

The `SOFT` and `WONK` axes were tried and removed: they only ship if the font
request asks for them, and once it did, neither made a difference worth carrying
on this site's headings. Don't re-add an axis without checking it changes the
render.

The font request uses variable weight ranges (`wght@400..600`) rather than
discrete weights, which is 23 font files instead of 43.

## General conventions

- Mobile breakpoint used throughout: `max-width: 640px`
- **Phones need bigger, not smaller.** Several mobile blocks had been shrinking
  type and padding to fit the narrow column, which produced 22px tap targets and
  9.5px mono. Touch wants the opposite: ≥40px on anything tappable, and a floor
  of ~11px on the small mono labels. A form field under 16px makes iOS zoom the
  whole page on focus, which leaves the reader scrolled sideways.
- The theme toggle is `position: fixed` on desktop and **absolute on a phone**,
  so it scrolls away with the header. There is nowhere on a 390px screen a
  corner-pinned disc can float without landing on something right-aligned
  further down — a chart's unit, a coverage row's rating.
- `.wrap::before`'s fade is a percentage of its own width, so the desktop's 26%
  ramp ate 100px at each end of a phone screen and the text nearest the margins
  sat on bare background. Narrow it at the breakpoint; the column needs the
  cover more than the soft edge. This was not cosmetic: measured at 390px
  against the worst point across the column, **sunrise was 4.09:1 and sunset
  3.53:1 — both below AA** — while the same phases pass comfortably on a
  desktop. The 7% ramp puts every phase at 4.87:1 or better on a phone
  (first-light is now the tightest). Re-measure on a phone viewport, not just a
  desktop one, after touching the scrim or any sky palette.
- Supabase is the backend for anything that needs to persist across devices;
  `localStorage` is fine for per-reader state (theme, sandbox ranking)
- Always test new interactive features respect `prefers-reduced-motion`
- Check every viewport width for horizontal overflow after touching layout —
  `document.documentElement.scrollWidth > clientWidth` is the test
- Numbers shown anywhere should be computed from a data file, not typed in. If
  there is no real number yet, say so rather than inventing a placeholder that
  reads as real.
