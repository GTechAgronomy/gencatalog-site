// Sweeping scroll reveals + parallax + nav blur

(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Nav blur on scroll
  const nav = document.querySelector('.nav');
  const onScroll = () => {
    if (window.scrollY > 12) nav?.classList.add('scrolled');
    else nav?.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Reveal on intersect
  if (reduceMotion) {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('in'));
  } else {
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      }
    }, { threshold: 0.1, rootMargin: '0px 0px -80px 0px' });

    document.querySelectorAll('.reveal').forEach(el => io.observe(el));
  }

  // Parallax for hero screenshot
  const heroShot = document.getElementById('hero-shot');
  if (heroShot && !reduceMotion) {
    let raf = 0;
    const onScrollParallax = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = Math.min(window.scrollY, 800);
        const tilt = 6 - (y / 800) * 6; // tilt 6deg -> 0deg
        const lift = y * 0.15;
        heroShot.style.transform = `perspective(1800px) rotateX(${tilt}deg) translateY(${-lift}px)`;
      });
    };
    window.addEventListener('scroll', onScrollParallax, { passive: true });
    onScrollParallax();
  }

  // Platform rotator on hero badge
  const platformWord = document.getElementById('platform-rotator');
  if (platformWord && !reduceMotion) {
    const list = ['Grok', 'GPT Image', 'Midjourney', 'Higgsfield', 'Digen', 'Venice'];
    let i = 0;
    setInterval(() => {
      i = (i + 1) % list.length;
      platformWord.style.opacity = '0';
      platformWord.style.transform = 'translateY(-6px)';
      setTimeout(() => {
        platformWord.textContent = list[i];
        platformWord.style.opacity = '1';
        platformWord.style.transform = 'translateY(0)';
      }, 200);
    }, 2200);
  }

  // Save FAB demo loop in "automatic capture" section
  const fabDemo = document.getElementById('fab-demo');
  if (fabDemo && !reduceMotion) {
    const states = ['rest', 'hover', 'saving', 'saved'];
    let i = 0;
    setInterval(() => {
      i = (i + 1) % states.length;
      fabDemo.dataset.state = states[i];
    }, 1800);
  }
})();
