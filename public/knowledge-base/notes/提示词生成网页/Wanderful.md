---
tags:
  - prompt
  - web-dev
  - travel
  - landing-page
category: 提示词
---


使用 React + TypeScript + Vite + Tailwind CSS 为名为“Wanderful”的旅行品牌构建一个全视口电影级英雄部分。使用 GSAP 进行动画，`lucide-react` 用于图标。

**字体（通过 Google Fonts 在 `src/index.css` 中加载）：**
```css
@import url('fonts.googleapis.com/css2?family=In…');
```
另外加载自定义显示字体：
```css
@font-face {
  font-family: 'Dirtyline';
  src: url('fonts.cdnfonts.com/s/15011/Dirtyl…') format('woff');
  font-weight: normal; font-style: normal; font-display: swap;
}
```
正文字体：`Barlow`。英雄标题：`Inter`。页面背景：`#000`。

**视频背景（固定、全屏、z-0）：**
- 使用此确切的 CloudFront URL 作为 `<video>` src：
  `d8j0ntlcm91z4.cloudfront.net/user_38xzZboKV…`
- 属性：`autoPlay muted loop playsInline`、`object-cover`、包装器缩放 `scale-[1.08]` 并使用 `origin-center`。
- 在 `onLoadedMetadata` 时，设置 `playbackRate = 1.25`。
- 添加 GSAP 驱动的鼠标视差效果：监听 `mousemove`，计算 `targetX/Y = ((clientX - cx)/cx) * 20`，在 `requestAnimationFrame` 内使用插值 `currentX/Y += (target - current) * 0.06`，并通过 `gsap.set(videoBg, { x, y })` 应用。

**液体玻璃实用工具（添加到 `index.css`）：**
```css
.liquid-glass {
  background: rgba(255,255,255,0.01);
  background-blend-mode: luminosity;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  border: none;
  box-shadow: inset 0 1px 1px rgba(255,255,255,0.1);
  position: relative;
  overflow: hidden;
}
.liquid-glass::before {
  content: "";
  position: absolute; inset: 0;
  border-radius: inherit;
  padding: 1.4px;
  background: linear-gradient(180deg,
    rgba(255,255,255,0.45) 0%,
    rgba(255,255,255,0.15) 20%,
    rgba(255,255,255,0) 40%,
    rgba(255,255,255,0) 60%,
    rgba(255,255,255,0.15) 80%,
    rgba(255,255,255,0.45) 100%);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
}
```

**头部（固定顶部、z-50、`px-10 py-8`、flex justify-between items-center）：**
- 左侧：文字标志 `Wanderful` 后跟 `<sup>TM</sup>`，`text-[17px] font-semibold tracking-tight`。
- 中心：使用 `.liquid-glass rounded-full px-2 py-2 flex items-center gap-1` 的 `<nav>`。链接：`JOURNEY`、`BENEFITS`、`JOURNAL`、`GUIDEBOOK`。每个链接：`text-[11px] font-medium tracking-[0.12em] text-white/90 hover:text-white px-4 py-1.5 rounded-full transition-colors duration-200`。
- 右侧：带有相同 `.liquid-glass rounded-full px-5 py-2.5 text-[11px] font-medium tracking-[0.12em] text-white/90 hover:text-white` 的“GET ROAMING”锚点。

**英雄标题（固定、`top: 120px`、居中、z-20）：**
两行，均居中，`Inter` 400，`font-size: clamp(40px, 5.4vw, 72px)`，`line-height: 1.1`，`letter-spacing: -0.02em`：
- 第 1 行（白色）：`Venture without edges.`
- 第 2 行（`rgba(255,255,255,0.55)`）：`Uncover with keen instinct.`

加载时淡入：`opacity 0 → 100` 和 `translate-y-6 → 0`，使用 `transition-all duration-1000`。

**底部块（固定 `bottom-14`、z-20、flex-col items-center gap-6），使用 `delay-300` 淡入：**
1. 段落，`max-w-[620px] text-[15px] leading-relaxed` 居中：
   - 白色：“Our smart itineraries shape around you — your rhythm, your vibe, your hunger for adventure.”
   - `text-white/55`：“ Each getaway is tailored, seamless, and wholly yours.”
2. 按钮：白色背景、黑色文字，`text-[15px] font-medium rounded-full px-8 py-3.5`，悬停时 `scale-[1.03]` + `shadow-[0_0_32px_4px_rgba(255,255,255,0.2)]`，激活时 `scale-[0.97]`。标签：`Plan my escape today`。
3. 行：来自 lucide-react 的 `Lock` 图标（`size={13} strokeWidth={1.5}`）+ `text-[11px] font-medium tracking-[0.14em] text-white/70`，文字：`SECURE BY DESIGN. ZERO DATA LEAKS.`。

**根容器：** `min-h-screen bg-black text-white overflow-x-hidden`，内联 `fontFamily: "'Inter', sans-serif"`。

依赖项：`gsap`、`lucide-react`、`react`、`react-dom`，tailwind 配置内容 glob 为 `./index.html` 和 `./src/**/*.{js,ts,jsx,tsx}`。

## 关联笔记

- [[提示词生成网页/liquid]]
- [[提示词生成网页/再生能源公司]]
- [[Seedance-2.0-prompt/3d动画喜剧/类型 ：3d动画喜剧]]
