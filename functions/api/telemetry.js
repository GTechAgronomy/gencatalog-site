const MAX_BODY_BYTES = 64 * 1024;
const SCHEMA_VERSION = 1;
const STORAGE_PREFIX = 'telemetry/daily/';
const MAX_ROW_AGE_DAYS = 90;

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
  'selectorKey',
  'area',
  'catalogSize',
  'visualCount',
  'motionCount',
  'favoriteCount',
  'sourceCount',
  'recent30Count',
  'hasLabels',
  'hasPrivateVault'
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

function dayStorageKey(day) {
  return `${STORAGE_PREFIX}${day}.json`;
}

function hasBlockedKey(value) {
  if (!value || typeof value !== 'object') return false;
  for (const key of Object.keys(value)) {
    if (BLOCKED_KEYS.some((pattern) => pattern.test(key))) return true;
  }
  return false;
}

function stableDimensionsKey(dimensions) {
  return Object.keys(dimensions)
    .sort()
    .map((key) => `${key}:${String(dimensions[key])}`)
    .join('|');
}

function isReasonableDay(day) {
  const parsed = Date.parse(`${day}T00:00:00.000Z`);
  if (!Number.isFinite(parsed)) return false;
  const now = Date.now();
  const min = now - MAX_ROW_AGE_DAYS * 24 * 60 * 60 * 1000;
  const max = now + 24 * 60 * 60 * 1000;
  return parsed >= min && parsed <= max;
}

function isSafePrimitive(value) {
  return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean';
}

function isSafeAggregate(row) {
  if (!row || typeof row !== 'object') return false;
  if (typeof row.day !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(row.day)) return false;
  if (!isReasonableDay(row.day)) return false;
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

function groupRowsByDay(rows) {
  const grouped = new Map();
  for (const row of rows) {
    if (!grouped.has(row.day)) grouped.set(row.day, []);
    grouped.get(row.day).push(row);
  }
  return grouped;
}

async function readDailySummary(bucket, day) {
  const key = dayStorageKey(day);
  const object = await bucket.get(key);
  if (!object) {
    return { schemaVersion: SCHEMA_VERSION, day, updatedAt: null, counts: {} };
  }

  try {
    const parsed = await object.json();
    if (parsed?.schemaVersion !== SCHEMA_VERSION || parsed?.day !== day || typeof parsed.counts !== 'object') {
      return { schemaVersion: SCHEMA_VERSION, day, updatedAt: null, counts: {} };
    }
    return parsed;
  } catch (_) {
    return { schemaVersion: SCHEMA_VERSION, day, updatedAt: null, counts: {} };
  }
}

async function storeAggregates(bucket, rows) {
  const grouped = groupRowsByDay(rows);
  let storedRows = 0;
  const storedDays = [];

  for (const [day, dayRows] of grouped.entries()) {
    const summary = await readDailySummary(bucket, day);
    const updatedAt = new Date().toISOString();

    for (const row of dayRows) {
      const dimensionKey = stableDimensionsKey(row.dimensions);
      const key = `${row.name}|${dimensionKey}`;
      const current = summary.counts[key] || {
        day: row.day,
        name: row.name,
        dimensions: row.dimensions,
        count: 0
      };
      current.count += row.count;
      current.updatedAt = updatedAt;
      summary.counts[key] = current;
      storedRows += 1;
    }

    summary.updatedAt = updatedAt;
    await bucket.put(dayStorageKey(day), JSON.stringify(summary, null, 2), {
      httpMetadata: { contentType: 'application/json; charset=utf-8' }
    });
    storedDays.push(day);
  }

  return { storedRows, storedDays };
}

export async function onRequestPost({ request, env }) {
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

  if (!env?.TELEMETRY_R2) {
    return json({
      accepted: true,
      stored: false,
      reason: 'storage_not_configured',
      storageDecision: 'R2 daily summaries'
    }, 202);
  }

  const result = await storeAggregates(env.TELEMETRY_R2, payload.aggregates);
  return json({
    accepted: true,
    stored: true,
    storage: 'r2_daily_summaries',
    storedRows: result.storedRows,
    storedDays: result.storedDays
  }, 202);
}

export function onRequest() {
  return new Response(null, { status: 405 });
}
