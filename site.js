// Sweeping scroll reveals + parallax + nav blur

(() => {
  // Nav blur on scroll
  const nav = document.querySelector('.nav');
  const onScroll = () => {
    if (window.scrollY > 12) nav?.classList.add('scrolled');
    else nav?.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Reveal on intersect
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    }
  }, { threshold: 0.1, rootMargin: '0px 0px -80px 0px' });

  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  // Platform rotator on hero badge
  const platformWord = document.getElementById('platform-rotator');
  if (platformWord) {
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
  if (fabDemo) {
    const states = ['rest', 'hover', 'saving', 'saved'];
    let i = 0;
    setInterval(() => {
      i = (i + 1) % states.length;
      fabDemo.dataset.state = states[i];
    }, 1800);
  }
})();
