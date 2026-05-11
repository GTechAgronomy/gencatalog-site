# GenCatalog Site Development Log

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
