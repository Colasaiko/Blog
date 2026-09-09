---
title: "进阶代理指南：终端 CMD/Git 走代理、局域网共享与软路由"
keywords: "进阶代理指南,终端 CMD/Git 走代理、局域网共享与软路由"
description: "解决 GitHub git clone 代理超时问题，教您如何让 Windows CMD / PowerShell 走代理，以及局域网共享代理与软路由基础知识。"
pubDate: 2026-09-09
updatedDate: 2026-09-09
author: "好机场编辑部"
category: "进阶知识"
---


# 进阶代理指南：终端 CMD/Git 代理与局域网共享

## 终端为什么不走系统代理？(Git Clone 超时)
很多开发者在使用 `git clone` GitHub 仓库，或者在 CMD / PowerShell 中运行 `npm install` 时，即使 Clash 已经开启并能正常访问 Google，依然会遇到 Timeout 超时。
因为 **命令行工具默认不读取 Windows 系统的 HTTP 代理设置**。

### 如何让终端走代理？
临时在当前 CMD 或 PowerShell 窗口中设置环境变量：
```bash
# 假设 Clash 本地端口为 7890
set http_proxy=http://127.0.0.1:7890
set https_proxy=http://127.0.0.1:7890
```
对于 Git，可执行全局配置：
```bash
git config --global http.proxy http://127.0.0.1:7890
```
*参考学习：[VPN-Clash：学术与 PC 代理进阶场景](https://vpn-clash.net/topics/pc/)*

## 局域网共享代理与软路由
如果您家里有设备（如 Apple TV、Switch 游戏机）无法安装代理软件，如何解决？

1. **局域网共享代理 (LAN Proxy)**：
   在 PC 端的 Clash 设置中，开启 **Allow LAN (允许局域网连接)**。然后在另一台设备（如 iPhone）的 Wi-Fi 设置中，将 HTTP 代理配置为这台 PC 的局域网 IP（例如 `192.168.1.10`），端口填 `7890` 即可。
2. **软路由**：
   更彻底的方案是在家中的主路由或旁路由上刷入 OpenWrt 系统，并安装 OpenClash 或 PassWall。这样全家所有连接 Wi-Fi 的设备都自动走代理。此方案极度依赖 [高稳定性机场](/blog/stable-airports/)，以免网络中断导致全家断网。
