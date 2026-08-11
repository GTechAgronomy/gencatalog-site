const LAST_MODIFIED_BY_PATH = Object.freeze({
  "/": "2026-08-10",
  "/grok": "2026-08-03",
  "/arcana": "2026-07-23",
  "/higgsfield": "2026-07-28",
  "/midjourney": "2026-07-28",
  "/digen": "2026-07-28",
  "/local-ai-media-import": "2026-08-10",
  "/comfyui-workflow-viewer": "2026-07-28",
  "/search-grok-favorites": "2026-07-28",
  "/rescue-your-ai-library": "2026-07-28",
  "/faq": "2026-08-10",
  "/support": "2026-08-10",
  "/release-notes": "2026-08-10",
  "/blog-organize-grok-imagine": "2026-07-28",
  "/blog-grok-favorites-disappeared": "2026-08-10",
  "/blog-download-grok-imagine-favorites": "2026-07-23",
  "/blog-manage-grok-favorites": "2026-07-23",
  "/blog-save-grok-prompts": "2026-07-23",
  "/blog-grok-imagine-library-backup": "2026-07-23",
  "/save-grok-prompts": "2026-07-23",
  "/save-ai-prompts-locally": "2026-08-10",
  "/ai-generation-backup": "2026-08-10",
  "/guides": "2026-07-23",
  "/privacy": "2026-08-10",
  "/terms": "2026-08-10",
  "/refund": "2026-07-18",
});

function toHex(buffer) {
  return Array.from(new Uint8Array(buffer), (byte) =>
    byte.toString(16).padStart(2, "0")
  ).join("");
}

function requestAcceptsEtag(requestHeader, etag) {
  if (!requestHeader) return false;
  return requestHeader
    .split(",")
    .map((value) => value.trim())
    .some((value) => value === "*" || value === etag);
}

export async function onRequest(context) {
  const url = new URL(context.request.url);

  if (url.pathname === "/GenCatalogLogo.png") {
    return new Response(null, {
      status: 301,
      headers: {
        "Cache-Control": "no-store",
        Location: new URL("/GenCatalogLogo-64.webp", url).toString(),
      },
    });
  }

  const response = await context.next();
  const contentType = response.headers.get("content-type") || "";
  const route =
    url.pathname.length > 1 ? url.pathname.replace(/\/+$/, "") : url.pathname;
  const lastModifiedDate = LAST_MODIFIED_BY_PATH[route];

  if (
    context.request.method !== "GET" ||
    response.status !== 200 ||
    !contentType.toLowerCase().startsWith("text/html")
  ) {
    return response;
  }

  const body = await response.arrayBuffer();
  const digest = await crypto.subtle.digest("SHA-256", body);
  const etag = `W/"sha256-${toHex(digest)}"`;
  const headers = new Headers(response.headers);

  headers.set("ETag", etag);
  if (lastModifiedDate) {
    headers.set(
      "Last-Modified",
      new Date(`${lastModifiedDate}T00:00:00.000Z`).toUTCString()
    );
  }
  headers.set("Cache-Control", "public, max-age=0, must-revalidate");
  headers.set("Cloudflare-CDN-Cache-Control", "no-store");
  headers.delete("Content-Length");

  const ifNoneMatch = context.request.headers.get("if-none-match");
  const ifModifiedSince = context.request.headers.get("if-modified-since");
  const notModifiedByDate =
    !ifNoneMatch &&
    lastModifiedDate &&
    ifModifiedSince &&
    Date.parse(ifModifiedSince) >= Date.parse(headers.get("last-modified"));

  if (requestAcceptsEtag(ifNoneMatch, etag) || notModifiedByDate) {
    return new Response(null, {
      status: 304,
      headers,
    });
  }

  return new Response(body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
