import fs from 'fs';
import path from 'path';

let hasErrors = false;
const allFiles = [];
const validUrls = new Set();
validUrls.add('/');

function scanValidUrlsPages(dirPath, baseRoute = '/') {
  if (!fs.existsSync(dirPath)) return;
  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      scanValidUrlsPages(fullPath, baseRoute + file + '/');
    } else if (file.endsWith('.astro')) {
      const name = file.replace('.astro', '');
      if (name === 'index') {
        validUrls.add(baseRoute);
      } else if (name !== '[...slug]' && name !== '404' && name !== 'rss.xml.js') {
        validUrls.add(baseRoute + name + '/');
        validUrls.add(baseRoute + name);
      }
    }
  }
}
scanValidUrlsPages('src/pages');

function scanValidUrlsBlog(dirPath) {
  if (!fs.existsSync(dirPath)) return;
  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    if (file.endsWith('.md') || file.endsWith('.mdx')) {
      const slug = file.replace(/\.(md|mdx)$/, '');
      validUrls.add(`/blog/${slug}/`);
      validUrls.add(`/blog/${slug}`);
    }
  }
}
scanValidUrlsBlog('src/content/blog');

function scanFiles(dirPath, ext) {
  if (!fs.existsSync(dirPath)) return;
  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      scanFiles(fullPath, ext);
    } else if (ext.some(e => file.endsWith(e))) {
      allFiles.push(fullPath.replace(/\\/g, '/'));
    }
  }
}
scanFiles('src/pages', ['.astro']);
scanFiles('src/content/blog', ['.md', '.mdx']);
scanFiles('src/components', ['.astro']);
scanFiles('src/layouts', ['.astro']);

const ignoreList = ['404', 'rss.xml', 'api', 'admin', '[...slug].astro', 'ios.astro', 'mac.astro', 'speedtest-gen.astro'];

let brokenLinksCount = 0;

// SEO Intent Map (Keyword Collision Check)
const intentMap = {
  '2026机场推荐': '/',
  '机场排行榜': '/brands/',
  '机场推荐排行': '/brands/',
  '稳定机场推荐': '/blog/stable-airports/',
  '便宜机场推荐': '/blog/cheap-airports/',
  '专线机场推荐': '/blog/iplc-iepl-airports/',
  '按量计费机场': '/blog/pay-as-you-go-airports/',
  'clash机场推荐': '/blog/clash-best-airports/',
  'shadowrocket机场推荐': '/blog/shadowrocket-airports/',
  'ai机场推荐': '/blog/ai-chatgpt-airports/',
  '流媒体机场推荐': '/blog/streaming-airports/',
  '四大优质机场': '/blog/top-4-recommended-airports/'
};

for (const fullPath of allFiles) {
  const content = fs.readFileSync(fullPath, 'utf-8');
  let urlPath = fullPath.replace('src/pages', '').replace('src/content', '').replace('.astro', '/').replace('.mdx', '/').replace('.md', '/').replace('//', '/');
  if (urlPath === '/index/') urlPath = '/';
  if (urlPath.includes('components') || urlPath.includes('layouts')) continue;

  if (!fullPath.includes('src/components/') && !fullPath.includes('src/layouts/')) {
      let titleMatch = content.match(/title:\s*['"]([^'"]+)['"]/);
      if (!titleMatch) titleMatch = content.match(/title\s*=\s*['"]([^'"]+)['"]/);
      if (!titleMatch) titleMatch = content.match(/title=\{["']([^"']+)["']\}/);
      if (!titleMatch) titleMatch = content.match(/<title>([^<]+)<\/title>/);
      
      let pubDateMatch = content.match(/pubDate:\s*([^\n]+)/);
      let updatedDateMatch = content.match(/updatedDate:\s*([^\n]+)/);

      const title = titleMatch ? titleMatch[1] : null;

      if (!title && !ignoreList.some(i => fullPath.includes(i))) {
        console.warn(`[SEO Warning] Title missing in ${fullPath}`);
      } else if (title) {
        if (title.length < 10) console.warn(`[SEO Warning] Title too short (${title.length}) in ${fullPath}: ${title}`);
        if (title.includes('| 好机场 | 好机场')) {
          console.error(`[SEO Error] Title double pipe in ${fullPath}: ${title}`);
          hasErrors = true;
        }

        // Check for Intent Collision in Title (WARNING ONLY)
        const lowerTitle = title.toLowerCase();
        for (const [kw, targetUrl] of Object.entries(intentMap)) {
            // We use exact intent match for collision detection
            if (lowerTitle.includes(kw) && urlPath !== targetUrl && urlPath !== targetUrl.replace(/\/$/, '')) {
                 console.warn(`[SEO Warning] Intent Collision: URL ${urlPath} is targeting "${kw}" which belongs to ${targetUrl}`);
            }
        }
      }

      const htmlH1Matches = content.match(/<h1[^>]*>/gi) || [];
      const mdH1Matches = content.match(/^#\s+.+$/gm) || [];
      let actualH1Count = htmlH1Matches.length;
      for (const h1 of mdH1Matches) {
         if (!h1.includes('# 假设')) actualH1Count++; // ignore code block comments
      }
      
      if (actualH1Count > 1) {
         console.warn(`[SEO Warning] Multiple H1s (${actualH1Count}) in ${fullPath}`);
      }

      if (pubDateMatch && updatedDateMatch) {
         let pDate = new Date(pubDateMatch[1].trim());
         let uDate = new Date(updatedDateMatch[1].trim());
         if (uDate < pDate) {
            console.error(`[SEO Error] updatedDate < pubDate in ${fullPath}`);
            hasErrors = true;
         }
      }
  }

  // Extract links for P0 check
  const links = [...content.matchAll(/href=["'](\/[^"']+)["']/g), ...content.matchAll(/\[.*?\]\(\/([^\)]+)\)/g)];
  for (const m of links) {
    let link = m[1].startsWith('/') ? m[1] : '/' + m[1];
    link = link.replace(/#.*$/, ''); // remove hash
    link = link.replace(/\?.*$/, ''); // remove query
    if (link !== '/' && !link.startsWith('/api/') && !link.startsWith('/admin/') && !link.match(/\.(svg|png|jpg|jpeg|gif|webp|css|js|woff2?|json)$/)) {
        if (!validUrls.has(link) && !validUrls.has(link + '/') && !validUrls.has(link.replace(/\/$/, ''))) {
            console.error(`[SEO Error] Broken internal link in ${fullPath}: ${link}`);
            hasErrors = true;
            brokenLinksCount++;
        }
    }
  }
}

console.log('SEO Check completed. Broken links found:', brokenLinksCount);
if (hasErrors) {
  process.exit(1);
}
