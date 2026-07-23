import assert from "node:assert/strict";
import { webcrypto } from "node:crypto";
import fs from "node:fs";

globalThis.crypto ??= webcrypto;

const middlewareSource = fs.readFileSync(
  new URL("../functions/_middleware.js", import.meta.url),
  "utf8"
);
const middlewareModule = `data:text/javascript;base64,${Buffer.from(
  middlewareSource
).toString("base64")}`;
const { onRequest } = await import(middlewareModule);

function contextFor(body, { ifNoneMatch, ifModifiedSince } = {}) {
  const headers = new Headers();
  if (ifNoneMatch) headers.set("If-None-Match", ifNoneMatch);
  if (ifModifiedSince) headers.set("If-Modified-Since", ifModifiedSince);

  return {
    request: new Request("https://gencatalog.app/grok", { headers }),
    next: async () =>
      new Response(body, {
        status: 200,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "public, max-age=0, must-revalidate",
        },
      }),
  };
}

const first = await onRequest(contextFor("<h1>Current</h1>"));
const firstEtag = first.headers.get("etag");
assert.equal(first.status, 200);
assert.match(firstEtag, /^W\/"sha256-[a-f0-9]{64}"$/);
assert.equal(first.headers.get("cloudflare-cdn-cache-control"), "no-store");
assert.equal(
  first.headers.get("last-modified"),
  "Thu, 23 Jul 2026 00:00:00 GMT"
);

const unchanged = await onRequest(
  contextFor("<h1>Current</h1>", { ifNoneMatch: firstEtag })
);
assert.equal(unchanged.status, 304);
assert.equal(await unchanged.text(), "");

const changed = await onRequest(
  contextFor("<h1>Updated</h1>", { ifNoneMatch: firstEtag })
);
assert.equal(changed.status, 200);
assert.notEqual(changed.headers.get("etag"), firstEtag);
assert.equal(await changed.text(), "<h1>Updated</h1>");

const unchangedByDate = await onRequest(
  contextFor("<h1>Current</h1>", {
    ifModifiedSince: "Thu, 23 Jul 2026 00:00:00 GMT",
  })
);
assert.equal(unchangedByDate.status, 304);

const olderDate = await onRequest(
  contextFor("<h1>Current</h1>", {
    ifModifiedSince: "Wed, 22 Jul 2026 00:00:00 GMT",
  })
);
assert.equal(olderDate.status, 200);

const legacyLogo = await onRequest({
  request: new Request("https://gencatalog.app/GenCatalogLogo.png?v=20260329"),
  next: async () => {
    throw new Error("Legacy logo redirect must run before static asset lookup");
  },
});
assert.equal(legacyLogo.status, 301);
assert.equal(
  legacyLogo.headers.get("location"),
  "https://gencatalog.app/GenCatalogLogo-64.webp"
);
assert.equal(legacyLogo.headers.get("cache-control"), "no-store");

console.log("HTML validator middleware: PASS");
