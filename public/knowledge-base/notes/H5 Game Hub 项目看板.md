---
tags:
  - project
  - game-dev
  - h5
category: 项目
---

### 产品概述

项目背景与目标

构建一个面向移动端与桌面端的 H5 游戏合集平台，提供多款经典小游戏，以极致的视觉体验和流畅的交互为核心竞争力。所有游戏基于 React + TypeScript + Canvas 实现，引入物理引擎提升游戏品质。

核心功能需求

① 游戏大厅 — 炫酷首页，卡片式游戏入口，粒子特效背景，成就展示  
② 游戏框架 — 统一的暂停/继续/重新开始/音效/全屏控制  
③ 排行榜 — 本地 localStorage 存储最高分，可分享截图  
④ 主题系统 — 暗色/亮色主题切换，渐变配色  
⑤ 触控支持 — 移动端手势操作，虚拟按键  
⑥ 音效系统 — Web Audio API 合成音效，音量控制

非功能需求

性能：60fps 稳定帧率，首屏加载 <2s  
兼容：Chrome/Safari/Firefox 最新版本，iOS 14+ / Android 10+  
响应式：375px ~ 1920px 全宽适配  
可访问性：键盘导航支持，游戏操作说明


核心路径
用户进入大厅 → 选择游戏 → 游戏加载（含动画过渡）→ 开始游戏 → 查看成绩 → 分享/重玩


### 开发任务看板

         全部阶段         Phase 1 基建         Phase 2 核心游戏         Phase 3 更多游戏         Phase 4 打磨       

Phase 1 · 基础架构Week 1–2

✓

项目脚手架 Vite + React + TS 搭建

Day 1

✓

目录结构规范 + ESLint + Prettier 配置

Day 1

⟳

全局状态管理 Zustand 接入

Day 2

⟳

游戏大厅页面（粒子背景 + 卡片布局）

Day 3–4

⟳

路由系统 React Router + 页面过渡动画

Day 3

通用游戏容器组件（HUD、暂停菜单、计分）

Day 4–5

Web Audio API 音效系统封装

Day 5

localStorage 排行榜 Hook

Day 6

主题切换系统（暗/亮）+ CSS 变量

Day 7

移动端触控 Hook + 虚拟按键组件


### 开发任务看板

         全部阶段         Phase 1 基建         Phase 2 核心游戏         Phase 3 更多游戏         Phase 4 打磨       

Phase 2 · 核心游戏Week 3–5

⟳

俄罗斯方块 — 方块生成 + 旋转算法（SRS）

Day 9–10

俄罗斯方块 — 碰撞检测 + 行消除 + 粒子爆炸

Day 11

俄罗斯方块 — 分数系统 + 关卡加速 + 音效

Day 12

贪吃蛇 — 格子系统 + 方向控制 + 食物生成

Day 13–14

贪吃蛇 — 碰撞检测 + 特殊食物 + 特效

Day 15

贪吃蛇 — AI 自动模式（A* 寻路）

Day 16

打砖块 — Matter.js 物理引擎集成

Day 17–18

打砖块 — 砖块布局 + 道具系统 + 多球


### 开发任务看板

         全部阶段         Phase 1 基建         Phase 2 核心游戏         Phase 3 更多游戏         Phase 4 打磨       

Phase 3 · 拓展游戏Week 6–8

2048 — 棋盘状态 + 滑动逻辑 + CSS 动画

Day 21–22

2048 — 撤销功能 + 最优路径提示

Day 23

记忆翻牌 — 卡片生成 + CSS 3D 翻转动画

Day 24–25

记忆翻牌 — 关卡难度 + 倒计时 + 连击奖励

Day 26

节奏轻触 — Web Audio API 节拍分析

Day 27–28

节奏轻触 — 音符下落渲染 + 判定窗口 + 连击特效

### 开发任务看板

         全部阶段         Phase 1 基建         Phase 2 核心游戏         Phase 3 更多游戏         Phase 4 打磨       

Phase 4 · 打磨上线Week 9–10

全局性能优化 + Canvas 离屏渲染

Day 31

分享截图功能（html2canvas）

Day 32

PWA 支持（离线可玩）

Day 33

全端 E2E 测试 + 性能基准测试

Day 34

部署 CI/CD（GitHub Actions + Vercel）



### 任务审核门控机制

📋

L1 — 代码完成审核（每个功能）

TypeScript 类型覆盖 100% · ESLint 0 error · 组件单测通过 · 代码注释完整

🎮

L2 — 游戏可玩性审核（每个游戏）

游戏逻辑无 bug · 帧率稳定 ≥55fps · 操作流畅度打分 ≥8/10 · 难度曲线合理

✨

L3 — 视觉体验审核（每个 Phase）

动画流畅无卡顿 · 粒子特效渲染正常 · 色彩与主题一致 · 移动端视觉还原度 ≥95%

📱

L4 — 跨端兼容审核（Phase 结束）

iOS Safari · Android Chrome · 桌面 3 浏览器 · 375px + 768px + 1440px 断点测试

🚀

L5 — 发布前最终审核

Lighthouse 性能分 ≥85 · 首屏 LCP <2s · 无内存泄漏 · PWA 安装正常 · 分享功能验证

### 审核流转规则

任务完成 → 自动化检测（CI）→ L1 代码审核 → 通过则流转下一任务  
  
游戏开发完毕 → L2 可玩性 + L3 视觉双审核 → 两项均通过方可合入主分支  
  
每个 Phase 结束 → L4 跨端审核 → 不通过则在本 Phase 内修复，不得进入下一阶段  
  
任何审核不通过的项目将自动在看板中标红并阻塞后续任务


### 技术栈架构

核心框架层

React 18

TypeScript 5

Vite 5

React Router v6

Zustand

游戏引擎层

Canvas 2D API

Matter.js（物理）

requestAnimationFrame

Web Audio API

特效与动画层

Framer Motion

CSS 自定义属性

粒子系统（自研）

CSS 3D Transform

工程与部署

Vitest + Testing Library

ESLint + Prettier

GitHub Actions CI

Vercel 部署

PWA + Service Worker


### 目录结构

src/  
  games/  
    tetris/     ← 俄罗斯方块  
    snake/      ← 贪吃蛇  
    breakout/   ← 打砖块  
    2048/       ← 2048  
    memory/     ← 记忆翻牌  
    rhythm/     ← 节奏轻触  
  core/        ← 游戏引擎抽象层  
  components/  ← 通用 UI 组件  
  hooks/       ← 自定义 Hooks  
  stores/      ← Zustand 全局状态  
  effects/     ← 粒子/特效系统  
  audio/       ← 音效管理  
  utils/       ← 工具函数

## 关联笔记

- [[个人博客搭建/前端项目 AGENTS.md 模板]]
- [[个人博客搭建/代码审查模板]]
- [[同城跑腿小程序的用户端/用户端]]
- [[提示词生成网页/Wanderful]]
