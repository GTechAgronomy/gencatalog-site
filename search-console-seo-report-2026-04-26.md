# GenCatalog Search Console and SEO Report

Audit date: 2026-04-26
Property: `sc-domain:gencatalog.app`
Primary window reviewed: Google Search Console, last visible performance update 14.5 hours ago

## Executive Summary

GenCatalog is starting to get meaningful organic exposure: 16.5K impressions over the last 3 months, with a strong average position of 6.2. The issue is click capture, not discovery. The site is ranking or being tested for relevant searches, but the 0.3% CTR shows snippets and page intent need tightening.

The Grok content is the current organic wedge. The homepage still drives the most clicks, but the `Grok Imagine favorites disappeared` article is producing the most impressions and has already created new clicks in the last 28 days. That page should become the center of a small content cluster around Grok favorites, backup, download, and prompt preservation.

Technical SEO is mostly healthy. HTTPS is clean, the sitemap is valid, removals are clean, and FAQ structured data is valid. The main technical gaps are crawl/index freshness, `.html` duplicate redirect noise, and five important platform pages discovered but not yet indexed.

## Implementation Update

Implemented locally on 2026-04-26:

- Updated the homepage to expose crawlable internal links to `/grok`, `/midjourney`, `/higgsfield`, and `/digen`, plus visible workflow links into the Grok content cluster.
- Retitled and expanded the two existing Grok articles around the highest-intent Search Console terms: disappeared favorites, bulk download, prompts, backup, and local archive.
- Added a new article: `/blog-download-grok-imagine-favorites`, targeting `grok favorites bulk download` and related feature-intent queries.
- Added related Grok guide links to `/guides`, `/support`, and `/faq` to strengthen internal links from pages already getting impressions.
- Updated `sitemap.xml` with the new article and fresh `lastmod` values for changed pages.
- Verified changed pages locally return `200`, JSON-LD parses, internal link targets exist, and `sitemap.xml` parses as valid XML.

Pending after deploy:

- Submit the updated sitemap in Google Search Console.
- Request indexing for `/blog-download-grok-imagine-favorites`, `/grok`, `/midjourney`, `/higgsfield`, `/digen`, `/release-notes`, and the two updated Grok articles.
- Watch CTR and impression movement over the next 7 to 14 days, especially for the Grok pages.

## Search Console Findings

### Performance, Last 3 Months

- Total clicks: 50
- Total impressions: 16.5K
- Average CTR: 0.3%
- Average position: 6.2
- Date range shown: February 18, 2026 to April 23, 2026

Interpretation: positions are promising, but CTR is far too low. The site is being shown, often in good positions, but searchers are not choosing the result often enough. Improving titles, meta descriptions, page-specific intent, and SERP-facing copy should be the fastest win.

### Top Queries, Last 3 Months

| Query | Clicks | Impressions | Notes |
| --- | ---: | ---: | --- |
| `gencatalog` | 16 | 37 | Strong branded intent, very high CTR. |
| `gencatalog.app` | 1 | 57 | Branded/domain query, low CTR. |
| `grok imagine favorites gone` | 1 | 18 | High-intent Grok recovery query. |
| `grok favourites disappeared` | 1 | 1 | Exact pain-point query. |
| `grok catalog saver` | 1 | 1 | Excellent commercial fit. |
| `gencatalog chrome extension grok imagine` | 0 | 86 | Good product-intent query with no clicks. |
| `gen ai catalog management software` | 0 | 77 | Broader category query. |
| `grok favorites bulk download feature` | 0 | 65 | High-intent feature query. |
| `grok imagine favorites disappeared 2026` | 0 | 51 | Freshness-sensitive query. |
| `grok favorites bulk download` | 0 | 46 | Excellent target for copy expansion. |

### Top Pages, Last 3 Months

| Page | Clicks | Impressions | Approx. CTR | Notes |
| --- | ---: | ---: | ---: | --- |
| `/` | 35 | 2,685 | 1.3% | Main click driver; down 22% in Insights over last 28 days. |
| `/blog-grok-favorites-disappeared` | 8 | 6,231 | 0.13% | Huge impressions, weak CTR; highest immediate SEO opportunity. |
| `/support` | 2 | 2,826 | 0.07% | Support page is showing in search but not earning clicks. |
| `/blog-organize-grok-imagine` | 2 | 2,617 | 0.08% | Good impression base, needs stronger title/snippet. |
| `/blog-grok-favorites-disappeared.html` | 2 | 1,480 | 0.14% | Duplicate legacy URL still appears; redirects to clean canonical. |
| `/faq` | 1 | 2,474 | 0.04% | FAQ is valid structured data but weak CTR. |

Interpretation: the biggest missed click pool is non-homepage content. The Grok article, support page, organize article, and FAQ together account for more than 15K impressions but only 13 clicks.

### Insights, Last 28 Days

- Clicks: 25, up 12%
- Impressions: 10.5K, up 46%
- Homepage: 14 clicks, down 22%
- `/blog-grok-favorites-disappeared`: 8 clicks, previously 0
- `/blog-grok-favorites-disappeared.html`: 2 clicks, previously 0
- `/faq`: 1 click, previously 0
- `/support`: 1 click
- Query `gencatalog`: 14 clicks, up 600%
- Queries `grok favourites disappeared` and `grok imagine favorites gone`: 1 click each, previously 0

Interpretation: organic exposure is expanding quickly, but mostly through Grok pain-point content. The new homepage may help conversion, but traffic growth should be built around the Grok wedge first.

### Countries

Last 3 months:

- United States: 15 clicks, 8,734 impressions
- Brazil: 4 clicks, 1,094 impressions
- Taiwan: 4 clicks, 57 impressions
- Germany: 3 clicks, 128 impressions
- Russia: 3 clicks, 90 impressions
- Sweden: 3 clicks, 36 impressions
- Spain: 2 clicks, 266 impressions
- France: 2 clicks, 265 impressions
- Poland: 2 clicks, 79 impressions
- South Korea: 2 clicks, 60 impressions

Interpretation: US has the largest impression base and very low CTR. International clicks are scattered but real; do not localize yet. First improve English pages and conversion tracking.

### Devices

- Desktop: 39 clicks, 14,360 impressions
- Mobile: 11 clicks, 2,130 impressions
- Tablet: 0 clicks, 5 impressions

Interpretation: GenCatalog is searched and clicked mostly on desktop, which matches the desktop-app purchase flow. Mobile still matters for discovery, but desktop conversion should be the main design target.

### Indexing

- Indexed pages: 10
- Not indexed pages: 11
- Last indexing report update: 2026-04-19

Not indexed reasons:

- Page with redirect: 5 pages, validation failed
- Not found (404): 1 page, validation started
- Discovered - currently not indexed: 5 pages, validation started
- Alternate page with proper canonical tag: 0
- Crawled - currently not indexed: 0

Redirect examples:

- `https://gencatalog.app/terms.html` redirects to `/terms`
- `http://gencatalog.app/` redirects to `https://gencatalog.app/`
- `https://gencatalog.app/support.html` redirects to `/support`
- `https://gencatalog.app/faq.html` redirects to `/faq`
- `https://gencatalog.app/privacy.html` redirects to `/privacy`

404 example:

- `https://gencatalog.app/cdn-cgi/l/email-protection`

Discovered but not indexed:

- `https://gencatalog.app/digen`
- `https://gencatalog.app/grok`
- `https://gencatalog.app/higgsfield`
- `https://gencatalog.app/midjourney`
- `https://gencatalog.app/release-notes`

Interpretation: the discovered-but-not-indexed platform pages are important. They have valid 200 responses and internal links, but Google has not crawled them yet. They need stronger internal prominence and possibly manual URL inspection/request indexing after the updated sitemap is deployed.

### Sitemap

- Submitted sitemap: `https://gencatalog.app/sitemap.xml`
- Submitted: 2026-04-23
- Last read: 2026-04-23
- Status: Success
- Discovered pages: 14
- Discovered videos: 0

Local/deployed sitemap notes:

- The sitemap is valid and being read successfully.
- It contains clean extensionless canonical URLs.
- `get.html` is correctly excluded and has `noindex`.
- The homepage `lastmod` was stale at `2026-04-24` despite the new index page today; updated locally to `2026-04-26`.

### Experience and Enhancements

- Core Web Vitals: not enough usage data for both mobile and desktop.
- HTTPS: 10 HTTPS URLs, 0 non-HTTPS URLs, no issues in the last 90 days.
- FAQ enhancement: 4 valid, 0 invalid, no critical issues.
- Search Appearance report: no data.
- Removals: no temporary removal requests submitted in the last 6 months.

### Links

- External links total: 15
- External links all point to homepage.
- Top linking sites:
  - `chrome-stats.com`: 6
  - `extpose.com`: 2
  - `reddit.com`: 2
  - `google.com`: 1
  - `orank.ai`: 1
- Internal links total: 11
- Internal top linked pages:
  - `/`: 8
  - `/faq`: 1
  - `/support`: 1
  - `/terms`: 1

Interpretation: internal link equity is too concentrated on the homepage. Important platform and blog pages are linked in HTML, but Search Console still sees a very thin internal link graph. Add more visible, crawlable links from indexed/high-impression pages to `/grok`, `/blog-grok-favorites-disappeared`, `/blog-organize-grok-imagine`, and platform pages.

## Local SEO and Site Audit

### Good

- Homepage has a clear title, description, canonical, OG/Twitter metadata, FAQ schema, SoftwareApplication schema, and Organization schema.
- `robots.txt` allows all and points to the sitemap.
- `sitemap.xml` uses clean canonical URLs and excludes the noindex download redirect page.
- `/get` is noindexed via `get.html`, which is correct for a download redirect page.
- Clean URLs like `/support`, `/faq`, and `/blog-grok-favorites-disappeared` correctly resolve, while `.html` variants redirect.
- Security headers are present: HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy.

### Needs Attention

- `sitemap.xml` was stale for the new homepage until this audit.
- Several platform pages are discovered but not indexed, even though they return 200.
- Search Console still sees `.html` redirects and a stale Cloudflare email-protection 404. These are not severe, but they add noise.
- `logo-grok.png`, `logo-grok.ico`, and `logo-digen.png` are not valid image files locally; they contain HTML. They are not currently referenced by the scanned HTML, but should be removed or replaced in a cleanup pass.
- Internal links are thin according to Search Console. Important pages need stronger crawl prominence.

## Key Insights

1. The SEO wedge is Grok, not generic AI cataloging yet.

The highest-impression non-brand pages and queries are around Grok favorites disappearing, Grok bulk download, and Grok Imagine backup. Build from that wedge before expanding hard into Midjourney/Higgsfield/Digen.

2. CTR is the main bottleneck.

Average position 6.2 with 16.5K impressions is a good early signal. A 0.3% CTR means titles/descriptions need more exact query matching and stronger promise. The most urgent page is `/blog-grok-favorites-disappeared`.

3. The homepage converts brand demand, but content creates new demand.

The homepage gets most clicks, but the article is producing new clicks from non-brand searches. The homepage should convert; the Grok cluster should acquire.

4. Platform pages are currently under-indexed.

`/grok`, `/midjourney`, `/higgsfield`, `/digen`, and `/release-notes` are in the sitemap but not indexed. That limits the site’s ability to rank for platform-specific commercial searches.

5. Backlinks are very thin.

15 external links is low, and all visible external link equity points to the homepage. The site needs credible links from Chrome extension directories, launch/community posts, Reddit/creator workflows, and AI-tool listings.

## Recommendations

### Immediate Technical Actions

1. Deploy the sitemap update and resubmit sitemap in Search Console.

The local `sitemap.xml` now reflects `2026-04-26` for the homepage. After deployment, resubmit `https://gencatalog.app/sitemap.xml` or use URL inspection for the homepage.

2. Request indexing for priority pages.

Use URL Inspection on:

- `https://gencatalog.app/`
- `https://gencatalog.app/grok`
- `https://gencatalog.app/blog-grok-favorites-disappeared`
- `https://gencatalog.app/blog-organize-grok-imagine`
- `https://gencatalog.app/midjourney`
- `https://gencatalog.app/higgsfield`
- `https://gencatalog.app/digen`

3. Add a stronger internal-link block on the homepage.

Create a visible “Save from every platform” section that links to:

- Grok Imagine backup and favorites download
- Midjourney prompt and parameter archive
- Higgsfield AI video archive
- Digen generation archive

4. Add a related-guides block to `/support` and `/faq`.

Both pages have many impressions and weak CTR. They should visibly link to the high-intent Grok article and platform pages.

5. Clean bad local image assets.

Replace or remove invalid local image files:

- `logo-grok.png`
- `logo-grok.ico`
- `logo-digen.png`

They are not currently referenced by the main scanned pages, so this is cleanup, not an emergency.

### CTR Improvements

1. Rewrite the Grok disappeared article title for direct search intent.

Current:

`Grok Imagine Favorites Disappeared? Recover, Download, and Protect Them | GenCatalog`

Test:

`Grok Imagine Favorites Disappeared? How to Recover and Bulk Download Them`

2. Rewrite the meta description around the searcher’s exact problem.

Test:

`If your Grok Imagine favorites disappeared or feel at risk, here is how to recover what you can, bulk download favorites, and save prompts locally.`

3. Add a short answer block at the top of the article.

Use 40-60 words that directly answer “why did Grok favorites disappear” and “how do I protect them.” This helps snippets and gives readers immediate confidence.

4. Update `/blog-organize-grok-imagine` for “bulk download” and “favorites” terms.

Its impressions are high but clicks low. Make the title and intro more specific to the queries Search Console is showing.

### Content Plan

Build a Grok cluster first:

1. `/grok`

Target: `grok favorites bulk download`, `grok imagine favorites downloader`, `save grok imagine prompts`.

2. `/blog-grok-favorites-disappeared`

Target: `grok imagine favorites disappeared`, `grok favorites gone`, `grok favourites disappeared`.

3. New article: `/blog-download-grok-imagine-favorites`

Target: `how to download grok imagine favorites`, `bulk download grok favorites`, `export grok imagine images`.

4. New article: `/blog-save-grok-prompts`

Target: `save grok prompts`, `grok imagine prompt history`, `download grok images with prompts`.

5. New article: `/blog-grok-imagine-library-backup`

Target: `backup grok imagine library`, `organize grok image generations`, `grok imagine archive`.

Then expand to parallel clusters:

- Midjourney: prompts, parameters, history, local archive.
- Higgsfield: video prompts, motion settings, shot library.
- Digen: high-volume generation management.

### Conversion Improvements

1. Keep the homepage focused on the new positioning.

The new index page is emotionally strong and product-forward. The SEO issue is not whether it is crawlable; it is getting more qualified searchers into it and making the above-the-fold CTA measurable.

2. Add UTM-style or GA event clarity for CTA paths.

Track:

- `homepage_buy_now`
- `homepage_trial`
- `blog_grok_trial`
- `platform_grok_trial`
- `support_trial`

3. Add a conversion-oriented CTA to the Grok article earlier.

The article currently explains the problem well. Add one early contextual CTA after the first answer block, before the reader drops off.

4. Preserve desktop-first conversion.

Most search impressions and clicks are desktop. Mobile should explain the workflow and encourage opening on desktop, but desktop should get the most polished direct download/purchase flow.

### Link-Building Plan

1. Chrome extension ecosystem links.

Claim/update listings on Chrome extension directory and review sites. Ensure all point to the clean homepage or `/grok`, not only the Chrome Web Store.

2. Reddit and creator-community posts.

The existing Reddit links are valuable. Post practical guides, not promotional copy:

- “How I back up Grok Imagine favorites with prompts”
- “What to do if Grok favorites disappear”
- “Local archive workflow for AI generations”

3. AI tools directories.

Submit to AI tool directories with the exact category language:

- AI image organizer
- AI generation archive
- Grok Imagine downloader
- Midjourney prompt organizer

4. Product-led comparison pages.

Create content that earns links:

- “Grok download vs prompt archive: what each saves”
- “Why screenshots are a bad AI generation archive”
- “Local-first AI image library checklist”

## 30-Day Plan

### Week 1

- Deploy sitemap update.
- Resubmit sitemap in Search Console.
- Request indexing for homepage, `/grok`, the two Grok blog posts, and platform pages.
- Rewrite title/meta for `/blog-grok-favorites-disappeared`.
- Add short-answer block and early CTA to the Grok disappeared article.

### Week 2

- Add homepage platform-link section above or near the feature area.
- Add related guide links to `/support`, `/faq`, and `/guides`.
- Create `/blog-download-grok-imagine-favorites`.
- Add clear internal links from the new article to `/grok`, `/get`, and the disappeared article.

### Week 3

- Create `/blog-save-grok-prompts`.
- Improve `/blog-organize-grok-imagine` title and intro around Search Console terms.
- Submit/refresh listings on Chrome extension and AI-tool directories.
- Share one useful Grok backup guide in relevant communities.

### Week 4

- Review Search Console query/page CTR deltas.
- Expand the best-performing query into another article.
- Start Midjourney cluster only after Grok pages are indexed.
- Add richer SoftwareApplication schema details if review/rating data becomes available legitimately.

## Success Metrics

Near-term targets:

- CTR from 0.3% to 0.8%+ over 30 days.
- `/blog-grok-favorites-disappeared` CTR from ~0.13% to 0.5%+.
- `/grok` indexed and receiving impressions.
- Internal links total materially higher in Search Console.
- Homepage clicks stable or growing after the new index page is crawled.

Mid-term targets:

- 100+ organic clicks per month.
- 3-5 non-brand pages generating clicks.
- One high-intent query group producing consistent conversion traffic.
- External links above 40 with at least a few links pointing to content pages, not only the homepage.
