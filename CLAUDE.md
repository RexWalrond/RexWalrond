# Rex Walrond — personal site

Static HTML/CSS/JS site hosted free on GitHub Pages. No build step, no framework,
no bundler — every page is a plain .html file that links to one shared
assets/style.css. Keep it that way unless explicitly asked to add tooling.

## Who this is for

Rex Walrond — MSF candidate at Notre Dame, healthcare analyst at Fighting Irish
Capital Fund (student-managed equity fund), co-founder of Norr Wellness (a
prestige oral care startup, early-stage/pre-launch), former neuroscience
researcher (McKnight Brain Institute, Romark Labs). Site needs to be
professional enough to link from LinkedIn and job applications, while still
having real personality (music, backpacking, diving, training data).

**Positioning goal (important, still being refined):** the site should read as
pointing toward venture/growth investing in healthcare — WITHOUT ever claiming
that identity directly, since Rex isn't there yet professionally. The signal
should come from the combination of experience already on the page (public
equity research + hands-on startup operating + hard science background), not
from adding a label like "aspiring VC." Be very cautious with any copy that
edges toward claiming investing credentials he doesn't have. As of this file's
writing, three bio/tagline rewrite options were drafted but not yet approved —
check with Rex before changing index.html's bio or tagline copy.

## File structure

- `index.html` — hub page, links out to the four sub-pages below
- `trips.html` ("Field Notes") — backpacking, dive and ski trip reports, plus
  the interactive map (see below). Real content, not a stub.
- `music.html` ("On Repeat") — Zach Bryan ranking + listening history, fully
  built (see below)
- `longevity.html` ("The Log") — nutrition/training/sleep tracking, real
  charted data from a MyFitnessPal export, with a live Supabase path
- `quant.html` ("The Work") — FICF stock pitches + personal quant projects.
  Structurally built; the coverage rows are still clearly-labelled placeholders
  waiting on real calls.
- `Rex_Walrond_Resume.pdf` — linked from the hub page

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

### Themes

Two themes off one set of tokens: **light** (alpine mist paper) and **dusk**
(the same landscape after sundown — ridges go to silhouette, the sunrise glow
becomes moonlight, stars appear). Dusk applies from `prefers-color-scheme`
unless the reader has pinned light, and the toggle in the top-right cycles
system → light → dusk, stored in `localStorage` under `rw-theme`. A small
inline script in each page's `<head>` applies the stored theme before first
paint so a pinned dusk theme doesn't flash light.

The dusk values appear **twice** in style.css — once under the media query and
once under `:root[data-theme="dusk"]`. CSS can't share a body between those
without a preprocessor and there's no build step, so edit both or neither.

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
- Markers carry `id="place-<id>"` counterparts on the trip cards and site rows;
  "Read the write-up" dispatches `fieldmap:jump`, which trips.html uses to open
  the right tab before scrolling.
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

## longevity.html specifics

Real nutrition data (MyFitnessPal export, Jan–Jun 2026) in `assets/log-data.js`,
charted by range (week/month/year/all). Reads the live `daily_log` Supabase
table when it has rows and falls back to the baked export otherwise, so the page
is never empty. Sleep columns exist but are null until the AutoSleep → Apple
Health feed is connected; `supabase/functions/ingest-health/` is the intended
ingestion path.

## General conventions

- Mobile breakpoint used throughout: `max-width: 640px`
- Supabase is the backend for anything that needs to persist across devices;
  `localStorage` is fine for per-reader state (theme, sandbox ranking)
- Always test new interactive features respect `prefers-reduced-motion`
- Check every viewport width for horizontal overflow after touching layout —
  `document.documentElement.scrollWidth > clientWidth` is the test
