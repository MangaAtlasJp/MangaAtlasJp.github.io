/* JPMangaatlas Ads System — admin-controlled sections with top-level Social Bar support. */
(function () {
  'use strict';
  if (window.__mangaAtlasAdsSystemLoaded) return;
  window.__mangaAtlasAdsSystemLoaded = true;
  if (location.pathname.indexOf('/admin') === 0) return;

  fetch('/data/ads-config.json?v=' + Date.now(), { cache: 'no-store' })
    .then(function (response) {
      if (!response.ok) throw new Error('Ads config HTTP ' + response.status);
      return response.json();
    })
    .then(function (config) {
      var sections = Array.isArray(config && config.sections)
        ? config.sections.filter(function (s) { return s && s.enabled && String(s.code || '').trim(); })
        : [];
      if (!sections.length) return;

      function root() {
        return document.querySelector('.pages') || document.querySelector('main') ||
          document.querySelector('article') || document.body;
      }
      function exists(id) {
        return Array.prototype.some.call(document.querySelectorAll('[data-ma-ad-section]'), function (el) {
          return el.getAttribute('data-ma-ad-section') === String(id);
        });
      }
      function isSocialBar(code) {
        return /social[\s_-]*bar|socialbar|abscloud\.org\/1\//i.test(String(code || ''));
      }
      function heightFor(code) {
        var matches = String(code).matchAll(/['"]height['"]\s*:\s*(\d+)/g);
        var height = 300;
        for (var m of matches) height = Math.max(height, Number(m[1]) || 0);
        return Math.min(650, Math.max(250, height + 30));
      }
      function executeInPage(code, slot) {
        // Social-bar providers need the top-level document to create their fixed-position bar.
        // Recreate script elements so the browser executes them; do not sandbox them in an iframe.
        var parsed = new DOMParser().parseFromString(String(code || ''), 'text/html');
        Array.prototype.forEach.call(parsed.body.childNodes, function (node) {
          if (node.nodeType === 3 && !node.textContent.trim()) return;
          if (node.nodeName.toLowerCase() === 'script') {
            var script = document.createElement('script');
            Array.prototype.forEach.call(node.attributes, function (a) { script.setAttribute(a.name, a.value); });
            if (node.src) script.src = node.src;
            else script.textContent = node.textContent;
            (slot || document.body).appendChild(script);
          } else {
            (slot || document.body).appendChild(document.importNode(node, true));
          }
        });
      }
      function createSlot(section, social) {
        var box = document.createElement('div');
        box.className = 'manga-atlas-ad-slot' + (social ? ' manga-atlas-social-bar-slot' : '');
        box.setAttribute('data-ma-ad-section', String(section.id || ''));
        box.style.cssText = 'width:100%;min-height:' + (social ? '1px' : '90px') + ';margin:' + (social ? '0' : '20px auto') + ';display:flex;justify-content:center;align-items:flex-start;clear:both;overflow:visible;position:relative;z-index:' + (social ? '2147483000' : '1') + ';';
        return box;
      }
      function place(section) {
        var id = String(section.id || '');
        if (!id || exists(id)) return true;
        var code = String(section.code || '');
        var social = isSocialBar(code);
        var placement = String(section.placement || 'start').toLowerCase();
        var box = createSlot(section, social);
        if (placement === 'between') {
          var pages = document.querySelector('.pages');
          if (!pages) return false;
          var imgs = Array.prototype.slice.call(pages.querySelectorAll('img.page, img.page-image'));
          var after = parseInt(section.afterImage != null ? section.afterImage : section.between, 10);
          if (!Number.isFinite(after) || after < 1) after = 5;
          if (imgs.length < after) return false;
          pages.insertBefore(box, imgs[after - 1].nextSibling);
        } else {
          var r = root();
          if (!r || !r.parentNode) return false;
          if (placement === 'end') r.parentNode.insertBefore(box, r.nextSibling);
          else r.parentNode.insertBefore(box, r);
        }
        if (social) {
          // Execute once for each enabled section, preserving repeated placements.
          executeInPage(code, document.body);
          box.setAttribute('data-ma-socialbar-loaded', 'true');
        } else {
          var frame = document.createElement('iframe');
          frame.title = 'Advertisement ' + id;
          frame.setAttribute('scrolling', 'auto');
          frame.setAttribute('referrerpolicy', 'unsafe-url');
          frame.style.cssText = 'display:block;width:100%;max-width:100%;height:' + heightFor(code) + 'px;border:0;background:transparent;';
          box.appendChild(frame);
          try {
            var doc = frame.contentDocument || frame.contentWindow.document;
            doc.open();
            doc.write('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><base target="_blank"></head><body style="margin:0;padding:0;text-align:center;overflow:auto;">' + code + '</body></html>');
            doc.close();
          } catch (e) { console.warn('[JPMangaatlas Ads] Section failed:', id, e); }
        }
        return true;
      }
      function install() { sections.forEach(place); }
      if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install, { once: true });
      else install();
      var observer = new MutationObserver(install);
      observer.observe(document.documentElement, { childList: true, subtree: true });
      var tries = 0;
      var retry = setInterval(function () {
        install();
        if (++tries >= 50) clearInterval(retry);
      }, 300);
    })
    .catch(function (error) { console.warn('[JPMangaatlas Ads] Config failed:', error); });
})();