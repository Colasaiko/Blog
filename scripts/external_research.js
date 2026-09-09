import fs from 'fs';
import path from 'path';

const blogDir = 'src/content/blog/';

// --- 1. NEW ARTICLES ---
const newArticles = [
  {
    filename: 'adv-29-node-multiplier.md',
    title: '什么是节点倍率？1x 2x 节点倍率与机场流量扣除规则详解',
    desc: '详细解释机场节点倍率是什么意思，1x、2x、0.5x 等节点倍率对流量消耗的影响，以及如何根据机场流量扣除规则合理使用套餐。',
    content: `
# 什么是节点倍率？机场流量扣除规则详解

## 搜索意图快速回答
如果您在使用机场时发现流量消耗异常快，可能是遇到了**节点倍率**（Node Multiplier）。简单来说，节点倍率是服务商对不同成本线路设置的流量结算系数。如果使用 **2x** 的节点下载 1GB 文件，您的机场账户将被扣除 2GB 流量。

## 常见的节点倍率类型
1. **1.0x (1x) 正常倍率**：绝大多数标准节点（如普通 BGP 中转的新加坡、日本节点）均为 1 倍率，用多少算多少。
2. **0.5x / 0.1x 低倍率**：部分机场为了分流晚高峰压力，会将冷门地区或成本极低的直连节点设置为低倍率。用 1GB 只扣 0.5GB，非常适合下载大文件。
3. **2.0x (2x) 甚至 5.0x 高倍率**：常见于昂贵的 **IPLC/IEPL 专线** 或极度稀缺的**原生住宅 IP** 节点。由于带宽成本极高，机场通过高倍率来控制用户的流量消耗。

## 机场流量是怎么扣除的？
您的实际扣除流量 = **实际传输数据量 × 节点倍率**。
*参考资料与延伸阅读：[机场猫：什么是节点，节点倍率与流量](https://jichangmao.com/blog/what-is-node/)*

如果您购买了 [便宜机场](/blog/cheap-airports/) 的大流量套餐，但主要使用高倍率专线，那么其实际可用流量将会大打折扣。建议在日常网页浏览时使用 1x 节点，而在游戏或高强度 AI 工具等对稳定性要求极高的场景切换至高倍率专线。
`
  },
  {
    filename: 'adv-30-low-ping-slow-speed.md',
    title: '延迟低为什么网速慢？机场稳定性测试与晚高峰测速指南',
    desc: '深入剖析延迟低为什么网速慢的原因，解析机场稳定性怎么测试，以及如何正确评估机场在晚高峰时段的真实网络测速表现。',
    content: `
# 延迟低为什么网速慢？机场稳定性与晚高峰测速指南

## 搜索意图快速回答
很多用户在客户端（如 Clash / v2ray）中点击"延迟测速"发现 Ping 只有 30ms，但打开网页却转圈，这就是典型的“**延迟低但网速慢**”。原因在于，客户端的测速通常只是测试到**中转服务器**或**落地节点**的 ICMP/TCP 握手时间，并未反映真实的带宽吞吐量与丢包率。

## 为什么 Ping 值具有欺骗性？
1. **中转节点的假象**：由于大部分 [专线机场](/blog/iplc-iepl-airports/) 采用国内 BGP 服务器作为入口，您 Ping 的其实是国内入口，延迟自然只有二三十毫秒，但这并不代表国际出口链路顺畅。
2. **带宽拥塞**：晚高峰（晚上8点-11点）时，虽然链路接通快（延迟低），但由于大量用户挤压同一条线路，导致带宽跑满、丢包严重，实际下载速度极慢。

## 机场稳定性怎么测试？晚高峰测速指南
不要仅仅依赖测速图的数字。根据外部技术博客整理，推荐以下评估方式：
*参考资料与延伸阅读：[机场猫：如何测试节点真实速度](https://jichangmao.com/blog/how-to-test-node-speed/)*

1. **YouTube 4K 跑分**：在晚高峰 21:00 打开 YouTube 4K 视频，查看 "Stats for nerds" 中的 Connection Speed，能稳定在 50000Kbps 以上的通常带宽充裕。
2. **实际文件下载测试**：使用单线程或多线程工具下载测速节点的文件（如 Speedtest.net 的测速节点）。
3. **长期观测**：购买前不要直接年付。先月付体验其在重大节假日或特定时段的表现，[稳定机场推荐](/blog/stable-airports/) 中的品牌通常在晚高峰留有更多带宽冗余。

## 总结
低延迟适合游戏和 SSH 远程连接，而高带宽（实际速度快）才适合流媒体与大文件下载。两者并不等价。
`
  },
  {
    filename: 'clash-23-url-test-tun.md',
    title: 'Clash 进阶：URL Test 策略组与 TUN 模式详解',
    desc: '详细介绍 Clash 中的 URL Test 是什么，如何通过它实现节点自动故障切换，以及 Clash Verge Rev 等客户端中 TUN 模式何时需要开启。',
    content: `
# Clash 进阶：URL Test 策略组与 TUN 模式详解

## 什么是 URL Test？
在使用 [Clash 系列客户端](/blog/clash-best-airports/)（如 Clash Verge Rev）时，您经常会看到名为 **URL Test（自动测速）** 或 **Fallback（故障转移）** 的策略组。

**URL Test** 会定期向指定的一个目标网址（通常是 http://www.gstatic.com/generate_204）发送请求，测试策略组内所有节点的延迟，并自动为您选择当前延迟**最低**的节点。
* 这极大地提升了体验，当某个节点挂掉时，它能自动切换到存活节点。
* *延伸阅读：[机场猫：代理模式与策略组指南](https://jichangmao.com/blog/proxy-modes-guide/)*

## TUN 模式什么时候需要开启？
默认情况下，Clash 作为系统代理（System Proxy）运行，它只能接管支持 HTTP/SOCKS 协议的浏览器流量。但很多软件（如各种游戏、部分终端工具、甚至 UWP 应用）不遵循系统代理设置。

此时就需要开启 **TUN 模式**。开启后，Clash 会在系统中创建一张虚拟网卡，**接管操作系统所有的网络流量**，从而实现“真全局”代理。如果您发现某些特定的 App 无法联网，尝试开启 TUN 模式通常能解决问题。
`
  },
  {
    filename: 'clash-24-troubleshooting.md',
    title: 'Clash 节点全部 Timeout 与订阅更新失败怎么办？常见故障排查',
    desc: '全面解析 Clash 订阅突然无法更新、节点全部显示 Timeout 的常见原因与故障排查方法，帮助您快速恢复网络连接。',
    content: `
# Clash 节点全部 Timeout 与订阅更新失败怎么办？

## 搜索意图快速回答
如果您打开 Clash 发现所有节点飘红，显示 \`Timeout\`，或者点击更新订阅时提示 \`Download Failed\`，通常不是机场倒闭了，而是网络环境或本地配置出现了基础阻断。

## 订阅突然无法更新 / 节点全部 Timeout 怎么办？

根据外部故障排查经验（*[参考：ClashWiki 新手故障排查指南](https://clashwiki.blog/category/troubleshooting/)*）的思路，您可以按照以下步骤排查：

1. **系统时间未同步**：Clash 依赖精确的系统时间进行 SSL 握手。如果您的电脑时间偏差超过 2 分钟，会导致所有的节点握手失败，表现为全部 Timeout。请进入系统设置开启“自动同步时间”。
2. **当前网络无法直连订阅地址**：机场提供的订阅链接所在的域名可能已经被污染或阻断。
   - 解决办法 A：登录机场官网，获取最新的备用订阅地址。
   - 解决办法 B：在 Clash 中暂时不关闭正在生效的残余节点（只要还有能用的），利用能用的节点去更新订阅。
3. **ISP 运营商阻断**：特定运营商（如泉州电信等）对跨境 UDP / TLS 握手有白名单机制，可能导致节点无法建立连接。
4. **机场服务端故障**：如果排除了本地问题，可以登录机场后台查看是否有维护公告，或者考虑备用方案，如 [按量计费机场](/blog/pay-as-you-go-airports/)。

在使用 [最佳 Clash 机场](/blog/clash-best-airports/) 时，遇到偶发的 Timeout 是正常的，通常等待服务商修复或更新订阅即可。
`
  },
  {
    filename: 'tools-36-terminal-lan-proxy.md',
    title: '进阶代理指南：终端 CMD/Git 走代理、局域网共享与软路由',
    desc: '解决 GitHub git clone 代理超时问题，教您如何让 Windows CMD / PowerShell 走代理，以及局域网共享代理与软路由基础知识。',
    content: `
# 进阶代理指南：终端 CMD/Git 代理与局域网共享

## 终端为什么不走系统代理？(Git Clone 超时)
很多开发者在使用 \`git clone\` GitHub 仓库，或者在 CMD / PowerShell 中运行 \`npm install\` 时，即使 Clash 已经开启并能正常访问 Google，依然会遇到 Timeout 超时。
因为 **命令行工具默认不读取 Windows 系统的 HTTP 代理设置**。

### 如何让终端走代理？
临时在当前 CMD 或 PowerShell 窗口中设置环境变量：
\`\`\`bash
# 假设 Clash 本地端口为 7890
set http_proxy=http://127.0.0.1:7890
set https_proxy=http://127.0.0.1:7890
\`\`\`
对于 Git，可执行全局配置：
\`\`\`bash
git config --global http.proxy http://127.0.0.1:7890
\`\`\`
*参考学习：[VPN-Clash：学术与 PC 代理进阶场景](https://vpn-clash.net/topics/pc/)*

## 局域网共享代理与软路由
如果您家里有设备（如 Apple TV、Switch 游戏机）无法安装代理软件，如何解决？

1. **局域网共享代理 (LAN Proxy)**：
   在 PC 端的 Clash 设置中，开启 **Allow LAN (允许局域网连接)**。然后在另一台设备（如 iPhone）的 Wi-Fi 设置中，将 HTTP 代理配置为这台 PC 的局域网 IP（例如 \`192.168.1.10\`），端口填 \`7890\` 即可。
2. **软路由**：
   更彻底的方案是在家中的主路由或旁路由上刷入 OpenWrt 系统，并安装 OpenClash 或 PassWall。这样全家所有连接 Wi-Fi 的设备都自动走代理。此方案极度依赖 [高稳定性机场](/blog/stable-airports/)，以免网络中断导致全家断网。
`
  },
  {
    filename: 'adv-31-google-scholar-captcha.md',
    title: '突破学术与 AI 限制：Google Scholar 验证码与节点地区选择',
    desc: '解析为什么 Google Scholar 总是出现验证码，大文件下载与学术研究时节点地区应该怎么选择，以及应对 AI 工具网络限制的策略。',
    content: `
# 突破学术与 AI 限制：Google Scholar 验证码与地区选择

## 为什么 Google Scholar 一直验证码？
在进行学术搜索（Google Scholar）或访问某些科研数据库时，频繁弹出人机验证（reCAPTCHA）是非常让人抓狂的。
这主要是因为您所在的 **机场节点 IP** 被大量用户共享，触发了 Google 的反作弊系统。部分采用廉价机房 IP 的 [便宜机场](/blog/cheap-airports/)，由于长期被用作爬虫出口，已经被拉入黑名单。

### 解决方案
1. 切换到小众地区的节点。
2. 使用原生 IP（Native IP）或 ISP 住宅 IP 节点，这类 IP 在 Google 看来更像真实的家庭宽带用户。
3. 参考 [AI 机场推荐](/blog/ai-chatgpt-airports/) 中提及的高纯净度线路。

## 节点地区怎么选择？
不同的使用场景决定了地区选择的优先级：
- **学术研究与网页浏览**：香港、日本、新加坡等亚太地区延迟最低，体验最好。
- **大文件下载**：优先测试美国节点。由于亚太地区跨海光缆带宽昂贵，部分服务商会在美国节点分配更大的可用带宽。
- **特定流媒体**：根据 Netflix 或 Disney+ 的内容库需求选择对应地区，详情参见 [流媒体机场](/blog/streaming-airports/)。

*参考资料拓展：[VPN-Clash：学术搜索场景下的代理优化](https://vpn-clash.net/topics/academic/)*
`
  }
];

newArticles.forEach(article => {
  const content = `---
title: "${article.title}"
keywords: "${article.title.replace(/[？：]/g, ',')}"
description: "${article.desc}"
pubDate: 2026-09-09
updatedDate: 2026-09-09
author: "好机场编辑部"
category: "进阶知识"
---

${article.content}`;
  fs.writeFileSync(path.join(blogDir, article.filename), content);
});

// --- 2. ENHANCE EXISTING HUBS ---
function appendToPost(filename, appendText) {
  const fullPath = path.join(blogDir, filename);
  if (fs.existsSync(fullPath)) {
    let original = fs.readFileSync(fullPath, 'utf8');
    fs.writeFileSync(fullPath, original + '\n\n' + appendText);
  }
}

appendToPost('iplc-iepl-airports.md', `
## 技术延伸：深入理解专线与中转
根据外部公开资料整理：
*参考资料：[机场猫：IPLC、IEPL与BGP线路通俗解析](https://jichangmao.com/blog/iplc-iepl-bgp-explained/)*

相比于传统的 BGP 公网中转，**IPLC** (International Private Leased Circuit) 实现了跨国物理内网传输，数据不会经过 GFW 的审查节点。而 **IEPL** (International Ethernet Private Line) 则是基于以太网技术的升级版。对于用户侧而言，两者的体感差异不大，都代表了目前科学上网稳定性与低延迟的天花板。
`);

appendToPost('clash-best-airports.md', `
## 学习路径推荐
如果您是第一次接触 Clash 客户端，我们建议您按照以下路径学习，以最大化利用本站推荐的机场节点：
1. **基础认知**：了解什么是[节点与订阅](/blog/guide-04/)。
2. **下载安装**：获取 [Clash Verge Rev](/blog/mac-clash-verge-rev/) 等最新分支版本。
3. **配置进阶**：学习如何使用 URL Test 与 TUN 模式（参见 [URL Test详解](/blog/clash-23-url-test-tun/)）。
4. **故障排查**：遇到 Timeout 时不要慌张，查阅 [故障排查指南](/blog/clash-24-troubleshooting/)。

*参考结构借鉴自：[ClashWiki: 新手学习路径体系](https://clashwiki.blog/topics/beginners/)*
`);

appendToPost('cheap-airports.md', `
## 市场定价观察与参考
本站的推荐及价格整理基于实时的品牌官网数据。作为交叉参考，根据外部市场观测站点（如 [机场博客 (Jichangblog)](https://jichangblog.net/) 等）的分类体系，当前低于 15元/月 的套餐普遍采用公网隧道或混合线路，而低于 5元/月 的则多为直连节点。购买此类服务时，请务必关注其节点倍率（详见 [节点倍率详解](/blog/adv-29-node-multiplier/)），避免落入低价高倍率的陷阱。
`);

console.log('Research implementation complete.');
