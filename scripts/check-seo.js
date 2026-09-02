 import fs from 'fs';
import path from 'path';

const seenTitles = new Set();
const seenDescs = new Set();

function checkSeoInDir(dirPath, ext) {
  if (!fs.existsSync(dirPath)) return;
  
  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      checkSeoInDir(fullPath, ext);
    } else if (file.endsWith(ext)) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      
      let titleMatch = content.match(/title:\s*['"]([^'"]+)['"]/);
      if (!titleMatch) titleMatch = content.match(/title\s*=\s*['"]([^'"]+)['"]/);
      if (!titleMatch) titleMatch = content.match(/title=["']([^"']+)["']/);

      let descMatch = content.match(/description:\s*['"]([^'"]+)['"]/);
      if (!descMatch) descMatch = content.match(/description\s*=\s*['"]([^'"]+)['"]/);
      if (!descMatch) descMatch = content.match(/description=["']([^"']+)["']/);

      const title = titleMatch ? titleMatch[1] : null;
      const desc = descMatch ? descMatch[1] : null;

      if (!title && !fullPath.includes('404') && !fullPath.includes('rss.xml') && !fullPath.includes('api')) {
        console.warn(`[SEO Warning] Title missing in ${fullPath}`);
      } else if (title && title.length < 10) {
        console.warn(`[SEO Warning] Title too short (${title.length}) in ${fullPath}: ${title}`);
      } else if (title) {
        if (seenTitles.has(title)) {
           console.warn(`[SEO Warning] Duplicate title in ${fullPath}: ${title}`);
        } else {
           seenTitles.add(title);
        }
      }

      if (!desc && !fullPath.includes('404') && !fullPath.includes('rss.xml') && !fullPath.includes('api')) {
        console.warn(`[SEO Warning] Description missing in ${fullPath}`);
      } else if (desc && desc.length < 20) {
        console.warn(`[SEO Warning] Description too short (${desc.length}) in ${fullPath}: ${desc}`);
      } else if (desc) {
        if (seenDescs.has(desc)) {
           console.warn(`[SEO Warning] Duplicate description in ${fullPath}: ${desc}`);
        } else {
           seenDescs.add(desc);
        }
      }
    }
  }
}

console.log('Running SEO Check...');
checkSeoInDir('src/pages', '.astro');
checkSeoInDir('src/content/blog', '.md');
checkSeoInDir('src/content/blog', '.mdx');
console.log('SEO Check completed.');
