/* JPMangaatlas — isolated chapter view counter system. Does not touch Admin or chapter data. */
(function(){
  'use strict';
  function run(){
    var slug='';
    try { slug=decodeURIComponent(new URLSearchParams(location.search).get('slug')||''); } catch(e) {}
    var host=document.getElementById('manga-atlas-view-count');
    if(!slug || !host || host.dataset.countStarted) return;
    host.dataset.countStarted='1';
    var safe=slug.toLowerCase().replace(/[^a-z0-9_-]+/g,'-').replace(/^-+|-+$/g,'').slice(0,180);
    if(!safe) return;
    var url='https://api.counterapi.dev/v1/mangaatlas-chapters/chapter-'+encodeURIComponent(safe)+'/up';
    fetch(url,{method:'GET',cache:'no-store'})
      .then(function(r){if(!r.ok)throw new Error('counter '+r.status);return r.json();})
      .then(function(result){
        var value=Number(result && (result.count ?? result.value));
        host.textContent=Number.isFinite(value)?value.toLocaleString():'0';
        host.removeAttribute('aria-busy');
      })
      .catch(function(){host.textContent='0';host.removeAttribute('aria-busy');});
  }
  function watch(){
    run();
    var obs=new MutationObserver(function(){run();if(document.getElementById('manga-atlas-view-count')?.dataset.countStarted)obs.disconnect();});
    obs.observe(document.body,{childList:true,subtree:true});
    setTimeout(function(){obs.disconnect();},10000);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',watch,{once:true});else watch();
})();
