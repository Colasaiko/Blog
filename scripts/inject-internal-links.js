import fs from 'fs';
import path from 'path';

const blogDir = 'src/content/blog/';
const files = fs.readdirSync(blogDir);

function appendToPost(filename, appendText) {
  const fullPath = path.join(blogDir, filename);
  if (fs.existsSync(fullPath)) {
    let original = fs.readFileSync(fullPath, 'utf8');
    if (!original.includes(appendText.trim().substring(0, 50))) { // avoid duplicate injection
        fs.writeFileSync(fullPath, original + '\n\n' + appendText);
    }
  }
}

let aiCount = 0;
let macCount = 0;
let clashCount = 0;
let reviewCount = 0;

for (const file of files) {
  if (file.endsWith('.md') || file.endsWith('.mdx')) {
    const content = fs.readFileSync(path.join(blogDir, file), 'utf8');
    
    // AI Hub injection
    if ((file.startsWith('ai-') || file.startsWith('grok-') || file.startsWith('poe-') || file.startsWith('copilot-') || file.startsWith('perplexity-')) && !file.includes('airports')) {
      if (content.includes('连接失败') || content.includes('验证码') || content.includes('网络环境') || content.includes('封号')) {
        appendToPost(file, `> **相关推荐**：如果您在访问以上 AI 工具时频繁遇到 \`Access Denied\` 或验证码阻拦，这通常是因为当前节点的出口 IP 被大量共享触发了风控。建议参考本站的 **[2026 AI 机场推荐](/blog/ai-chatgpt-airports/)**，选择拥有高纯净度原生 IP 的优质节点。`);
        aiCount++;
      }
    }

    // Mac/PC Hub injection
    if (file.startsWith('mac-') && !file.includes('airports')) {
      appendToPost(file, `> **延伸阅读**：如果您配置完客户端后仍无法科学上网，通常是订阅链接已失效或节点倍率耗尽。请参考我们的 **[2026 Clash 机场推荐](/blog/clash-best-airports/)**，获取支持一键导入、规则预设完善的备选方案。`);
      macCount++;
    }

    // Clash Hub injection
    if (file.startsWith('clash-') && !file.includes('airports') && !file.includes('troubleshooting') && !file.includes('url-test')) {
      appendToPost(file, `> **延伸阅读**：优质的机场通常会在您导入订阅时，自动下发优化好的代理组与分流规则（Rules）。如果您需要开箱即用的体验，请查看 **[2026 Clash 机场推荐](/blog/clash-best-airports/)** 获取支持一键导入的机场列表。`);
      clashCount++;
    }

    // Review Hub injection
    if (file.startsWith('review-')) {
      let links = [];
      if (content.includes('便宜') || content.includes('低价') || content.includes('性价比')) {
         links.push('[便宜机场推荐](/blog/cheap-airports/)');
      }
      if (content.includes('专线') || content.includes('IPLC') || content.includes('IEPL')) {
         links.push('[专线机场推荐 (IPLC/IEPL)](/blog/iplc-iepl-airports/)');
      }
      if (content.includes('按量计费') || content.includes('不限时')) {
         links.push('[按量计费机场](/blog/pay-as-you-go-airports/)');
      }
      links.push('[稳定机场推荐](/blog/stable-airports/)');
      
      const linkText = `> **分类参考**：为了方便您横向对比，本文介绍的品牌已收录至本站的核心榜单中。您可以根据需求查看：` + links.join('、') + `。`;
      appendToPost(file, linkText);
      reviewCount++;
    }
  }
}

console.log(`Injected internal links: AI(${aiCount}), Mac(${macCount}), Clash(${clashCount}), Reviews(${reviewCount})`);
