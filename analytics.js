(function () {
  function closestLink(node) {
    while (node && node.tagName !== 'A') node = node.parentElement;
    return node;
  }

  function classify(link) {
    var href = link.href || '';
    if (!href) return null;
    if (href.indexOf('/get') !== -1 || href.indexOf('downloads.gencatalog.app') !== -1) {
      return 'download_click';
    }
    if (href.indexOf('chromewebstore.google.com') !== -1) {
      return 'chrome_extension_click';
    }
    if (href.indexOf('lemonsqueezy.com/checkout') !== -1) {
      return 'checkout_click';
    }
    return null;
  }

  document.addEventListener('click', function (event) {
    var link = closestLink(event.target);
    if (!link) return;

    var eventName = classify(link);
    if (!eventName || typeof window.gtag !== 'function') return;

    window.gtag('event', eventName, {
      event_category: 'conversion',
      event_label: (link.textContent || '').trim().slice(0, 120),
      link_url: link.href,
      page_location: window.location.href,
      transport_type: 'beacon'
    });
  });
})();
