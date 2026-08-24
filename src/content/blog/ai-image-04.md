---
title: "如何让 AI 生成同一个人物的不同照片？"
keywords: "网络教程, 代理配置, 技术指南"
description: "想用 AI 打造虚拟模特或角色，却发现每次生成的人脸都不一样？本文教你如何通过角色参考（Character Reference）和换脸工具，实现人物一致性。"
pubDate: 2026-01-26
category: "AI 视频与图片"
author: "好机场编辑部"
---

在制作小说推文、连环画或是品牌虚拟代言人时，最大的痛点就是：**AI 每次生成的脸都不一样**。上一秒还是瓜子脸，下一秒就变圆脸了。
不同地区、账号类型和平台政策可能存在差异，具体以工具当前官方页面显示为准。要解决这个问题，目前主流有以下几种非常实用的方案。

## 方案一：使用 Midjourney 的角色参考 (--cref)

Midjourney 推出的 `--cref` (Character Reference) 功能是目前解决这个问题最简单直接的方法。它能让 AI 参考你提供的人物脸部和特征，生成在不同场景下的人物。

**操作步骤**：
1. 生成或准备一张基础人物图（最好是正脸清晰、没有太多遮挡的照片），获取该图片的链接。
2. 输入新的提示词，并在末尾加上 `--cref [图片链接]`。
3. （可选）你可以通过 `--cw` (Character Weight) 参数控制相似度范围。
   - `--cw 100`（默认值）：AI 会尝试保留人物的脸、发型和衣服。
   - `--cw 0`：AI 只保留人物的脸，你可以给人物换衣服和发型。

**举例**：
> "A young woman reading a book in a cafe --cref https://example.com/face.jpg --cw 0"

## 方案二：给人物“起个特殊的名字”

对于一些未内置专门角色控制功能的工具（如 DALL-E 3），你可以通过“特征固定法”来“骗”过 AI。
不要只写“一个女孩”，而是详细描述她极其具体的特征，并在每张图的提示词里重复这些特征。

**例如**：
> "A 25-year-old Asian woman, short black hair with a red headband, wearing round glasses and a yellow sweater, a small mole on her left cheek..."
只要你每次都输入这段一模一样的长描述，AI 生成的人物看起来就会像是同一个人。

## 方案三：后期换脸法

这是目前效果最稳定、被广泛应用于商业项目的方法。思路是：先不管脸长什么样，把动作和场景生成出来，最后再统一把脸换成你的目标人物。

**常用工具**：
- **InsightFace (Discord 插件)**：常配合 Midjourney 使用，可以直接在 Discord 里用 /swapid 快速换脸。
- **各种网页端换脸工具**：市面上有许多基于 Roop 或相关开源项目封装的在线换脸工具，上传原图和目标脸部即可替换。

## 常见问题与避坑指南

- **为什么参考图里的人长得很像，但气质变了？**
  `--cref` 虽然能固定长相，但由于光影和画风的改变，有时候会觉得“不像”。尽量保证生成图的画风和原图的画风一致。
- **原图戴了墨镜，怎么去掉？**
  如果原图脸部有遮挡物（墨镜、口罩），AI 会把这些遮挡物当成人物特征保留下来。因此，**基础人物图必须是一张干干净净的脸**。

## 官方资料
- [Midjourney Character Reference 说明](https://docs.midjourney.com/)
- [InsightFace 介绍](https://insightface.ai/)

## 相关文章
- [如何让 AI 生成统一风格的一套图片？](./ai-image-03.md)
