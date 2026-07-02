function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store'
    }
  });
}

const STORAGE_PREFIX = 'telemetry/daily/';

function respond(body, type = 'text/html; charset=utf-8', status = 200) {
  return new Response(body, {
    status,
    headers: {
      'Content-Type': type,
      'Cache-Control': 'no-store'
    }
  });
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function isAccessAuthenticated(request) {
  const accessUser = request.headers.get('Cf-Access-Authenticated-User-Email');
  const accessJwt = request.headers.get('Cf-Access-Jwt-Assertion');
  return Boolean(accessUser && accessJwt);
}

function clampDays(value) {
  const parsed = Number.parseInt(value || '30', 10);
  if (!Number.isFinite(parsed)) return 30;
  return Math.min(Math.max(parsed, 1), 90);
}

async function readSummaries(bucket, maxDays) {
  const listed = await bucket.list({ prefix: STORAGE_PREFIX, limit: 1000 });
  const objects = listed.objects
    .filter((object) => /^telemetry\/daily\/\d{4}-\d{2}-\d{2}\.json$/.test(object.key))
    .sort((a, b) => b.key.localeCompare(a.key))
    .slice(0, maxDays);

  const summaries = [];
  for (const object of objects) {
    const stored = await bucket.get(object.key);
    if (!stored) continue;
    try {
      const summary = await stored.json();
      if (summary?.schemaVersion === 1 && typeof summary.counts === 'object') {
        summaries.push(summary);
      }
    } catch (_) {
      // Ignore malformed storage objects rather than showing partial internals.
    }
  }

  return summaries;
}

function addToMap(map, key, count) {
  if (!key) return;
  map.set(key, (map.get(key) || 0) + count);
}

function summarize(summaries) {
  const totalsByEvent = new Map();
  const totalsByPlatform = new Map();
  const totalsByMediaType = new Map();
  const totalsByOs = new Map();
  const totalsByReason = new Map();
  const totalsByAppVersion = new Map();
  const totalsByExtensionVersion = new Map();
  const totalsByDay = new Map();
  const appOpensByDay = new Map();
  const totalsByFeatureArea = new Map();
  const totalsByCatalogSize = new Map();
  const totalsByVisualCount = new Map();
  const totalsByMotionCount = new Map();
  const totalsByFavoriteCount = new Map();
  const recentRows = [];
  let total = 0;
  let librarySnapshots = 0;

  for (const summary of summaries) {
    for (const row of Object.values(summary.counts || {})) {
      const count = Number(row.count || 0);
      if (!Number.isFinite(count) || count <= 0) continue;
      total += count;
      addToMap(totalsByEvent, row.name, count);
      addToMap(totalsByPlatform, row.dimensions?.platform, count);
      addToMap(totalsByMediaType, row.dimensions?.mediaType, count);
      addToMap(totalsByOs, row.dimensions?.osFamily, count);
      addToMap(totalsByReason, row.dimensions?.reason, count);
      addToMap(totalsByAppVersion, row.dimensions?.appVersion, count);
      addToMap(totalsByExtensionVersion, row.dimensions?.extensionVersion, count);
      addToMap(totalsByDay, row.day, count);
      if (row.name === 'app.opened') addToMap(appOpensByDay, row.day, count);
      if (row.name === 'feature.used') addToMap(totalsByFeatureArea, row.dimensions?.area, count);
      if (row.name === 'library.snapshot') {
        librarySnapshots += count;
        addToMap(totalsByCatalogSize, row.dimensions?.catalogSize, count);
        addToMap(totalsByVisualCount, row.dimensions?.visualCount, count);
        addToMap(totalsByMotionCount, row.dimensions?.motionCount, count);
        addToMap(totalsByFavoriteCount, row.dimensions?.favoriteCount, count);
      }
      recentRows.push(row);
    }
  }

  return {
    total,
    totalsByEvent,
    totalsByPlatform,
    totalsByMediaType,
    totalsByOs,
    totalsByReason,
    totalsByAppVersion,
    totalsByExtensionVersion,
    totalsByDay,
    appOpensByDay,
    totalsByFeatureArea,
    totalsByCatalogSize,
    totalsByVisualCount,
    totalsByMotionCount,
    totalsByFavoriteCount,
    librarySnapshots,
    recentRows: recentRows
      .sort((a, b) => String(b.updatedAt || '').localeCompare(String(a.updatedAt || '')))
      .slice(0, 30)
  };
}

function sortedEntries(map) {
  return Array.from(map.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

function rowsFor(map) {
  return sortedEntries(map)
    .map(([label, count]) => `<tr><td>${escapeHtml(label)}</td><td>${count.toLocaleString()}</td></tr>`)
    .join('') || '<tr><td colspan="2">No data yet.</td></tr>';
}

function rowsForDays(map) {
  return Array.from(map.entries())
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([day, count]) => `<tr><td>${escapeHtml(day)}</td><td>${count.toLocaleString()}</td></tr>`)
    .join('') || '<tr><td colspan="2">No data yet.</td></tr>';
}

function recentRowsTable(rows) {
  return rows.map((row) => {
    const dimensions = Object.entries(row.dimensions || {})
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${escapeHtml(key)}=${escapeHtml(value)}`)
      .join(' · ');
    return `<tr><td>${escapeHtml(row.day)}</td><td>${escapeHtml(row.name)}</td><td>${escapeHtml(dimensions)}</td><td>${Number(row.count || 0).toLocaleString()}</td></tr>`;
  }).join('') || '<tr><td colspan="4">No data yet.</td></tr>';
}

function mapToObject(map) {
  return Object.fromEntries(sortedEntries(map));
}

function latestVersion(map) {
  return Array.from(map.keys())
    .filter(Boolean)
    .sort((a, b) => String(a).localeCompare(String(b), undefined, { numeric: true }))
    .pop() || 'No data yet';
}

function jsonPayload({ summaries, stats, maxDays }) {
  return {
    schemaVersion: 1,
    maxDays,
    total: stats.total,
    days: summaries.map((summary) => summary.day),
    updatedAt: summaries[0]?.updatedAt || null,
    byEvent: mapToObject(stats.totalsByEvent),
    byPlatform: mapToObject(stats.totalsByPlatform),
    byMediaType: mapToObject(stats.totalsByMediaType),
    byOsFamily: mapToObject(stats.totalsByOs),
    byFailureReason: mapToObject(stats.totalsByReason),
    byAppVersion: mapToObject(stats.totalsByAppVersion),
    byExtensionVersion: mapToObject(stats.totalsByExtensionVersion),
    byDay: Object.fromEntries(Array.from(stats.totalsByDay.entries()).sort((a, b) => a[0].localeCompare(b[0]))),
    appOpensByDay: Object.fromEntries(Array.from(stats.appOpensByDay.entries()).sort((a, b) => a[0].localeCompare(b[0]))),
    byFeatureArea: mapToObject(stats.totalsByFeatureArea),
    byCatalogSize: mapToObject(stats.totalsByCatalogSize),
    byVisualCount: mapToObject(stats.totalsByVisualCount),
    byMotionCount: mapToObject(stats.totalsByMotionCount),
    byFavoriteCount: mapToObject(stats.totalsByFavoriteCount),
    recentRows: stats.recentRows
  };
}

function renderDashboard({ accessUser, summaries, stats, maxDays }) {
  const latestDay = summaries[0]?.day || 'No data yet';
  const earliestDay = summaries[summaries.length - 1]?.day || 'No data yet';
  const updatedAt = summaries[0]?.updatedAt || 'No data yet';
  const appOpens = stats.totalsByEvent.get('app.opened') || 0;
  const featureEvents = stats.totalsByEvent.get('feature.used') || 0;
  const newestVersion = latestVersion(stats.totalsByAppVersion);
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>GenCatalog Telemetry</title>
  <style>
    :root { color-scheme: dark; --bg: #08090d; --panel: #11131a; --border: #282c38; --text: #f3f4f8; --muted: #9ca3b4; --accent: #7c8cff; --ok: #5ee2a0; }
    * { box-sizing: border-box; }
    body { margin: 0; min-height: 100vh; background: var(--bg); color: var(--text); font: 15px/1.5 Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    main { width: min(1240px, calc(100vw - 32px)); margin: 0 auto; padding: 48px 0; }
    header { display: flex; justify-content: space-between; gap: 24px; align-items: flex-start; margin-bottom: 28px; }
    h1 { margin: 0 0 8px; font-size: clamp(30px, 4vw, 48px); line-height: 1; letter-spacing: 0; }
    p { margin: 0; color: var(--muted); max-width: 780px; }
    a { color: var(--accent); text-decoration: none; }
    .actions { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 8px; }
    .pill { display: inline-flex; align-items: center; border: 1px solid var(--border); border-radius: 999px; padding: 6px 10px; color: var(--muted); white-space: nowrap; }
    .pill strong { color: var(--text); font-weight: 600; }
    .grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
    .card { border: 1px solid var(--border); border-radius: 8px; background: var(--panel); padding: 18px; }
    .wide { grid-column: span 2; }
    .full { grid-column: 1 / -1; }
    .metric { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; margin-bottom: 16px; }
    .metric strong { display: block; color: var(--accent); font-size: 28px; line-height: 1.1; }
    .metric span { color: var(--muted); font-size: 12px; text-transform: uppercase; letter-spacing: .08em; }
    h2 { margin: 0 0 14px; font-size: 16px; }
    table { width: 100%; border-collapse: collapse; }
    td { border-top: 1px solid var(--border); padding: 9px 10px 9px 0; color: var(--muted); vertical-align: top; }
    td:last-child { text-align: right; color: var(--text); font-variant-numeric: tabular-nums; }
    .full td:last-child { text-align: left; color: var(--muted); }
    .full td:nth-child(4) { text-align: right; color: var(--text); font-variant-numeric: tabular-nums; }
    code { color: var(--accent); }
    @media (max-width: 900px) { header, .grid, .metric { grid-template-columns: 1fr; display: grid; } .wide { grid-column: auto; } }
  </style>
</head>
<body>
  <main>
    <header>
      <div>
        <h1>Telemetry</h1>
        <p>Aggregate, opt-in product signals only. GenCatalog collects events and buckets, not catalog content.</p>
      </div>
      <div class="actions">
        <div class="pill"><strong>${maxDays}</strong>&nbsp;days</div>
        <a class="pill" href="?days=7">7d</a>
        <a class="pill" href="?days=30">30d</a>
        <a class="pill" href="?days=90">90d</a>
        <a class="pill" href="?days=${maxDays}&format=json">JSON</a>
        <div class="pill">${escapeHtml(accessUser)}</div>
      </div>
    </header>
    <section class="metric">
      <div class="card"><span>App opens</span><strong>${appOpens.toLocaleString()}</strong></div>
      <div class="card"><span>Feature events</span><strong>${featureEvents.toLocaleString()}</strong></div>
      <div class="card"><span>Library snapshots</span><strong>${stats.librarySnapshots.toLocaleString()}</strong></div>
      <div class="card"><span>Newest version seen</span><strong>${escapeHtml(newestVersion)}</strong></div>
    </section>
    <section class="grid">
      <div class="card"><h2>Feature Usage</h2><table>${rowsFor(stats.totalsByFeatureArea)}</table></div>
      <div class="card"><h2>Library Size</h2><table>${rowsFor(stats.totalsByCatalogSize)}</table></div>
      <div class="card"><h2>App Opens by Day</h2><table>${rowsForDays(stats.appOpensByDay)}</table></div>
      <div class="card"><h2>App Versions</h2><table>${rowsFor(stats.totalsByAppVersion)}</table></div>
      <div class="card"><h2>Image Count Buckets</h2><table>${rowsFor(stats.totalsByVisualCount)}</table></div>
      <div class="card"><h2>Video Count Buckets</h2><table>${rowsFor(stats.totalsByMotionCount)}</table></div>
      <div class="card"><h2>Favorite Count Buckets</h2><table>${rowsFor(stats.totalsByFavoriteCount)}</table></div>
      <div class="card"><h2>Events</h2><table>${rowsFor(stats.totalsByEvent)}</table></div>
      <div class="card"><h2>Daily Event Trend</h2><table>${rowsForDays(stats.totalsByDay)}</table></div>
      <div class="card"><h2>Platforms</h2><table>${rowsFor(stats.totalsByPlatform)}</table></div>
      <div class="card"><h2>Media Types</h2><table>${rowsFor(stats.totalsByMediaType)}</table></div>
      <div class="card"><h2>OS Family</h2><table>${rowsFor(stats.totalsByOs)}</table></div>
      <div class="card"><h2>Failure Reasons</h2><table>${rowsFor(stats.totalsByReason)}</table></div>
      <div class="card"><h2>Extension Versions</h2><table>${rowsFor(stats.totalsByExtensionVersion)}</table></div>
      <div class="card"><h2>Storage</h2><table><tr><td>Backend</td><td><code>R2 daily summaries</code></td></tr><tr><td>Objects read</td><td>${summaries.length}</td></tr></table></div>
      <div class="card full"><h2>Recent Aggregate Rows</h2><table>${recentRowsTable(stats.recentRows)}</table></div>
    </section>
  </main>
</body>
</html>`;
}

export async function onRequest({ request, env }) {
  if (!isAccessAuthenticated(request)) {
    return json({ error: 'Cloudflare Access required' }, 403);
  }

  if (!env?.TELEMETRY_R2) {
    return json({ error: 'Telemetry storage is not configured' }, 501);
  }

  const url = new URL(request.url);
  const maxDays = clampDays(url.searchParams.get('days'));
  const accessUser = request.headers.get('Cf-Access-Authenticated-User-Email');
  const summaries = await readSummaries(env.TELEMETRY_R2, maxDays);
  const stats = summarize(summaries);
  if (url.searchParams.get('format') === 'json') {
    return respond(JSON.stringify(jsonPayload({ summaries, stats, maxDays }), null, 2), 'application/json; charset=utf-8');
  }
  return respond(renderDashboard({ accessUser, summaries, stats, maxDays }));
}
