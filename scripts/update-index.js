import fs from 'fs';

let content = fs.readFileSync('src/pages/index.astro', 'utf8');

content = content.replace(/const title = "2026机场推荐.*?";/, 'const title = "2026机场推荐：稳定、便宜与专线机场评测指南";');
content = content.replace(/const description = ".*?";/, 'const description = "2026最新机场推荐与评测入口。按预算与线路分类，涵盖稳定机场、便宜高性价比套餐及 IPLC/IEPL 专线，提供最适合您的科学上网机场指南。";');

// Replace H1 precisely
content = content.replace(
  /<h1 class="reveal-el[^>]*>[\s\S]*?<\/h1>/,
  `<h1 class="reveal-el text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-4 leading-tight">
              2026 机场推荐：<br class="sm:hidden" />
              <span class="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-400">全方位选择指南</span>
            </h1>`
);

fs.writeFileSync('src/pages/index.astro', content, 'utf8');
