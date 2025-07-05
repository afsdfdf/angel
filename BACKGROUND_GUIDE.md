# Angel Paradise 背景图片使用指南

## 📸 背景图片系统说明

Angel Paradise 采用统一的背景图片系统，支持为不同页面和组件配置专属背景，营造沉浸式的天使主题体验。

## 🎨 推荐的背景图片风格

### 天使主题元素
- ✨ **天使翅膀**：纯白或金色的天使翅膀
- 🌤️ **天空云朵**：柔和的云朵和天空背景
- 🌟 **星光效果**：闪烁的星星和光效
- 💫 **光晕效果**：温暖的光晕和光芒
- 🕊️ **和平象征**：白鸽、橄榄枝等和平元素
- 🌈 **彩虹色彩**：柔和的彩虹渐变
- 💎 **水晶质感**：透明水晶和宝石效果

### 色彩搭配建议
- **主色调**：白色、金色、淡紫色、天蓝色
- **辅助色**：粉色、薄荷绿、珍珠白
- **避免**：过于鲜艳、刺眼的颜色

## 📐 图片规格要求

### 桌面端背景
- **推荐尺寸**：1920x1080 (16:9)
- **最小尺寸**：1366x768
- **最大尺寸**：3840x2160

### 移动端背景
- **推荐尺寸**：1080x1920 (9:16)
- **最小尺寸**：750x1334
- **最大尺寸**：1284x2778

### 卡片背景
- **推荐尺寸**：800x600 (4:3)
- **最小尺寸**：600x400
- **最大尺寸**：1200x900

### 文件格式与大小
- **支持格式**：JPG, JPEG, PNG, WebP
- **推荐格式**：WebP (更好的压缩比)
- **最大文件大小**：5MB
- **推荐文件大小**：500KB - 2MB

## 📁 文件结构

```
public/
└── backgrounds/
    ├── angel-heaven-primary.jpg          # 主背景图片
    ├── angel-clouds-secondary.jpg        # 次要背景图片
    ├── angel-paradise-home.jpg           # 首页背景
    ├── angel-trading-swap.jpg            # 交换页背景
    ├── angel-gallery-nft.jpg             # NFT页背景
    ├── angel-treasury-staking.jpg        # 质押页背景
    ├── angel-lands-paradise.jpg          # 乐园页背景
    ├── angel-profile.jpg                 # 个人资料页背景
    ├── angel-premium-card.jpg            # 高级卡片背景
    ├── angel-glass-card.jpg              # 玻璃卡片背景
    └── angel-accent-card.jpg             # 强调卡片背景
```

## 🔧 配置方法

### 1. 准备图片文件
将您的背景图片按照上述规格准备好，并按照建议的命名方式命名。

### 2. 上传图片
将图片文件放置在 `public/backgrounds/` 目录下。

### 3. 更新配置
在 `lib/background-config.ts` 文件中更新对应的路径：

```typescript
export const backgroundConfig: BackgroundConfig = {
  primary: "/backgrounds/你的主背景图片.jpg",
  secondary: "/backgrounds/你的次要背景图片.jpg",
  special: {
    home: "/backgrounds/你的首页背景.jpg",
    swap: "/backgrounds/你的交换页背景.jpg",
    nft: "/backgrounds/你的NFT页背景.jpg",
    staking: "/backgrounds/你的质押页背景.jpg",
    paradise: "/backgrounds/你的乐园页背景.jpg",
    profile: "/backgrounds/你的个人资料页背景.jpg"
  },
  cards: {
    premium: "/backgrounds/你的高级卡片背景.jpg",
    glass: "/backgrounds/你的玻璃卡片背景.jpg",
    accent: "/backgrounds/你的强调卡片背景.jpg"
  }
}
```

### 4. 应用背景
在组件中使用背景：

```typescript
// 使用页面专属背景
<MemeBackground variant="image" backgroundImage={getBackgroundUrl('home')}>
  {/* 页面内容 */}
</MemeBackground>

// 使用卡片背景
<MemeCard 
  variant="premium" 
  style={generateBackgroundStyle(getCardBackgroundUrl('premium'))}
>
  {/* 卡片内容 */}
</MemeCard>
```

## 🎯 各页面背景建议

### 🏠 首页背景 (Home)
- **主题**：温暖的天使乐园
- **元素**：天使城堡、彩虹桥、云朵
- **色调**：温暖的金色和白色

### 💱 交换页背景 (Swap)
- **主题**：神圣的交易圣殿
- **元素**：天平、金币、光芒
- **色调**：蓝色和金色

### 🎨 NFT页背景 (NFT)
- **主题**：艺术画廊
- **元素**：画框、展示台、聚光灯
- **色调**：紫色和粉色

### 💰 质押页背景 (Staking)
- **主题**：宝藏库房
- **元素**：宝箱、金币、宝石
- **色调**：金色和橙色

### 🏝️ 乐园页背景 (Paradise)
- **主题**：天使土地
- **元素**：花园、山川、湖泊
- **色调**：绿色和蓝色

### 👤 个人资料页背景 (Profile)
- **主题**：个人神殿
- **元素**：光环、徽章、星座
- **色调**：个性化色彩

## 🛠️ 优化建议

### 性能优化
1. **图片压缩**：使用工具压缩图片文件
2. **WebP格式**：优先使用WebP格式
3. **懒加载**：为大图片启用懒加载
4. **CDN加速**：使用CDN加速图片加载

### 用户体验
1. **加载占位符**：提供加载时的占位符
2. **渐进式加载**：先加载低质量图片，再加载高质量图片
3. **响应式设计**：为不同设备提供合适的图片
4. **可访问性**：确保图片不影响文字可读性

### 品牌一致性
1. **统一风格**：保持所有背景图片的风格一致
2. **色彩协调**：确保背景色彩与UI色彩协调
3. **主题呼应**：背景图片要与天使主题呼应
4. **情感传达**：通过背景传达治愈和温暖的情感

## 🔍 测试检查清单

### 视觉测试
- [ ] 图片在不同设备上显示正常
- [ ] 文字在背景上清晰可读
- [ ] 色彩搭配和谐美观
- [ ] 动画效果流畅自然

### 性能测试
- [ ] 页面加载速度合理
- [ ] 图片文件大小适中
- [ ] 移动端体验良好
- [ ] 网络较慢时也能正常显示

### 兼容性测试
- [ ] 不同浏览器显示一致
- [ ] 不同分辨率适配良好
- [ ] 深色模式适配正常
- [ ] 无障碍访问支持

## 📞 技术支持

如果您在配置背景图片时遇到任何问题，请：

1. 检查图片文件路径是否正确
2. 确认图片文件格式是否支持
3. 验证图片文件大小是否符合要求
4. 查看浏览器控制台是否有错误信息

## 🎨 设计灵感

### 天使艺术风格参考
- **古典天使画**：文艺复兴时期的天使艺术
- **现代简约**：简洁的几何图形和渐变
- **梦幻风格**：柔和的光效和粒子效果
- **水彩风格**：温柔的水彩晕染效果

### 在线资源推荐
- **免费图片**：Unsplash, Pexels, Pixabay
- **付费图片**：Shutterstock, Getty Images, Adobe Stock
- **AI生成**：Midjourney, DALL-E, Stable Diffusion
- **设计工具**：Figma, Photoshop, Canva

---

**🌟 愿您的Angel Paradise拥有最美丽的背景！** 