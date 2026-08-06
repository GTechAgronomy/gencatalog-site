#!/usr/bin/env node

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const annualCheckout = 'https://secondactlabs.lemonsqueezy.com/checkout/buy/33e4fb54-df7e-4135-b850-b7fe008a7ddb';
const legacyCheckoutId = '3b893527-ed40-40b5-8f6f-9451c01f30f1';
const stagingCheckoutId = '3ea693d3-5e94-46a2-a457-120f0e1c1e44';
const copyrightNotice = '© 2026 Second Act Labs. All rights reserved.';

const customerFiles = fs.readdirSync(root)
  .filter((file) => file.endsWith('.html') || file === 'llms.txt')
  .sort();

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
const nonHomeCustomerCopy = customerFiles
  .filter((file) => file !== 'index.html')
  .map((file) => `${file}\n${read(file)}`)
  .join('\n');
const staleClaims = [
  /\$79\b/i,
  /79\.00/,
  new RegExp(legacyCheckoutId, 'i'),
  /includes all 5\.x updates/i,
  /one[- ]time purchase/i,
  /buy it once/i,
  /no recurring fees/i,
  /updates to the current major version/i,
  /\b(?:paid|already-paid) library\b/i,
  /lifetime updates/i,
  /payment processor/i,
  /first successful payment and activation/i,
  /(?:three device|3) activations/i,
  /subscription-funded (?:functionality|integrations|capabilities)/i,
  /GTech|Agronomy/i
];

for (const pattern of staleClaims) {
  assert.equal(pattern.test(allCustomerCopy), false, `stale commercial claim remains: ${pattern}`);
}
assert.equal(
  /Your library is always yours/i.test(nonHomeCustomerCopy),
  false,
  'the concise homepage ownership promise must not replace precise lifecycle copy elsewhere'
);
assert.equal(allCustomerCopy.includes(stagingCheckoutId), false, 'staging checkout leaked into customer copy');

const footerFiles = fs.readdirSync(root)
  .filter((file) => file.endsWith('.html') && /<footer\b/i.test(read(file)))
  .sort();
assert.ok(footerFiles.length > 0, 'no website footers were found');
for (const file of footerFiles) {
  const source = read(file);
  const footer = source.match(/<footer\b[\s\S]*?<\/footer>/i)?.[0] || '';
  assert.ok(footer.includes(copyrightNotice), `${file} footer is missing the canonical copyright notice`);
  assert.equal(
    source.split(copyrightNotice).length - 1,
    1,
    `${file} must contain the canonical copyright notice exactly once`
  );
}

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
assert.ok(home.includes('Your library is always yours.'));
assert.ok(home.includes('Everything you’ve already captured stays on your computer and remains fully usable forever.'));
assert.ok(home.includes('GenCatalog continues to receive updates whether or not you renew.'));
assert.ok(home.includes('Ongoing app updates, platform compatibility, and new features'));
assert.ok(home.includes('Cancel anytime. Your library stays yours. GenCatalog keeps updating. Only new asset acquisition stops.'));
assert.ok(home.includes('One individual • Up to 3 personally controlled devices'));
assert.ok(!home.includes('first successful payment'));
assert.ok(!home.includes('current paid period'));
assert.ok(!home.includes('subscription lapse'));
assert.ok(faq.includes('After your first successful payment'));
assert.ok(faq.includes('one individual and can be used on up to three devices they personally control'));
assert.ok(faq.includes('Merchant of Record'));
assert.ok(faq.includes('rights included with their original purchase'));
assert.ok(support.includes('Subscription states'));
assert.ok(support.includes('Renew to keep capturing'));
assert.ok(support.includes('one individual and can be used on up to three devices they personally control'));
assert.ok(terms.includes('paid-through date'));
assert.ok(terms.includes('one individual for personal or commercial work on up to three devices they personally control'));
assert.ok(terms.includes('After the first successful payment'));
assert.ok(terms.includes('Merchant of Record'));
assert.ok(terms.includes('rights included with their original purchase'));
assert.ok(refund.includes('What a Refund Changes'));
assert.ok(refund.includes('After the first successful payment'));
assert.ok(refund.includes('Merchant of Record'));
assert.ok(privacy.includes('license.gencatalog.app'));
assert.ok(privacy.includes('Merchant of Record'));

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

console.log(`Subscription website draft checks passed: ${customerFiles.length} customer files, ${jsonLdCount} JSON-LD blocks, ${footerFiles.length} canonical footers, annual checkout ${annualCheckout}.`);
