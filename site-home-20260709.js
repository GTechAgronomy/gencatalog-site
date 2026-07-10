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

  const workflowStage = document.querySelector('#workflow-stage');
  const workflowChapters = document.querySelectorAll('.workflow-chapter[data-stage]');
  const workflowMarkers = document.querySelectorAll('.workflow-marker[data-stage-jump]');

  const activateWorkflowStage = (stageName) => {
    if (!workflowStage || !stageName) return;
    workflowStage.dataset.active = stageName;
    workflowMarkers.forEach((marker) => {
      const active = marker.dataset.stageJump === stageName;
      if (active) marker.setAttribute('aria-current', 'step');
      else marker.removeAttribute('aria-current');
    });
  };

  if ('IntersectionObserver' in window && workflowChapters.length) {
    const workflowObserver = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (visible) activateWorkflowStage(visible.target.dataset.stage);
    }, { threshold: [0.18, 0.42, 0.66], rootMargin: '-28% 0px -38% 0px' });

    workflowChapters.forEach((chapter) => workflowObserver.observe(chapter));
  }

  workflowMarkers.forEach((marker) => {
    marker.addEventListener('click', () => {
      const stageName = marker.dataset.stageJump;
      const target = document.querySelector(`.workflow-chapter[data-stage="${stageName}"]`);
      target?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'center' });
      activateWorkflowStage(stageName);
    });
  });

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
