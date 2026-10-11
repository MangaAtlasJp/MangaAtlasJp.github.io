/* JPMangaatlas Ads System — admin-controlled ad sections. */
(function () {
  'use strict';
  if (window.__mangaAtlasAdsSystemLoaded) return;
  window.__mangaAtlasAdsSystemLoaded = true;
  if (location.pathname.indexOf('/admin') === 0) return;

  var configUrl = '/data/ads-config.json?v=' + Date.now();
  fetch(configUrl, { cache: 'no-store' })
    .then(function (response) {
      if (!response.ok) throw new Error('Ads config HTTP ' + response.status);
      return response.json();
    })
    .then(function (config) {
      var sections = Array.isArray(config && config.sections)
        ? config.sections.filter(function (section) {
            return section && section.enabled && String(section.code || '').trim();
          })
        : [];
      if (!sections.length) return;

      function getRoot() {
        return document.querySelector('.pages') ||
          document.querySelector('main') ||
          document.querySelector('article') ||
          document.body;
      }

      function findSlot(id) {
        return Array.prototype.slice.call(document.querySelectorAll('[data-ma-ad-section]'))
          .some(function (node) { return node.getAttribute('data-ma-ad-section') === String(id); });
      }

      function getFrameHeight(code) {
        var matches = String(code).matchAll(/['"]height['"]\s*:\s*(\d+)/g);
        var height = 300;
        for (var match of matches) height = Math.max(height, Number(match[1]) || 0);
        return Math.min(650, Math.max(250, height + 30));
      }

      function createSlot(section) {
        var box = document.createElement('div');
        box.className = 'manga-atlas-ad-slot';
        box.setAttribute('data-ma-ad-section', String(section.id || ''));
        box.style.cssText = 'width:100%;min-height:90px;margin:20px auto;display:flex;justify-content:center;align-items:flex-start;clear:both;overflow:visible;position:relative;z-index:1;';
        var frame = document.createElement('iframe');
        frame.title = 'Advertisement ' + String(section.id || '');
        frame.setAttribute('scrolling', 'auto');
        frame.setAttribute('referrerpolicy', 'unsafe-url');
        frame.style.cssText = 'display:block;width:100%;max-width:100%;height:' + getFrameHeight(section.code) + 'px;border:0;background:transparent;overflow:visible;';
        box.appendChild(frame);
        return { box: box, frame: frame, code: String(section.code || '') };
      }

      function runInFrame(slot) {
        try {
          var doc = slot.frame.contentDocument || slot.frame.contentWindow.document;
          doc.open();
          doc.write('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><base target="_blank"></head><body style="margin:0;padding:0;text-align:center;overflow:auto;">' + slot.code + '</body></html>');
          doc.close();
        } catch (error) {
          console.warn('[JPMangaatlas Ads] Could not initialize section:', error);
        }
      }

      function place(section) {
        var id = String(section.id || '');
        if (!id || findSlot(id)) return true;
        var placement = String(section.placement || 'start').toLowerCase();
        var slot = createSlot(section);
        if (placement === 'between') {
          var pages = document.querySelector('.pages');
          if (!pages) return false;
          var images = Array.prototype.slice.call(pages.querySelectorAll('img.page'));
          var after = parseInt(section.afterImage != null ? section.afterImage : section.between, 10);
          if (!Number.isFinite(after) || after < 1) after = 5;
          if (images.length < after) return false;
          pages.insertBefore(slot.box, images[after - 1].nextSibling);
        } else {
          var root = getRoot();
          if (!root || !root.parentNode) return false;
          if (placement === 'end') root.parentNode.insertBefore(slot.box, root.nextSibling);
          else root.parentNode.insertBefore(slot.box, root);
        }
        runInFrame(slot);
        return true;
      }

      function install() {
        sections.forEach(place);
      }

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', install, { once: true });
      } else {
        install();
      }

      var observer = new MutationObserver(install);
      observer.observe(document.documentElement, { childList: true, subtree: true });
      var attempts = 0;
      var retry = setInterval(function () {
        install();
        attempts += 1;
        if (attempts >= 50) clearInterval(retry);
      }, 300);
    })
    .catch(function (error) {
      console.warn('[JPMangaatlas Ads] Configuration failed to load:', error);
    });
})();