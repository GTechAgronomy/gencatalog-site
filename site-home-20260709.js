(() => {
  const root = document.documentElement;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  root.classList.add('motion-ready');

  const nav = document.querySelector('.nav');
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelectorAll('.nav-links a');

  const setMenu = (open) => {
    if (!nav || !navToggle) return;
    nav.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };

  navToggle?.addEventListener('click', () => {
    setMenu(!nav?.classList.contains('open'));
  });

  navLinks.forEach((link) => {
    link.addEventListener('click', () => setMenu(false));
  });

  let navFrame = 0;
  const updateNav = () => {
    navFrame = 0;
    nav?.classList.toggle('scrolled', window.scrollY > 16);
  };

  const requestNavUpdate = () => {
    if (navFrame) return;
    navFrame = window.requestAnimationFrame(updateNav);
  };

  window.addEventListener('scroll', requestNavUpdate, { passive: true });
  updateNav();

  const reveals = document.querySelectorAll('.reveal');
  if (reducedMotion || !('IntersectionObserver' in window)) {
    reveals.forEach((item) => item.classList.add('in'));
  } else {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in');
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    reveals.forEach((item) => revealObserver.observe(item));
  }

  const saveDemo = document.querySelector('[data-save-demo]');
  const saveDemoButton = document.querySelector('[data-save-demo-button]');
  const saveDemoToast = document.querySelector('[data-save-demo-toast]');

  if (saveDemo && saveDemoButton) {
    let saveDemoVisible = false;
    let saveDemoRunning = false;
    let saveDemoTimers = [];

    const clearSaveDemoTimers = () => {
      saveDemoTimers.forEach((timer) => window.clearTimeout(timer));
      saveDemoTimers = [];
    };

    const scheduleSaveDemo = (callback, delay) => {
      const timer = window.setTimeout(callback, delay);
      saveDemoTimers.push(timer);
    };

    const setSaveDemoState = (state) => {
      saveDemo.dataset.state = state;
      saveDemoButton.dataset.state = state;
      saveDemoButton.setAttribute('aria-disabled', String(state === 'saving'));

      if (state === 'saved') {
        saveDemoButton.setAttribute('aria-label', 'Saved to GenCatalog');
        if (saveDemoToast) saveDemoToast.textContent = 'Saved to GenCatalog';
      } else if (state === 'saving') {
        saveDemoButton.setAttribute('aria-label', 'Saving to GenCatalog');
        if (saveDemoToast) saveDemoToast.textContent = '';
      } else {
        saveDemoButton.setAttribute('aria-label', 'Replay the save to GenCatalog demonstration');
        if (saveDemoToast) saveDemoToast.textContent = '';
      }
    };

    const resetSaveDemo = () => {
      clearSaveDemoTimers();
      saveDemoRunning = false;
      setSaveDemoState('rest');
    };

    const runSaveDemo = ({ automatic = false } = {}) => {
      if (saveDemoRunning) return;

      clearSaveDemoTimers();
      saveDemoRunning = true;
      setSaveDemoState(automatic ? 'rest' : 'press');

      const hoverAt = automatic ? 850 : 0;
      const pressAt = automatic ? 1550 : 0;
      const savingAt = automatic ? 1690 : 140;
      const savedAt = automatic ? 2690 : 1140;
      const resetAt = automatic ? 5690 : 4140;
      const replayAt = automatic ? 7100 : 5540;

      if (automatic) {
        scheduleSaveDemo(() => setSaveDemoState('hover'), hoverAt);
        scheduleSaveDemo(() => setSaveDemoState('press'), pressAt);
      }

      scheduleSaveDemo(() => setSaveDemoState('saving'), savingAt);
      scheduleSaveDemo(() => setSaveDemoState('saved'), savedAt);
      scheduleSaveDemo(() => setSaveDemoState('rest'), resetAt);
      scheduleSaveDemo(() => {
        saveDemoRunning = false;
        if (saveDemoVisible && !document.hidden && !reducedMotion) {
          runSaveDemo({ automatic: true });
        }
      }, replayAt);
    };

    saveDemoButton.addEventListener('click', () => {
      if (saveDemoButton.dataset.state === 'saving') return;
      resetSaveDemo();
      runSaveDemo();
    });

    if (!reducedMotion && 'IntersectionObserver' in window) {
      const saveDemoObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          saveDemoVisible = entry.isIntersecting;

          if (saveDemoVisible && !document.hidden) {
            runSaveDemo({ automatic: true });
          } else {
            resetSaveDemo();
          }
        });
      }, { threshold: 0.35 });

      saveDemoObserver.observe(saveDemo);
    } else if (!reducedMotion) {
      saveDemoVisible = true;
      runSaveDemo({ automatic: true });
    } else {
      setSaveDemoState('rest');
    }

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        resetSaveDemo();
      } else if (saveDemoVisible && !reducedMotion) {
        runSaveDemo({ automatic: true });
      }
    });
  }

  const heroFrame = document.querySelector('[data-tilt]');
  const finePointer = window.matchMedia('(pointer: fine)').matches;

  if (heroFrame && finePointer && !reducedMotion) {
    let tiltFrame = 0;
    let nextX = 0;
    let nextY = 0;

    const renderTilt = () => {
      tiltFrame = 0;
      heroFrame.style.transform = `rotateY(${nextX}deg) rotateX(${nextY}deg)`;
    };

    heroFrame.addEventListener('pointermove', (event) => {
      const rect = heroFrame.getBoundingClientRect();
      nextX = -4 + ((event.clientX - rect.left) / rect.width - 0.5) * 3.2;
      nextY = 1.5 - ((event.clientY - rect.top) / rect.height - 0.5) * 2.2;
      if (!tiltFrame) tiltFrame = window.requestAnimationFrame(renderTilt);
    }, { passive: true });

    heroFrame.addEventListener('pointerleave', () => {
      nextX = -4;
      nextY = 1.5;
      if (!tiltFrame) tiltFrame = window.requestAnimationFrame(renderTilt);
    }, { passive: true });
  }
})();
