# GenCatalog Site Development Log

---
## 2026-07-23 — Publish GenCatalog 5.16.81

### Customer-facing change

- Advanced the homepage and download experience from desktop `5.16.80` to
  `5.16.81` after both public installers returned HTTP `200`.
- Added one customer-facing App Polish note: large imports stay responsive when
  external catalog storage is slow or temporarily unavailable.
- Preserved the existing homepage, product claims, extension version, pricing,
  support content, and all unrelated release notes.

### Files

- `index.html`
- `get.html`
- `release-notes.html`
- `DEVLOG.md`

The homepage and release-notes sitemap dates were already July 23, so the
version helper correctly produced no `sitemap.xml` diff.

### Validation

- `bash scripts/update-version.sh --check` — passed with every public version
  surface at `5.16.81` and both installers returning HTTP `200`.
- `node scripts/check-crawl-freshness.mjs` — passed across 26 sitemap URLs and
  26 indexable canonical HTML files.
- `node scripts/test-html-validator.mjs`, `xmllint --noout sitemap.xml`, and
  `git diff --check` — passed.
- The older optional subscription-draft audit still expects an annual checkout
  URL in `llms.txt` that current `origin/main` no longer contains. This release
  does not change `llms.txt`, pricing, or checkout behavior, and the active
  deploy workflow does not run that stale assertion.
- Release PR `#47` passed its Cloudflare Pages check and merged as `9ed7611`.
  The main-branch crawl-verification and cache-purge workflow passed against
  that exact merge commit.
- Cache-busted production requests confirmed the homepage, `/get`,
  `/release-notes`, and `sitemap.xml` at HTTP `200`. The homepage structured
  data, hero, footer, and download handoff all report `5.16.81`; release notes
  contain exactly one Latest marker and one `5.16.81` heading, while preserving
  the complete `5.16.80` entry.

---
## 2026-07-23 — Harden crawler freshness and cache invalidation

### Diagnosis

- Direct custom-domain, Pages-origin, cache-busted, and no-cache requests all
  returned current HTML with `Cache-Control: public, max-age=0,
  must-revalidate`; the custom domain reported `CF-Cache-Status: DYNAMIC` with
  no `Age`.
- The production Pages deployment matched current `main`, so the July crawler
  evidence was not reproducible at the active EWR edge or the Pages hostname.
- HTML responses had neither `ETag` nor `Last-Modified`, 22 sitemap entries
  understated their pages' actual July change dates, and legacy crawlable
  references remained in several otherwise-current pages.

### Changes

- Added content-derived weak ETags plus sitemap-backed `Last-Modified` dates
  for successful HTML responses, with correct conditional-request handling
  through Pages middleware. Browser copies must revalidate, while
  `Cloudflare-CDN-Cache-Control: no-store` keeps HTML out of Cloudflare's
  shared edge cache.
- Changed the zone-wide Browser Cache TTL from four hours to Respect Existing
  Headers so the Pages response policy is not lengthened at Cloudflare.
- Updated `sitemap.xml` dates to match the corresponding page changes and added
  a crawl-freshness guard that checks sitemap coverage, dates, robots,
  canonical/noindex boundaries, current facts, and stale markers.
- Updated `llms.txt`, added `llms-full.txt`, repaired old homepage anchors and
  Grok navigation labels, updated structured-data logo URLs, and removed the
  orphaned legacy PNG.
- Added a main-branch workflow that waits for the matching Pages production
  deployment before purging the zone cache, plus a manual purge script.

### Validation

- `node scripts/check-crawl-freshness.mjs` — passed for 26 sitemap URLs and 26
  indexable canonical HTML files.
- `node scripts/test-html-validator.mjs` — passed.
- Local Pages runtime — all seven audited HTML routes returned unique
  content-derived ETags and `304` for matching `If-None-Match`.
- `xmllint --noout sitemap.xml`, `bash scripts/update-version.sh --check`, and
  `git diff --check` — passed.

---
## 2026-07-21 — Refresh the homepage for Sources and Generation Recipes

### Scope and decisions

- Preserved the homepage headline, problem framing, structure, pacing, pricing
  model, and closing promise. The central customer outcome remains an organized,
  searchable local library; the refresh updates the parts of that story that
  had begun to undersell the product.
- Reframed prompt and metadata preservation as preserving how a result was
  made, then introduced Generation Recipes once as the product name for that
  richer record. Kept familiar prompt, model, setting, and resource language
  everywhere else rather than repeating the term throughout the page.
- Expanded the workflow from browser capture and one-time imports to Sources
  and watched folders. Public copy leads with the customer benefit—new work
  appearing automatically while originals remain in place—and avoids internal
  acquisition terminology.
- Aligned the page title, social descriptions, SoftwareApplication schema, and
  visible FAQ schema with the refreshed Sources and recipe story.
- Kept the closing positioning unchanged. “Searchable library” remains the
  clearest immediate promise; creative history is the value GenCatalog
  preserves inside that library, not a replacement category.

### Visuals

- Replaced the older detail screenshot with a current Generation Recipe view.
- Replaced the simplified Recipe Card with a full export based on a ComfyUI
  workflow: one checkpoint, three LoRAs, two generation stages, settings,
  resources, and original embedded evidence. The fixture artwork is original,
  public-safe, and contains no customer content.
- Replaced the one-time import panel with the current Sources screen showing
  connected watched folders and live status.
- Retained the existing homepage CSS after desktop and mobile review; the new
  assets fit the established layout without responsive changes.

### Files

- `index.html`
- `uploads_v2/GenerationRecipeView-20260721.webp`
- `uploads_v2/GenerationRecipeExport-20260721.webp`
- `uploads_v2/SourcesWatchedFolders-20260721.webp`
- `DEVLOG.md`

### Validation

- Parsed all three JSON-LD blocks in `index.html` — passed.
- `node scripts/check-subscription-draft.mjs` — passed across 30 customer files
  and 53 JSON-LD blocks.
- `bash scripts/update-version.sh --check` — passed with every public version
  surface at 5.16.78 and both release artifacts returning HTTP `200`.
- Desktop review at 1440px and mobile review at 390px — no horizontal overflow;
  all new images load at their declared aspect ratios.
- `git diff --check` — passed.

### Lesson

The product has not outgrown its central story. It has outgrown several
descriptions inside that story: “prompts and metadata” no longer conveys the
workflow knowledge GenCatalog can preserve, and “local import” no longer
conveys the continuing value of Sources and watched folders.

### Browser review refinements

- Added an intentional break before “Not just the file.” in the save heading.
- Added an intentional break before “New work appears automatically.” and
  removed the restrictive heading-width constraint so the sentence can occupy
  its own line when space permits.
- Kept “See what one parameter changes.” on one line at desktop widths while
  preserving normal wrapping on mobile.
- Verified the three headings at the annotated 1784px desktop viewport and a
  390px mobile viewport with no horizontal overflow.
- Replaced the CSS-dependent sentence breaks with explicit HTML line breaks
  after a cached older stylesheet rendered the sentences together. Advanced
  the homepage stylesheet cache key so the associated heading refinements load
  reliably for returning visitors.
- Vertically centered the Find section copy beside its tall sidebar screenshot
  so the text and visual read as one balanced composition instead of leaving
  the explanation pinned to the top of the section.

---
## 2026-07-19 — Publish GenCatalog 5.16.74

- Added customer-facing release notes for the thoughtfully timed, one-time
  Chrome Web Store review request and the privacy-preserving aggregate signals
  used to improve the trial and onboarding experience.
- Advanced the shared Mac and Windows version surfaces only after both final
  artifacts, their blockmaps, and both updater feeds were public at the bucket
  root and `updates/` paths.
- Kept the release note focused on what customers can see and rely on; build,
  repository, receiver, and deployment proof remains in internal logs.

### Files

- `release-notes.html`
- `index.html` and `get.html` through `scripts/update-version.sh 5.16.74`
- `DEVLOG.md`

The sitemap already carried the current July 19 last-modified date, so the
version updater correctly produced no sitemap diff.

### Validation

- `scripts/update-version.sh 5.16.74` — passed the live-artifact gate and
  aligned all public desktop version surfaces.
- `scripts/update-version.sh --check` — passed with both 5.16.74 artifacts
  returning HTTP `200`.
- Parsed all JSON-LD blocks in `index.html` and `faq.html` — passed.
- `git diff --check` — passed.

---
## 2026-07-19 — Disclose anonymous journey analytics

- Updated the privacy policy and FAQ to describe the refreshed notice for older
  former-default-off installations while preserving explicit opt-outs.
- Disclosed the coarse journey milestones, local-only opaque completion
  markers, and the absence of a persistent identifier or person-level journey.
- Added the integrated review-request counts and their broad bucket limits.
- Kept the visible FAQ answer aligned with FAQPage JSON-LD.
- Verified `git diff --check` and parsed every JSON-LD block in both pages.

### Lesson

“Existing choices are preserved” was too broad once ambiguous legacy defaults
and explicit opt-outs required different handling.

---
## 2026-07-19 — Clarify the homepage subscription value

- Replaced only the paragraph beneath “The subscription pays for tomorrow.”
  with the founder-approved explanation of what the subscription funds.
- Preserved the existing markup, emphasized ownership promise, layout,
  typography, spacing, hierarchy, styling, and every other copy surface.

---
## 2026-07-19 — Publish the 5.16.73 completed-trial library repair

### Scope and decision

- Advance the public Mac and Windows desktop surfaces to `5.16.73` only after
  both final artifacts and updater feeds are live at the download host.
- Explain the customer-visible outcome plainly: reaching the seven-day or
  250-save boundary pauses new capture but leaves every saved trial item
  available to browse, organize, compare, export, and manage.
- Include the prompt-navigation and Slideshow shortcut improvements without
  adding pricing or internal release-process details.
- Preserve all subscription, policy, extension, analytics, and unrelated site
  copy exactly as published.

### Files

- `release-notes.html`
- `index.html` and `get.html` through the established
  `scripts/update-version.sh 5.16.73` release gate
- `DEVLOG.md`

The sitemap already carried the current July 19 last-modified date, so the
version updater correctly produced no sitemap diff.

---
## 2026-07-19 — Publish the Windows 5.16.72 trial-startup hotfix

### Scope and decision

- Advance the public latest-desktop surfaces to `5.16.72` only after the
  Windows installer and updater manifest return HTTP `200` from production and
  the public installer matches the approved local SHA-256.
- Point Windows downloads directly to `5.16.72` so a new customer receives the
  repaired trial behavior on first launch.
- Keep the Mac download and updater feed on the already accepted, notarized
  `5.16.71` artifact. The trial-anchor defect is Windows-specific; an attempted
  `5.16.72` Mac build correctly stopped when Apple rejected the saved
  notarization credential, and no unnotarized artifact was published.
- Teach the existing release checker to verify the current Windows and Mac
  artifacts independently. Its normal version-bump command still converges
  both platforms to one version and refuses the bump until both artifacts are
  public.

### Files

- `index.html`
- `get.html`
- `release-notes.html`
- `scripts/update-version.sh`
- `DEVLOG.md`

### Customer-facing boundary

- Release copy says only that new Windows installations now begin the complete
  free trial reliably, including on established Windows accounts.
- No pricing, subscription policy, extension, analytics, Mac download,
  navigation, or unrelated site copy changed.

---
## 2026-07-19 — Prepare the public 5.16.71 subscription launch

### Scope and decision

- Advance the public desktop download surfaces from `5.16.70` to `5.16.71`
  only after the Mac and Windows artifacts return HTTP 200 from the production
  download host.
- Add a customer-facing `5.16.71` / Extension `5.121` release entry limited to
  current platform compatibility and the user-visible reliability fixes in
  this release. Keep pricing and commercial-policy details on the homepage,
  FAQ, support, and policy surfaces rather than the release notes.
- Preserve the founder-approved subscription and policy copy exactly. Do not
  reopen the settled commercial model during release closeout.

### Files

- `release-notes.html`
- `index.html`, `get.html`, and `sitemap.xml` through the established
  `scripts/update-version.sh 5.16.71` release gate
- `DEVLOG.md`

### Launch boundary

- Publish the site only after the desktop artifacts and Extension `5.121` are
  independently confirmed public.
- Keep the legacy perpetual Lemon Squeezy product unchanged. Enable only the
  approved `$99/year` product after the website is live, then verify checkout,
  downloads, update feeds, subscription authority health, and both license
  classes.

---
## 2026-07-19 — Simplify the homepage subscription promise

### Scope and decision

- Replace the homepage pricing card copy with the founder-approved commercial
  message: “The subscription pays for tomorrow. Your library is always yours.”
- Keep the card focused on trial terms, ongoing product value, the individual
  device allowance, and the permanent ownership promise.
- Remove first-payment, paid-period, cancellation-lifecycle, and lapse mechanics
  from the visible homepage. Those operational details remain available where
  customers expect them: FAQ, Terms, refund policy, and trial-complete surfaces.
- Align the Index price FAQ metadata with the same plain-language promise so
  search results do not reintroduce the operational copy removed from the page.
- Preserve the annual checkout URL, free-trial destination, pricing, behavior,
  navigation, and existing visual structure.

### Files

- `index.html`
- `scripts/check-subscription-draft.mjs`
- `DEVLOG.md`

### Validation and boundary

- Update the draft guard to require the new homepage ownership language and
  reject the displaced lifecycle phrases on the Index while continuing to
  require those details on the appropriate policy and support pages.
- Run the complete subscription-draft guard and diff checks locally.
- Keep the branch local. No push, deployment, checkout submission, sales
  activation, or website publication.

---
## 2026-07-18 — Standardize the Second Act Labs copyright notice

### Scope and decision

- Replace the three existing website-footer copyright variants with the exact
  approved notice: “© 2026 Second Act Labs. All rights reserved.”
- Apply it to every one of the 23 existing root HTML footers, including the
  homepage, resource pages, platform pages, guides, and blog pages. Existing
  footer structure, links, spacing, typography, and responsive behavior remain
  unchanged.
- Add a sitewide footer assertion to the existing subscription-draft guard so
  every current or future root HTML page with a footer must carry the canonical
  notice exactly once.

### Files

- Footer copy only in the 23 existing HTML files reported by
  `rg -l '<footer' --glob '*.html'`.
- `scripts/check-subscription-draft.mjs`
- `DEVLOG.md`

### Validation and boundary

- Run the complete subscription-draft guard, public-version check, diff check,
  and desktop/mobile footer visual review.
- Keep the branch local. No push, deployment, checkout submission, or website
  publication.

---
## 2026-07-18 — Clarify the permanent library promise

### Scope

- Founder review identified that “paid library” can sound as though some saved
  items are paid and others are not.
- Change only the ownership promise on the homepage pricing card and the three
  matching FAQ/Support/Terms lifecycle explanations. Do not otherwise polish,
  restructure, or alter the approved subscription copy.

### Files

- `index.html`
- `faq.html`
- `support.html`
- `terms.html`
- `scripts/check-subscription-draft.mjs`
- `DEVLOG.md`

### Copy decision

- The homepage now says: “Everything already in your library remains yours
  after your first payment.”
- Support uses the same ownership language while preserving the operational
  explanation of what pauses after a subscription ends.
- Terms refers to “your existing library,” not an “already-paid library.”
- The draft guard rejects future “paid library” and “already-paid library” copy
  across customer-facing sources.

### Boundary and validation

- Regenerate the affected desktop/mobile pricing and lifecycle screenshots,
  rerun the complete subscription-draft and public-version checks, and keep the
  branch local. No push, deployment, checkout submission, or sales activation.

---
## 2026-07-18 — Prepare the annual-subscription website draft

### Source and exact boundary

- Worktree:
  `/Users/danieldavis/Dev/worktrees/gencatalog-site-subscription-draft`.
- Branch: `codex/subscription-site-draft`, created from exact clean
  `origin/main` commit `daa0d77`.
- The canonical site checkout remains on `main` with its unrelated telemetry
  changes and uncommitted Midjourney testimonial untouched. The clean draft
  changes a separate commercial-copy hunk in `midjourney.html`; reconcile that
  file only after the testimonial work is committed in its own task.
- This is a local founder-review draft. No git push, PR, Cloudflare deployment,
  public checkout change, Lemon product publication, or website publication is
  authorized or performed.

### Commercial message

- New customers see one `$99/year`, billed-annually plan after the familiar
  seven-day-or-250-save trial; no card is required for the trial.
- Lead with the customer promise: “The subscription pays for tomorrow. Your
  library is always yours.” After the first payment, ending or refunding the
  subscription pauses new capture and imports without taking away management
  of work already in the catalog.
- Explain paid-through cancellation, renewal, three device activations,
  verification outages, current release availability, and permanent
  grandfathering without exposing runtime implementation language.
- Trial users who never paid are described honestly: GenCatalog pauses at the
  fork, while the files in their chosen catalog folder stay on their computer
  and are never deleted.

### Customer surfaces

- `index.html`
- `get.html`
- `faq.html`
- `support.html`
- `terms.html`
- `refund.html`
- `privacy.html`
- `llms.txt`
- `ai-generation-backup.html`
- `arcana.html`
- `blog-grok-favorites-disappeared.html`
- `blog-organize-grok-imagine.html`
- `comfyui-workflow-viewer.html`
- `digen.html`
- `grok.html`
- `higgsfield.html`
- `local-ai-media-import.html`
- `midjourney.html`
- `rescue-your-ai-library.html`
- `save-ai-prompts-locally.html`
- `search-grok-favorites.html`
- `brand/BRAND-VOICE.md`

### Validation and safety files

- `scripts/check-subscription-draft.mjs`
- `DEVLOG.md`

### Structured data and attribution

- Every priced `SoftwareApplication` offer now reports `$99 USD`, the approved
  annual checkout, and `UnitPriceSpecification.billingDuration: P1Y`.
- Homepage Open Graph, Twitter, FAQ schema, crawler copy, and visible pricing
  agree with the annual model.
- The existing generic Lemon checkout decorator continues to attach first/last
  source, channel, and surface attribution to the new checkout without code
  changes.

### Deliberate release boundary

- Keep public desktop download/version surfaces at `5.16.70` in this draft.
  The site must not point at `5.16.71` until compatible Mac and Windows
  artifacts actually exist at the public download URLs; the established
  version script enforces that later release gate.
- The draft contains the approved production annual checkout URL so copy and
  attribution can be reviewed exactly, but it exists only in this unpushed
  worktree.

### Validation

- `node scripts/check-subscription-draft.mjs`
- `git diff --check`
- Legacy `$79`, one-time-purchase, all-5.x, and legacy checkout sweep across
  customer HTML/text sources.
- JSON parsing for every JSON-LD block and annual-offer assertions for all
  priced application pages.
- Local Chromium review at desktop and mobile widths for homepage pricing,
  download handoff, subscription FAQ, support, terms, refund, and privacy.
- Review screenshots:
  `/Users/danieldavis/.codex/visualizations/2026/07/17/019f70df-3e35-74a1-b353-7764ae672134/subscription-launch-candidate-5.16.71/website-draft`.

### Parking record

- Keep this branch and worktree local for founder review. Do not push or deploy.
- Next action: incorporate review notes, reconcile the separately owned
  `midjourney.html` testimonial, rerun the draft guard and screenshots, then
  wait for compatible public desktop and extension releases before any site
  cutover.

---
## 2026-07-08 — Published 5.16.51 large-batch smoothness release

### What Changed
- Bumped public desktop download/version surfaces from 5.16.50 to 5.16.51 after
  the Mac and Windows artifacts were live.
- Added the 5.16.51 release note for smoother large-batch catalog saves and
  lighter sidebar refreshes during active imports.

### What I Learned
- Public copy for this release should stay focused on the practical feeling:
  fewer pauses while new items are being added to large catalogs, especially on
  external drives.

### Verification
- `scripts/update-version.sh 5.16.51`
- `scripts/update-version.sh --check`

### Status
- Ready to deploy via Cloudflare Pages on push.

---
## 2026-07-04 — Published 5.16.44 desktop polish release

### What Changed
- Bumped public desktop download/version surfaces from 5.16.43 to 5.16.44 after
  the Mac and Windows artifacts were live.
- Added the 5.16.44 release note for more native desktop behavior, right-click
  catalog actions, smoother search typing, and cleaner accessibility/motion
  behavior.

### What I Learned
- This release is best described publicly as desktop polish users can feel:
  expected app menus, remembered windows, useful context menus, and fewer
  rough edges while typing or navigating.

### Verification
- `scripts/update-version.sh 5.16.44`
- `scripts/update-version.sh --check`

### Status
- Ready to deploy via Cloudflare Pages on push.

---
## 2026-07-04 — Published 5.16.42 integrated repair release

### What Changed
- Bumped public desktop download/version surfaces from 5.16.41 to 5.16.42 after
  the Mac and Windows artifacts were live.
- Added the 5.16.42 release note for the integrated ComfyUI, Higgsfield,
  Midjourney, Local files color, and Shift+Arrow selection fixes.

### What I Learned
- Public release copy should describe the visible recovery: one build that
  includes the recent fixes users rely on, without exposing branch cleanup or
  release-source mechanics.

### Verification
- `scripts/update-version.sh 5.16.42`
- `scripts/update-version.sh --check`

### Status
- Ready to deploy via Cloudflare Pages on push.

---
## 2026-07-04 — Published 5.16.41 Higgsfield video repair

### What Changed
- Bumped public desktop download/version surfaces from 5.16.40 to 5.16.41 after
  the Mac and Windows artifacts were live.
- Added the 5.16.41 release note for Higgsfield video repair sync and safer
  bulk video imports that avoid saving preview thumbnails as videos.

### What I Learned
- Public release copy should state the customer-visible Higgsfield outcome:
  broken thumbnail-only records are repaired by sync, and unavailable video
  media fails clearly instead of creating another bad catalog item.

### Verification
- `scripts/update-version.sh 5.16.41`
- `scripts/update-version.sh --check`

### Status
- Ready to deploy via Cloudflare Pages on push.

---
## 2026-07-03 — Updated ComfyUI import website copy

### What Changed
- Updated the homepage metadata, platform strip, source-filter copy, and Local
  Import feature section to describe ComfyUI output imports and embedded
  workflow metadata.
- Expanded FAQ metadata, structured FAQ data, visible platform guidance, and
  local import answers with ComfyUI prompts, checkpoints, settings, and LoRAs.
- Added support-page ComfyUI import guidance under Local Media Import, including
  LoRA strength/model/clip values and the source-versus-checkpoint distinction.
- Reworked the local AI media import SEO page around ComfyUI output folders
  while keeping ordinary downloaded media and API outputs covered.

### What I Learned
- The clearest public framing is that ComfyUI is a creation tool/import source,
  while the checkpoint remains the searchable model. The copy should emphasize
  automatic metadata recovery when embedded data exists, then manual review for
  ordinary local files.

### Verification
- `node` JSON-LD parse check for `index.html`, `faq.html`, `support.html`, and
  `local-ai-media-import.html`
- `git diff --check`
- `xmllint --noout sitemap.xml`
- `scripts/update-version.sh --check`
- Pending: live production polling after push.

### Status
- Ready to deploy via Cloudflare Pages on push.

---
## 2026-07-03 — Published 5.16.40 ComfyUI LoRA hotfix

### What Changed
- Bumped public desktop download/version surfaces from 5.16.39 to 5.16.40 after
  the Mac and Windows artifacts were live.
- Added the 5.16.40 release note for fuller ComfyUI LoRA metadata capture,
  readable stacked LoRA lists, and compact ComfyUI Recipe Cards.

### What I Learned
- Public ComfyUI copy should separate detail-panel fidelity from shareable
  Recipe Card readability: full LoRA details belong in the app detail view,
  while cards need a concise summary.

### Verification
- `scripts/update-version.sh --check`
- `xmllint --noout sitemap.xml`
- `git diff --check`

### Status
- Ready to deploy via Cloudflare Pages on push.

---
## 2026-07-03 — Published 5.16.39 ComfyUI release and SEO page

### What Changed
- Bumped public desktop download/version surfaces from 5.16.38 to 5.16.39 after
  the Mac and Windows artifacts were live.
- Added the 5.16.39 release note for ComfyUI folder imports, searchable ComfyUI
  settings and LoRAs, and clearer ComfyUI/Rogue Studio labels.
- Added `/comfyui-workflow-viewer` as a search-intent page for creators who
  need to browse and search ComfyUI output folders, embedded workflow metadata,
  prompts, checkpoints, seeds, CFG, sampler/scheduler settings, and LoRAs.
- Linked the new page from Guides, local import, AI backup, prompt recovery,
  rescue, `llms.txt`, and `sitemap.xml`.

### What I Learned
- The strongest public framing is "ComfyUI output folder to searchable local
  workflow library." ComfyUI should be described as a creation tool/source, with
  checkpoints and LoRAs presented as searchable generation ingredients.

### Verification
- `scripts/update-version.sh 5.16.39`
- `scripts/update-version.sh --check`

### Status
- Ready to deploy via Cloudflare Pages on push.

---
## 2026-07-03 — Strengthened local AI media import narrative

### What Changed
- Reworked `/local-ai-media-import` from a feature-first explanation into a recovery-focused page for creators with existing AI download folders, exported ZIPs, external drives, local tool outputs, and old projects.
- Moved the core insight higher: the files may be saved, but the archive is not usable when creative context is gone.
- Added a Before/After comparison, a Local Import differentiator section for yesterday's work, an anonymous Chrome Web Store proof quote, and an outcome-led CTA.
- Updated meta and structured-data language to include natural search phrases around downloaded AI images, downloaded AI videos, existing AI generations, AI prompt archive, and AI media library.

### What I Learned
- The stronger conversion story is emotional recovery first, file import second: GenCatalog helps users rediscover and reconnect with a library they already spent time building.

### Verification
- `git diff --check`
- `scripts/update-version.sh --check`
- Local `curl` smoke confirmed `/local-ai-media-import.html` and `uploads_v2/LocalImportReview.png` return `200`, and the served page includes the new hero, Before/After section, proof quote, and CTA.

### Status
- Ready to deploy via Cloudflare Pages on push.

---
## 2026-07-03 — Added prompt recovery intent pages

### What Changed
- Added `/save-grok-prompts` for Grok creators who need to preserve prompts, source context, and saved outputs together.
- Added `/save-ai-prompts-locally` for the broader local AI prompt archive workflow.
- Linked both pages from `/guides` and added them to `sitemap.xml`.

### What I Learned
- The site does not have a separate generator for the problem-intent pages; the existing static guide/article pages provide the reusable problem, workflow, related-links, and CTA structure.
- The prompt-preservation copy should stay focused on creator recovery: find the file, recover the prompt, understand the context, and make the next GenCatalog action explicit.

### Verification
- `git diff --check`
- `xmllint --noout sitemap.xml`
- `scripts/update-version.sh --check`

### Status
- Ready to deploy via Cloudflare Pages on push.

---
## 2026-07-03 — Added local AI media import SEO page

### What Changed
- Added `/local-ai-media-import` as a problem-intent SEO page for AI creators with existing folders of downloaded generations.
- Focused the page on the concrete GenCatalog local import workflow: Import button, drag-and-drop, Settings import, duplicate hash checks, batch review, tags, prompts, notes, and search.
- Added the page to the Guides index and sitemap so it is internally linked and discoverable.

### What I Learned
- Local import is already described in support/FAQ as a customer-facing workflow, so the new page mirrors those exact entry points and file-type claims instead of inventing broader import promises.
- The strongest intent is not generic "AI organizer"; it is the folder-to-library transition for people whose media is saved but not retrievable.

### Verification
- `git diff --check`
- `xmllint --noout sitemap.xml`
- `scripts/update-version.sh --check`

### Status
- Ready to deploy via Cloudflare Pages on push.

---
## 2026-07-03 — Added Chrome extension 5.64 availability note

### What Changed
- Added a latest-release note that Rogue Studio support and the new Higgsfield bulk sync require Chrome extension 5.64.
- Noted that extension 5.64 has been uploaded to the Chrome Web Store and will be available after approval.

### Verification
- Confirmed the latest release notes include a Chrome extension 5.64 availability note.
- `git diff --check`

### Status
- Ready to deploy via Cloudflare Pages on push.

---
## 2026-07-03 — Shortened Grok large-library release copy

### What Changed
- Rewrote the Grok large-library release note to focus on the user-visible reliability improvement instead of connection-recovery details.

### Verification
- Confirmed the release-note paragraph no longer mentions extension connection or tab reconnection details.
- `git diff --check`

### Status
- Ready to deploy via Cloudflare Pages on push.

---
## 2026-07-03 — Simplified Higgsfield release-note copy

### What Changed
- Rewrote the Higgsfield bulk-sync release note to describe the customer outcome instead of background-worker implementation details.

### Verification
- Confirmed the release-note paragraph no longer mentions background-worker or service-worker implementation details.
- `git diff --check`

### Status
- Ready to deploy via Cloudflare Pages on push.

---
## 2026-07-02 — Removed Higgsfield helper support section

### What Changed
- Removed the support sidebar link and support-page instructions for the old Higgsfield helper script.
- Updated the Higgsfield bulk-save copy to describe the built-in Sync New flow that can open queued detail pages automatically for prompts and metadata.

### Verification
- Confirmed `support.html` no longer references `higgsfield-helper`, `Hit the Griddy`, `hit-the-griddy`, console steps, or `stopSync`.
- Confirmed the Higgsfield sidebar link list and bulk-save section render coherently in the edited HTML.
- `git diff --check`

### Status
- Ready to deploy via Cloudflare Pages on push.

---
## 2026-07-02 — Made telemetry dashboard useful

### What Changed
- Expanded `/admin/telemetry` from a basic counter page into an operator view
  with app opens, feature usage, library-size buckets, version adoption, daily
  app-open trend, platform/media/OS/failure breakdowns, recent aggregate rows,
  `?days=` range controls, and `?format=json` export.
- Updated `/api/telemetry` to accept the new allowlisted feature usage and
  bucketed library-size dimensions while keeping blocked content-shaped keys
  fail-closed.
- Kept the dashboard private behind Cloudflare Access headers.
- Added `scripts/telemetry-report.mjs` to generate the same kind of useful
  dashboard from R2 locally without running a Python localhost server.

### Verification
- Local function smoke confirmed HTML and JSON responses render with fake R2
  data and Access-shaped headers, including feature and library-size sections.
- Local function smoke confirmed the route still returns `403` without Access
  headers.
- `npx wrangler pages functions build .`
- Live spoofed Access-header check still returned `403`.
- `scripts/telemetry-report.mjs /tmp/gencatalog-telemetry-dashboard.html`
  generated a local HTML dashboard from the R2 summaries.
- Pending: deploy and live Access-protected dashboard check.

---
## 2026-06-29 — Wired privacy-safe telemetry storage

### What Changed
- Added a Cloudflare Pages R2 binding for dedicated telemetry storage.
- Updated `/api/telemetry` to store only allowlisted aggregate counters in R2
  daily summaries.
- Kept invalid or non-allowlisted telemetry fail-closed: unsupported payloads
  are ignored and no request metadata is stored.
- Updated `/admin/telemetry` into a private read-only dashboard that reads the
  summaries and requires Cloudflare Access headers.
- Added `.wrangler/` to `.gitignore` so local Cloudflare cache files stay out
  of commits.

### Verification
- `wrangler pages functions build .`
- Local module smoke confirmed a valid aggregate payload stores one R2 daily
  summary object.
- Local module smoke confirmed a blocked `prompt` dimension returns `204` and
  stores nothing.
- Local module smoke confirmed `/admin/telemetry` returns `403` without
  Cloudflare Access headers and renders with Access-shaped headers.

### Status
- `gencatalog-telemetry` R2 bucket created; ready to deploy via Cloudflare
  Pages.

---
## 2026-06-29 — Emphasized privacy plain-English promise

### What Changed
- Made the final plain-English privacy promise in `/privacy` bold and accent
  colored.

### Verification
- Confirmed the copy remains unchanged except for presentation.

### Status
- Ready to deploy via Cloudflare Pages on merge/push.

---
## 2026-06-29 — Published 5.16.32 site surfaces

### What Changed
- Added the GenCatalog 5.16.32 release notes entry.
- Updated homepage and download page version surfaces to 5.16.32.
- Kept the opt-in telemetry privacy scaffold and updated privacy-policy copy on
  the same deployment branch.

### Verification
- `scripts/update-version.sh 5.16.32`
- `scripts/update-version.sh --check`
- Confirmed the 5.16.32 macOS DMG and Windows installer returned `200` before
  bumping public version surfaces.

### Status
- Ready to deploy via Cloudflare Pages on merge/push.

---
## 2026-06-29 — Scaffolded opt-in telemetry surfaces

### What Changed
- Updated `/privacy` to describe opt-in aggregate app telemetry while keeping
  the local-library privacy promise explicit.
- Added a fail-closed `/api/telemetry` Cloudflare Pages Function scaffold that
  validates aggregate rows only and does not assume a storage binding.
- Added a disabled `/admin/telemetry` scaffold that requires Cloudflare Access
  headers before returning anything.
- Documented the remaining storage decision in code: Analytics Engine versus
  R2 daily summaries.

### Verification
- Local module smoke confirmed `/api/telemetry` returns `202` with
  `stored:false` for a schema-versioned aggregate payload.
- Local module smoke confirmed `/api/telemetry` returns `204` for a payload
  containing a blocked content key.
- Local module smoke confirmed `/admin/telemetry` returns `403` without
  Cloudflare Access headers and `501` scaffold-only with the Access header.
- `git diff --check`

### Status
- Ready to deploy after the app-side telemetry foundation is reviewed.

---
## 2026-06-29 — Cache-busted Recipe Card landing image

### What Changed
- Added `/recipe-card-demo-2026-06-29.webp` and pointed `/r.html` at it so
  the refreshed Recipe Card example is not blocked by immutable caching of the
  previous `/recipe-card-demo.webp` asset.

### Verification
- Confirmed the live old asset was still serving the previous 107540-byte file
  with `cache-control: public, max-age=31536000, immutable`.
- Confirmed the new asset is a 1040x1440 lossless WebP.

### Status
- Ready to deploy via Cloudflare Pages on push.

---
## 2026-06-29 — Refreshed Recipe Card landing example

### What Changed
- Replaced the `/r` landing page Recipe Card sample image with the supplied
  exported card.
- Kept the existing `/recipe-card-demo.webp` asset path so `/r.html` markup
  and public copy stayed unchanged.

### Verification
- Converted the supplied 1040x1440 PNG to a lossless WebP at the existing
  asset path.
- Confirmed `/r.html` still references `/recipe-card-demo.webp`.

### Status
- Ready to deploy via Cloudflare Pages on push.

---
## 2026-06-29 — Fixed live Recipe Card landing route

### What Changed
- Removed the `/r /r.html 200` Cloudflare Pages rewrite because Pages already
  canonicalizes `/r.html` to `/r`, and the rewrite caused a `/r` redirect loop.
- Embedded the small GenCatalog header mark directly in `/r.html` so the top
  left brand icon works in both live and local file previews.

### Verification
- Confirmed live `/r` was returning repeated `308 location: /r` responses
  before the fix.
- Confirmed the page still references the Recipe Card sample image.

### Status
- Ready to deploy via Cloudflare Pages on push.

---
## 2026-06-29 — Updated Recipe Card landing example

### What Changed
- Replaced the `/r` landing page example image with a real exported Recipe
  Card sample.
- Kept the existing `/recipe-card-demo.webp` asset path so the landing page
  markup did not need to change.

### Verification
- Confirmed the replacement asset is a 1040x1440 WebP.
- Confirmed `/r.html` still references `/recipe-card-demo.webp`.

### Status
- Ready to deploy via Cloudflare Pages on push.

---
## 2026-06-29 — Added Recipe Card attribution landing page

### What Changed
- Added `/r` as a lightweight Recipe Card landing page for campaign-level
  attribution from shared PNGs.
- Added a Cloudflare Pages rewrite from `/r` to `/r.html`.
- Kept the page generic: it explains that the shared image was made with
  GenCatalog, points visitors to download or learn more, and states that the
  shared image was not uploaded or tied to the exporter.
- Preserved incoming UTM parameters on the page CTAs so `/get` and homepage
  visits can keep the recipe-card campaign context.

### Files
- `r.html`
- `_redirects`
- `DEVLOG.md`

### Verification
- `git diff --check`
- Confirmed `recipe-card-demo.webp` and `GenCatalogLogo-64.webp` exist.
- Focused Node check confirmed inline scripts compile and the page includes
  the expected UTM-preserving links and privacy-safe generic copy.
- Focused Node check confirmed `_redirects` contains `/r /r.html 200`.

### Status
- Ready to review and deploy via Cloudflare Pages on push.

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

---
## 2026-07-09 — Published GenCatalog 5.16.55 and Extension 5.94 surfaces

### What Changed
- Added the customer-facing 5.16.55 / 5.94 release entry with two launch
  stories: complete source-to-video Recipe View lineage and Recipe Cards that
  pair the source/image prompt with the result/motion prompt.
- Updated `/get`, homepage structured data, and visible homepage/footer version
  badges from 5.16.54 to 5.16.55.
- Updated homepage and release-notes sitemap dates through the version helper.

### Verification
- Confirmed the 5.16.55 Mac and Windows artifacts returned HTTP 200 before the
  site version moved.
- Confirmed both updater-feed locations report 5.16.55 and all versioned
  artifacts, blockmaps, and Extension 5.94 ZIPs are live at the bucket root and
  under `/updates/`.
- Ran `scripts/update-version.sh --check` before publishing.

### Status
- Ready for Cloudflare Pages production deployment through the main branch.
## 2026-07-18 — Commercial policy refresh for annual subscription review

### Scope
- Standardized Terms, Refund Policy, FAQ, Privacy Policy, Support, homepage,
  JSON-LD, `llms.txt`, and trial-adjacent marketing copy on the approved annual
  subscription contract.
- Identified Lemon Squeezy as Merchant of Record, used the exact individual and
  device rule, and made the first successful payment the permanent-library
  threshold.
- Removed new-customer perpetual-sale language, legacy lifetime-update
  overpromises, broad post-lapse feature gating, and pre-payment "Your library
  is always yours" claims.
- Kept the draft local and unpublished.

### Files
- `ai-generation-backup.html`
- `comfyui-workflow-viewer.html`
- `digen.html`
- `faq.html`
- `grok.html`
- `higgsfield.html`
- `index.html`
- `llms.txt`
- `local-ai-media-import.html`
- `midjourney.html`
- `privacy.html`
- `refund.html`
- `rescue-your-ai-library.html`
- `save-ai-prompts-locally.html`
- `scripts/check-subscription-draft.mjs`
- `search-grok-favorites.html`
- `support.html`
- `terms.html`
- `DEVLOG.md`

### Validation
- `node scripts/check-subscription-draft.mjs` — passed across 30 customer
  files, 53 JSON-LD blocks, 23 canonical footers, and the annual checkout.
- The checker now rejects obsolete perpetual-sale, lifetime-update,
  payment-processor, device-activation, pre-payment ownership, former-business
  name, and broad subscription-funded-feature language.

### Provenance and parking note
- Re-authored only the three commits on this unpushed website draft as
  `Second Act Labs <support@gencatalog.app>`; published history was untouched.
- One additional wording-only consistency occurrence was found in
  `blog-organize-grok-imagine.html:600`. It is outside the approved file list
  and remains parked pending explicit approval to change "first payment" to
  "first successful payment."

### Lesson
The trial promise and the paid ownership promise must not collapse into one
slogan. Trial files stay on disk; permanent in-app access begins after the
first successful payment.

---
