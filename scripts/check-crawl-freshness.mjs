import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function fail(message) {
  errors.push(message);
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function gitDate(relativePath) {
  const dirty = execFileSync(
    "git",
    ["status", "--porcelain", "--", relativePath],
    { cwd: root, encoding: "utf8" }
  ).trim();
  if (dirty) return today();

  return execFileSync(
    "git",
    ["log", "-1", "--format=%cs", "--", relativePath],
    { cwd: root, encoding: "utf8" }
  ).trim();
}

const sitemap = read("sitemap.xml");
const robots = read("robots.txt");
const llms = read("llms.txt");
const llmsFull = read("llms-full.txt");

const sitemapEntries = new Map();
for (const match of sitemap.matchAll(
  /<url>\s*<loc>(https:\/\/gencatalog\.app\/[^<]*)<\/loc>\s*<lastmod>(\d{4}-\d{2}-\d{2})<\/lastmod>[\s\S]*?<\/url>/g
)) {
  const [, url, lastmod] = match;
  if (sitemapEntries.has(url)) fail(`Duplicate sitemap URL: ${url}`);
  sitemapEntries.set(url, lastmod);
}

const htmlFiles = fs
  .readdirSync(root)
  .filter((name) => name.endsWith(".html"))
  .sort();

const canonicalFiles = new Map();
for (const file of htmlFiles) {
  const html = read(file);
  const noindex = /<meta[^>]+name=["']robots["'][^>]+noindex/i.test(html);
  const canonical = html.match(
    /<link[^>]+rel=["']canonical["'][^>]+href=["'](https:\/\/gencatalog\.app\/[^"']*)["']/i
  )?.[1];

  if (file === "get.html" && !noindex) {
    fail("/get must remain noindex");
  }

  if (noindex || !canonical) continue;
  canonicalFiles.set(canonical, file);
  if (!sitemapEntries.has(canonical)) {
    fail(`Indexable canonical missing from sitemap: ${canonical} (${file})`);
  }
}

for (const [url, lastmod] of sitemapEntries) {
  const file = canonicalFiles.get(url);
  if (!file) {
    fail(`Sitemap URL has no indexable canonical HTML file: ${url}`);
    continue;
  }

  const expected = gitDate(file);
  if (lastmod !== expected) {
    fail(`${url} lastmod is ${lastmod}; expected ${expected} from ${file}`);
  }
}

if (!robots.includes("User-agent: *") || !robots.includes("Allow: /")) {
  fail("robots.txt must allow the public site");
}
if (!robots.includes("Sitemap: https://gencatalog.app/sitemap.xml")) {
  fail("robots.txt must reference the canonical sitemap");
}

const stalePatterns = [
  [/\$39\b/g, "$39"],
  [/\$79\b/g, "$79"],
  [/one-time purchase/gi, "one-time purchase"],
  [/Grok Saver/g, "Grok Saver"],
  [/GenCatalogLogo\.png/g, "GenCatalogLogo.png"],
  [/#features/g, "#features"],
  [/#how-it-works/g, "#how-it-works"],
  [/href=["']\/#how["']/g, "/#how"],
];

for (const file of htmlFiles) {
  const html = read(file);
  for (const [pattern, label] of stalePatterns) {
    if (pattern.test(html)) fail(`${file} contains stale marker: ${label}`);
    pattern.lastIndex = 0;
  }
}

if (fs.existsSync(path.join(root, "GenCatalogLogo.png"))) {
  fail("Legacy GenCatalogLogo.png must not be deployed");
}

const requiredLlmsFacts = [
  "$99 per year",
  "7 days or 250 saved generations",
  "first successful payment",
  "perpetual",
  "Grok Imagine",
  "Arcana Labs",
  "Midjourney",
  "Higgsfield",
  "Digen",
  "Gemini",
  "GPT Image",
  "Rogue Studio",
  "ComfyUI",
  "Venice.ai",
  "Local media imports",
  "macOS",
  "Windows 10/11",
  "local-first",
];

for (const fact of requiredLlmsFacts) {
  if (!llms.includes(fact) && !llmsFull.includes(fact)) {
    fail(`llms files are missing required fact: ${fact}`);
  }
}

if (!fs.existsSync(path.join(root, "functions", "_middleware.js"))) {
  fail("HTML validator middleware is missing");
}

if (errors.length) {
  console.error("Crawl freshness checks failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(
  `Crawl freshness checks: PASS (${sitemapEntries.size} sitemap URLs, ${canonicalFiles.size} indexable HTML files)`
);
