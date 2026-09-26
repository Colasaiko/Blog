import fs from 'fs';

const updates = {
  'src/content/blog/how-to-choose-airport.md': {
    title: '机场怎么选？2026 最新机场选择与避坑指南',
    desc: '不知道机场怎么选？本文从预算、线路（IPLC/专线/中转）、流媒体与 AI 需求等维度，为您提供详尽的 2026 机场选择指南与避坑建议。',
    h1: '机场怎么选？2026 机场选择指南'
  },
  'src/content/blog/stable-airports.md': {
    title: '2026 稳定机场推荐：晚高峰高速靠谱机场指南',
    desc: '为您精选 2026 表现优秀的稳定机场推荐，对比各家可用性、晚高峰抗压与 SLA 协议，助您挑选最靠谱的老牌机场与高质量专线节点。',
    h1: '2026 稳定机场推荐：晚高峰靠谱线路指南'
  },
  'src/content/blog/cheap-airports.md': {
    title: '2026 便宜机场推荐：高性价比与低价梯子指南',
    desc: '整理 2026 年高性价比与便宜机场推荐，包含低至几元每月的平价套餐、按量计费以及提供优惠码的低价梯子，适合日常轻度用户查阅。',
    h1: '2026 便宜机场推荐：高性价比套餐选购指南'
  },
  'src/content/blog/iplc-iepl-airports.md': {
    title: '2026 专线机场推荐：IPLC 与 IEPL 高速机场指南',
    desc: '针对追求低延迟网络体验的用户，精选 2026 年 IPLC / IEPL 专线机场推荐。深度解析专线优势，告别晚高峰拥堵与丢包。',
    h1: '2026 专线机场推荐：IPLC/IEPL 高速节点选购指南'
  },
  'src/content/blog/pay-as-you-go-airports.md': {
    title: '2026 按量机场推荐：不限时流量包与备用机场指南',
    desc: '专为寻找备用节点的用户整理的 2026 按量机场推荐。解析不限时按流量机场套餐的性价比，低成本拥有靠谱的网络接入。',
    h1: '2026 按量机场推荐：不限时流量包选购指南'
  },
  'src/content/blog/clash-best-airports.md': {
    title: '2026 Clash 机场推荐：全平台节点订阅与配置指南',
    desc: '整理 2026 年良好兼容 Clash (Clash Verge Rev / Mihomo) 的优质机场，提供一键导入订阅教程与稳定 Clash 机场推荐。',
    h1: '2026 Clash 机场推荐：节点订阅与导入指南'
  },
  'src/content/blog/shadowrocket-airports.md': {
    title: '2026 Shadowrocket 机场推荐：小火箭 iOS 节点订阅指南',
    desc: '整理 2026 良好兼容 Shadowrocket (小火箭) 的节点服务商。提供各机场一键导入体验、更新速度对比，专为 iPhone 机场推荐打造。',
    h1: '2026 Shadowrocket 机场推荐：小火箭订阅与一键导入'
  },
  'src/content/blog/ai-chatgpt-airports.md': {
    title: '2026 ChatGPT 机场推荐：AI 节点与原生 IP 线路指南',
    desc: '专为 AI 生产力用户整理的 2026 ChatGPT机场推荐。深度解析原生 IP，解决 Claude 封号痛点，推荐稳定纯净的 AI 机场。',
    h1: '2026 ChatGPT 机场推荐：AI 原生 IP 节点选择指南'
  },
  'src/content/blog/streaming-airports.md': {
    title: '2026 流媒体机场推荐：Netflix 与 Disney+ 解锁节点',
    desc: '精选 2026 提供流媒体原生 IP 解锁的机场服务商。深度对比 Netflix、Disney+ 等跨区解锁能力与晚高峰观影的稳定流媒体机场推荐。',
    h1: '2026 流媒体机场推荐：原生 IP 与高清观影指南'
  }
};

for (const [file, data] of Object.entries(updates)) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Replace title
    content = content.replace(/title:\s*['"]?[^\r\n]+['"]?/, `title: "${data.title}"`);
    // Replace desc
    content = content.replace(/description:\s*['"]?[^\r\n]+['"]?/, `description: "${data.desc}"`);
    // Replace H1
    content = content.replace(/^#\s+[^\r\n]+/m, `# ${data.h1}`);
    // Fallback if H1 was HTML
    if (!content.match(/^#\s+/m)) {
      content = content.replace(/<h1[^>]*>.*?<\/h1>/, `<h1>${data.h1}</h1>`);
    }

    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  }
}
