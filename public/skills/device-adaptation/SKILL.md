---
name: device-adaptation
description: |
  前端跨设备适配技能，专注响应式文字大小和页面布局。

  用于 Codex 需要以下场景时：
  (1) 设计在桌面、平板、手机上都正常工作的响应式布局
  (2) 实现跨视口缩放的流体字体系统
  (3) 处理触摸/指针交互以兼容不同设备
  (4) 使用媒体查询、容器查询和现代 CSS 实现设备感知布局
  (5) 确保从 320px 手机到 4K 桌面每个断点的文字大小、间距和视觉层次都正确
  (6) 将现有的固定 px 设计转换为流体、响应式系统
  (7) 构建移动优先项目，正确处理安全区域、触摸目标和视口
---

# Device Adaptation（跨设备适配）

跨设备前端适配 — 从 320px 手机屏到 4K 桌面显示器，无缝适配文字大小和页面布局。

## 核心原则

**内容定义断点。** 不要针对特定设备设断点。让布局告诉你哪里需要断。

**移动优先。** 优先编写窄视口的基础样式。用 `min-width` 媒体查询叠加大屏样式。

**流体而非固定。** 文字和布局间距用相对单位（`rem`、`%`、`vw`、`clamp()`）取代 `px`。`px` 只用在边框和精细细节上。

**渐进增强。** 先确保每个设备都有可用的基础体验，再为高级浏览器和大屏添加能力。

## 文字大小适配

详见 [typography.md](references/typography.md)。

### 工作流程

1. 在 `html` 上设置根字体基准（默认 `100%` / `16px`；不要设固定 `px` 值）
2. 用 CSS 自定义属性和 `clamp()` 定义流体字号模度
3. 所有文字用 `rem`——字体大小绝不使用 `px`
4. 设置最大行宽（拉丁文 `max-width: 70ch`，中日韩 `45ch`）
5. 处理移动端特殊行为：
   - `-webkit-text-size-adjust: 100%` 防止 iOS 自动缩放
   - 输入框 `font-size: 16px` 避免 iOS 自动放大
   - 视口 meta：`width=device-width, initial-scale=1.0`

### 关键模式

```css
/* 流体文字系统 */
--font-body: clamp(1rem, 0.875rem + 0.5vw, 1.25rem);
--font-h1: clamp(1.5rem, 0.75rem + 3vw, 3rem);

/* 行宽控制 */
.text-content { max-width: 70ch; }
.cjk-content { max-width: 45ch; }
```

## 布局适配

详见 [layout.md](references/layout.md)。

### 工作流程

1. 选择合适的布局方式：
   - **CSS Grid + `auto-fit`/`auto-fill`** — 二维网格和页面级结构
   - **Flexbox + `flex-wrap`** — 一维序列（卡片、导航项、工具栏）
   - **容器查询** — 可复用组件（卡片、小组件、侧边栏）
2. 用 `clamp()` 定义流体的 `gap`、`padding`、`margin`
3. 内容容器使用内在尺寸：`width: min(100% - 2rem, 1200px)`
4. 只在布局需要结构性变化时才加媒体查询
5. 可复用组件用 `container-type: inline-size`，布局取决于容器宽度而非视口宽度

### 关键模式

```css
/* 流体网格 */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr));
  gap: clamp(1rem, 2vw, 2rem);
}

/* 带内在最大宽度的容器 */
.page-content {
  width: min(100% - 2rem, 1200px);
  margin-inline: auto;
}
```

## 移动端专项适配

详见 [mobile.md](references/mobile.md)。

### 核验清单

- [ ] 视口 meta 标签: `width=device-width, initial-scale=1.0`
- [ ] 可交互元素触摸目标 ≥ 44×44px
- [ ] 安全区域: `env(safe-area-inset-*)` 带 fallback
- [ ] 不用 `100vh`——用 `100dvh` 或 JS 方案
- [ ] 触控事件监听器用 `passive` 保证滚动性能
- [ ] 用 `@media (pointer: coarse/fine)` 检测输入类型调整交互样式
- [ ] 模态框和滚动容器设 `overscroll-behavior: contain`
- [ ] 输入框 `font-size: 16px` 防止 iOS 缩放
- [ ] 用 `prefers-reduced-motion` 处理动画敏感
- [ ] `prefers-color-scheme` 处理深色/浅色模式

### 指针感知样式

hover 特效一定要用 `@media (hover: hover)` 包裹：

```css
@media (hover: hover) {
  .card:hover { transform: translateY(-2px); }
}
```

## 跨设备验证

在下列视口宽度验证适配效果：
- **320px** — 小屏手机
- **375px** — iPhone SE/14
- **414px** — iPhone Plus/Max
- **768px** — 平板竖屏
- **1024px** — 平板横屏 / 桌面边界
- **1280px** — 常规桌面
- **1440px+** — 宽屏
- **1920px+** — 大桌面

### 每个断点检查项

1. **文字**：不溢出、大小可读、行高合适
2. **布局**：无横向滚动、网格正确折行、元素不重叠
3. **触摸目标**：按钮和链接 ≥ 44×44px
4. **安全区域**：内容不被刘海或设备边框遮挡
5. **图片**：正确缩放、无变形、`srcset` 提供合适尺寸
6. **表单**：输入框在 iOS 上不缩放、标签可见、键盘不遮挡字段

## 什么时候引用哪个文件

| 场景 | 参考文件 |
|------|---------|
| 流体字体、clamp()、rem/em 系统 | [typography.md](references/typography.md) |
| CSS Grid/Flexbox 模式、容器查询、断点 | [layout.md](references/layout.md) |
| 触摸事件、视口 meta、安全区域、移动端性能 | [mobile.md](references/mobile.md) |
