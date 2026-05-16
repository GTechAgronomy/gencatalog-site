(function () {
  var ATTR_KEY = 'gc_attribution_v1';
  var ATTR_PARAM_KEYS = ['source', 'channel', 'surface', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
  var CHECKOUT_HOST = 'secondactlabs.lemonsqueezy.com';

  function closestLink(node) {
    while (node && node.tagName !== 'A') node = node.parentElement;
    return node;
  }

  function safeUrl(value, base) {
    try {
      return new URL(value, base || window.location.href);
    } catch (_) {
      return null;
    }
  }

  function readStoredAttribution() {
    try {
      return JSON.parse(window.localStorage.getItem(ATTR_KEY) || '{}') || {};
    } catch (_) {
      return {};
    }
  }

  function writeStoredAttribution(value) {
    try {
      window.localStorage.setItem(ATTR_KEY, JSON.stringify(value));
    } catch (_) {
      // Attribution is best-effort only.
    }
  }

  function compact(value) {
    return String(value || '').trim().slice(0, 180);
  }

  function getInboundAttribution() {
    var params = new URLSearchParams(window.location.search);
    var inbound = {};

    ATTR_PARAM_KEYS.forEach(function (key) {
      var value = compact(params.get(key));
      if (value) inbound[key] = value;
    });

    return inbound;
  }

  function updateAttribution() {
    var stored = readStoredAttribution();
    var inbound = getInboundAttribution();
    var hasInbound = Object.keys(inbound).length > 0;
    var now = new Date().toISOString();

    if (!stored.firstLandingPage) {
      stored.firstLandingPage = window.location.href;
      stored.firstSeenAt = now;
    }

    if (hasInbound) {
      if (!stored.firstSource && inbound.source) stored.firstSource = inbound.source;
      if (!stored.firstChannel && inbound.channel) stored.firstChannel = inbound.channel;
      stored.lastSource = inbound.source || stored.lastSource;
      stored.lastChannel = inbound.channel || stored.lastChannel;
      stored.lastSurface = inbound.surface || stored.lastSurface;
      stored.lastUtmSource = inbound.utm_source || stored.lastUtmSource;
      stored.lastUtmMedium = inbound.utm_medium || stored.lastUtmMedium;
      stored.lastUtmCampaign = inbound.utm_campaign || stored.lastUtmCampaign;
      stored.lastUtmContent = inbound.utm_content || stored.lastUtmContent;
      stored.lastUtmTerm = inbound.utm_term || stored.lastUtmTerm;
      stored.lastSeenAt = now;
    }

    stored.lastLandingPage = window.location.href;
    writeStoredAttribution(stored);
    return stored;
  }

  function setCustom(url, key, value) {
    var normalized = compact(value);
    if (normalized) url.searchParams.set('checkout[custom][' + key + ']', normalized);
  }

  function isCheckoutUrl(url) {
    return url && url.hostname === CHECKOUT_HOST && url.pathname.indexOf('/checkout/') !== -1;
  }

  function decorateCheckoutUrl(href) {
    var url = safeUrl(href);
    if (!isCheckoutUrl(url)) return href;

    var attr = updateAttribution();
    var source = attr.lastSource || attr.firstSource || 'website';
    var channel = attr.lastChannel || attr.firstChannel || 'website';

    url.searchParams.set('source', source);
    setCustom(url, 'source', source);
    setCustom(url, 'channel', channel);
    setCustom(url, 'surface', attr.lastSurface || 'website');
    setCustom(url, 'first_source', attr.firstSource);
    setCustom(url, 'first_channel', attr.firstChannel);
    setCustom(url, 'landing_page', attr.firstLandingPage);
    setCustom(url, 'last_page', attr.lastLandingPage || window.location.href);
    setCustom(url, 'utm_source', attr.lastUtmSource);
    setCustom(url, 'utm_medium', attr.lastUtmMedium);
    setCustom(url, 'utm_campaign', attr.lastUtmCampaign);
    setCustom(url, 'utm_content', attr.lastUtmContent);
    setCustom(url, 'utm_term', attr.lastUtmTerm);

    return url.toString();
  }

  function decorateCheckoutLinks() {
    document.querySelectorAll('a[href*="lemonsqueezy.com/checkout"]').forEach(function (link) {
      var decorated = decorateCheckoutUrl(link.href);
      if (decorated) link.href = decorated;
    });
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

  function analyticsPayload(link) {
    var attr = updateAttribution();
    return {
      event_category: 'conversion',
      event_label: (link.textContent || '').trim().slice(0, 120),
      link_url: link.href,
      page_location: window.location.href,
      gc_source: attr.lastSource || attr.firstSource || '',
      gc_channel: attr.lastChannel || attr.firstChannel || '',
      gc_surface: attr.lastSurface || '',
      gc_utm_source: attr.lastUtmSource || '',
      gc_utm_medium: attr.lastUtmMedium || '',
      gc_utm_campaign: attr.lastUtmCampaign || '',
      transport_type: 'beacon'
    };
  }

  updateAttribution();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', decorateCheckoutLinks);
  } else {
    decorateCheckoutLinks();
  }

  document.addEventListener('click', function (event) {
    var link = closestLink(event.target);
    if (!link) return;

    if ((link.href || '').indexOf('lemonsqueezy.com/checkout') !== -1) {
      link.href = decorateCheckoutUrl(link.href);
    }

    var eventName = classify(link);
    if (!eventName || typeof window.gtag !== 'function') return;

    window.gtag('event', eventName, analyticsPayload(link));
  });
})();
