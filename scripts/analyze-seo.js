import fs from 'fs';

const files = [
  'src/pages/index.astro',
  'src/pages/brands.astro',
  'src/content/blog/how-to-choose-airport.md',
  'src/content/blog/stable-airports.md',
  'src/content/blog/cheap-airports.md',
  'src/content/blog/iplc-iepl-airports.md',
  'src/content/blog/pay-as-you-go-airports.md',
  'src/content/blog/clash-best-airports.md',
  'src/content/blog/shadowrocket-airports.md',
  'src/content/blog/ai-chatgpt-airports.md',
  'src/content/blog/streaming-airports.md'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    
    // Frontmatter title/desc for MD/MDX
    let title = '';
    let desc = '';
    let h1 = '';

    const titleMatch = content.match(/title:\s*['"]?([^'"]+)['"]?/);
    if (titleMatch) title = titleMatch[1];
    else {
      // Astro pages usually have title="{something}" or <title>something</title>
      const astroTitle = content.match(/<title>([^<]+)<\/title>/) || content.match(/title=["']([^"']+)["']/);
      if (astroTitle) title = astroTitle[1];
    }

    const descMatch = content.match(/description:\s*['"]?([^'"]+)['"]?/);
    if (descMatch) desc = descMatch[1];
    else {
      const astroDesc = content.match(/name="description"\s+content=["']([^"']+)["']/);
      if (astroDesc) desc = astroDesc[1];
    }

    // Markdown H1
    const h1Match = content.match(/^#\s+(.+)$/m) || content.match(/<h1[^>]*>([^<]+)<\/h1>/);
    if (h1Match) h1 = h1Match[1].trim();

    console.log(`\n--- ${file} ---`);
    console.log(`Title: ${title}`);
    console.log(`Desc:  ${desc}`);
    console.log(`H1:    ${h1}`);
  } else {
    console.log(`\n--- ${file} (MISSING) ---`);
  }
});
