# Open threads

Things discussed and decided-ish but not yet built. `CLAUDE.md` describes the
site as it *is*; this file is the queue. Delete a line when it ships.

## SEO

The site is a GitHub Pages user site serving at the domain root
(`https://rexwalrond.github.io/`), not under a path. Not yet in the repo:

- `sitemap.xml` and `robots.txt` — five pages, hand-written is fine, no build step.
- `Person` JSON-LD on `index.html` with a `sameAs` array pointing at the other
  owned domains and profiles. This is the main lever for tying the properties
  together in search.
- `rel="me"` links alongside the footer contacts.
- `.nojekyll` at the repo root, so Pages stops running the files through Jekyll.

Cross-linking from `rexwalrond.com` (which already ranks) is the highest-value
single action, and it belongs on that site, not in this repo.

## Custom subdomain

Moving to something like `notes.rexwalrond.com` needs:

- a `CNAME` file at the repo root,
- a DNS record at the registrar,
- **15 hardcoded `https://rexwalrond.github.io/` URLs** across the five HTML
  files (canonical tags plus Open Graph / Twitter `url` and `image`),
- `assets/og.png` regenerated only if its URL is baked in anywhere.

Do all of them in one commit — a half-migrated canonical is worse than neither.

## Content gaps

- **`quant.html` coverage rows are still labelled placeholders** (`[A]`, `[B]`,
  "Buy — sample"). They read as deliberate stubs, which is the right failure
  mode, but the page can't carry weight until real calls replace them. This is
  also the page most likely to be searched for by name.
- **The tagline** (`finance · healthcare research · higher elevations`) predates
  the change in Rex's situation and hasn't been re-approved. `CLAUDE.md`
  requires his sign-off before touching index.html's bio or tagline copy; three
  rewrite options were drafted and none chosen.
- **No résumé is linked.** The old PDF was deleted from the repo, not just
  unlinked, because Pages serves any file in the tree. A replacement needs to
  not name the school or the fund before it goes back.
- **Sleep columns in `longevity.html` are null** until the AutoSleep → Apple
  Health feed is wired through `supabase/functions/ingest-health/`.

## Other properties

Rex owns several domains, most running on Wix. Nothing about them is in this
repo and nothing here depends on them. Two standing notes:

- Any migration off Wix is a rebuild plus a redirect map, and the redirect map
  is the part that protects the existing rankings. Order matters: stand the new
  site up on a staging host, verify it, then cut DNS and publish 301s.
- Credentials never belong in chat or in a checked-in file. Scoped API tokens in
  environment config are the only workable path, and the sandbox this repo is
  worked in reaches `api.github.com` and nothing else, so registrar and CMS
  access wouldn't function from here regardless.
