# 移动端适配：触摸、视口与原生集成

## 核心原则：移动端不只是窄了的桌面

移动端的交互模式、视口行为和硬件约束需要专门处理。

## 触摸 vs 指针 vs 鼠标

### 统一指针处理

```js
/* 用 pointer 事件取代 touch/mouse，统一处理所有输入 */
element.addEventListener("pointerdown", handler); // 所有输入类型都会触发

/* CSS：检测主要输入方式 */
@media (pointer: coarse) {
  /* 仅触摸：更大的触摸目标、更多间距 */
  .btn { min-height: 44px; min-width: 44px; }
}

@media (pointer: fine) {
  /* 鼠标/手写笔：悬停效果、更小的控件 */
  .btn:hover { transform: scale(1.05); }
}

@media (hover: none) and (pointer: coarse) {
  /* 专指触摸设备 */
  .card { cursor: default; }
}
```

### 触摸目标尺寸（WCAG 2.2）

- 最小：24×24 CSS 像素（WCAG AA）
- 推荐：44×44 CSS 像素
- 确保触摸目标之间有足够间距（≥8px）

```css
.touch-target {
  min-width: 44px;
  min-height: 44px;
  /* 使用 SVG 图标时，添加不可见的点击区域扩展 */
}

/* 用 padding 扩展点击区域 */
.small-icon-button {
  padding: 12px;       /* 大多数布局中将点击区域扩展到 44px+ */
  background-clip: content-box;
}
```

### 消除 300ms 点击延迟

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<!-- 设置了视口后，现代浏览器会消除延迟 -->
```

## 视口与安全区域

### 安全区域（刘海屏）

```css
/* iOS 安全区域 */
.safe-area {
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}

/* 带降级方案 */
.fixed-bottom {
  padding-bottom: max(16px, env(safe-area-inset-bottom));
}
```

### 视口高度的坑

移动端 Safari 的 `100vh` 包含地址栏，导致布局跳动。解决方案：

```css
/* 方案1：使用动态视口（现代浏览器） */
.fullscreen { height: 100dvh; }

/* 方案2：用 min-height 代替 height */
.fullscreen { min-height: 100vh; min-height: 100dvh; }

/* 方案3：CSS fill-available */
.fullscreen { height: -webkit-fill-available; }

/* 方案4：JS 降级（最可靠） */
:root { --vh: 1vh; }
@media (pointer: coarse) {
  :root { --vh: 1dvh; }
}
.fullscreen { height: calc(var(--vh, 1vh) * 100); }
```

## 方向与键盘

### 方向感知布局

```css
/* 检测方向 */
@media (orientation: portrait) {
  .layout { grid-template-columns: 1fr; }
}
@media (orientation: landscape) and (max-height: 500px) {
  .layout { grid-template-columns: 1fr 1fr; }
}

/* 也可以用宽高比 */
@media (max-aspect-ratio: 1/1) {
  /* 竖屏 */
}
```

### 虚拟键盘处理

```css
/* Visual Viewport API 是现代方案 */
/* CSS：确保输入框不被键盘遮挡 */
.form-footer {
  position: sticky;
  bottom: 0;
  background: var(--surface);
}

/* 防止 iOS 输入聚焦时视口缩放（iOS） */
input, textarea, select {
  font-size: 16px; /* iOS 在 font-size ≥ 16px 时不缩放 */
}
```

## 触摸手势

### 为滚动性能使用 passive 事件监听器

```js
document.addEventListener("touchstart", handler, { passive: true });
document.addEventListener("touchmove", handler, { passive: true });
// 只有调用 preventDefault() 时才设 passive: false
```

### 下拉刷新控制

```css
/* 在特定容器禁用回弹 */
.no-overscroll {
  overscroll-behavior: contain;
}

/* 主内容区域启用原生下拉刷新 */
body { overscroll-behavior: auto; }
```

## 移动端专用 CSS

### 防止 iOS 在方向旋转时缩放文字

```css
html { -webkit-text-size-adjust: 100%; }
```

### 选中颜色（移动端一致性）

```css
::selection { background: var(--primary); color: white; }
```

### 惯性滚动

```css
.scroll-container {
  -webkit-overflow-scrolling: touch;  /* iOS 惯性 */
  scroll-behavior: smooth;            /* 平滑滚动锚点 */
  overflow-y: auto;
}
```

### 防止长按弹出菜单（iOS）

```css
/* 只用于可交互元素，不要用在 body 上 */
.draggable { -webkit-touch-callout: none; }
```

## 设备特性检测（CSS + JS）

```css
/* 悬停能力 */
@media (hover: none) { /* 触摸设备 */ }

/* 指针精度 */
@media (pointer: coarse) { /* 不精确的触摸 */ }
@media (pointer: fine) { /* 精确的鼠标/手写笔 */ }

/* 配色方案 */
@media (prefers-color-scheme: dark) { /* 深色模式 */ }

/* 对比度偏好 */
@media (prefers-contrast: more) { /* 高对比度 */ }

/* 动效敏感 */
@media (prefers-reduced-motion: reduce) {
  * { animation-duration: 0.01ms !important; }
}

/* 显示类型 */
@media (dynamic-range: high) { /* HDR 显示器 */ }
```

## 性能注意事项

### 移动端关键性能规则：

1. **减少 DOM 大小**：目标 <1000 节点，<30 层深度
2. **避免布局抖动**：用 `requestAnimationFrame` 批量读写
3. **触摸处理性能**：用 passive 监听器、防抖滚动
4. **图片优化**：`srcset` + `sizes` + `loading="lazy"` + `decoding="async"`
5. **响应式图片**：始终提供多种分辨率

```html
<img
  src="photo-800.jpg"
  srcset="photo-400.jpg 400w, photo-800.jpg 800w, photo-1200.jpg 1200w"
  sizes="(max-width: 600px) 100vw, 50vw"
  loading="lazy"
  decoding="async"
  alt="描述文字"
>
```

## 设备特性快速参考

| 特性 | 处理方式 |
|------|---------|
| 输入框自动缩放（iOS） | 输入框设 `font-size: 16px` 最小 |
| 刘海/挖孔屏 | 使用 `env(safe-area-inset-*)` |
| 300ms 点击延迟 | 设置视口 meta 标签 |
| 100vh 地址栏问题 | 使用 `100dvh` 或 JS 降级 |
| 双击缩放 | 只对特定交互元素禁用 |
| 触摸端的 hover | 用 `@media (hover: hover)` 包裹 hover 样式 |
| 滚动性能 | `will-change: transform`、passive 监听器 |
| 点击高亮 | 交互元素用 `-webkit-tap-highlight-color: transparent` |
