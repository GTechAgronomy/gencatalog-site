# GenCatalog Site Development Log

---
## 2026-06-24 — Published desktop 5.16.28 selection release copy

### What Changed
- Updated homepage visible version references and structured-data software version to 5.16.28.
- Updated `/get` desktop download redirect to 5.16.28.
- Added customer-facing release notes for restored Shift+Arrow grid multi-select behavior.

### Verification
- `scripts/update-version.sh 5.16.28` verified the 5.16.28 macOS DMG and Windows installer URLs before changing public version surfaces.
- `scripts/update-version.sh --check` passed with all version surfaces at 5.16.28, release notes present, and desktop artifacts live.
- Release copy stays customer-facing and avoids internal process language.

### Status
- Ready to deploy via Cloudflare Pages on push.

---
## 2026-06-17 — Added Gemini to homepage platform rotator

### What Changed
- Added Gemini to the homepage hero "Capturing from" platform rotator.
- Added a homepage script cache-bust so visitors receive the updated rotator immediately instead of a stale cached JavaScript asset.

### Verification
- `git diff --check` passed.
- `./scripts/update-version.sh --check` passed with all version surfaces at 5.16.22 and both desktop artifacts live.
- Live check confirmed the unversioned JavaScript asset was still a Cloudflare cache HIT without Gemini, while the cache-busted asset returned the updated Gemini list.

### Status
- Ready to deploy via Cloudflare Pages on push.

---
## 2026-06-16 — Added Grok local-folder retrieval positioning

### What Changed
- Added Grok retrieval positioning around local folders vs. a searchable, source-aware catalog.
- Added related Grok FAQ copy explaining why downloaded files alone are not enough for reliable retrieval.
- Added a small homepage reinforcement under the core workflow section without changing download links or layout structure.

### Verification
- JSON-LD parse passed for updated pages.
- Structural tag balance check passed for `grok.html`, `index.html`, and `faq.html`.
- `git diff --check` passed.
- `./scripts/update-version.sh --check` passed with all version surfaces still at 5.16.21.
- Local browser review confirmed the new Grok sections use existing feature grid/card classes and collapse cleanly on a narrow viewport.

### Status
- Ready to deploy via Cloudflare Pages on push.

---
## 2026-06-16 — Published 5.16.21 Private Vault release copy

### What Changed
- Added customer-facing release notes for GenCatalog 5.16.21, leading with Private Vault and explaining encryption at rest in plain language.
- Updated Support with a dedicated Private Vault section covering what it encrypts, how it differs from App Lock, Privacy Mode, and Hidden Items, and the password/recovery-key boundary.
- Updated FAQ visible copy and FAQPage structured data for Private Vault, encrypted storage, and encryption at rest.
- Updated `/get`, homepage version surfaces, and sitemap lastmod values to 5.16.21 after public desktop artifacts returned `200`.

### Verification
- `./scripts/update-version.sh 5.16.21` verified the 5.16.21 macOS DMG and Windows installer URLs before changing public version surfaces.
- `./scripts/update-version.sh --check` passed with all version surfaces at 5.16.21, release notes present, and desktop artifacts live.
- `git diff --check` passed.
- `xmllint --noout sitemap.xml` passed.
- FAQ JSON-LD parse passed for both structured-data blocks.

### Status
- Ready to deploy via Cloudflare Pages on push.

---
## 2026-06-14 — Published desktop 5.16.14 Higgsfield source-image release copy

### What Changed
- Updated homepage visible version references and structured-data software version to 5.16.14.
- Updated `/get` desktop download redirect to 5.16.14.
- Added customer-facing release notes for desktop 5.16.14 and Chrome extension 5.43.
- Highlighted Higgsfield reference-image saves, separate folder context, source-image detail cards, filter reset, zoom-out, and license refresh behavior.
- Refreshed sitemap lastmod values for the homepage and release notes.

### Verification
- Confirmed public download URLs return `200` for the 5.16.14 macOS DMG and Windows installer before updating site copy.
- Confirmed release copy stays customer-facing and avoids internal process language.
- `scripts/update-version.sh --check` passed with all version surfaces at 5.16.14, release notes present, and desktop artifacts live.

### Status
- Ready to deploy via Cloudflare Pages on push.

---
## 2026-06-13 — Published desktop 5.16.12 Higgsfield release copy

### What Changed
- Updated homepage visible version references and structured-data software version to 5.16.12.
- Updated `/get` desktop download redirect to 5.16.12.
- Added customer-facing release notes for desktop 5.16.12 and Chrome extension 5.41.
- Highlighted improved Higgsfield Favorites, private folder metadata, Nano Banana Pro metadata, and action-label filtering.

### Verification
- Confirmed public download URLs return `200` for the 5.16.12 macOS DMG and Windows installer before updating site copy.
- Confirmed release copy stays customer-facing and avoids internal process language.
- `scripts/update-version.sh --check` passed with all version surfaces at 5.16.12, release notes present, and desktop artifacts live.
- Verified live `gencatalog.app`, `/get`, and `/release-notes` propagated to 5.16.12 after push.

### Status
- Deployed via Cloudflare Pages and verified live.

---
## 2026-06-10 — Audit fixes: privacy scoping, trust cleanup, 404, image weight (Batches 1–3)

### What Changed
- Rewrote `/privacy` to scope no-telemetry claims to the app/extension and disclose website Google Analytics + localStorage attribution honestly. GA stays installed.
- Deleted the dormant `#hero-counter` fake-counter block from `site.js`.
- Removed the unsourced @grok pull quote from the homepage (no post URL available to cite).
- Unified trial framing site-wide: "7 days or 250 generations, whichever comes first, no credit card." Fixed `llms.txt` ("100 items" → 250-generation framing) and pointed its download link at `/get` instead of a versioned DMG so it can't go stale.
- Standardized performance claims to "tested with catalogs of 30,000+ items."
- "Includes all v1 updates" → "Includes all 5.x updates" (pricing card + FAQ JSON-LD).
- Added `404.html` (Cloudflare Pages now returns real 404s instead of soft-200 homepage fallback).
- Added `_redirects` keeping DEVLOG.md, AGENTS.md, AUDIT.md, the Search Console report, `brand/`, and `scripts/` out of public reach.
- Added `scripts/update-version.sh` + version consistency check.
- Converted oversized homepage/platform images to right-sized WebP; added lazy-loading and width/height attributes; fixed `/#how-it-works` → `/#how`; fixed higgsfield picture fallback; added long-lived asset caching to `_headers`.

### Manual follow-up: www subdomain (NXDOMAIN today)
`www.gencatalog.app` does not resolve — anyone typing www gets a browser error. Fix in the Cloudflare dashboard (no code change possible):
1. Cloudflare dashboard → Workers & Pages → the gencatalog.app Pages project → **Custom domains** → Add `www.gencatalog.app`. Pages will create the DNS record and route it.
2. Then add a redirect to apex: dashboard → the gencatalog.app zone → **Rules → Redirect Rules** → create rule: if hostname equals `www.gencatalog.app`, 301 to `https://gencatalog.app` preserving path and query. (Or use Bulk Redirects.)
3. Verify: `curl -sI https://www.gencatalog.app/` returns 301 → `https://gencatalog.app/`.
4. Optional afterward: submit to hstspreload.org (preload requires the working www redirect).

### Verification
- Public download URLs for the current released desktop version verified `200` before completion.
- Grep checks: no `hero-counter`, no stale `5.16.0` DMG link, no `/#how-it-works`, no "100 items".

---
## 2026-06-06 — Removed internal About-panel release note

### What Changed
- Removed the 5.16.5 release-note section that called out the macOS About-panel ownership text.
- Kept the public 5.16.5 notes focused on user-visible Save & Favorite and import receipt readiness.

### Verification
- Confirmed live `/release-notes` no longer contains the About-panel ownership copy.

### Status
- Deployed via Cloudflare Pages and verified live.

---
## 2026-06-05 — Published desktop 5.16.6 release copy

### What Changed
- Updated homepage visible version references and structured-data software version to 5.16.6.
- Updated `/get` desktop download redirect to 5.16.6.
- Added customer-facing release notes for desktop 5.16.6.
- Highlighted that Statistics top tags now open the matching catalog items.

### Verification
- Confirmed public download URLs return `200` for the 5.16.6 desktop artifacts and updater feeds before updating site copy.
- Confirmed release copy stays customer-facing and avoids internal process language.
- Confirmed live `gencatalog.app`, `/get.html`, and `/release-notes` propagated to 5.16.6 after push.

### Status
- Deployed via Cloudflare Pages and verified live.

---
## 2026-06-05 — Published desktop 5.16.5 release copy

### What Changed
- Updated homepage visible version references and structured-data software version to 5.16.5.
- Updated `/get` desktop download redirect to 5.16.5.
- Added customer-facing release notes for desktop 5.16.5.
- Noted that the matching Chrome extension Save & Favorite and import receipt improvements are coming soon after Web Store approval.

### Verification
- Confirmed public download URLs return `200` for the 5.16.5 desktop artifacts and updater feeds before updating site copy.
- Confirmed release copy stays customer-facing and avoids internal process language.
- Confirmed live `gencatalog.app`, `/get.html`, and `/release-notes` propagated to 5.16.5 after push.

### Status
- Deployed via Cloudflare Pages and verified live.

---
## 2026-06-04 — Published extension 5.35 Grok upscale safety copy

### What Changed
- Added customer-facing release notes for Chrome extension 5.35.
- Updated support guidance to explain that Grok video upscaling happens in the desktop app, not during extension scan/download.
- Added FAQ instructions for single-video and selected-item Grok upgrades from the desktop app.
- Removed stale guide copy that described bulk upscaling as part of the Grok recovery workflow.

### Verification
- Confirmed static HTML no longer contains stale extension-upscale settings copy.
- `git diff --check`

### Status
- Ready to deploy via Cloudflare Pages on push.

---
## 2026-06-03 — Published 5.16.3 Venice and large-catalog stability copy

### What Changed
- Updated homepage visible version references and structured-data software version to 5.16.3.
- Updated `/get` desktop download redirect to 5.16.3.
- Added customer-facing release notes for desktop 5.16.3 and Chrome extension 5.33.

### Verification
- Confirmed public download URLs return `200` for the 5.16.3 desktop artifacts and update feeds before updating site copy.
- Confirmed release copy stays customer-facing and avoids internal process language.

### Status
- Ready to deploy via Cloudflare Pages on push.

---
## 2026-06-03 — Published 5.16.2 fullscreen video navigation hotfix copy

### What Changed
- Updated homepage visible version references and structured-data software version to 5.16.2.
- Updated `/get` desktop download redirect to 5.16.2.
- Added customer-facing release notes for desktop 5.16.2 with Chrome extension 5.31 unchanged.

### Verification
- Confirmed public download URLs return `200` for the 5.16.2 desktop artifacts and update feeds before updating site copy.
- Confirmed release copy stays customer-facing and avoids internal process language.

### Status
- Ready to deploy via Cloudflare Pages on push.

---
## 2026-06-01 — Published 5.16.0 GPT Image and Grok upscale release copy

### What Changed
- Updated homepage visible version references and structured-data software version to 5.16.0.
- Updated `/get` desktop download redirect to 5.16.0.
- Added customer-facing release notes for desktop 5.16.0 and Chrome extension 5.30.
- Added GPT Image to homepage, support, FAQ, privacy, and machine-readable `llms.txt` platform support copy.
- Updated `llms.txt` to point at the current 5.16.0 macOS DMG download.

### Verification
- Confirmed public download URLs return `200` for the 5.16.0 desktop artifacts, updater feeds, and 5.30 extension ZIP before updating site copy.
- Confirmed release copy stays customer-facing and avoids internal process language.
- Confirmed `git diff --check` passes.

### Status
- Ready to deploy via Cloudflare Pages on push.

---
## 2026-05-24 — Published 5.15.13 preview sync and Higgsfield video release

### What Changed
- Updated homepage visible version references and structured-data software version to 5.15.13.
- Updated `/get` desktop download redirect to 5.15.13.
- Added customer-facing release notes for desktop 5.15.13 and Chrome extension 5.28.

### Verification
- Confirmed public download URLs return `200` for the 5.15.13 desktop artifacts and update feeds.
- Confirmed release copy stays customer-facing and avoids internal process language.

### Status
- Ready to deploy via Cloudflare Pages on push.

---
## 2026-05-23 — Published 5.15.12 Grok URL visibility release

### What Changed
- Updated homepage visible version references and structured-data software version to 5.15.12.
- Updated `/get` desktop download redirect to 5.15.12.
- Added customer-facing release notes for desktop 5.15.12 and Chrome extension 5.27.

### Verification
- Confirmed public download URLs return `200` for the 5.15.12 desktop artifacts, update feeds, and 5.27 extension ZIP.
- Confirmed the live updater feeds point to 5.15.12 with the final post-staple DMG hash and Windows installer hash.
- Confirmed release copy stays customer-facing and avoids internal process language.

### Status
- Ready to deploy via Cloudflare Pages on push.

---
## 2026-05-23 — Published 5.15.11 customer QOL release

### What Changed
- Updated `/get` desktop download redirect to 5.15.11.
- Added customer-facing release notes for desktop 5.15.11 and Chrome extension 5.26.

### Verification
- Confirmed public download URLs return `200` for the 5.15.11 desktop artifacts, update feeds, and 5.26 extension ZIP.
- Confirmed the live updater feeds point to 5.15.11 with the final post-staple DMG hash and Windows installer hash.
- Confirmed release copy stays customer-facing and avoids internal process language.

### Status
- Ready to deploy via Cloudflare Pages on push.

---
## 2026-05-23 — Published 5.15.10 source image release copy

### What Changed
- Updated homepage and `/get` desktop version references to 5.15.10.
- Added release notes for desktop 5.15.10 and Chrome extension 5.25.
- Refreshed sitemap lastmod values for the homepage and release notes.

### Verification
- Confirmed public download URLs return `200` for the 5.15.10 desktop artifacts, update feeds, and 5.25 extension ZIP.
- Confirmed release copy stays customer-facing and avoids internal process language.

### Status
- Ready to deploy via Cloudflare Pages on push.

---
## 2026-05-16 — Added May Grok favorites outage SEO update

### What Changed
- Updated `/blog-grok-favorites-disappeared` around Search Console queries for Grok favorites not loading, not showing, unable to load, and saved images disappeared.
- Added a May 2026 update section near the top of the article.
- Refreshed the article title, meta description, Open Graph copy, FAQ structured data, and sitemap lastmod.

### Verification
- Confirmed article metadata and JSON-LD parse correctly.
- Confirmed `sitemap.xml` parses as valid XML.
- Confirmed `/blog-grok-favorites-disappeared.html`, `sitemap.xml`, and `robots.txt` return `200` on a local static server.
- Confirmed `git diff --check` passes.

### Status
- Ready to deploy via Cloudflare Pages on push.

---
## 2026-05-16 — Added purchase attribution carry-through

### What Changed
- Stored inbound `source`, `channel`, `surface`, and UTM parameters in local browser attribution state.
- Decorated Lemon Squeezy checkout links with official `checkout[custom][...]` metadata before checkout opens.
- Added the stored attribution fields to GA conversion click and download redirect events.
- Passed the same attribution fields through to the final DMG/EXE URLs so the download tracker can record source context on installer downloads.
- Added referrer fallback attribution for organic search and external referrals when visitors arrive without explicit source or UTM parameters.

### Verification
- Confirmed checkout URLs can be generated with Lemon Squeezy custom metadata fields.
- Confirmed `/get` download redirect events include the available attribution fields.

### Status
- Ready to deploy via Cloudflare Pages on push.

---
## 2026-05-14 — Published 5.15.9 Venice prompt repair release copy

### What Changed
- Updated homepage and `/get` desktop version references to 5.15.9.
- Added release notes for desktop 5.15.9 and Chrome extension 5.23.
- Refreshed sitemap lastmod values for the homepage and release notes.

### Verification
- `python3` XML parse confirms `sitemap.xml` is well-formed.
- `git diff --check` passes.
- Public release artifacts returned HTTP 200 from `downloads.gencatalog.app`.

### Status
- Ready to deploy via Cloudflare Pages on push.

---
## 2026-05-12 — Added Venice.ai support and FAQ guidance

### What Changed
- Expanded the Venice.ai section on the support page with chat-page save steps, video playback guidance, saved metadata, and current limits.
- Added a dedicated Venice.ai FAQ section covering support scope, save steps, video behavior, and metadata capture.
- Updated FAQ metadata and structured data so Venice.ai support is represented consistently.

### Verification
- Confirmed `/support.html` and `/faq.html` return `200` on a local static server.
- Confirmed FAQ structured data parses as valid JSON-LD.
- Confirmed `git diff --check` passes.

### Status
- Ready to deploy via Cloudflare Pages on push.

---
## 2026-05-12 — Published 5.15.8 Venice prompt hotfix

### What Changed
- Updated homepage and `/get` desktop version references to 5.15.8.
- Added release notes for desktop 5.15.8 and Chrome extension 5.22.
- Updated FAQ and privacy copy so Venice.ai is named consistently without referring to "Venice chats" in product overview copy.

### Verification
- Confirmed public download URLs return `200` for the 5.15.8 desktop artifacts, update feeds, and 5.22 extension ZIP.
- Confirmed release copy stays customer-facing and avoids internal process language.

### Status
- Ready to deploy via Cloudflare Pages on push.

---
## 2026-05-12 — Tightened Venice.ai product-page wording

### What Changed
- Changed homepage and metadata references from "Venice chats" to "Venice.ai".
- Removed the homepage "Limited support" label from the platform strip.
- Kept chat-only limitations in release notes and support copy where users expect setup details.

### Verification
- Confirmed product-facing homepage copy no longer says "Venice chats" or "Limited support".
- Confirmed `git diff --check` passes.

### Status
- Ready to deploy via Cloudflare Pages on push.

---
## 2026-05-12 — Published Venice limited-support release copy

### What Changed
- Updated homepage, support, privacy, terms, and release notes copy for desktop 5.15.7 and extension 5.21.
- Added customer-facing limited Venice.ai chat support guidance, including the video play-before-save caveat.
- Updated `/get` to point at the 5.15.7 desktop downloads and refreshed sitemap lastmod values for changed public pages.

### Verification
- Confirmed public download URLs return `200` for the 5.15.7 desktop artifacts, update feeds, and 5.21 extension ZIP.
- Confirmed static copy avoids internal release-process language.
- Confirmed `git diff --check` passes.

### Status
- Ready to deploy via Cloudflare Pages on push.

---
## 2026-05-11 — Search Console CTR and Grok query follow-up

### What Changed
- Added `/blog-manage-grok-favorites` for the Search Console query family around managing favorites in Grok/xAI.
- Tightened titles and meta descriptions on the homepage and Grok articles to better match high-impression queries.
- Added stronger internal links from the homepage, guides, FAQ, support, and related article blocks into the Grok content cluster.
- Updated `sitemap.xml` with the new article and May 11 lastmod values for changed pages.

### Verification
- Confirmed changed static pages, `sitemap.xml`, and `robots.txt` return `200` on a local server.
- Confirmed changed pages have titles, canonicals, and valid JSON-LD where present.
- Confirmed internal link targets in changed pages resolve to existing site files.
- Confirmed `sitemap.xml` parses as valid XML.
- Confirmed `git diff --check` passes.

### Status
- Ready to review and deploy via Cloudflare Pages on push.

---
## 2026-05-08 — Added Hit the Griddy support download

### What Changed
- Published `hit-the-griddy.js` as a static support download.
- Added a Higgsfield helper section to `support.html` with usage steps and a direct download link.

### Verification
- Confirmed the helper script file exists in the site root.
- Confirmed the support page links to `/hit-the-griddy.js`.

### Status
- Ready to deploy via Cloudflare Pages on push.

---
## 2026-05-08 — Added public release copy rule

### What Changed
- Added `AGENTS.md` for site-specific guidance.
- Added a release-copy rule requiring public release notes to describe customer-visible outcomes only.
- Explicitly moved branch/provenance/build/process language to internal docs such as `DEVLOG.md`, PR descriptions, and handoff notes.

### Verification
- Confirmed the rule covers release notes, homepage copy, download pages, and support pages.

### Status
- Ready to deploy via Cloudflare Pages on push.

---
## 2026-04-26 — Search Console SEO pass and Grok content cluster

### What Changed
- Reviewed Google Search Console performance, indexing, sitemap, HTTPS, FAQ enhancement, removals, and links data.
- Added `search-console-seo-report-2026-04-26.md` with findings, recommendations, and a 30-day traffic plan.
- Added `/blog-download-grok-imagine-favorites` to target high-intent Grok favorites bulk-download queries.
- Reworked the two existing Grok blog pages for clearer search intent around disappeared favorites, bulk download, prompt preservation, and local backup.
- Added visible internal links from the homepage, guides, FAQ, and support pages into the Grok content cluster.
- Updated `sitemap.xml` with the new article and fresh `lastmod` values for changed pages.

### Verification
- Confirmed changed static pages, `sitemap.xml`, and `robots.txt` return `200` on a local server.
- Confirmed changed pages have titles, canonicals, and valid JSON-LD where present.
- Confirmed internal link targets in changed pages resolve to existing site files.
- Confirmed `sitemap.xml` parses as valid XML.

### Status
- Ready to review and deploy via Cloudflare Pages on push.

---
## 2026-04-24 — Published 5.15.1 download links and release notes

### What Changed
- Added release notes for desktop 5.15.1 and Chrome extension 5.18.
- Updated `/get` so macOS and Windows downloads resolve to 5.15.1 artifacts.
- Updated the homepage visible version badge and structured-data software version.
- Uploaded the 5.15.1 desktop artifacts, update YAMLs, blockmaps, and 5.18 extension ZIP to R2 at both `updates/` and the public bucket root.

### Verification
- Confirmed public R2 URLs return 200 for the 5.15.1 DMG, macOS ZIP, Windows EXE, extension ZIP, `latest-mac.yml`, and `latest.yml`.

---
## Rules / Conventions

### R2 release artifacts must live at the bucket root
The public hostname `downloads.gencatalog.app` serves from the **root** of the `gencatalog-downloads` R2 bucket — **not** from `updates/`.

When a release is uploaded to `gencatalog-downloads/updates/...`, the site's download buttons (which point at `downloads.gencatalog.app/GenCatalog-X.Y.Z-universal.dmg`) return `File not found` to end users.

**On every release, copy these files from `updates/` to the bucket root:**
- `GenCatalog-<version>-universal.dmg` + `.blockmap`
- `GenCatalog-<version>-universal-mac.zip` + `.blockmap`
- `GenCatalog-<version>-Setup.exe` + `.blockmap`
- `GenCatalog-Extension-v<version>.zip` (if a new extension ships)
- `latest.yml` (overwrites prior — flips electron-updater on Windows)
- `latest-mac.yml` (overwrites prior — flips electron-updater on Mac)

Fast way (rclone with the `r2` remote configured):
```
for f in <files>; do rclone copyto "r2:gencatalog-downloads/updates/$f" "r2:gencatalog-downloads/$f"; done
```

Verify each URL returns `200` via `curl -I https://downloads.gencatalog.app/<file>` before announcing the release. Leave the `updates/` copies in place as an archive.

---
## Update: Windows download button + support FAQ content on homepage
### Date: 2026-02-25

### Files Modified:
- `index.html`
- `DEVLOG.md`

### What Changed:
1. Added a new Windows download button alongside the existing Mac download button in both homepage download areas:
   - URL: `https://downloads.gencatalog.app/GenCatalog-4.0.0-Setup.exe`
   - Label: `Download for Windows`
   - Reused existing `.btn-primary` styling for visual consistency.
2. Added a small warning note under each Windows button:
   - `Windows may show a security warning — click 'More info' then 'Run anyway'.`
3. Added a new `Support & FAQ` section on the homepage with two entries:
   - `Intel Mac — Video Thumbnails`
   - `Windows — Video Thumbnails`
   - Included the provided ffmpeg setup guidance text for each platform.
4. Updated homepage availability copy to remove “Windows support coming soon” language.

### Verification:
1. Confirmed both Windows buttons and warning notes are present in `index.html`.
2. Confirmed new support section appears with both requested entries and copy.

### Status:
- Ready to deploy via Cloudflare Pages on push.

---
## 2026-05-28 — Published 5.15.14 desktop hotfix surfaces

### What Changed
- Updated `/get` so macOS and Windows downloads resolve to 5.15.14 artifacts.
- Updated the homepage visible version badge and structured-data software version.
- Added customer-facing release notes for GenCatalog 5.15.14 while leaving the Chrome extension at 5.28.

### Verification
- Confirmed public R2 URLs returned 200 for the 5.15.14 DMG, macOS ZIP, Windows EXE, `latest-mac.yml`, and `latest.yml`.
- Confirmed the updater feeds report version 5.15.14.

### Status
- Ready to deploy via Cloudflare Pages on push.
