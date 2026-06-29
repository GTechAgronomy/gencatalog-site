const MAX_BODY_BYTES = 64 * 1024;
const SCHEMA_VERSION = 1;

const BLOCKED_KEYS = [
  /prompt/i,
  /filename/i,
  /file.?path/i,
  /path/i,
  /url/i,
  /thumb/i,
  /hash/i,
  /item.?id/i,
  /media.?id/i,
  /source.?id/i,
  /tag/i,
  /note/i,
  /collection/i,
  /content/i,
  /image/i,
  /video/i
];

const ALLOWED_DIMENSIONS = new Set([
  'osFamily',
  'appVersion',
  'extensionVersion',
  'enabled',
  'key',
  'value',
  'count',
  'on',
  'sort',
  'moment',
  'action',
  'source',
  'reason',
  'trialStatus',
  'platform',
  'queueDepth',
  'mediaType',
  'facetsCaptured',
  'facetRatio',
  'durationMs',
  'selectorKey'
]);

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store'
    }
  });
}

function hasBlockedKey(value) {
  if (!value || typeof value !== 'object') return false;
  for (const key of Object.keys(value)) {
    if (BLOCKED_KEYS.some((pattern) => pattern.test(key))) return true;
  }
  return false;
}

function isSafePrimitive(value) {
  return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean';
}

function isSafeAggregate(row) {
  if (!row || typeof row !== 'object') return false;
  if (typeof row.day !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(row.day)) return false;
  if (typeof row.name !== 'string' || !/^[a-z0-9._:-]{1,80}$/.test(row.name)) return false;
  if (!Number.isInteger(row.count) || row.count < 1) return false;
  if (!row.dimensions || typeof row.dimensions !== 'object' || Array.isArray(row.dimensions)) return false;
  if (hasBlockedKey(row.dimensions)) return false;
  return Object.entries(row.dimensions).every(([key, value]) => {
    return ALLOWED_DIMENSIONS.has(key) && isSafePrimitive(value);
  });
}

function isSafeTelemetryPayload(payload) {
  if (!payload || typeof payload !== 'object') return false;
  if (payload.schemaVersion !== SCHEMA_VERSION) return false;
  if (!Array.isArray(payload.aggregates)) return false;
  if (payload.aggregates.length > 1000) return false;
  return payload.aggregates.every(isSafeAggregate);
}

export async function onRequestPost({ request }) {
  const size = Number(request.headers.get('content-length') || 0);
  if (Number.isFinite(size) && size > MAX_BODY_BYTES) {
    return new Response(null, { status: 413 });
  }

  let payload;
  try {
    payload = await request.json();
  } catch (_) {
    return new Response(null, { status: 204 });
  }

  if (!isSafeTelemetryPayload(payload)) {
    return new Response(null, { status: 204 });
  }

  return json({
    accepted: true,
    stored: false,
    reason: 'storage_not_configured',
    storageDecisionNeeded: 'Analytics Engine vs R2 daily summaries'
  }, 202);
}

export function onRequest() {
  return new Response(null, { status: 405 });
}
