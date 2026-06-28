# 万能 Prompt 模板

直接复制并根据项目修改。

## 完整版

```text
请帮我生成一个高端、现代的页面，满足以下要求：

【布局与结构】
- 使用 Tailwind CSS 做响应式布局
- 使用 Bento Grid / Dashboard 式布局组织内容
- 信息层级清晰，留白充足

【视觉与质感】
- 细边框、轻阴影，配合 backdrop-blur 做玻璃态（glassmorphism）
- 关键词：subtle border、soft shadow、noise texture
- 适度使用 gradient mesh 增强纵深与层次

【动效与交互】
- 使用 Framer Motion（Motion）处理交互与动画
- 包含：hover feedback、scroll reveal、stagger animation、smooth transition
- 动效克制、自然，有呼吸感，不干扰阅读

【3D 与空间感】（按需选用/删除）
- 适度使用 Three.js / React Three Fiber 作为背景氛围
- 例如：particle field、3D orb、floating geometry
- 3D 仅烘托氛围，不遮挡主内容与主操作

【组件与产品感】
- 采用 shadcn/ui 风格的组件体系，视觉统一
- 包含：Button、Card、Input、Modal、Toast、Empty State 等
- 遵循 design system，组件可复用、命名与变体清晰

【整体风格】
- 极简、偏科技、偏高端、偏真实产品气质
- 视觉干净、焦点明确；动效与 3D 均为辅助

【禁止项】
- 避免：过度渐变、大量 Emoji、廉价光晕、过大圆角堆叠、信息过载

【目标】
- 让页面看起来像真实的现代产品，而不是通用模板
```

## 精简版（快速使用）

```text
请帮我生成一个高端页面，要求：
- Tailwind CSS + Motion + {shadcn/ui | 自定组件}
- 质感关键词：backdrop-blur、soft-shadow、subtle-border、bento-grid
- 动效：scroll-reveal、stagger-animation、hover-feedback
- {可选} Three.js 粒子场作为背景氛围
- 组件状态完整、响应式适配
- 禁止 Emoji、过度渐变、信息过载
```

## 场景变体

### 落地页（Landing Page）
在布局中强调：首屏 Hero 大标题 + 副标题 + CTA；产品/服务亮点 Bento Grid 展示；底部 Footer。

### Dashboard / 后台
在组件中强调：Sidebar 导航、数据卡片（Stat Card）、图表区域、Command Palette；使用浅色/中性配色。

### 品牌展示站
在 3D 中强调：背景粒子场或漂浮几何体；品牌色做主色调；动效节奏偏慢，强调沉浸感。

### 产品详情页
在视觉中强调：大图/视频区域、产品规格表格、评价区、粘性购买按钮；字体层级偏标题重。

> 使用方式：选一个场景变体，删除其他部分，然后修改 3D/组件/禁止项 以满足你的具体需求。
