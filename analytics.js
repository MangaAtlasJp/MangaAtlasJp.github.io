/* JPMangaatlas GA4 analytics — measurement ID G-50N8R6DVZH */
(function () {
  'use strict';

  var MEASUREMENT_ID = 'G-50N8R6DVZH';
  var sent = false;

  function sendPageView() {
    if (sent || typeof window.gtag !== 'function') return;
    var isChapter = /\/chapter\.html$/i.test(location.pathname);
    var title = String(document.title || '').trim();

    if (isChapter && (!title || /^Manga Chapter Raw \| JPMangaatlas$/i.test(title) || title === 'Chapter | JPMangaatlas')) {
      return;
    }

    var params = {
      page_title: title || 'JPMangaatlas',
      page_location: location.href
    };

    if (isChapter) {
      try {
        var chapterTitle = document.getElementById('title')?.textContent?.trim();
        var slug = new URLSearchParams(location.search).get('slug') || '';
        if (chapterTitle) params.chapter_name = chapterTitle;
        if (slug) params.chapter_slug = slug;
      } catch (e) {}
    }

    window.gtag('event', 'page_view', params);
    sent = true;
  }

  function init() {
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };

    var script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(MEASUREMENT_ID);
    document.head.appendChild(script);

    window.gtag('js', new Date());
    window.gtag('config', MEASUREMENT_ID, { send_page_view: false });

    if (/\/chapter\.html$/i.test(location.pathname)) {
      var observer = new MutationObserver(function () {
        sendPageView();
        if (sent) observer.disconnect();
      });
      observer.observe(document.documentElement, { childList: true, subtree: true, characterData: true });
      setTimeout(function () { sendPageView(); if (sent) observer.disconnect(); }, 15000);
    } else {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', sendPageView, { once: true });
      } else {
        sendPageView();
      }
    }
  }

  init();
})();