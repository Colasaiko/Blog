import fs from 'fs';
import path from 'path';

const indexPath = path.join('src', 'pages', 'index.astro');
let indexContent = fs.readFileSync(indexPath, 'utf8');

// Ensure correct Title and Description
indexContent = indexContent.replace(/const title = ["'].*?["'];/, 'const title = "2026机场推荐：稳定、便宜、专线机场排行榜与实测 | 好机场";');
indexContent = indexContent.replace(/const description = ["'].*?["'];/, 'const description = "2026年机场推荐与实测数据，覆盖稳定机场、便宜机场、IPLC/IEPL专线、套餐价格、优惠码、Clash与Shadowrocket兼容性，按线路、晚高峰表现和使用场景持续更新。";');

// If title variable is missing, try to add it.
if (!indexContent.includes('const title = "2026机场推荐')) {
    indexContent = indexContent.replace(/---/, '---\nconst title = "2026机场推荐：稳定、便宜、专线机场排行榜与实测 | 好机场";\nconst description = "2026年机场推荐与实测数据，覆盖稳定机场、便宜机场、IPLC/IEPL专线、套餐价格、优惠码、Clash与Shadowrocket兼容性，按线路、晚高峰表现和使用场景持续更新。";');
}

// Ensure the H1 is exactly "2026机场推荐" (if it is something else, we will fix it, but let's just make sure it's bold and right).
// The user prompt: "首页主抢：机场推荐 / 2026机场推荐"

const insertContent = `
      {/* 2026机场怎么选 & 快速表 (SEO) */}
      <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div class="mb-12 max-w-3xl">
          <h2 class="text-3xl font-bold text-slate-900 dark:text-white mb-6">2026 机场怎么选？新手指南</h2>
          <div class="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-400 space-y-4">
            <p>在选择机场时，许多新手容易被眼花缭乱的参数迷惑。我们建议您从以下几个核心维度进行考量：</p>
            <ul class="list-disc pl-5 space-y-2">
              <li><strong>预算与流量</strong>：明确您是轻度查阅资料，还是重度 4K 追剧。预算低可考虑 <a href="/blog/cheap-airports/" class="text-primary-600 hover:underline">便宜机场推荐</a>，轻度需求可选择 <a href="/blog/pay-as-you-go-airports/" class="text-primary-600 hover:underline">按量计费机场</a>。</li>
              <li><strong>线路与晚高峰</strong>：如果您有严格的跨国办公、交易需求，请优先查看 <a href="/blog/stable-airports/" class="text-primary-600 hover:underline">稳定机场推荐</a> 或直接选择不过墙的 <a href="/blog/iplc-iepl-airports/" class="text-primary-600 hover:underline">专线机场 (IPLC/IEPL)</a>。</li>
              <li><strong>倍率陷阱</strong>：部分廉价套餐包含大量 2x 甚至更高倍率的节点，实际可用流量远低于标称值。</li>
              <li><strong>设备与客户端</strong>：确认机场是否提供完善的订阅支持，如 <a href="/blog/clash-best-airports/" class="text-primary-600 hover:underline">Clash 机场推荐</a> 与 <a href="/blog/shadowrocket-airports/" class="text-primary-600 hover:underline">Shadowrocket (小火箭)</a> 兼容性。</li>
              <li><strong>流媒体与 AI</strong>：如果您需要使用 ChatGPT / Claude，请查看 <a href="/blog/ai-chatgpt-airports/" class="text-primary-600 hover:underline">AI 解锁机场</a>，看剧则参考 <a href="/blog/streaming-airports/" class="text-primary-600 hover:underline">流媒体机场推荐</a>。</li>
            </ul>
          </div>
        </div>

        <div class="mb-12">
          <h2 class="text-2xl font-bold text-slate-900 dark:text-white mb-6">不同需求选择快速表</h2>
          <div class="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table class="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-sm">
              <thead class="bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <th class="px-6 py-4 text-left font-semibold text-slate-900 dark:text-slate-200">需求场景</th>
                  <th class="px-6 py-4 text-left font-semibold text-slate-900 dark:text-slate-200">适合人群</th>
                  <th class="px-6 py-4 text-left font-semibold text-slate-900 dark:text-slate-200">线路侧重点</th>
                  <th class="px-6 py-4 text-left font-semibold text-slate-900 dark:text-slate-200">核心指南</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
                <tr>
                  <td class="px-6 py-4 text-slate-600 dark:text-slate-400">日常网页与极简备用</td>
                  <td class="px-6 py-4 text-slate-600 dark:text-slate-400">学生党、极低频用户</td>
                  <td class="px-6 py-4 text-slate-600 dark:text-slate-400">公网直连 / 低倍率 BGP</td>
                  <td class="px-6 py-4 font-medium"><a href="/blog/cheap-airports/" class="text-primary-600 hover:underline">便宜机场推荐</a></td>
                </tr>
                <tr>
                  <td class="px-6 py-4 text-slate-600 dark:text-slate-400">晚高峰不卡、企业办公</td>
                  <td class="px-6 py-4 text-slate-600 dark:text-slate-400">远程办公、极客玩家</td>
                  <td class="px-6 py-4 text-slate-600 dark:text-slate-400">高带宽冗余 / IPLC / IEPL</td>
                  <td class="px-6 py-4 font-medium"><a href="/blog/stable-airports/" class="text-primary-600 hover:underline">稳定机场推荐</a></td>
                </tr>
                <tr>
                  <td class="px-6 py-4 text-slate-600 dark:text-slate-400">多设备智能分流</td>
                  <td class="px-6 py-4 text-slate-600 dark:text-slate-400">PC / Mac 主力用户</td>
                  <td class="px-6 py-4 text-slate-600 dark:text-slate-400">订阅格式兼容、预设规则</td>
                  <td class="px-6 py-4 font-medium"><a href="/blog/clash-best-airports/" class="text-primary-600 hover:underline">Clash 机场推荐</a></td>
                </tr>
                <tr>
                  <td class="px-6 py-4 text-slate-600 dark:text-slate-400">ChatGPT / Claude 解锁</td>
                  <td class="px-6 py-4 text-slate-600 dark:text-slate-400">AI 重度工作流</td>
                  <td class="px-6 py-4 text-slate-600 dark:text-slate-400">高纯净度原生 IP</td>
                  <td class="px-6 py-4 font-medium"><a href="/blog/ai-chatgpt-airports/" class="text-primary-600 hover:underline">AI 机场推荐</a></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
`;

// Insert it right after the Category section (which starts with <section class="max-w-7xl mx-auto px-4 ..."> containing "按需求选择机场" or similar)
// If we can't find it reliably, we insert before the FAQ section.
const faqMarker = '2026年机场推荐常见问题 (FAQ)';
if (indexContent.includes(faqMarker)) {
    indexContent = indexContent.replace(/(<section[^>]*>\s*<div[^>]*>\s*<h2[^>]*>2026年机场推荐常见问题 \(FAQ\))/, insertContent + '\n$1');
} else {
    // Fallback to inserting before footer
    indexContent = indexContent.replace(/<Footer \/>/, insertContent + '\n<Footer />');
}

fs.writeFileSync(indexPath, indexContent);
console.log('index.astro SEO enhanced.');
