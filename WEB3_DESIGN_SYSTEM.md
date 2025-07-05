# 天使加密 WEB3 设计系统

## 🎨 设计理念

### 核心原则
- **清爽简洁**: 减少视觉噪音，突出核心功能
- **高对比度**: 确保文字和背景有足够的对比度
- **统一配色**: 建立一致的品牌色彩体系
- **现代感**: 体现WEB3时代的科技感和未来感

### WEB3 风格特征
- 玻璃拟态效果 (Glassmorphism)
- 渐变色彩系统
- 柔和的阴影和发光效果
- 流畅的过渡动画
- 高对比度的配色方案

## 🎯 配色系统

### 主要品牌色
```css
/* 主紫色 */
--angel-primary: 280 100% 65%;        /* #A855F7 */
--angel-primary-dark: 280 100% 50%;   /* 深紫色 */
--angel-primary-light: 280 100% 80%;  /* 浅紫色 */

/* 粉色 */
--angel-secondary: 328 100% 60%;      /* #E91E63 */
--angel-secondary-dark: 328 100% 45%; 
--angel-secondary-light: 328 100% 75%;

/* 青色 */
--angel-accent: 199 100% 45%;         /* #00BCD4 */
--angel-accent-dark: 199 100% 30%;
--angel-accent-light: 199 100% 60%;

/* 金色 */
--angel-gold: 43 100% 50%;            /* #FFB000 */
--angel-gold-dark: 43 100% 35%;
--angel-gold-light: 43 100% 65%;
```

### 功能色彩
```css
/* 成功色 */
--angel-success: 142 76% 36%;         /* #00C853 */

/* 警告色 */
--angel-warning: 38 100% 50%;         /* #FF9800 */

/* 错误色 */
--angel-error: 0 100% 50%;            /* #F44336 */
```

### 中性色彩 (高对比度)
```css
/* 亮色主题 */
--neutral-50: 240 5% 98%;   /* 极浅灰 */
--neutral-100: 240 5% 96%;  /* 浅灰 */
--neutral-500: 240 6% 46%;  /* 中等灰 */
--neutral-900: 240 15% 9%;  /* 深灰 */

/* 深色主题 */
--background: 240 15% 6%;   /* 深色背景 */
--card: 240 12% 8%;         /* 深色卡片 */
--border: 240 8% 18%;       /* 深色边框 */
```

## 🌈 渐变系统

### 主要渐变
```css
/* 主渐变 - 紫色到粉色 */
.bg-gradient-primary {
  background: linear-gradient(135deg, 
    hsl(var(--angel-primary)) 0%, 
    hsl(var(--angel-secondary)) 100%);
}

/* 次渐变 - 青色到紫色 */
.bg-gradient-secondary {
  background: linear-gradient(135deg, 
    hsl(var(--angel-accent)) 0%, 
    hsl(var(--angel-primary)) 100%);
}

/* 金色渐变 */
.bg-gradient-gold {
  background: linear-gradient(135deg, 
    hsl(var(--angel-gold)) 0%, 
    hsl(var(--angel-gold-light)) 100%);
}

/* 彩虹渐变 */
.bg-gradient-premium {
  background: linear-gradient(135deg, 
    hsl(var(--angel-primary)) 0%, 
    hsl(var(--angel-secondary)) 25%, 
    hsl(var(--angel-accent)) 50%, 
    hsl(var(--angel-gold)) 75%, 
    hsl(var(--angel-success)) 100%);
}
```

## 🔮 玻璃拟态效果

### 玻璃效果类
```css
/* 标准玻璃效果 */
.glass-effect {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
}

/* 卡片玻璃效果 */
.glass-card {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
}
```

### 深色模式适配
```css
.dark .glass-effect {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}
```

## ✨ 发光和阴影效果

### 品牌色阴影
```css
.shadow-angel-primary {
  box-shadow: 0 10px 40px -10px hsl(var(--angel-primary) / 0.4);
}

.shadow-angel-secondary {
  box-shadow: 0 10px 40px -10px hsl(var(--angel-secondary) / 0.4);
}

.shadow-angel-accent {
  box-shadow: 0 10px 40px -10px hsl(var(--angel-accent) / 0.4);
}

.shadow-angel-gold {
  box-shadow: 0 10px 40px -10px hsl(var(--angel-gold) / 0.4);
}
```

### 悬停发光效果
```css
.hover-glow-primary:hover {
  box-shadow: 0 0 30px hsl(var(--angel-primary) / 0.5);
  transform: translateY(-2px);
}
```

## 🎭 文字系统

### 语义化颜色
```css
/* 使用语义化的颜色变量 */
.text-foreground     /* 主要文字 */
.text-muted-foreground  /* 次要文字 */
.text-angel-primary     /* 品牌色文字 */
.text-angel-secondary   /* 辅助色文字 */
```

### 渐变文字
```css
.text-gradient-primary {
  background: linear-gradient(135deg, 
    hsl(var(--angel-primary)) 0%, 
    hsl(var(--angel-secondary)) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

## 🎯 组件设计规范

### 按钮设计
- **最小尺寸**: 44x44px (符合移动端触摸标准)
- **圆角**: 0.75rem (12px)
- **悬停效果**: 轻微上移 + 发光效果
- **点击反馈**: 缩放到 95%

### 卡片设计
- **背景**: 玻璃拟态效果
- **圆角**: 1rem (16px) 或 1.5rem (24px)
- **阴影**: 品牌色柔和阴影
- **悬停**: 上移 4px + 缩放 102%

### 导航设计
- **侧边栏**: 玻璃拟态背景 + 模糊效果
- **激活状态**: 主渐变背景 + 白色文字
- **悬停状态**: 次要背景 + 品牌色文字

## 📱 移动端优化

### 触摸交互
```css
/* 触摸反馈 */
.touch-feedback:active {
  transform: scale(0.95);
  opacity: 0.8;
}

/* 触摸目标大小 */
button, .btn, [role="button"] {
  min-height: 44px;
  min-width: 44px;
}
```

### 安全区域
```css
.safe-area-top { padding-top: env(safe-area-inset-top); }
.safe-area-bottom { padding-bottom: env(safe-area-inset-bottom); }
```

## 🌗 深色模式

### 背景系统
- **亮色**: 纯白色到极浅灰的渐变
- **深色**: 深紫灰色的渐变背景

### 对比度增强
- 深色模式下所有文字颜色都经过优化
- 边框和分割线使用语义化颜色
- 保持品牌色在两种模式下的视觉一致性

## 🎬 动画系统

### 缓动函数
```css
/* 标准缓动 */
transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

/* 快速反馈 */
transition: all 0.15s ease;
```

### 浮动动画
```css
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}
```

## 🔧 使用指南

### 组件类名约定
```html
<!-- 主要卡片 -->
<div class="glass-card shadow-angel-primary hover-glow-primary">

<!-- 按钮 -->
<button class="bg-gradient-primary text-white shadow-angel-primary hover-glow-primary touch-feedback">

<!-- 文字 -->
<h1 class="text-foreground">
<p class="text-muted-foreground">
```

### 响应式设计
- 所有组件都优先考虑移动端体验
- 使用相对单位和弹性布局
- 支持触摸手势和键盘导航

## 📊 可访问性

### 对比度标准
- 所有文字都达到 WCAG AA 标准
- 重要信息达到 AAA 标准
- 支持高对比度模式

### 键盘导航
- 所有交互元素支持键盘操作
- 明确的焦点指示器
- 逻辑的 Tab 顺序

## 🎉 设计成果

### 统一性
- 全应用使用统一的设计语言
- 一致的交互模式和视觉反馈
- 统一的配色和字体系统

### 现代感
- 符合 2024 年设计趋势
- 体现 WEB3 的科技感
- 优雅的玻璃拟态效果

### 可用性
- 优秀的移动端体验
- 高对比度保证可读性
- 流畅的动画和过渡效果 