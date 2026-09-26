import fs from 'fs';

// Fix index.astro
let index = fs.readFileSync('src/pages/index.astro', 'utf8');
index = index.replace(/const title = ["'][^"']+["'];/, 'const title = "2026机场推荐：稳定、便宜与专线机场评测指南";');
index = index.replace(/const description = ["'][^"']+["'];/, 'const description = "2026最新机场推荐与评测入口。按预算与线路分类，涵盖稳定机场、便宜高性价比套餐及 IPLC/IEPL 专线，提供最适合您的科学上网机场指南。";');

// Also make sure H1 doesn't have "排行榜" in index
index = index.replace(
  /<h1 class="reveal-el.*?<\/h1>/s,
  `<h1 class="reveal-el text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-4 leading-tight">
              2026 机场推荐：<br class="sm:hidden" />
              <span class="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-400">全方位选择指南</span>
            </h1>`
);
fs.writeFileSync('src/pages/index.astro', index, 'utf8');

// Fix brands.astro
let brands = fs.readFileSync('src/pages/brands.astro', 'utf8');
brands = brands.replace(/const title = ["'][^"']+["'];/, 'const title = "2026机场排行榜：最新机场天梯榜与综合品牌评测";');
brands = brands.replace(/const description = ["'][^"']+["'];/, 'const description = "整理2026年各大机场服务商排行榜与天梯榜。对比机场线路、流媒体解锁、月付起步价与流量信息，助您快速查询与比较心仪品牌。";');

brands = brands.replace(
  /<h1 class="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">.*?<\/h1>/s,
  `<h1 class="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">2026 机场排行榜与天梯榜</h1>`
);
fs.writeFileSync('src/pages/brands.astro', brands, 'utf8');

console.log("Updated index and brands Astro files.");
