/* JPMangaatlas SEO System — isolated metadata/canonical/structured-data layer. */
(async()=>{
  if(location.pathname.startsWith('/admin')) return;
  if(document.documentElement.dataset.mangaAtlasSeo==='ready') return;
  document.documentElement.dataset.mangaAtlasSeo='ready';

  const esc=v=>String(v??'').replace(/[&<>\"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[m]));
  const base='https://mangaatlasjp.github.io';
  const upsert=(selector,attrs)=>{
    let el=document.head.querySelector(selector);
    if(!el){el=document.createElement('meta');document.head.appendChild(el)}
    Object.keys(attrs).forEach(k=>el.setAttribute(k,attrs[k]));
    return el;
  };
  const canonical=url=>{
    let el=document.head.querySelector('link[rel="canonical"]');
    if(!el){el=document.createElement('link');el.rel='canonical';document.head.appendChild(el)}
    el.href=url; return el;
  };
  const jsonLd=data=>{
    const old=document.head.querySelector('script[data-manga-atlas-seo-jsonld]');
    if(old) old.remove();
    const s=document.createElement('script');
    s.type='application/ld+json';
    s.dataset.mangaAtlasSeoJsonld='1';
    s.textContent=JSON.stringify(data);
    document.head.appendChild(s);
  };

  try{
    const path=location.pathname;
    const params=new URLSearchParams(location.search);
    const slug=params.get('slug');

    if(path==='/chapter.html'||path==='/chapter'){
      if(!slug) return;
      const [content,manual]=await Promise.all([
        fetch('/data/content.json?v='+Date.now(),{cache:'no-store'}).then(r=>r.ok?r.json():{}).catch(()=>({})),
        fetch('/data/manual-chapters.json?v='+Date.now(),{cache:'no-store'}).then(r=>r.ok?r.json():{}).catch(()=>({}))
      ]);
      const rows=[...(content.chapters||[]),...(manual.chapters||[])];
      const c=rows.find(x=>String(x.slug||'')===String(slug));
      if(!c) return;
      const title=String(c.title||c.name||'Manga Chapter Raw').trim();
      const series=String(c.mangaTitle||c.manga||c.series||c.mangaId||'Manga').trim();
      const number=c.number!=null?String(c.number):'';
      const seoTitle=(title+' | JPMangaatlas').slice(0,70);
      const desc=(number?series+' chapter '+number+' raw release. ':'')+'Read '+title+' on JPMangaatlas.';
      const url=base+'/chapter.html?slug='+encodeURIComponent(slug);
      const pages=Array.isArray(c.pages)?c.pages:[];
      const image=pages.length?String(pages[0]):'';
      document.title=seoTitle;
      upsert('meta[name="description"]',{name:'description',content:desc.slice(0,155)});
      upsert('meta[property="og:title"]',{'property':'og:title',content:seoTitle});
      upsert('meta[property="og:description"]',{'property':'og:description',content:desc.slice(0,200)});
      upsert('meta[property="og:url"]',{'property':'og:url',content:url});
      upsert('meta[name="twitter:title"]',{name:'twitter:title',content:seoTitle});
      upsert('meta[name="twitter:description"]',{name:'twitter:description',content:desc.slice(0,200)});
      canonical(url);
      jsonLd({
        '@context':'https://schema.org',
        '@type':'Article',
        headline:title,
        name:title,
        description:desc.slice(0,200),
        url:url,
        mainEntityOfPage:{'@type':'WebPage','@id':url},
        isPartOf:{'@type':'WebSite',name:'JPMangaatlas',url:base+'/'},
        about:{'@type':'Thing',name:series},
        keywords:[series,'manga raw','manga chapter','chapter '+number].filter(Boolean).join(', '),
        image:image||undefined,
        primaryImageOfPage:image?{'@type':'ImageObject',url:image}:undefined,
        datePublished:c.createdAt||c.created_at||undefined,
        dateModified:c.updatedAt||c.updated_at||c.createdAt||c.created_at||undefined
      });
      return;
    }

    if(path==='/'){
      document.title='JPMangaatlas — Latest Manga Chapters & Raw Releases';
      upsert('meta[name="description"]',{name:'description',content:'JPMangaatlas — discover the latest manga chapters, raw releases and new chapter updates.'});
      canonical(base+'/');
      jsonLd({'@context':'https://schema.org','@type':'WebSite',name:'JPMangaatlas',url:base+'/',description:'Latest manga chapters and raw releases on JPMangaatlas.'});
      return;
    }

    if(path==='/latest-chapters.html'){
      canonical(base+'/latest-chapters.html');
      jsonLd({'@context':'https://schema.org','@type':'CollectionPage',name:'Latest Manga Chapters & Raw Releases | JPMangaatlas',url:base+'/latest-chapters.html',isPartOf:{'@type':'WebSite',name:'JPMangaatlas',url:base+'/'}});
    }
  }catch(e){console.warn('JPMangaatlas SEO System unavailable',e)}
})();
