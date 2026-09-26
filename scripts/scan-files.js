import fs from 'fs';
import path from 'path';

function scanDir(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      scanDir(filePath, fileList);
    } else {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const pages = scanDir('src/pages').filter(f => f.endsWith('.astro') || f.endsWith('.md') || f.endsWith('.mdx'));
const blog = scanDir('src/content/blog').filter(f => f.endsWith('.md') || f.endsWith('.mdx'));

console.log("--- PAGES ---");
pages.forEach(p => console.log(p.replace(/\\/g, '/')));
console.log("\n--- BLOG ---");
blog.forEach(b => console.log(b.replace(/\\/g, '/')));
