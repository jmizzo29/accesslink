/**
 * Forge Commerce — Stripe Checkout client for static GitHub Pages apps.
 * Requires forge-commerce-api deployed; set apiBaseUrl in commerce-config.json.
 */
(function (global) {
  'use strict';

  var configCache = null;

  function resolveSharedBase() {
    var scripts = document.getElementsByTagName('script');
    for (var i = 0; i < scripts.length; i++) {
      var src = scripts[i].src || '';
      if (src.indexOf('forge-commerce.js') !== -1) {
        return src.replace(/forge-commerce\.js.*$/, '');
      }
    }
    return '../../_shared/';
  }

  function loadConfig() {
    if (configCache) return Promise.resolve(configCache);
    var base = resolveSharedBase();
    return fetch(base + 'commerce-config.json', { cache: 'no-cache' })
      .then(function (r) { return r.json(); })
      .then(function (cfg) {
        configCache = cfg;
        return cfg;
      })
      .catch(function () {
        configCache = { apiBaseUrl: '', products: {} };
        return configCache;
      });
  }

  function apiBase(cfg) {
    var base = (cfg && cfg.apiBaseUrl) || '';
    if (base) return base.replace(/\/$/, '');
    if (global.location.hostname === 'localhost' || global.location.hostname === '127.0.0.1') {
      return 'http://localhost:8787';
    }
    if (global.location.hostname === 'www.restarto.ai' || global.location.hostname === 'restarto.ai') {
      return 'https://api.restarto.ai';
    }
    return '';
  }

  function loadDeployPosture(slug) {
    return fetch('../deploy-posture.json', { cache: 'no-cache' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .catch(function () { return null; });
  }

  function startCheckout(slug, opts) {
    opts = opts || {};
    return loadDeployPosture(slug).then(function (posture) {
      if (posture && posture.posture && posture.posture.purchaseAllowed === false) {
        throw new Error(posture.posture.purchaseBlockReason || 'Purchase not available for this outcome yet.');
      }
      return loadConfig().then(function (cfg) {
        var base = apiBase(cfg);
        if (!base) {
          var landing = opts.purchaseUrl || '../index.html#purchase';
          global.location.href = landing;
          return { redirected: true };
        }
        return fetch(base + '/api/checkout/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug: slug, email: opts.email || undefined }),
        })
          .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, status: r.status, j: j }; }); })
          .then(function (_ref) {
            if (!_ref.ok || !_ref.j.url) {
              throw new Error(_ref.j.error || 'Checkout unavailable');
            }
            global.location.href = _ref.j.url;
            return _ref.j;
          });
      });
    });
  }

  function verifyReturn(slug) {
    if (typeof URLSearchParams === 'undefined') return Promise.resolve(null);
    var params = new URLSearchParams(global.location.search);
    var sessionId = params.get('session_id');
    if (!sessionId) return Promise.resolve(null);

    return loadConfig().then(function (cfg) {
      var base = apiBase(cfg);
      if (!base) return null;
      var q = 'session_id=' + encodeURIComponent(sessionId) + '&slug=' + encodeURIComponent(slug);
      return fetch(base + '/api/checkout/verify?' + q)
        .then(function (r) { return r.json(); })
        .then(function (result) {
          if (result && result.unlocked) {
            if (result.liveUrl) {
              global.location.replace(result.liveUrl);
              return result;
            }
            params.delete('session_id');
            var clean = global.location.pathname + (params.toString() ? '?' + params.toString() : '');
            global.history.replaceState({}, '', clean);
          }
          return result;
        });
    });
  }

  function bindPurchaseButtons(slug, opts) {
    opts = opts || {};
    loadDeployPosture(slug).then(function (posture) {
      if (posture && posture.posture && posture.posture.purchaseAllowed === false) {
        ['forge-trial-purchase', 'forge-trial-buy-early', 'forge-purchase-btn'].forEach(function (id) {
          var el = document.getElementById(id);
          if (!el) return;
          el.disabled = true;
          if (el.tagName === 'BUTTON') el.textContent = 'Not available for purchase';
          el.title = posture.posture.purchaseBlockReason || 'Deploy posture blocks purchase';
        });
        document.querySelectorAll('[data-forge-checkout]').forEach(function (el) {
          el.disabled = true;
          el.title = posture.posture.purchaseBlockReason || 'Deploy posture blocks purchase';
        });
      }
    });
    function handler(e) {
      if (e) e.preventDefault();
      var btn = e && e.target;
      if (btn) {
        btn.disabled = true;
        btn.textContent = 'Redirecting to checkout…';
      }
      startCheckout(slug, opts).catch(function (err) {
        alert(err.message || 'Checkout failed. Try again or contact support.');
        if (btn) {
          btn.disabled = false;
          btn.textContent = opts.label || 'Purchase full access';
        }
      });
    }
    ['forge-trial-purchase', 'forge-trial-buy-early', 'forge-purchase-btn'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) {
        el.addEventListener('click', handler);
        if (el.tagName === 'A') el.href = '#';
      }
    });
    document.querySelectorAll('[data-forge-checkout]').forEach(function (el) {
      el.addEventListener('click', handler);
    });
  }

  function priceLabel(slug) {
    return loadConfig().then(function (cfg) {
      var p = cfg.products && cfg.products[slug];
      if (!p || p.priceUsd == null) return null;
      return '$' + p.priceUsd;
    });
  }

  global.ForgeCommerce = {
    loadConfig: loadConfig,
    loadDeployPosture: loadDeployPosture,
    startCheckout: startCheckout,
    verifyReturn: verifyReturn,
    bindPurchaseButtons: bindPurchaseButtons,
    priceLabel: priceLabel,
  };
})(typeof window !== 'undefined' ? window : globalThis);
