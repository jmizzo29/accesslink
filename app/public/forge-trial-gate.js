/**
 * Forge public trial gate — 30-minute editable interaction window, then purchase decision.
 * Pairs with forge-commerce.js + forge-commerce-api for Stripe Checkout unlock.
 */
(function (global) {
  'use strict';

  var TRIAL_MS = 30 * 60 * 1000;
  var STORAGE_PREFIX = 'forge-trial:';
  var FOUNDER_KEYS = ['forge-founder-always', 'forge-founder-unlock'];

  function isPrivateLanHost(host) {
    if (!host) return false;
    if (host === 'localhost' || host === '127.0.0.1' || host === '[::1]') return true;
    return /^(192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.)/.test(host);
  }

  function persistFounderBypass() {
    try {
      localStorage.setItem('forge-founder-always', '1');
    } catch { /* private mode */ }
  }

  function isFounderBypass(opts) {
    opts = opts || {};
    if (opts.founderBypass === true || opts.founder === true) return true;
    try {
      if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('forge-founder-unlock') === '1') return true;
      for (var fi = 0; fi < FOUNDER_KEYS.length; fi++) {
        if (localStorage.getItem(FOUNDER_KEYS[fi]) === '1') return true;
      }
    } catch { /* private mode */ }
    if (typeof location !== 'undefined') {
      // file:// and empty host must not cover CTAs with a fixed trial banner
      if (location.protocol === 'file:' || !location.hostname) return true;
      var q = new URLSearchParams(location.search);
      if (q.get('founder') === '1' || q.get('purchased') === '1') {
        persistFounderBypass();
        return true;
      }
      if (isPrivateLanHost(location.hostname)) return true;
    }
    return false;
  }

  function storageKey(slug) {
    return STORAGE_PREFIX + slug;
  }

  function readState(slug) {
    try {
      var raw = localStorage.getItem(storageKey(slug));
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  function writeState(slug, state) {
    try {
      localStorage.setItem(storageKey(slug), JSON.stringify(state));
    } catch { /* quota / private mode */ }
  }

  function fmtRemaining(ms) {
    var totalSec = Math.max(0, Math.ceil(ms / 1000));
    var m = Math.floor(totalSec / 60);
    var s = totalSec % 60;
    return m + ':' + String(s).padStart(2, '0');
  }

  function ensureStyles() {
    if (document.getElementById('forge-trial-gate-styles')) return;
    var style = document.createElement('style');
    style.id = 'forge-trial-gate-styles';
    style.textContent = [
      '#forge-trial-banner{position:fixed;top:0;left:0;right:0;z-index:99990;display:flex;align-items:center;justify-content:center;gap:12px;padding:8px 16px;background:#1a2332;color:#e2e8f0;font:600 13px/1.4 system-ui,sans-serif;border-bottom:1px solid #334155;box-shadow:0 4px 12px rgba(0,0,0,.25);pointer-events:none}',
      '#forge-trial-banner a,#forge-trial-banner button{pointer-events:auto}',
      '#forge-trial-banner .trial-time{color:#fbbf24;font-variant-numeric:tabular-nums}',
      '#forge-trial-banner a,#forge-trial-banner button.linkish{color:#fbbf24;text-decoration:underline;background:none;border:none;font:inherit;cursor:pointer;padding:0}',
      '#forge-trial-overlay{position:fixed;inset:0;z-index:99999;display:none;align-items:center;justify-content:center;padding:24px;background:rgba(15,20,25,.82);backdrop-filter:blur(4px)}',
      '#forge-trial-overlay.is-open{display:flex}',
      '#forge-trial-modal{max-width:420px;width:100%;background:#fff;color:#1e293b;border-radius:16px;padding:28px 24px;box-shadow:0 24px 48px rgba(0,0,0,.35);text-align:center}',
      '#forge-trial-modal h2{margin:0 0 8px;font-size:1.35rem}',
      '#forge-trial-modal p{margin:0 0 16px;color:#64748b;font-size:.95rem;line-height:1.5}',
      '#forge-trial-modal .forge-trial-actions{display:flex;flex-direction:column;gap:10px}',
      '#forge-trial-modal .btn-primary{display:block;padding:12px 18px;border-radius:10px;background:#059669;color:#fff;font-weight:700;text-decoration:none;border:none;cursor:pointer;font-size:1rem}',
      '#forge-trial-modal .btn-ghost{display:block;padding:10px;background:transparent;border:none;color:#64748b;font-size:.875rem;cursor:pointer}',
      'body.forge-trial-locked input,body.forge-trial-locked textarea,body.forge-trial-locked select,body.forge-trial-locked button:not(.forge-trial-allow){pointer-events:none;opacity:.55}',
      'body.forge-trial-active{padding-top:42px}',
    ].join('');
    document.head.appendChild(style);
  }

  function ensureChrome(opts) {
    ensureStyles();
    var purchaseUrl = opts.purchaseUrl || '../index.html#purchase';

    if (!document.getElementById('forge-trial-banner')) {
      var banner = document.createElement('div');
      banner.id = 'forge-trial-banner';
      banner.setAttribute('role', 'status');
      banner.innerHTML =
        '<span>Trial: <span class="trial-time" id="forge-trial-countdown">30:00</span> to edit &amp; explore</span>' +
        '<button type="button" class="linkish forge-trial-allow" id="forge-trial-buy-early">Purchase now</button>';
      document.body.appendChild(banner);
    }

    if (!document.getElementById('forge-trial-overlay')) {
      var overlay = document.createElement('div');
      overlay.id = 'forge-trial-overlay';
      overlay.setAttribute('role', 'dialog');
      overlay.setAttribute('aria-modal', 'true');
      overlay.setAttribute('aria-labelledby', 'forge-trial-title');
      overlay.innerHTML =
        '<div id="forge-trial-modal">' +
        '<h2 id="forge-trial-title">Trial ended</h2>' +
        '<p>Your 30-minute trial is over. Purchase via Stripe to keep editing, save your data, and unlock full access.</p>' +
        '<div class="forge-trial-actions">' +
        '<button type="button" class="btn-primary forge-trial-allow" id="forge-trial-purchase">Purchase full access</button>' +
        '<button type="button" class="btn-ghost forge-trial-allow" id="forge-trial-view-only">Continue view-only</button>' +
        '</div></div>';
      document.body.appendChild(overlay);

      document.getElementById('forge-trial-view-only').addEventListener('click', function () {
        overlay.classList.remove('is-open');
      });
    }

    var priceSlot = document.getElementById('forge-trial-price-hint');
    if (!priceSlot && global.ForgeCommerce) {
      global.ForgeCommerce.priceLabel(opts.slug).then(function (label) {
        if (!label) return;
        var modal = document.querySelector('#forge-trial-modal p');
        if (modal) modal.textContent = 'Your 30-minute trial is over. Purchase (' + label + ') via Stripe to unlock full access.';
      });
    }

    document.body.classList.add('forge-trial-active');
  }

  function lockEdits(showModal) {
    document.body.classList.add('forge-trial-locked');
    if (showModal) {
      var overlay = document.getElementById('forge-trial-overlay');
      if (overlay) overlay.classList.add('is-open');
    }
  }

  function unlockEdits() {
    document.body.classList.remove('forge-trial-locked');
    var overlay = document.getElementById('forge-trial-overlay');
    if (overlay) overlay.classList.remove('is-open');
    var banner = document.getElementById('forge-trial-banner');
    if (banner) banner.style.display = 'none';
  }

  function startTrial(slug) {
    var now = Date.now();
    var state = { slug: slug, startedAt: now, purchased: false };
    writeState(slug, state);
    return state;
  }

  function markPurchased(slug, meta) {
    var state = readState(slug) || { slug: slug, startedAt: Date.now() };
    state.purchased = true;
    state.purchasedAt = Date.now();
    if (meta) state.purchaseMeta = meta;
    writeState(slug, state);
    return state;
  }

  function remainingMs(state) {
    if (!state || state.purchased) return Infinity;
    if (!state.startedAt) return TRIAL_MS;
    var elapsed = Date.now() - state.startedAt;
    return TRIAL_MS - elapsed;
  }

  function tick(opts, state) {
    var left = remainingMs(state);
    var countdown = document.getElementById('forge-trial-countdown');
    if (countdown) {
      countdown.textContent = state.purchased ? 'Full access' : (state.startedAt ? fmtRemaining(left) : '30:00');
    }

    if (state.purchased) {
      unlockEdits();
      return;
    }

    if (state.startedAt && left <= 0) {
      lockEdits(true);
      if (countdown) countdown.textContent = '0:00';
      return;
    }

    document.body.classList.remove('forge-trial-locked');
  }

  function bindInteractionStart(slug, state, editable) {
    if (!editable || state.startedAt) return;
    var startOnce = function () {
      var cur = readState(slug);
      if (cur && cur.startedAt) return;
      state = startTrial(slug);
      tick({ slug: slug }, state);
    };
    document.addEventListener('input', startOnce, { once: true, capture: true });
    document.addEventListener('change', startOnce, { once: true, capture: true });
  }

  function wireCommerce(slug, opts) {
    if (!global.ForgeCommerce) return;
    global.ForgeCommerce.bindPurchaseButtons(slug, { purchaseUrl: opts.purchaseUrl });
    global.ForgeCommerce.verifyReturn(slug).then(function (result) {
      if (result && result.unlocked) {
        markPurchased(slug, { sessionId: result.sessionId, via: 'stripe' });
        unlockEdits();
        tick(opts, readState(slug));
      }
    }).catch(function () { /* API offline — trial still works */ });
  }

  function init(options) {
    var opts = options || {};
    var slug = opts.slug || 'outcome';

    if (isFounderBypass(opts)) {
      markPurchased(slug, { via: 'founder-bypass' });
      document.body.classList.remove('forge-trial-locked', 'forge-trial-active');
      var founderBanner = document.getElementById('forge-trial-banner');
      if (founderBanner) founderBanner.style.display = 'none';
      var founderOverlay = document.getElementById('forge-trial-overlay');
      if (founderOverlay) founderOverlay.classList.remove('is-open');
      return {
        slug: slug,
        purchased: true,
        founderBypass: true,
        remainingMs: function () { return Infinity; },
        markPurchased: function (meta) { markPurchased(slug, meta || { via: 'founder-bypass' }); },
      };
    }

    var editable = opts.editable !== false;
    var freeAccess = opts.freeAccess === true;

    if (freeAccess) {
      markPurchased(slug, { via: 'free' });
      document.body.classList.remove('forge-trial-active', 'forge-trial-locked');
      var bannerFree = document.getElementById('forge-trial-banner');
      if (bannerFree) bannerFree.style.display = 'none';
      return {
        slug: slug,
        purchased: true,
        freeAccess: true,
        remainingMs: function () { return Infinity; },
        markPurchased: function (meta) { markPurchased(slug, meta); unlockEdits(); },
      };
    }

    var trialMs = opts.trialMinutes ? opts.trialMinutes * 60 * 1000 : TRIAL_MS;
    if (opts.trialMinutes) TRIAL_MS = trialMs;

    ensureChrome(opts);
    wireCommerce(slug, opts);

    var state = readState(slug);
    if (!state) {
      state = { slug: slug, startedAt: null, purchased: false };
      writeState(slug, state);
    }

    if (state.purchased) {
      unlockEdits();
      tick(opts, state);
      return { slug: slug, purchased: true, remainingMs: function () { return Infinity; } };
    }

    if (!state.startedAt && editable) {
      bindInteractionStart(slug, state, editable);
    } else if (state.startedAt) {
      tick(opts, state);
    }

    var interval = setInterval(function () {
      state = readState(slug) || state;
      tick(opts, state);
      if (state.purchased || (state.startedAt && remainingMs(state) <= 0)) clearInterval(interval);
    }, 1000);

    return {
      slug: slug,
      purchased: !!state.purchased,
      remainingMs: function () { return remainingMs(readState(slug) || state); },
      markPurchased: function (meta) { markPurchased(slug, meta); unlockEdits(); },
    };
  }

  global.ForgeTrialGate = {
    TRIAL_MS: TRIAL_MS,
    TRIAL_MINUTES: 30,
    init: init,
    markPurchased: markPurchased,
    readState: readState,
    isFounderBypass: isFounderBypass,
    enableFounderAlways: persistFounderBypass,
  };
})(typeof window !== 'undefined' ? window : globalThis);
