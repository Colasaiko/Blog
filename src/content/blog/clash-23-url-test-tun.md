---
title: "Clash 进阶：URL Test 策略组与 TUN 模式详解"
keywords: "Clash 进阶,URL Test 策略组与 TUN 模式详解"
description: "详细介绍 Clash 中的 URL Test 是什么，如何通过它实现节点自动故障切换，以及 Clash Verge Rev 等客户端中 TUN 模式何时需要开启。"
pubDate: 2026-09-09
updatedDate: 2026-09-09
author: "好机场编辑部"
category: "进阶知识"
---


# Clash 进阶：URL Test 策略组与 TUN 模式详解

## 什么是 URL Test？
在使用 [Clash 系列客户端](/blog/clash-best-airports/)（如 Clash Verge Rev）时，您经常会看到名为 **URL Test（自动测速）** 或 **Fallback（故障转移）** 的策略组。

**URL Test** 会定期向指定的一个目标网址（通常是 http://www.gstatic.com/generate_204）发送请求，测试策略组内所有节点的延迟，并自动为您选择当前延迟**最低**的节点。
* 这极大地提升了体验，当某个节点挂掉时，它能自动切换到存活节点。
* *延伸阅读：[机场猫：代理模式与策略组指南](https://jichangmao.com/blog/proxy-modes-guide/)*

## TUN 模式什么时候需要开启？
默认情况下，Clash 作为系统代理（System Proxy）运行，它只能接管支持 HTTP/SOCKS 协议的浏览器流量。但很多软件（如各种游戏、部分终端工具、甚至 UWP 应用）不遵循系统代理设置。

此时就需要开启 **TUN 模式**。开启后，Clash 会在系统中创建一张虚拟网卡，**接管操作系统所有的网络流量**，从而实现“真全局”代理。如果您发现某些特定的 App 无法联网，尝试开启 TUN 模式通常能解决问题。
