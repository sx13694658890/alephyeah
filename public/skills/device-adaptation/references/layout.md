# 布局适配：响应式与跨设备布局系统

## 核心原则：让内容决定断点

**不要为特定设备做设计——为内容做设计。** 断点由布局在哪断开决定，而不是由 iPad 尺寸决定。

## 响应式布局的三根支柱

### 1. 流体网格（CSS Grid + Flexbox）

```css
/* CSS Grid: auto-fill 和 auto-fit 是最好的朋友 */
.grid-auto {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr));
  gap: clamp(1rem, 2vw, 2rem);
}

/* Flexbox: 自然折行 */
.flex-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: var(--gutter, 1rem);
}
.flex-wrap > * {
  flex: 1 1 var(--item-min, 280px);
}

/* 用 min() 和 max() 做内在尺寸 */
.container {
  width: min(100% - 2rem, 1200px);
  margin-inline: auto;
}
```

### 2. 媒体查询（视口响应）

按内容驱动布局的策略断点：

```css
/* 基础：移动优先（320px+）*/
/* 不加媒体查询 = 移动端样式 */

/* 小平板 / 大手机 */
@media (min-width: 480px) { /* ... */ }

/* 平板 */
@media (min-width: 768px) { /* ... */ }

/* 小桌面 */
@media (min-width: 1024px) { /* ... */ }

/* 大桌面 */
@media (min-width: 1280px) { /* ... */ }

/* 超宽屏（可选） */
@media (min-width: 1536px) { /* ... */ }
```

**移动优先原则**：先写移动端基础样式，用 `min-width` 查询逐层叠加。

### 3. 容器查询（组件响应）

容器查询让组件响应**自身容器大小**，而非视口：

```css
.card-container {
  container-type: inline-size;
  container-name: card;
}

@container card (max-width: 400px) {
  .card { flex-direction: column; }
  .card-image { width: 100%; }
}

@container card (min-width: 401px) {
  .card { flex-direction: row; }
  .card-image { width: 40%; }
}
```

**何时用容器查询 vs 媒体查询：**

| 场景 | 使用 |
|------|------|
| 页面级布局变化 | 媒体查询 |
| 在不同上下文中复用的组件 | 容器查询 |
| 仪表盘小组件、卡片、侧边栏 | 容器查询 |
| 全页模板 | 媒体查询 |

## 布局模式

### 侧边栏 + 主体（无痛圣杯布局）

```css
.page {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 2rem;
}

@media (max-width: 768px) {
  .page {
    grid-template-columns: 1fr;
  }
}
```

更好的方式：自动计算的侧边栏

```css
.page {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 2rem;
}

@media (min-width: 768px) {
  .page {
    grid-template-columns: minmax(200px, 280px) minmax(0, 1fr);
  }
}
```

### 卡片网格

```css
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 300px), 1fr));
  gap: clamp(1rem, 2vw, 2rem);
}
```

### 多列文字

```css
.text-columns {
  columns: 2;
  column-gap: 2rem;
}

@media (max-width: 480px) {
  .text-columns {
    columns: 1;
  }
}
```

## 间距系统

间距应随比例缩放：

```css
:root {
  --space-xs: clamp(0.25rem, 0.5vw, 0.5rem);
  --space-sm: clamp(0.5rem, 1vw, 0.75rem);
  --space-md: clamp(1rem, 2vw, 1.5rem);
  --space-lg: clamp(1.5rem, 3vw, 2.5rem);
  --space-xl: clamp(2rem, 4vw, 4rem);
  --space-2xl: clamp(3rem, 6vw, 6rem);
}
```

## 响应式导航模式

### 底部导航（移动端）→ 侧边栏（桌面端）

```css
.nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-around;
  background: var(--surface);
  padding: env(safe-area-inset-bottom, 0) 0 0;
}

@media (min-width: 768px) {
  .nav {
    position: sticky;
    top: 0;
    flex-direction: row;
    justify-content: center;
  }
}
```

### 汉堡菜单（移动端）→ 内联导航（桌面端）

```css
.nav-toggle { display: block; }
.nav-links {
  display: none;
  /* 移动端菜单用 absolute/fixed 覆盖层 */
}
.nav-links.open { display: flex; }

@media (min-width: 768px) {
  .nav-toggle { display: none; }
  .nav-links { display: flex; position: static; }
}
```

## 打印样式

```css
@media print {
  body { font-size: 12pt; }
  .no-print { display: none !important; }
  a[href]::after { content: " (" attr(href) ")"; }
}
```
