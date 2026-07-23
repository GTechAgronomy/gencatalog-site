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
  const response = await context.next();
  const contentType = response.headers.get("content-type") || "";

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
  headers.set("Cache-Control", "public, max-age=0, must-revalidate");
  headers.set("Cloudflare-CDN-Cache-Control", "no-store");
  headers.delete("Content-Length");

  if (requestAcceptsEtag(context.request.headers.get("if-none-match"), etag)) {
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
