import fs from 'fs';

let content = fs.readFileSync('src/pages/index.astro', 'utf8');

const newFaqs = `const faqs = [
    {
      q: '2026机场怎么选？',
      a: '在 2026 年选择机场，首先要明确您的核心需求。如果是刷网页查资料，几十块钱一年的平价套餐即可；如果需要打游戏、看 4K 流媒体或重度办公，推荐选择 IPLC/IEPL 专线机场。具体可参考我们的《机场选择指南》，通过对比预算、线路、设备兼容性快速挑选。'
    },
    {
      q: '机场越贵越稳定吗？',
      a: '不一定。机场稳定性主要由线路架构（如是否有 IPLC 专线）和冗余节点决定。有些高价机场由于用户过多也可能导致晚高峰拥堵。在我们的机场排行榜中，会综合评估“价格”与“实际 SLA（服务等级协议）”，帮助您找到高性价比且真正稳定的服务。'
    },
    {
      q: 'IPLC和IEPL有什么区别？',
      a: '两者都属于专线级别。IPLC（国际专线）是物理层面的端到端内网专线，延迟极低；IEPL（国际以太网专线）属于二层以太网链路，配置更灵活。在实际翻墙体验中，两者均不过墙、不丢包，都是目前最顶级的线路类型，晚高峰表现极其稳定。'
    },
    {
      q: '便宜机场靠谱吗？',
      a: '市面上有许多几块钱一个月的低价梯子，它们的特点是“高性价比、大流量”。这些便宜机场多采用公网直连或普通中转，晚高峰偶尔会有轻微卡顿。只要是口碑较好的老牌商家，对于非重度视频用户来说是非常靠谱的备用或日常选择。'
    },
    {
      q: 'Clash应该选择什么机场？',
      a: '目前绝大多数机场都完美支持 Clash（包括 Clash Verge Rev / Mihomo 内核）。选择时，推荐寻找提供“一键导入 Clash 订阅”功能的商家，这能极大地简化您的配置流程。支持自动测速和多节点智能分流的机场体验最佳。'
    },
    {
      q: 'Shadowrocket怎么选择机场？',
      a: 'Shadowrocket（小火箭）是 iOS 平台上最流行的客户端。iOS 用户在选购机场时，优先选择那些提供完整 Shadowrocket 订阅教程、扫码一键导入的机场。这会让手机端用户的设置成本降到最低。'
    },
    {
      q: '按量机场适合什么人？',
      a: '按量计费套餐（不限时流量包）非常适合两类人：一是偶尔需要科学上网查阅资料的轻度用户；二是已经购买了主力机场，只想花 10 块钱买一个备用节点的重度用户。这类套餐买了之后只要流量没用完就不会过期，性价比极高。'
    },
    {
      q: '机场线路怎么看？',
      a: '常见线路分为三类：1. 直连线路（价格最低，晚高峰易卡顿拥堵）；2. 中转线路（目前主流，通过国内服务器中转出国，速度有保障）；3. IPLC/IEPL 专线（价格最高，完全不经过防火墙，延迟最低不丢包）。'
    }
  ];`;

content = content.replace(/const faqs = \[.*?\];/s, newFaqs);

// Also add a snippet for "机场怎么选" right after the rankings
const howToChooseSection = `
    <!-- 机场怎么选 -->
    <section class="max-w-4xl mx-auto text-center px-4 mb-20 scroll-mt-24">
      <div class="p-8 sm:p-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <h2 class="reveal-el text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-6">机场怎么选？新手避坑指南</h2>
        <p class="reveal-el reveal-delay-100 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-8 leading-relaxed">
          预算多少合适？流媒体和 AI 节点怎么看？晚高峰到底该选择哪种线路？我们抽取了最新的选购重点，为您深度解析。
        </p>
        <div class="reveal-el reveal-delay-200">
          <a href="/blog/how-to-choose-airport/" class="inline-flex items-center justify-center px-6 py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-full font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500">
            阅读完整《机场选择指南》
          </a>
        </div>
      </div>
    </section>
`;

content = content.replace(/(<section class="max-w-4xl mx-auto text-center px-4">[\s\S]*?<\/section>)/, howToChooseSection + '\n$1');

fs.writeFileSync('src/pages/index.astro', content, 'utf8');
