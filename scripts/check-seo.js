import fs from 'fs';
import path from 'path';

const seenTitles = new Map();
const seenDescs = new Map();
let hasErrors = false;

const allFiles = [];
const allLinks = new Set();
const internalLinksMap = new Map(); // file -> set of links

// 1. Build valid URL set
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

for (const fullPath of allFiles) {
  const content = fs.readFileSync(fullPath, 'utf-8');

  // Skip title/desc check for components and layouts
  if (!fullPath.includes('src/components/') && !fullPath.includes('src/layouts/')) {
      let titleMatch = content.match(/title:\s*['"]([^'"]+)['"]/);
      if (!titleMatch) titleMatch = content.match(/title\s*=\s*['"]([^'"]+)['"]/);
      if (!titleMatch) titleMatch = content.match(/title=\{["']([^"']+)["']\}/);
      if (!titleMatch) titleMatch = content.match(/<title>([^<]+)<\/title>/);
      
      let descMatch = content.match(/description:\s*['"]([^'"]+)['"]/);
      if (!descMatch) descMatch = content.match(/description\s*=\s*['"]([^'"]+)['"]/);
      if (!descMatch) descMatch = content.match(/description=\{["']([^"']+)["']\}/);
      
      let pubDateMatch = content.match(/pubDate:\s*([^\n]+)/);
      let updatedDateMatch = content.match(/updatedDate:\s*([^\n]+)/);

      const title = titleMatch ? titleMatch[1] : null;
      const desc = descMatch ? descMatch[1] : null;

      if (!title && !ignoreList.some(i => fullPath.includes(i))) {
        console.warn(`[SEO Warning] Title missing in ${fullPath}`);
      } else if (title) {
        if (title.length < 10) console.warn(`[SEO Warning] Title too short (${title.length}) in ${fullPath}: ${title}`);
        if (title.includes('| 好机场 | 好机场')) {
          console.error(`[SEO Error] Title double pipe in ${fullPath}: ${title}`);
          hasErrors = true;
        }
      }

      if (!desc && !ignoreList.some(i => fullPath.includes(i))) {
        console.warn(`[SEO Warning] Description missing in ${fullPath}`);
      } else if (desc) {
        if (desc.length < 20) console.warn(`[SEO Warning] Description too short (${desc.length}) in ${fullPath}: ${desc}`);
      }

      const h1Matches = content.match(/^#\s+.+$/gm) || [];
      const htmlH1Matches = content.match(/<h1[^>]*>/gi) || [];
      const totalH1s = h1Matches.length + htmlH1Matches.length;
      if (totalH1s > 1) {
         console.warn(`[SEO Warning] Multiple H1s (${totalH1s}) in ${fullPath}`);
      }

      if (pubDateMatch && updatedDateMatch) {
         let pDate = new Date(pubDateMatch[1].trim());
         let uDate = new Date(updatedDateMatch[1].trim());
         if (uDate < pDate) {
            console.error(`[SEO Error] updatedDate < pubDate in ${fullPath}`);
            hasErrors = true;
         }
      }
      
      const jsonLdMatch = content.match(/dateModified["']?:\s*["']([^"']+)["']/);
      const jsonLdPubMatch = content.match(/datePublished["']?:\s*["']([^"']+)["']/);
      if(jsonLdMatch && jsonLdPubMatch) {
         let uDate = new Date(jsonLdMatch[1]);
         let pDate = new Date(jsonLdPubMatch[1]);
         if (uDate < pDate) {
            console.error(`[SEO Error] JSON-LD dateModified < datePublished in ${fullPath}`);
            hasErrors = true;
         }
      }
  }

  // Extract links for P0 check
  const links = [...content.matchAll(/href=["'](\/[^"']+)["']/g), ...content.matchAll(/\[.*?\]\(\/([^\)]+)\)/g)];
  internalLinksMap.set(fullPath, new Set());
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
