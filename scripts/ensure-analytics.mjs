import fs from 'node:fs';
import path from 'node:path';

const GA_ID = 'G-DHGL7T1G5Z';
const files = fs.readdirSync('.').filter(name => name.endsWith('.html'));
const tag = `<!-- MangaAtlas GA4 --><script async src="https://www.googletagmanager.com/gtag/js?id=${GA_ID}"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${GA_ID}',{page_title:document.title,page_location:location.href});</script>`;

for (const file of files) {
  if (file === 'chapter.html') continue; // already has chapter-specific GA4 tracking.
  let html = fs.readFileSync(file, 'utf8');
  if (html.includes(GA_ID)) continue;
  if (!html.includes('</head>')) continue;
  html = html.replace('</head>', `${tag}</head>`);
  fs.writeFileSync(path.join('.', file), html);
  console.log(`Added GA4 to ${file}`);
}
