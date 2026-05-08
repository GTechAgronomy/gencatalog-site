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
 */

(async function GenCatalogSync() {

  const DELAY_AFTER_CLICK   = 2500;
  const DELAY_AFTER_ADVANCE = 2000;
  const MAX_IMAGES = 9999;

  // Our own extension's selector — see extension/save-fab.js createButton().
  // Stable across Higgsfield redesigns because WE inject it.
  const BUTTON_SELECTOR = 'button.gc-save-fab[data-gc-platform="hf"]';
  const FALLBACK_SELECTOR = 'button.gc-save-fab'; // any platform, in case attr is missing

  let count = 0;
  let skipped = 0;
  let stopped = false;
  window.stopSync = () => { stopped = true; console.log('🛑 Stop requested.'); };

  const sleep = ms => new Promise(r => setTimeout(r, ms));

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
        count++;
        console.log(`✅ [${count}] Clicked (was state="${state}") — waiting for save to complete...`);
        const finalState = await waitForSaveComplete(btn, 8000);
        console.log(`   → final state: "${finalState}"`);
        await sleep(DELAY_AFTER_CLICK);
      }

      const hitModal = pressRightArrow();
      console.log(`   ➡️  Advancing...`);
      await sleep(DELAY_AFTER_ADVANCE);

      if (!hitModal || !getModalOverlay()) {
        const recovered = await ensureModalOpen();
        if (!recovered) {
          console.warn('   ❌ Could not recover modal. Stopping.');
          break;
        }
      }
    } catch (err) {
      console.warn(`⚠️  Stopped after ${count} saved / ${skipped} skipped: ${err.message}`);
      break;
    }
  }

  console.log('─'.repeat(60));
  console.log(`✅ Done. Saved: ${count}, Skipped (already saved): ${skipped}`);
})();