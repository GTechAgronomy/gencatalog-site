# GenCatalog Site Development Log

---
## 2026-05-23 — Published 5.15.12 Grok URL visibility release

### What Changed
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
