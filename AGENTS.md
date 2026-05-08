# GenCatalog Site Guidelines

## User-Facing Copy
- Release notes, homepage copy, download pages, and support pages must be written for customers, not for internal engineering review
- Describe only what users can see, do, or rely on
- NEVER mention internal implementation or process details in public copy: branch names, `origin/main`, PRs, cherry-picks, worktrees, source cleanup, build provenance, R2 mechanics, notarization, CI, or internal regression cause
- Put internal proof, root cause, branch hygiene, and release verification details in `DEVLOG.md`, PR descriptions, or handoff notes instead
- Before publishing release notes, reread them as a customer and remove anything that sounds like engineering process rather than product outcome

## Release Updates
- Keep `index.html`, `get.html`, and `release-notes.html` aligned on the current public desktop version
- Verify download URLs return `200` before announcing a release
- Leave unrelated site copy, formatting, and generated files untouched unless the task explicitly calls for them
