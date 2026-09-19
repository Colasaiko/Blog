import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';
import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';
import fs from 'fs';
import path from 'path';

// Parse all blog posts to get their last modified dates
const getSitemapDates = () => {
  const dates = {};
  try {
    const blogDir = path.resolve('src/content/blog');
    const files = fs.readdirSync(blogDir);
    files.forEach(file => {
      if (file.endsWith('.md') || file.endsWith('.mdx')) {
        const content = fs.readFileSync(path.join(blogDir, file), 'utf-8');
        const slug = file.replace(/\.mdx?$/, '');
        
        let lastMod = null;
        const updatedMatch = content.match(/updatedDate:\s*(['"]?[0-9]{4}-[0-9]{2}-[0-9]{2}['"]?)/);
        if (updatedMatch) {
          lastMod = new Date(updatedMatch[1].replace(/['"]/g, ''));
        } else {
          const pubMatch = content.match(/pubDate:\s*(['"]?[0-9]{4}-[0-9]{2}-[0-9]{2}['"]?)/);
          if (pubMatch) {
            lastMod = new Date(pubMatch[1].replace(/['"]/g, ''));
          }
        }
        
        if (lastMod && !isNaN(lastMod)) {
          dates[`/blog/${slug}/`] = lastMod.toISOString();
        }
      }
    });

    // Read static lastmod JSON
    const staticLastmodPath = path.resolve('src/data/static-lastmod.json');
    if (fs.existsSync(staticLastmodPath)) {
      const staticLastmods = JSON.parse(fs.readFileSync(staticLastmodPath, 'utf-8'));
      for (const [pathname, dateStr] of Object.entries(staticLastmods)) {
        let cleanPath = pathname;
        if (!cleanPath.endsWith('/')) cleanPath += '/';
        const parsedDate = new Date(dateStr);
        if (!isNaN(parsedDate)) {
          dates[cleanPath] = parsedDate.toISOString();
        }
      }
    }
  } catch (e) {
    console.error('Error parsing dates for sitemap:', e);
  }
  return dates;
};

const sitemapDates = getSitemapDates();

// https://astro.build/config
export default defineConfig({
  site: 'https://bestjichang.com',
  trailingSlash: 'ignore',
  output: 'hybrid',
  outDir: './dist',
  adapter: cloudflare(),
  integrations: [
    tailwind(),
    mdx(),
    sitemap({
      filter: (page) => !page.includes("/api/") && !page.includes("/admin/") && !page.includes("/404") && !page.endsWith("/airport") && !page.endsWith("/airport/"),
      serialize(item) {
        // Parse pathname from item.url
        try {
          const urlObj = new URL(item.url);
          let pathname = urlObj.pathname;
          if (!pathname.endsWith('/')) pathname += '/';
          
          if (sitemapDates[pathname]) {
            item.lastmod = sitemapDates[pathname];
          }
        } catch (e) {}
        return item;
      }
    }),
  ],
  markdown: {
    shikiConfig: {
      theme: 'css-variables',
      wrap: true,
    },
  },
});
