import fs from 'fs';

let content = fs.readFileSync('src/pages/brands.astro', 'utf8');

// Replace the sub-heading description paragraph to contain the exact requested words
content = content.replace(/<p class="text-lg text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed mb-6">[^<]*<\/p>/s, '<p class="text-lg text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed mb-6">\n          本站收录的2026最新机场排行榜与品牌评测。针对每个品牌的<strong>适合人群</strong>、<strong>线路</strong>质量（如专线与中转）、<strong>套餐</strong>价格、<strong>客户端</strong>兼容性（Clash 等）、<strong>优惠</strong>活动与实际<strong>使用场景</strong>，提供客观真实的<strong>详细评测</strong>参考。\n        </p>');

fs.writeFileSync('src/pages/brands.astro', content);
console.log('brands.astro intro updated.');
