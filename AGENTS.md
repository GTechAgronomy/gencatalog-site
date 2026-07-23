# GenCatalog Site Guidelines

## User-Facing Copy
- Release notes, homepage copy, download pages, and support pages must be written for customers, not for internal engineering review
- Describe only what users can see, do, or rely on
- NEVER mention internal implementation or process details in public copy: branch names, `origin/main`, PRs, cherry-picks, worktrees, source cleanup, build provenance, R2 mechanics, notarization, CI, or internal regression cause
- Put internal proof, root cause, branch hygiene, and release verification details in `DEVLOG.md`, PR descriptions, or handoff notes instead
- Before publishing release notes, reread them as a customer and remove anything that sounds like engineering process rather than product outcome

## Release Updates
- Keep `index.html`, `get.html`, and `release-notes.html` aligned on the current public desktop version
- Use `scripts/update-version.sh <new-version>` to bump all version surfaces at once — it refuses to bump until the download artifacts return `200`
- Run `scripts/update-version.sh --check` before pushing any release; it fails if version surfaces disagree, release notes are missing, or artifacts are not live
- Verify download URLs return `200` before announcing a release
- `llms.txt` links `/get` instead of a versioned download URL on purpose — keep it that way
- Leave unrelated site copy, formatting, and generated files untouched unless the task explicitly calls for them

## Crawl Freshness
- Run `node scripts/check-crawl-freshness.mjs` and `node scripts/test-html-validator.mjs` before deploying
- Update each changed indexable page's `sitemap.xml` `<lastmod>` value to the deployment date
- Keep `llms.txt` and `llms-full.txt` aligned with pricing, access terms, supported platforms, privacy, and canonical page links
- Keep indexable canonical pages in `sitemap.xml`; keep `/get` intentionally `noindex`
- The main-branch workflow waits for the matching Cloudflare Pages deployment and then purges the zone cache; keep the `CLOUDFLARE_CACHE_API_TOKEN` repository secret current
