(() => {
  const nav = document.querySelector('.resource-nav');
  const toggle = document.querySelector('.resource-nav .nav-toggle');

  if (!nav || !toggle) return;

  const setMenu = (open) => {
    nav.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };

  toggle.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
  nav.querySelectorAll('.nav-links a').forEach((link) => {
    link.addEventListener('click', () => setMenu(false));
  });
})();
