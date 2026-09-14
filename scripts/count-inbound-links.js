import fs from 'fs';
import path from 'path';

const allFiles = [];
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

const targets = {
    '/': 0,
    '/brands/': 0,
    '/blog/stable-airports/': 0,
    '/blog/cheap-airports/': 0,
    '/blog/iplc-iepl-airports/': 0,
    '/blog/pay-as-you-go-airports/': 0,
    '/blog/clash-best-airports/': 0,
    '/blog/shadowrocket-airports/': 0,
    '/blog/ai-chatgpt-airports/': 0,
    '/blog/streaming-airports/': 0,
    '/blog/how-to-choose-airport/': 0
};

for (const fullPath of allFiles) {
    const content = fs.readFileSync(fullPath, 'utf8');
    for (const target of Object.keys(targets)) {
        // Simple string matching for exact hrefs. We ignore self-links if any.
        // E.g., href="/" or (/blog/stable-airports/)
        let urlPath = fullPath.replace('src/pages', '').replace('src/content', '').replace('.astro', '/').replace('.mdx', '/').replace('.md', '/').replace('//', '/');
        if (urlPath === '/index/') urlPath = '/';
        
        if (urlPath !== target) {
            // Count occurrences
            const regex1 = new RegExp(`href=["']${target.replace(/\//g, '\\/')}["']`, 'g');
            const regex2 = new RegExp(`\\]\\(${target.replace(/\//g, '\\/')}\\)`, 'g');
            let match1 = content.match(regex1);
            let match2 = content.match(regex2);
            if (match1) targets[target] += match1.length;
            if (match2) targets[target] += match2.length;
        }
    }
}

console.log(JSON.stringify(targets, null, 2));
