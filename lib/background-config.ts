// 背景图片配置文件
// 您可以在这里配置统一的背景图片

export interface BackgroundConfig {
  // 主背景图片
  primary: string
  // 次要背景图片
  secondary: string
  // 特殊页面背景
  special: {
    home: string
    swap: string
    nft: string
    staking: string
    paradise: string
    profile: string
  }
  // 卡片背景
  cards: {
    premium: string
    glass: string
    accent: string
  }
}

// 默认配置 - 您可以替换为实际的图片URL
export const backgroundConfig: BackgroundConfig = {
  primary: "/backgrounds/angel-heaven-primary.jpg",
  secondary: "/backgrounds/angel-clouds-secondary.jpg",
  special: {
    home: "/backgrounds/angel-paradise-home.jpg",
    swap: "/backgrounds/angel-trading-swap.jpg", 
    nft: "/backgrounds/angel-gallery-nft.jpg",
    staking: "/backgrounds/angel-treasury-staking.jpg",
    paradise: "/backgrounds/angel-lands-paradise.jpg",
    profile: "/backgrounds/angel-profile.jpg"
  },
  cards: {
    premium: "/backgrounds/angel-premium-card.jpg",
    glass: "/backgrounds/angel-glass-card.jpg", 
    accent: "/backgrounds/angel-accent-card.jpg"
  }
}

// 背景图片占位符信息
export const backgroundPlaceholders = {
  // 推荐尺寸
  recommended: {
    desktop: "1920x1080",
    mobile: "1080x1920",
    card: "800x600"
  },
  // 支持格式
  formats: ["jpg", "jpeg", "png", "webp"],
  // 最大文件大小 (MB)
  maxSize: 5,
  // 使用说明
  instructions: {
    zh: {
      title: "背景图片使用指南",
      steps: [
        "1. 准备符合推荐尺寸的高质量图片",
        "2. 将图片文件放置在 public/backgrounds/ 目录下",
        "3. 在 backgroundConfig 中更新对应的路径",
        "4. 确保图片文件名与配置中的路径一致",
        "5. 建议使用 webp 格式以获得更好的性能"
      ],
      tips: [
        "• 使用柔和的天使主题色彩",
        "• 避免过于鲜艳或刺眼的颜色",
        "• 确保图片有足够的对比度以便文字清晰可读",
        "• 考虑在图片上添加半透明遮罩以提高可读性"
      ]
    }
  }
}

// 获取背景图片URL的工具函数
export function getBackgroundUrl(type: keyof BackgroundConfig['special'] | 'primary' | 'secondary'): string {
  if (type === 'primary') return backgroundConfig.primary
  if (type === 'secondary') return backgroundConfig.secondary
  return backgroundConfig.special[type as keyof BackgroundConfig['special']]
}

// 获取卡片背景URL的工具函数
export function getCardBackgroundUrl(type: keyof BackgroundConfig['cards']): string {
  return backgroundConfig.cards[type]
}

// 检查背景图片是否存在的工具函数
export async function checkBackgroundExists(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' })
    return response.ok
  } catch {
    return false
  }
}

// 动态加载背景图片的工具函数
export function preloadBackground(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve()
    img.onerror = reject
    img.src = url
  })
}

// 生成背景样式的工具函数
export function generateBackgroundStyle(
  imageUrl: string,
  options: {
    size?: 'cover' | 'contain' | 'auto'
    position?: string
    repeat?: 'no-repeat' | 'repeat' | 'repeat-x' | 'repeat-y'
    attachment?: 'fixed' | 'local' | 'scroll'
    overlay?: boolean
    overlayColor?: string
    overlayOpacity?: number
  } = {}
): React.CSSProperties {
  const {
    size = 'cover',
    position = 'center',
    repeat = 'no-repeat',
    attachment = 'fixed',
    overlay = true,
    overlayColor = 'rgba(255, 255, 255, 0.1)',
    overlayOpacity = 0.1
  } = options

  const baseStyle: React.CSSProperties = {
    backgroundImage: `url(${imageUrl})`,
    backgroundSize: size,
    backgroundPosition: position,
    backgroundRepeat: repeat,
    backgroundAttachment: attachment
  }

  if (overlay) {
    baseStyle.backgroundImage = `
      linear-gradient(${overlayColor.replace(/[\d.]+(?=\))/, overlayOpacity.toString())}, ${overlayColor.replace(/[\d.]+(?=\))/, overlayOpacity.toString())}),
      url(${imageUrl})
    `
  }

  return baseStyle
} 