/* JPMangaatlas Latest Chapters System — isolated homepage fallback. */
(async()=>{
 const app=document.getElementById('app'); if(!app||document.getElementById('manga-atlas-latest-system')) return;
 const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
 const GH='https://raw.githubusercontent.com/MangaAtlasJp/MangaAtlasJp.github.io/main/';
 const root=document.createElement('section'); root.id='manga-atlas-latest-system'; root.className='ma-latest-system';
 const style=document.createElement('style'); style.textContent='.ma-latest-system{max-width:1380px;margin:0 auto 28px;padding:24px 5%}.ma-latest-shell{padding:24px;border:2px solid #5b8bd9;border-radius:18px;background:#10151f}.ma-latest-head{display:flex;justify-content:space-between;gap:20px;align-items:end;margin-bottom:18px}.ma-latest-kicker{color:#7da8ef;font-size:12px;font-weight:900;letter-spacing:.12em}.ma-latest-head h2{margin:5px 0;font-size:30px}.ma-latest-head p{margin:0;color:#aeb5c2}.ma-latest-head>a{padding:10px 14px;border:1px solid #33415a;border-radius:9px;color:#c7d8f5}.ma-latest-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}.ma-latest-card{display:grid;grid-template-columns:88px 1fr;gap:14px;padding:14px;border:1px solid #2b3547;border-radius:13px;background:#0b1018}.ma-latest-card img{width:88px;height:118px;object-fit:cover;border-radius:9px;background:#171922}.ma-latest-copy{min-width:0}.ma-latest-badge{display:inline-block;padding:4px 7px;border-radius:999px;background:#18263a;color:#9fc2ff;font-size:10px;font-weight:900}.ma-latest-card h3{margin:9px 0 8px;font-size:16px;line-height:1.35}.ma-latest-card p{margin:0;color:#9ba2b0;font-size:12px}.ma-latest-link{display:inline-block;margin-top:11px;color:#82a9e7;font-size:12px;font-weight:800}@media(max-width:900px){.ma-latest-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:600px){.ma-latest-head{align-items:flex-start;flex-direction:column}.ma-latest-grid{grid-template-columns:1fr}.ma-latest-card{grid-template-columns:80px 1fr}.ma-latest-card img{width:80px;height:108px}}'; document.head.appendChild(style);
 const unwrap=d=>{if(d&&typeof d.content==='string'){try{return JSON.parse(d.content)}catch(e){return {}}}return d&&typeof d==='object'?d:{}};
 try{
  const [content,manual]=await Promise.all([
   fetch('/data/content.json?v='+Date.now(),{cache:'no-store'}).then(r=>r.ok?r.json():{}).catch(()=>({})),
   fetch('/data/manual-chapters.json?v='+Date.now(),{cache:'no-store'}).then(r=>r.ok?r.json():{}).catch(()=>({}))
  ]);
  const cd=unwrap(content),md=unwrap(manual); const rows=[]; const seen=new Set();
  const add=(c,source,index)=>{if(!c?.slug)return;const k=String(c.slug).toLowerCase();if(seen.has(k))return;seen.add(k);rows.push({c,source,index})};
  (cd.chapters||[]).forEach((c,i)=>add(c,0,i)); (md.chapters||[]).forEach((c,i)=>add(c,1,i));
  const timeOf=c=>{for(const k of ['updated_at','updatedAt','last_updated','lastUpdated','published_at','publishedAt','created_at','createdAt','posted_at','postedAt','date','timestamp']){const n=Date.parse(c?.[k]);if(Number.isFinite(n))return n}return 0};
  const id=c=>String(c?.mangaId||c?.manga_id||c?.seriesId||c?.series_id||c?.mangaTitle||c?.manga||c?.series||c?.slug||'').toLowerCase().replace(/[-_](ja|raw)$/,'').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
  rows.sort((a,b)=>timeOf(b.c)-timeOf(a.c)||b.source-a.source||Number(b.c.number||0)-Number(a.c.number||0)||b.index-a.index);
  const latestByManga=new Map(); for(const row of rows){const k=id(row.c);if(k&&!latestByManga.has(k))latestByManga.set(k,row.c)}
  const latest=[...latestByManga.values()].slice(0,6);
  root.innerHTML='<div class="ma-latest-shell"><div class="ma-latest-head"><div><div class="ma-latest-kicker">LATEST ACTIVITY</div><h2>Latest Chapters</h2><p>Only the newest chapter from each manga appears here.</p></div><a href="/latest-chapters.html">View all chapters →</a></div><div class="ma-latest-grid"></div></div>';
  const grid=root.querySelector('.ma-latest-grid'); latest.forEach((c,i)=>{const cover=c.cover||c.cover_url||'';const title=c.title||c.name||'Latest Chapter';const series=c.mangaTitle||c.manga||c.series||c.mangaId||'Manga';const number=c.number??'';const a=document.createElement('a');a.className='ma-latest-card';a.href='/chapter.html?slug='+encodeURIComponent(c.slug);a.innerHTML=(cover?'<img src="'+esc(cover.startsWith('http')?cover:GH+cover)+'" alt="'+esc(series)+' manga cover" loading="'+(i<2?'eager':'lazy')+'">':'<div></div>')+'<div class="ma-latest-copy"><span class="ma-latest-badge">NEW / UPDATED</span><h3>'+esc(title)+'</h3><p>'+esc(series)+(number!==''?' · Chapter '+esc(number):'')+'</p><span class="ma-latest-link">Read Chapter →</span></div>';grid.appendChild(a)});
  app.parentNode.insertBefore(root,app);
 }catch(e){console.warn('Latest Chapters System unavailable',e)}
})();