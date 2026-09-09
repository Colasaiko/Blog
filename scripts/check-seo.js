import fs from 'fs';
import path from 'path';

const seenTitles = new Map();
const seenDescs = new Map();
let hasErrors = false;

const allFiles = [];
const allLinks = new Set();
const internalLinksMap = new Map(); // file -> set of links

function scanFiles(dirPath, ext) {
  if (!fs.existsSync(dirPath)) return;
  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      scanFiles(fullPath, ext);
    } else if (file.endsWith(ext)) {
      allFiles.push(fullPath.replace(/\\/g, '/'));
    }
  }
}

scanFiles('src/pages', '.astro');
scanFiles('src/content/blog', '.md');
scanFiles('src/content/blog', '.mdx');

const ignoreList = ['404', 'rss.xml', 'api', 'admin', '[...slug].astro', 'ios.astro', 'mac.astro', 'speedtest-gen.astro'];

for (const fullPath of allFiles) {
  const content = fs.readFileSync(fullPath, 'utf-8');
  const basename = path.basename(fullPath);
  const slug = basename.replace(/\.(md|mdx|astro)$/, '');

  let titleMatch = content.match(/title:\s*['"]([^'"]+)['"]/);
  if (!titleMatch) titleMatch = content.match(/title\s*=\s*['"]([^'"]+)['"]/);
  if (!titleMatch) titleMatch = content.match(/title=["']([^"']+)["']/);

  let descMatch = content.match(/description:\s*['"]([^'"]+)['"]/);
  if (!descMatch) descMatch = content.match(/description\s*=\s*['"]([^'"]+)['"]/);
  if (!descMatch) descMatch = content.match(/description=["']([^"']+)["']/);
  
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
    if (seenTitles.has(title)) {
       console.warn(`[SEO Warning] Duplicate title in ${fullPath} and ${seenTitles.get(title)}: ${title}`);
    } else {
       seenTitles.set(title, fullPath);
    }
  }

  if (!desc && !ignoreList.some(i => fullPath.includes(i))) {
    console.warn(`[SEO Warning] Description missing in ${fullPath}`);
  } else if (desc) {
    if (desc.length < 20) console.warn(`[SEO Warning] Description too short (${desc.length}) in ${fullPath}: ${desc}`);
    if (seenDescs.has(desc)) {
       console.warn(`[SEO Warning] Duplicate description in ${fullPath} and ${seenDescs.get(desc)}: ${desc}`);
    } else {
       seenDescs.set(desc, fullPath);
    }
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
  
  // JSON-LD Date check
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

  // Extract links
  const links = [...content.matchAll(/href=["'](\/[^"']+)["']/g), ...content.matchAll(/\[.*?\]\(\/([^\)]+)\)/g)];
  internalLinksMap.set(fullPath, new Set());
  for (const m of links) {
    let link = m[1].replace(/#.*$/, ''); // remove hash
    if (link !== '/') {
        link = link.replace(/\/$/, ''); // remove trailing slash
    }
    internalLinksMap.get(fullPath).add(link);
    allLinks.add(link);
  }
}

// Simple Orphan check (Very basic, assumes slugs map to /category/slug or /slug)
// Let's just do a basic one for blog posts
for (const fullPath of allFiles) {
  if (fullPath.includes('src/content/blog/') && !ignoreList.some(i => fullPath.includes(i))) {
    const slug = path.basename(fullPath).replace(/\.(md|mdx)$/, '');
    let found = false;
    for (const [file, links] of internalLinksMap.entries()) {
      if (file === fullPath) continue;
      for (const link of links) {
         if (link.includes(slug)) { found = true; break; }
      }
      if (found) break;
    }
    if (!found) {
       console.warn(`[SEO Warning] Orphan page detected (no internal links found pointing to it): ${fullPath}`);
    }
    
    if (internalLinksMap.get(fullPath).size === 0) {
       console.warn(`[SEO Warning] No internal links out from: ${fullPath}`);
    }
  }
}

console.log('SEO Check completed.');
if (hasErrors) {
  process.exit(1);
}
