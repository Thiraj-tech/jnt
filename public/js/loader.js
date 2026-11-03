// Shows the loader only when the visitor is actually waiting:
// - page links: after 400 ms, so fast navigations never flash it
// - forms: quote-form.js calls jntLoader.show() while the enquiry is sent
(function () {
  'use strict';
  // Service worker for the offline page. It lives at the site root (or /new/, /jnt/), one level above /js/.
  var script = document.currentScript;
  if ('serviceWorker' in navigator && script) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register(new URL('../sw.js', script.src).href).catch(function () {});
    });
  }

  // "Try again" on the offline page
  document.addEventListener('click', function (e) {
    if (e.target.closest && e.target.closest('[data-retry]')) location.reload();
  });

  // Banner while the connection is down
  var banner;
  function setOffline(off) {
    if (!banner) {
      banner = document.createElement('p');
      banner.className = 'net-banner';
      banner.setAttribute('role', 'status');
      banner.hidden = true;
      document.body.appendChild(banner);
    }
    banner.textContent = off ? 'You are offline. Pages you have already opened still work.' : '';
    banner.hidden = !off;
  }
  window.addEventListener('offline', function () { setOffline(true); });
  window.addEventListener('online', function () { setOffline(false); });
  if (navigator.onLine === false) document.addEventListener('DOMContentLoaded', function () { setOffline(true); });

  var el = document.getElementById('loader');
  if (!el) return;
  var text = el.querySelector('.loader__text');
  var timer;

  function show(message, delay) {
    clearTimeout(timer);
    timer = setTimeout(function () {
      text.textContent = message || 'Loading…';
      el.hidden = false;
    }, delay || 0);
  }
  function hide() {
    clearTimeout(timer);
    el.hidden = true;
  }
  window.jntLoader = { show: show, hide: hide };

  document.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a || (a.target && a.target !== '_self') || a.hasAttribute('download')) return;
    var to = new URL(a.href, location.href);
    if (to.origin !== location.origin) return; // WhatsApp, phone, email, Facebook, maps
    if (to.pathname === location.pathname && to.search === location.search) return; // same page or #anchor
    show('Loading…', 400);
  });

  // Coming back with the browser's back button can restore a page with the loader still showing.
  window.addEventListener('pageshow', hide);
})();
