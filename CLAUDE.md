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
- `trips.html` ("Field Notes") — backpacking/dive trip reports — still a stub
- `music.html` ("On Repeat") — Zach Bryan ranking, fully built (see below)
- `longevity.html` ("The Log") — nutrition/training/sleep tracking — still a
  stub, explicitly needs a real backend eventually, not just static HTML
- `quant.html` ("The Work") — FICF stock pitches + personal quant projects —
  still a stub
- `assets/style.css` — shared stylesheet, imported by every page
- `Rex_Walrond_Resume.pdf` — linked from the hub page

There is no `assets/topo-bg.svg` file and none is needed — the background is
generated entirely in CSS/inline SVG inside style.css (see below). Do not
re-add an external background image reference.

## Design system (don't redesign from scratch)

- **Palette**: bg `#eef0ea`, paper `#f6f7f2`, ink `#1e2b26`, ink-soft
  `#52605a`, ink-faint `#8a9791`, hairline `#cdd3c6`, accent blue `#3c5a73`,
  accent ember `#b5652f`, accent pine `#2f5c4a`, accent gold `#c99a35` (pine/
  gold added in the "pop" pass — used for background ridge color depth, hover
  accents, and the "Summited" badge on Field Notes; still only 4 accents
  total, spend them deliberately rather than scattering)
- **Type**: Fraunces (display/headlines), Inter (body), IBM Plex Mono
  (labels/eyebrows/data/numerals) — loaded via Google Fonts import at the top
  of style.css
- **Signature motif**: an animated "elevation profile" SVG line (draws in on
  load) used as a section divider — doubles as a trail chart and a stock
  chart. Reused at smaller scale (`.elevation--sm`) between sections.
- **Background**: `.topo-bg` is a fixed, full-viewport layer behind all
  content — inline SVG mountain ridge silhouettes (`.ridges`, 3 layers at
  different opacity for depth) + slowly drifting blurred "mist" divs
  (`.mist--a/b/c`, animated via CSS `translateX` keyframes) + a faint ember
  "sunrise" glow near the horizon (`.glow`, breathing opacity animation) + a
  gradient fade (`.topo-bg::after`) so content stays readable on top. All
  motion is wrapped in `@media (prefers-reduced-motion: no-preference)` — never
  remove that guard.
- **Restraint**: this is a minimal, editorial, hairline-rule aesthetic, not a
  maximalist one. Spend visual boldness in one place per page, not scattered.
  Avoid generic "AI-generated" defaults (cream+terracotta with no other point
  of view, unnecessary card/shadow treatments, numbered-marker sequences that
  don't represent real sequence).

## music.html specifics

Fully built, not a stub. A drag-and-reorder ranked list of Zach Bryan's
discography (127 tracks seeded from Rex's own Spotify playlist order), styled
like an analyst's coverage sheet:

- Live "Current No. 1" hero at the top that updates when the list reorders
- Column header row, top-3 rows get a serif ember rank numeral, others mono
- Reordering via drag (desktop), up/down arrow buttons, or typing a new rank
  number directly — implemented with a FLIP animation so rows visibly
  resettle instead of snapping
- Search + Studio/Live filter segmented control
- "Add a track that's missing" form for filling in discography gaps
- Export button dumps the current order as plain text
- **State is stored in `localStorage` only** (key `zb-ranking-v1`) — it is
  NOT shared across visitors or devices, since this is a static site with no
  backend. This is a known, accepted limitation, not a bug to fix casually —
  if asked to make rankings visible to visitors, that requires an actual
  backend/database decision, don't silently bolt one on.

A future addition (not started): a "monthly top songs/artists/albums" section
on this same page, blocked on Rex exporting his Spotify Extended Streaming
History. Don't build this until that data exists.

## General conventions

- Mobile breakpoint used throughout: `max-width: 640px`
- Keep localStorage as the persistence pattern for any other interactive/
  editable features added to stub pages, unless a real backend is explicitly
  requested
- Always test new interactive features respect `prefers-reduced-motion`
