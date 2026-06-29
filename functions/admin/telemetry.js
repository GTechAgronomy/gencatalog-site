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

function html(body, status = 200) {
  return new Response(body, {
    status,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
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

async function readSummaries(bucket, maxDays = 30) {
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
  let total = 0;

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
    }
  }

  return {
    total,
    totalsByEvent,
    totalsByPlatform,
    totalsByMediaType,
    totalsByOs,
    totalsByReason
  };
}

function rowsFor(map) {
  return Array.from(map.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([label, count]) => `<tr><td>${escapeHtml(label)}</td><td>${count.toLocaleString()}</td></tr>`)
    .join('') || '<tr><td colspan="2">No data yet.</td></tr>';
}

function renderDashboard({ accessUser, summaries, stats }) {
  const latestDay = summaries[0]?.day || 'No data yet';
  const earliestDay = summaries[summaries.length - 1]?.day || 'No data yet';
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>GenCatalog Telemetry</title>
  <style>
    :root { color-scheme: dark; --bg: #08090d; --panel: #11131a; --border: #282c38; --text: #f3f4f8; --muted: #9ca3b4; --accent: #7c8cff; }
    * { box-sizing: border-box; }
    body { margin: 0; min-height: 100vh; background: var(--bg); color: var(--text); font: 15px/1.5 Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    main { width: min(1120px, calc(100vw - 32px)); margin: 0 auto; padding: 48px 0; }
    header { display: flex; justify-content: space-between; gap: 24px; align-items: flex-start; margin-bottom: 28px; }
    h1 { margin: 0 0 8px; font-size: clamp(30px, 4vw, 48px); line-height: 1; letter-spacing: 0; }
    p { margin: 0; color: var(--muted); max-width: 780px; }
    .pill { display: inline-flex; align-items: center; border: 1px solid var(--border); border-radius: 999px; padding: 6px 10px; color: var(--muted); white-space: nowrap; }
    .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
    .card { border: 1px solid var(--border); border-radius: 8px; background: var(--panel); padding: 18px; }
    .metric { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; margin-bottom: 16px; }
    .metric strong { display: block; color: var(--accent); font-size: 28px; line-height: 1.1; }
    .metric span { color: var(--muted); font-size: 12px; text-transform: uppercase; letter-spacing: .08em; }
    h2 { margin: 0 0 14px; font-size: 16px; }
    table { width: 100%; border-collapse: collapse; }
    td { border-top: 1px solid var(--border); padding: 9px 0; color: var(--muted); }
    td:last-child { text-align: right; color: var(--text); font-variant-numeric: tabular-nums; }
    code { color: var(--accent); }
    @media (max-width: 760px) { header, .grid, .metric { grid-template-columns: 1fr; display: grid; } }
  </style>
</head>
<body>
  <main>
    <header>
      <div>
        <h1>Telemetry</h1>
        <p>Aggregate event counters only. GenCatalog collects events, not content.</p>
      </div>
      <div class="pill">${escapeHtml(accessUser)}</div>
    </header>
    <section class="metric">
      <div class="card"><span>Total counted events</span><strong>${stats.total.toLocaleString()}</strong></div>
      <div class="card"><span>Latest day</span><strong>${escapeHtml(latestDay)}</strong></div>
      <div class="card"><span>Earliest day shown</span><strong>${escapeHtml(earliestDay)}</strong></div>
    </section>
    <section class="grid">
      <div class="card"><h2>Events</h2><table>${rowsFor(stats.totalsByEvent)}</table></div>
      <div class="card"><h2>Platforms</h2><table>${rowsFor(stats.totalsByPlatform)}</table></div>
      <div class="card"><h2>Media Types</h2><table>${rowsFor(stats.totalsByMediaType)}</table></div>
      <div class="card"><h2>OS Family</h2><table>${rowsFor(stats.totalsByOs)}</table></div>
      <div class="card"><h2>Failure Reasons</h2><table>${rowsFor(stats.totalsByReason)}</table></div>
      <div class="card"><h2>Storage</h2><table><tr><td>Backend</td><td><code>R2 daily summaries</code></td></tr><tr><td>Objects read</td><td>${summaries.length}</td></tr></table></div>
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

  const accessUser = request.headers.get('Cf-Access-Authenticated-User-Email');
  const summaries = await readSummaries(env.TELEMETRY_R2);
  const stats = summarize(summaries);
  return html(renderDashboard({ accessUser, summaries, stats }));
}
