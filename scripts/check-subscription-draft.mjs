#!/usr/bin/env node

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const annualCheckout = 'https://secondactlabs.lemonsqueezy.com/checkout/buy/33e4fb54-df7e-4135-b850-b7fe008a7ddb';
const legacyCheckoutId = '3b893527-ed40-40b5-8f6f-9451c01f30f1';
const stagingCheckoutId = '3ea693d3-5e94-46a2-a457-120f0e1c1e44';

const customerFiles = [
  'ai-generation-backup.html',
  'arcana.html',
  'blog-grok-favorites-disappeared.html',
  'blog-organize-grok-imagine.html',
  'comfyui-workflow-viewer.html',
  'digen.html',
  'faq.html',
  'get.html',
  'grok.html',
  'higgsfield.html',
  'index.html',
  'llms.txt',
  'local-ai-media-import.html',
  'midjourney.html',
  'privacy.html',
  'refund.html',
  'rescue-your-ai-library.html',
  'save-ai-prompts-locally.html',
  'search-grok-favorites.html',
  'support.html',
  'terms.html'
];

const offerFiles = [
  'ai-generation-backup.html',
  'arcana.html',
  'comfyui-workflow-viewer.html',
  'digen.html',
  'grok.html',
  'higgsfield.html',
  'index.html',
  'local-ai-media-import.html',
  'midjourney.html',
  'rescue-your-ai-library.html',
  'search-grok-favorites.html'
];

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function jsonLdBlocks(relativePath) {
  const source = read(relativePath);
  return Array.from(source.matchAll(/<script\s+type=["']application\/ld\+json["']\s*>([\s\S]*?)<\/script>/gi), (match) => {
    try {
      return JSON.parse(match[1]);
    } catch (error) {
      throw new Error(`${relativePath} contains invalid JSON-LD: ${error.message}`);
    }
  });
}

function walk(value, visit) {
  if (!value || typeof value !== 'object') return;
  visit(value);
  if (Array.isArray(value)) {
    for (const entry of value) walk(entry, visit);
    return;
  }
  for (const entry of Object.values(value)) walk(entry, visit);
}

const allCustomerCopy = customerFiles.map((file) => `${file}\n${read(file)}`).join('\n');
const staleClaims = [
  /\$79\b/i,
  /79\.00/,
  new RegExp(legacyCheckoutId, 'i'),
  /includes all 5\.x updates/i,
  /one[- ]time purchase/i,
  /buy it once/i,
  /no recurring fees/i,
  /updates to the current major version/i,
  /\b(?:paid|already-paid) library\b/i
];

for (const pattern of staleClaims) {
  assert.equal(pattern.test(allCustomerCopy), false, `stale commercial claim remains: ${pattern}`);
}
assert.equal(allCustomerCopy.includes(stagingCheckoutId), false, 'staging checkout leaked into customer copy');

const home = read('index.html');
const faq = read('faq.html');
const support = read('support.html');
const terms = read('terms.html');
const refund = read('refund.html');
const privacy = read('privacy.html');
const llms = read('llms.txt');
const getPage = read('get.html');

assert.ok(home.includes(annualCheckout), 'homepage annual checkout is missing');
assert.ok(llms.includes(annualCheckout), 'llms.txt annual checkout is missing');
assert.ok(home.includes('The subscription pays for tomorrow.'));
assert.ok(home.includes('Your library is always yours.'));
assert.ok(faq.includes('everything already in your catalog remains fully accessible'));
assert.ok(faq.includes('permanent perpetual license'));
assert.ok(support.includes('Subscription states'));
assert.ok(support.includes('Renew to keep capturing'));
assert.ok(terms.includes('paid-through date'));
assert.ok(terms.includes('permanent full access, and lifetime updates'));
assert.ok(refund.includes('What a Refund Changes'));
assert.ok(privacy.includes('license.gencatalog.app'));

const getVersion = getPage.match(/var VERSION = '([^']+)'/)?.[1];
const schemaVersion = home.match(/"softwareVersion":\s*"([^"]+)"/)?.[1];
assert.ok(getVersion, 'get.html version is missing');
assert.equal(schemaVersion, getVersion, 'homepage schema and download page versions differ');
assert.ok(getPage.includes(`GenCatalog ${getVersion}`), 'download page visible version differs');

let jsonLdCount = 0;
for (const file of customerFiles.filter((name) => name.endsWith('.html'))) {
  jsonLdCount += jsonLdBlocks(file).length;
}

for (const file of offerFiles) {
  const offers = [];
  for (const block of jsonLdBlocks(file)) {
    walk(block, (value) => {
      if (value['@type'] === 'Offer' && value.price !== undefined) offers.push(value);
    });
  }
  assert.ok(offers.length > 0, `${file} has no priced Offer`);
  for (const offer of offers) {
    assert.equal(String(offer.price), '99.00', `${file} has the wrong annual price`);
    assert.equal(offer.priceCurrency, 'USD', `${file} has the wrong currency`);
    assert.equal(offer.url, annualCheckout, `${file} has the wrong checkout URL`);
    assert.equal(offer.priceSpecification?.['@type'], 'UnitPriceSpecification');
    assert.equal(String(offer.priceSpecification?.price), '99.00');
    assert.equal(offer.priceSpecification?.priceCurrency, 'USD');
    assert.equal(offer.priceSpecification?.billingDuration, 'P1Y');
  }
}

const analytics = read('analytics.js');
assert.ok(analytics.includes("CHECKOUT_HOST = 'secondactlabs.lemonsqueezy.com'"));
assert.ok(analytics.includes("'checkout[custom][' + key + ']'"));
assert.ok(analytics.includes("return 'checkout_click'"));

console.log(`Subscription website draft checks passed: ${customerFiles.length} customer files, ${jsonLdCount} JSON-LD blocks, annual checkout ${annualCheckout}.`);
