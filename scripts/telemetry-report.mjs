#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const bucket = 'r2:gencatalog-telemetry/telemetry/daily/';
const out = process.argv[2] || join(tmpdir(), 'gencatalog-telemetry-dashboard.html');
const temp = mkdtempSync(join(tmpdir(), 'gencatalog-telemetry-'));

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function add(map, key, count) {
  if (!key) return;
  map.set(key, (map.get(key) || 0) + count);
}

function rowsFor(map) {
  return Array.from(map.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([label, count]) => `<tr><td>${escapeHtml(label)}</td><td>${count.toLocaleString()}</td></tr>`)
    .join('') || '<tr><td colspan="2">No data yet.</td></tr>';
}

function dayRowsFor(map) {
  return Array.from(map.entries())
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([day, count]) => `<tr><td>${escapeHtml(day)}</td><td>${count.toLocaleString()}</td></tr>`)
    .join('') || '<tr><td colspan="2">No data yet.</td></tr>';
}

function recentRows(rows) {
  return rows
    .sort((a, b) => String(b.updatedAt || '').localeCompare(String(a.updatedAt || '')))
    .slice(0, 40)
    .map((row) => {
      const dimensions = Object.entries(row.dimensions || {})
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, value]) => `${escapeHtml(key)}=${escapeHtml(value)}`)
        .join(' · ');
      return `<tr><td>${escapeHtml(row.day)}</td><td>${escapeHtml(row.name)}</td><td>${dimensions}</td><td>${Number(row.count || 0).toLocaleString()}</td></tr>`;
    })
    .join('') || '<tr><td colspan="4">No data yet.</td></tr>';
}

try {
  execFileSync('rclone', ['copy', bucket, temp, '--include', '*.json'], { stdio: 'pipe' });
  const files = execFileSync('find', [temp, '-name', '*.json', '-maxdepth', '1', '-print'], { encoding: 'utf8' })
    .trim()
    .split('\n')
    .filter(Boolean)
    .sort();

  const summaries = files.map((file) => JSON.parse(readFileSync(file, 'utf8')));
  const allRows = summaries.flatMap((summary) => Object.values(summary.counts || {}));
  const total = allRows.reduce((sum, row) => sum + Number(row.count || 0), 0);
  const byEvent = new Map();
  const byAppVersion = new Map();
  const byExtensionVersion = new Map();
  const byDay = new Map();
  const byPlatform = new Map();
  const byMediaType = new Map();
  const byOs = new Map();
  const byReason = new Map();

  for (const row of allRows) {
    const count = Number(row.count || 0);
    if (!Number.isFinite(count) || count <= 0) continue;
    add(byEvent, row.name, count);
    add(byAppVersion, row.dimensions?.appVersion, count);
    add(byExtensionVersion, row.dimensions?.extensionVersion, count);
    add(byDay, row.day, count);
    add(byPlatform, row.dimensions?.platform, count);
    add(byMediaType, row.dimensions?.mediaType, count);
    add(byOs, row.dimensions?.osFamily, count);
    add(byReason, row.dimensions?.reason, count);
  }

  const latest = summaries.at(-1);
  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>GenCatalog Telemetry Report</title>
  <style>
    :root { color-scheme: dark; --bg: #08090d; --panel: #11131a; --border: #282c38; --text: #f3f4f8; --muted: #9ca3b4; --accent: #7c8cff; }
    * { box-sizing: border-box; }
    body { margin: 0; min-height: 100vh; background: var(--bg); color: var(--text); font: 15px/1.5 Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    main { width: min(1240px, calc(100vw - 32px)); margin: 0 auto; padding: 48px 0; }
    header { display: flex; justify-content: space-between; gap: 24px; align-items: flex-start; margin-bottom: 28px; }
    h1 { margin: 0 0 8px; font-size: clamp(30px, 4vw, 48px); line-height: 1; letter-spacing: 0; }
    p { margin: 0; color: var(--muted); max-width: 780px; }
    .pill { display: inline-flex; align-items: center; border: 1px solid var(--border); border-radius: 999px; padding: 6px 10px; color: var(--muted); white-space: nowrap; }
    .grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
    .card { border: 1px solid var(--border); border-radius: 8px; background: var(--panel); padding: 18px; }
    .metric { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; margin-bottom: 16px; }
    .metric strong { display: block; color: var(--accent); font-size: 28px; line-height: 1.1; }
    .metric span { color: var(--muted); font-size: 12px; text-transform: uppercase; letter-spacing: .08em; }
    .full { grid-column: 1 / -1; }
    h2 { margin: 0 0 14px; font-size: 16px; }
    table { width: 100%; border-collapse: collapse; }
    td { border-top: 1px solid var(--border); padding: 9px 10px 9px 0; color: var(--muted); vertical-align: top; }
    td:last-child { text-align: right; color: var(--text); font-variant-numeric: tabular-nums; }
    .full td:last-child { text-align: right; }
    .full td:nth-child(3) { color: var(--muted); }
    @media (max-width: 900px) { header, .grid, .metric { grid-template-columns: 1fr; display: grid; } }
  </style>
</head>
<body>
  <main>
    <header>
      <div>
        <h1>Telemetry Report</h1>
        <p>Aggregate event counters only. Generated from R2 daily summaries.</p>
      </div>
      <div class="pill">${escapeHtml(new Date().toLocaleString())}</div>
    </header>
    <section class="metric">
      <div class="card"><span>Total counted events</span><strong>${total.toLocaleString()}</strong></div>
      <div class="card"><span>Rows</span><strong>${allRows.length.toLocaleString()}</strong></div>
      <div class="card"><span>Latest day</span><strong>${escapeHtml(latest?.day || 'No data')}</strong></div>
      <div class="card"><span>Storage objects</span><strong>${summaries.length.toLocaleString()}</strong></div>
    </section>
    <section class="grid">
      <div class="card"><h2>Events</h2><table>${rowsFor(byEvent)}</table></div>
      <div class="card"><h2>App Versions</h2><table>${rowsFor(byAppVersion)}</table></div>
      <div class="card"><h2>Daily Trend</h2><table>${dayRowsFor(byDay)}</table></div>
      <div class="card"><h2>Platforms</h2><table>${rowsFor(byPlatform)}</table></div>
      <div class="card"><h2>Media Types</h2><table>${rowsFor(byMediaType)}</table></div>
      <div class="card"><h2>OS Family</h2><table>${rowsFor(byOs)}</table></div>
      <div class="card"><h2>Failure Reasons</h2><table>${rowsFor(byReason)}</table></div>
      <div class="card"><h2>Extension Versions</h2><table>${rowsFor(byExtensionVersion)}</table></div>
      <div class="card"><h2>Source</h2><table><tr><td>Bucket</td><td>${escapeHtml(bucket)}</td></tr></table></div>
      <div class="card full"><h2>Recent Aggregate Rows</h2><table>${recentRows(allRows)}</table></div>
    </section>
  </main>
</body>
</html>`;

  writeFileSync(out, html);
  console.log(out);
} finally {
  rmSync(temp, { recursive: true, force: true });
}
