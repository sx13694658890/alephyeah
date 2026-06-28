# 字体适配：流体与响应式字体系统

## 核心原则：文字永远不要用固定 px

设备感知字体的基本规则：**标题和正文必须随视口缩放**。

## 用 clamp() 实现流体字体

### 推荐：clamp() 配合视口相对的最小/最大值

```css
/* 流体模度：320px 视口时 16px → 1200px 视口时 20px */
--font-body: clamp(1rem, 0.875rem + 0.5vw, 1.25rem);

/* 流体模度：24px → 48px */
--font-h1: clamp(1.5rem, 0.75rem + 3vw, 3rem);

/* 用 calc() 精确控制斜率 */
--font-h2: clamp(1.25rem, calc(0.75rem + 1.5vw), 2rem);
```

### 计算 clamp() 的值

公式：`clamp(最小字号, calc(最小字号 + (最大字号 - 最小字号) * (100vw - 最窄视口) / (最宽视口 - 最窄视口)), 最大字号)`

工具：可用 `clamp()` 计算器或 `utopia.fyi` 生成流体模度。

### 老旧浏览器降级

```css
font-size: 1.25rem;                /* 降级 */
font-size: clamp(1rem, 0.875rem + 0.5vw, 1.25rem);
```

## 字号模度系统

用跨设备适配的模度比例：

```css
:root {
  --font-xs: clamp(0.75rem, 0.6875rem + 0.25vw, 0.875rem);
  --font-sm: clamp(0.875rem, 0.75rem + 0.5vw, 1rem);
  --font-base: clamp(1rem, 0.875rem + 0.5vw, 1.125rem);
  --font-lg: clamp(1.125rem, 0.875rem + 1vw, 1.375rem);
  --font-xl: clamp(1.25rem, 1rem + 1.5vw, 1.75rem);
  --font-2xl: clamp(1.5rem, 1rem + 2.5vw, 2.5rem);
  --font-3xl: clamp(2rem, 1.25rem + 3.5vw, 3.5rem);
  /* 正文推荐小三度(1.2)比例，标题推荐纯四度(1.333)比例 */

  /* 行高：字号越大行高越紧 */
  --leading-tight: 1.15;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;

  --letter-spacing-heading: -0.02em;
  --letter-spacing-body: 0;
}
```

## rem vs em vs px

| 单位 | 行为 | 何时使用 |
|------|------|---------|
| `rem` | 相对根字体大小 | **主要单位**：文字、间距、尺寸 |
| `em` | 相对父元素字体大小 | 组件内相对大小、与文字成比例的 padding |
| `px` | 绝对 | **边框**和精细细节专用 |
| `vw`, `vh` | 相对视口 | 需要流体且设了最小/最大值时、首屏区域 |
| `dvh`, `svh`, `lvh` | 动态视口（移动端友好） | 移动端全屏布局（避免 `100vh`） |
| `cqw`, `cqi` | 相对容器（较新） | 组件级在容器内流体 |

### 为什么 rem 优于 px

- 1rem = 浏览器默认字体大小（通常是 16px）
- 用户设置了更大的基础字体后，所有文字自动放大
- 移动端浏览器对相对单位的缩放表现更好
- 无障碍：尊重 `prefers-reduced-scale` 和系统字体大小设置

## 行宽（阅读宽度）

- 最佳：每行 45–75 个字符（用 CSS 的 `ch` 单位）
- 拉丁文容器设 `max-width: 70ch`
- 中日韩(CJK)文字：每行 30–45 个字符

```css
.prose {
  max-width: 70ch;           /* 拉丁文 */
  max-width: 45ch;           /* CJK — 用 lang 属性覆盖 */
}
```

## 移动端视口 Meta

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">
```

- 必须设置 `width=device-width, initial-scale=1.0`
- 避免 `user-scalable=no`——违反无障碍要求
- 只有确实有布局限制时才设 `maximum-scale`

## iOS 字体缩放

```css
/* 防止 iOS 在旋转屏幕时自动调整字号 */
html { -webkit-text-size-adjust: 100%; }

/* 允许但控制特定元素的缩放 */
.element { -webkit-text-size-adjust: none; } /* 谨慎使用 */
```

## 响应式行高

行高应随字号和行宽变化：

```css
:root {
  --lh-body: clamp(1.5, 1.4 + 0.2vw, 1.625);
  --lh-heading: clamp(1.15, 1.1 + 0.1vw, 1.25);
}
```

## 可变字体

可变字体支持按视口响应式调节字重和字宽：

```css
h1 {
  font-weight: 700;
  font-stretch: 100%;
}

@media (max-width: 600px) {
  h1 {
    font-weight: 400;  /* 小屏上用较轻字重，提高可读性 */
  }
}
```
