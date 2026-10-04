/* JPMangaatlas Homepage System — isolated homepage release feed. */
(async()=>{
  const app=document.getElementById('app');
  if(!app||window.__mangaAtlasHomepageLoaded)return;
  window.__mangaAtlasHomepageLoaded=true;
  const GH='https://raw.githubusercontent.com/JPMangaatlasJp/JPMangaatlasJp.github.io/main/';
  const esc=v=>String(v??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#039;'}[m]));
  const norm=v=>String(v??'').toLowerCase().replace(/[-_](ja|raw)$/,'').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
  const unwrap=d=>{let v=d;for(let i=0;i<6;i++){if(v&&typeof v.content==='string'){try{v=JSON.parse(v.content);continue}catch(e){break}}break}return v&&typeof v==='object'?v:{}};
  const read=async(path)=>{
    try{const r=await fetch('/'+path+'?v='+Date.now(),{cache:'no-store'});if(r.ok)return unwrap(await r.json())}catch(e){}
    try{const r=await fetch(GH+path+'?v='+Date.now(),{cache:'no-store'});if(r.ok)return unwrap(await r.json())}catch(e){}
    return {};
  };
  const time=c=>{for(const k of ['updated_at','updatedAt','last_updated','lastUpdated','published_at','publishedAt','created_at','createdAt','posted_at','postedAt','date','timestamp']){const n=Date.parse(c?.[k]);if(Number.isFinite(n))return n}return 0};
  const title=c=>c?.mangaTitle||c?.manga||c?.series||c?.mangaId||c?.title||'Manga';
  const chapterId=c=>norm(c?.mangaId||c?.manga_id||c?.seriesId||c?.series_id||title(c)||c?.slug||'');
  const mangaId=m=>norm(m?.id||m?.slug||m?.mangaId||m?.manga_id||m?.title||'');
  const href=c=>'/chapter.html?slug='+encodeURIComponent(c?.slug||'');
  try{
    const [content,manual]=await Promise.all([read('data/content.json'),read('data/manual-chapters.json')]);
    const mangas=Array.isArray(content.mangas)?content.mangas:[];
    const mangaMap=new Map();
    mangas.forEach(m=>{const key=mangaId(m);if(key)mangaMap.set(key,m)});
    const resolveManga=c=>{
      const direct=mangaMap.get(chapterId(c));
      if(direct)return direct;
      const t=norm(title(c));
      return mangas.find(m=>mangaId(m)===t||norm(m.title)===t||norm(m.slug)===t)||null;
    };
    const isJapaneseManga=m=>{
      if(!m)return false;
      const country=String(m.country||m.origin||m.region||'').toLowerCase().trim();
      const language=String(m.language||m.lang||'').toLowerCase().trim();
      return country==='jp'||country==='jpn'||country==='japan'||country.includes('japan')||language==='ja'||language==='jp'||language.includes('japanese');
    };
    const blockedSlug='hun x hun - us - 419';
    const rows=[];const seen=new Set();
    // Manual chapters intentionally come first so a newly posted chapter overrides
    // a stale/duplicated record in content.json with the same slug.
    for(const source of [manual.chapters||[],content.chapters||[]]) for(const c of source){
      if(!c?.slug)continue;
      if(String(c.slug).trim().toLowerCase()===blockedSlug)continue;
      const manga=resolveManga(c);
      if(!isJapaneseManga(manga))continue;
      const key=String(c.slug).trim().toLowerCase();
      if(!key||seen.has(key))continue;
      seen.add(key);rows.push(c);
    }
    rows.sort((a,b)=>time(b)-time(a)||Number(b.number||0)-Number(a.number||0));
    const latestByManga=new Map();
    for(const c of rows){const k=chapterId(c);if(k&&!latestByManga.has(k))latestByManga.set(k,c)}
    const latest=[...latestByManga.values()].sort((a,b)=>time(b)-time(a)||Number(b.number||0)-Number(a.number||0));
    const info=c=>resolveManga(c);
    const cover=c=>{
      const m=info(c),v=m?.cover||c?.cover||c?.cover_url||'';
      if(!v)return '';
      if(/^https:\/\/mangaatlas\.github\.io\//i.test(v))return v.replace(/^https:\/\/mangaatlas\.github\.io\//i,GH);
      return /^https?:\/\//i.test(v)?v:(GH+String(v).replace(/^\/+/,''));
    };
    if(!latest.length){app.innerHTML='<div class="empty">No latest chapters found.</div>';return}
    const card=(c,i)=>{const m=info(c),name=m?.title||title(c),img=cover(c);return '<a class="ma-home-card '+(i===0?'featured':'')+'" href="'+href(c)+'">'+(img?'<img src="'+esc(img)+'" alt="'+esc(name)+'" loading="'+(i<2?'eager':'lazy')+'">':'<div class="ma-home-cover-fallback">M</div>')+'<div class="ma-home-overlay"><small>Latest release</small><strong>'+esc(name)+'</strong><span>Chapter '+esc(c.number??'')+'</span></div></a>'};
    const list=c=>'<a class="ma-home-list-item" href="'+href(c)+'"><div><strong>'+esc(info(c)?.title||title(c))+'</strong><span>Chapter '+esc(c.number??'')+'</span></div><b>Read →</b></a>';
    app.innerHTML='<div class="ma-home-wrap"><section class="ma-home-section"><div class="ma-home-heading"><div><span>LATEST RELEASES</span><h2>Latest Chapters</h2><p>Newest posted or updated chapter from each Japanese manga.</p></div><a href="/latest-chapters.html">View all →</a></div><div class="ma-home-grid">'+latest.slice(0,10).map(card).join('')+'</div></section><section class="ma-home-section"><div class="ma-home-heading"><div><span>RECENT ACTIVITY</span><h2>More Latest Chapters</h2></div></div><div class="ma-home-list">'+latest.slice(0,18).map(list).join('')+'</div></section></div>';
  }catch(e){console.warn('Homepage System unavailable',e);app.innerHTML='<div class="empty">Unable to load latest chapters.</div>'}
})();
(function(){const style=document.createElement('style');style.textContent=`.ma-home-wrap{max-width:1380px;margin:0 auto;padding:8px 0 40px}.ma-home-section{margin:0 0 34px}.ma-home-heading{display:flex;justify-content:space-between;align-items:end;gap:20px;margin-bottom:18px}.ma-home-heading span{font-size:11px;letter-spacing:.14em;font-weight:900;color:#7da8ef}.ma-home-heading h2{font-size:28px;margin:5px 0}.ma-home-heading p{margin:0;color:#8f97a8;font-size:13px}.ma-home-heading>a{color:#9fc2ff;font-size:13px;font-weight:800;white-space:nowrap}.ma-home-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:12px}.ma-home-card{position:relative;display:block;min-height:245px;border-radius:14px;overflow:hidden;background:#10151f;border:1px solid #2b3547}.ma-home-card img,.ma-home-card .ma-home-cover-fallback{width:100%;height:245px;display:block;object-fit:cover}.ma-home-card.featured{grid-column:span 2}.ma-home-card.featured img,.ma-home-card.featured .ma-home-cover-fallback{height:320px}.ma-home-cover-fallback{display:flex!important;align-items:center;justify-content:center;color:#61708a;font-weight:900;font-size:28px;background:#151a24}.ma-home-overlay{position:absolute;left:0;right:0;bottom:0;padding:38px 13px 13px;background:linear-gradient(transparent,rgba(5,7,12,.96));display:flex;flex-direction:column}.ma-home-overlay small{color:#b9c0cc;font-size:10px}.ma-home-overlay strong{font-size:15px;margin-top:5px;line-height:1.3}.ma-home-overlay span{font-size:11px;color:#9fc2ff;margin-top:5px}.ma-home-list{border-top:1px solid #252c39}.ma-home-list-item{display:flex;justify-content:space-between;align-items:center;gap:15px;padding:15px 8px;border-bottom:1px solid #252c39}.ma-home-list-item div{display:flex;flex-direction:column;gap:4px}.ma-home-list-item strong{font-size:14px}.ma-home-list-item span{font-size:12px;color:#8f97a8}.ma-home-list-item b{font-size:12px;color:#7da8ef;white-space:nowrap}@media(max-width:1050px){.ma-home-grid{grid-template-columns:repeat(4,1fr)}}@media(max-width:700px){.ma-home-grid{grid-template-columns:repeat(2,1fr)}.ma-home-card.featured{grid-column:span 2}.ma-home-card,.ma-home-card.featured,.ma-home-card img,.ma-home-card.featured img,.ma-home-card .ma-home-cover-fallback,.ma-home-card.featured .ma-home-cover-fallback{min-height:220px;height:220px}}`;document.head.appendChild(style)})();