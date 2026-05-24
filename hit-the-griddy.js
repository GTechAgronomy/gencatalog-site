/**
 * Higgsfield → Gen Catalog Bulk Metadata Sync
 *
 * Targets the GenCatalog extension's injected Save button (button.gc-save-fab),
 * not a native Higgsfield element. Works regardless of whether the button is
 * rendered top-left or in the bottom action row.
 *
 * HOW TO USE:
 * 1. Open Higgsfield, navigate to your first image detail page
 * 2. Open DevTools (Cmd+Option+I) → Console
 * 3. Paste this script, hit Enter
 * 4. Type stopSync() in console to halt gracefully
 * 5. Type getFailedSyncUrls() to print failures again
 * 6. Type downloadFailedSyncUrls() to download higgsfield-failed-urls.txt
 */

(async function GenCatalogSync() {

  const DELAY_AFTER_CLICK   = 2500;
  const DELAY_AFTER_ADVANCE = 2000;
  const MAX_IMAGES = 9999;
  const FAILURE_STORAGE_KEY = 'gc_higgsfield_failed_urls_v1';

  // Our own extension's selector — see extension/save-fab.js createButton().
  // Stable across Higgsfield redesigns because WE inject it.
  const BUTTON_SELECTOR = 'button.gc-save-fab[data-gc-platform="hf"]';
  const FALLBACK_SELECTOR = 'button.gc-save-fab'; // any platform, in case attr is missing

  let count = 0;
  let skipped = 0;
  let failed = 0;
  let stopped = false;
  window.stopSync = () => { stopped = true; console.log('🛑 Stop requested.'); };

  const sleep = ms => new Promise(r => setTimeout(r, ms));

  function readStoredFailures() {
    try {
      const parsed = JSON.parse(localStorage.getItem(FAILURE_STORAGE_KEY) || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch (_) {
      return [];
    }
  }

  function writeStoredFailures(entries) {
    try {
      localStorage.setItem(FAILURE_STORAGE_KEY, JSON.stringify(entries.slice(-1000)));
    } catch (err) {
      console.warn('   ⚠️ Could not save failure list to localStorage:', err.message);
    }
  }

  function getCurrentAssetUrl() {
    const canonical = document.querySelector('link[rel="canonical"]')?.href;
    if (canonical) return canonical;
    const assetLink = document.querySelector('a[href*="/asset/"]')?.href;
    if (assetLink) return assetLink;
    return window.location.href;
  }

  function rememberFailure(reason, state = '') {
    failed++;
    const entry = {
      url: getCurrentAssetUrl(),
      reason: String(reason || 'Unknown failure'),
      state: String(state || ''),
      time: new Date().toISOString()
    };
    const entries = readStoredFailures();
    entries.push(entry);
    writeStoredFailures(entries);
    console.warn(`   📝 Logged failed item ${failed}: ${entry.url}`);
    console.warn(`      Reason: ${entry.reason}${entry.state ? ` (state="${entry.state}")` : ''}`);
    return entry;
  }

  function formatFailures(entries = readStoredFailures()) {
    return entries.map((entry, index) => {
      return `${index + 1}. ${entry.url}\n   ${entry.reason}${entry.state ? ` (state: ${entry.state})` : ''}\n   ${entry.time}`;
    }).join('\n\n');
  }

  window.getFailedSyncUrls = () => {
    const entries = readStoredFailures();
    if (!entries.length) {
      console.log('No failed Higgsfield URLs logged.');
      return [];
    }
    console.log(formatFailures(entries));
    return entries;
  };

  window.clearFailedSyncUrls = () => {
    localStorage.removeItem(FAILURE_STORAGE_KEY);
    console.log('Cleared failed Higgsfield URL log.');
  };

  window.downloadFailedSyncUrls = () => {
    const entries = readStoredFailures();
    const text = entries.length ? formatFailures(entries) : 'No failed Higgsfield URLs logged.';
    const blob = new Blob([text + '\n'], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'higgsfield-failed-urls.txt';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  function getModalOverlay() {
    return document.querySelector('div[class*="fixed"][class*="z-"][class*="inset-0"]')
      || document.querySelector('div.fixed.inset-0')
      || [...document.querySelectorAll('div')].find(el => {
          const s = window.getComputedStyle(el);
          return s.position === 'fixed' && parseInt(s.zIndex) > 50;
        })
      || null;
  }

  function findCatalogButton() {
    // Prefer a button inside the currently-open modal/detail overlay.
    const modal = getModalOverlay();
    if (modal) {
      const inModal = modal.querySelector(BUTTON_SELECTOR) || modal.querySelector(FALLBACK_SELECTOR);
      if (inModal) return inModal;
    }
    return document.querySelector(BUTTON_SELECTOR) || document.querySelector(FALLBACK_SELECTOR);
  }

  function buttonState(btn) {
    return btn?.dataset?.state || 'unknown';
  }

  function waitForButton(timeoutMs = 10000) {
    return new Promise((resolve, reject) => {
      const deadline = Date.now() + timeoutMs;
      let attempts = 0;
      (function check() {
        attempts++;
        const btn = findCatalogButton();
        if (btn) {
          console.log(`   🔍 Button found (state="${buttonState(btn)}") after ${attempts} attempts`);
          return resolve(btn);
        }
        if (Date.now() > deadline) {
          console.error(`   ❌ Button not found after ${attempts} attempts (${timeoutMs}ms)`);
          console.error('   URL:', window.location.href);
          console.error('   Hint: confirm the GenCatalog extension is loaded and the detail view is open.');
          return reject(new Error('gc-save-fab button not found'));
        }
        setTimeout(check, 250);
      })();
    });
  }

  // Wait until the button leaves the "saving" state (i.e. save cycle completed).
  async function waitForSaveComplete(btn, timeoutMs = 8000) {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      const s = buttonState(btn);
      if (s !== 'saving') return s;
      await sleep(150);
    }
    return buttonState(btn);
  }

  function pressRightArrow() {
    const modal = getModalOverlay();
    const target = modal || document.activeElement || document.body;
    const isModal = !!modal;
    console.log(`   🎯 Arrow → ${target.tagName}${isModal ? ' (MODAL ✓)' : ' (⚠️ NOT MODAL)'}`);
    ['keydown', 'keyup'].forEach(type => {
      target.dispatchEvent(new KeyboardEvent(type, {
        key: 'ArrowRight', code: 'ArrowRight', keyCode: 39,
        bubbles: true, cancelable: true
      }));
    });
    return isModal;
  }

  async function ensureModalOpen() {
    await sleep(500);
    if (getModalOverlay()) return true;
    console.log('   ⚠️ Modal closed — trying to re-open from grid...');
    const gridItems = document.querySelectorAll('a[href*="/asset/"]');
    if (gridItems.length) {
      gridItems[0].click();
      await sleep(2000);
      return !!getModalOverlay();
    }
    return false;
  }

  console.log('🚀 GenCatalog bulk sync started. Type stopSync() to halt.');
  console.log('   Failures will be saved locally. Use getFailedSyncUrls(), downloadFailedSyncUrls(), or clearFailedSyncUrls().');
  console.log(`   Selector: ${BUTTON_SELECTOR}`);
  console.log(`   Delays: ${DELAY_AFTER_CLICK}ms click / ${DELAY_AFTER_ADVANCE}ms advance`);
  console.log('─'.repeat(60));

  while (!stopped && (count + skipped) < MAX_IMAGES) {
    try {
      const btn = await waitForButton(10000);
      const state = buttonState(btn);

      if (state === 'saved') {
        skipped++;
        console.log(`⏭️  [skip ${skipped}] Already saved — advancing.`);
      } else if (state === 'disabled') {
        skipped++;
        console.log(`⏭️  [skip ${skipped}] Button disabled — advancing.`);
      } else {
        btn.click();
        console.log(`✅ Clicked (was state="${state}") — waiting for save to complete...`);
        const finalState = await waitForSaveComplete(btn, 8000);
        console.log(`   → final state: "${finalState}"`);
        if (finalState === 'saved' || finalState === 'exists' || finalState === 'excluded') {
          count++;
        } else {
          rememberFailure('Save did not complete successfully', finalState);
        }
        await sleep(DELAY_AFTER_CLICK);
      }

      const hitModal = pressRightArrow();
      console.log(`   ➡️  Advancing...`);
      await sleep(DELAY_AFTER_ADVANCE);

      if (!hitModal || !getModalOverlay()) {
        const recovered = await ensureModalOpen();
        if (!recovered) {
          rememberFailure('Could not recover modal after advancing');
          console.warn('   ❌ Could not recover modal. Continuing after a longer wait.');
          await sleep(4000);
        }
      }
    } catch (err) {
      rememberFailure(err.message || 'Unhandled sync error');
      console.warn(`⚠️  Error after ${count} saved / ${skipped} skipped / ${failed} failed: ${err.message}`);
      const recovered = await ensureModalOpen();
      if (!recovered) {
        console.warn('   ❌ Could not recover modal after error. Stopping.');
        break;
      }
      pressRightArrow();
      await sleep(DELAY_AFTER_ADVANCE);
    }
  }

  console.log('─'.repeat(60));
  console.log(`✅ Done. Saved: ${count}, Skipped (already saved): ${skipped}, Failed: ${failed}`);
  if (failed > 0) {
    console.log('Failed URLs:');
    window.getFailedSyncUrls();
    console.log('Run downloadFailedSyncUrls() to save higgsfield-failed-urls.txt');
  }
})();
