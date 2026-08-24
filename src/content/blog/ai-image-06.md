---
title: "如何用 AI 制作网站 Banner？"
keywords: "网络教程, 代理配置, 技术指南"
description: "网站 Banner（横幅）通常需要极宽的比例并留出文字排版空间。本文教你如何用 AI 生成完美比例的 Banner 背景图，并分享常用的排版技巧。"
pubDate: 2026-01-27
category: "AI 视频与图片"
author: "好机场编辑部"
---

打开任何一个专业网站，最先映入眼帘的就是顶部的 Banner（横幅）大图。一张高质量的 Banner 不仅能吸引眼球，还能清晰地传达网站的核心信息。
过去，制作 Banner 需要找图、裁剪、排版，耗时耗力。现在借助 AI，你可以快速生成各种风格的专属 Banner 背景。不同地区、账号类型和平台政策可能存在差异，具体以工具当前官方页面显示为准。

## 制作 Banner 的两个核心要求

用 AI 生成 Banner 图，和生成普通图片有很大的区别，主要在两点：
1. **比例极宽**：Banner 通常是 16:9 甚至 21:9、3:1 的超宽图。
2. **需要留白**：必须为左侧或右侧的文字、按钮留出干净的空间，不能让画面充满复杂的元素。

## 第一步：生成超宽比例的背景图

大部分 AI 工具默认生成的是 1:1 的正方形图片，你需要手动调整比例参数。

**Midjourney 实操：**
在提示词末尾加上 `--ar` (Aspect Ratio) 参数。对于 Banner，常用的比例是 `--ar 16:9`（常规横幅）或 `--ar 2:1`、`--ar 3:1`（超宽横幅）。

## 第二步：在提示词中强制“留白”

如果你只是输入“美丽的风景”，AI 会把整个画面填满细节，导致后期加文字时看不清。你需要明确告诉 AI 在画面的某一边留出空白。

**常用留白提示词技巧：**
- **指定构图**：`negative space on the left/right`（左侧/右侧留白）、`empty space for text`（为文字留出空白空间）。
- **指定排版风格**：`banner layout`（横幅排版）、`editorial design`（编辑排版设计）。
- **极简背景**：`clean background`（干净背景）、`minimalist`（极简主义）。

**完整提示词示例（Midjourney）：**
> "A modern office desk with a laptop and coffee cup on the right side, left side is completely clean and empty negative space for text, bright lighting, corporate style, banner layout --ar 16:9"
> *(翻译：现代办公桌，右侧有笔记本电脑和咖啡杯，左侧完全干净为空白留白区域以供放置文字，明亮光线，企业风格，横幅排版 --ar 16:9)*

## 第三步：后期加字（推荐用 Canva）

拿到 AI 生成的背景图后，千万不要尝试让 AI 直接帮你把中文标题写上去（目前极易出现乱码）。

1. 将图片导入 **Canva** 或 Photoshop 等设计工具。
2. 在留白处添加一个大标题（H1）和一行副标题（H2）。
3. 添加一个醒目的“行动号召按钮（CTA）”，比如“立即注册”或“了解更多”。

## 常见问题与避坑指南

- **画面太空，显得单调？**
  可以在留白处加上一层非常淡的渐变遮罩，或者在文字底部垫一个半透明的色块，增加层次感。
- **生成的图边缘被切断了？**
  如果使用 Midjourney，可以使用它的 **Pan（平移）** 功能，向左或向右扩展画面，AI 会自动补全边缘。

## 官方资料
- [Midjourney 官网](https://www.midjourney.com/)
- [Canva 官网](https://www.canva.com/)

## 相关文章
- [如何用 AI 制作 Blog 封面图？](./ai-image-07.md)
- [AI 图片为什么总是出现奇怪文字？](./ai-image-05.md)
