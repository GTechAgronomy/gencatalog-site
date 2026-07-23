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

function contextFor(body, ifNoneMatch) {
  const headers = new Headers();
  if (ifNoneMatch) headers.set("If-None-Match", ifNoneMatch);

  return {
    request: new Request("https://gencatalog.app/example", { headers }),
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

const unchanged = await onRequest(
  contextFor("<h1>Current</h1>", firstEtag)
);
assert.equal(unchanged.status, 304);
assert.equal(await unchanged.text(), "");

const changed = await onRequest(
  contextFor("<h1>Updated</h1>", firstEtag)
);
assert.equal(changed.status, 200);
assert.notEqual(changed.headers.get("etag"), firstEtag);
assert.equal(await changed.text(), "<h1>Updated</h1>");

console.log("HTML validator middleware: PASS");
