"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"

interface AngelLogoProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl"
  variant?: "default" | "white" | "gradient"
  className?: string
}

export function AngelLogo({ 
  size = "md", 
  variant = "default",
  className 
}: AngelLogoProps) {
  const getSizeStyles = () => {
    switch (size) {
      case "xs":
        return "w-6 h-6"
      case "sm":
        return "w-8 h-8"
      case "md":
        return "w-10 h-10"
      case "lg":
        return "w-16 h-16"
      case "xl":
        return "w-24 h-24"
      default:
        return "w-10 h-10"
    }
  }

  const getImageSrc = () => {
    // 根据尺寸选择合适的图片
    return size === "xs" || size === "sm" ? "/logos.png" : "/logol.png"
  }

  const getContainerStyles = () => {
    const baseStyles = "relative flex items-center justify-center rounded-full overflow-hidden"
    
    switch (variant) {
      case "white":
        return cn(baseStyles, "bg-white/90 backdrop-blur-sm shadow-lg")
      case "gradient":
        return cn(baseStyles, "bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-500/30")
      default:
        return cn(baseStyles, "bg-transparent")
    }
  }

  return (
    <div className={cn(getContainerStyles(), getSizeStyles(), className)}>
      <Image
        src={getImageSrc()}
        alt="Angel Crypto Logo"
        width={size === "xs" || size === "sm" ? 32 : 64}
        height={size === "xs" || size === "sm" ? 32 : 64}
        className="object-cover w-full h-full"
        priority
      />
    </div>
  )
}

// 品牌标识组件 - 包含 LOGO 和文字
interface AngelBrandProps {
  size?: "sm" | "md" | "lg"
  showText?: boolean
  variant?: "horizontal" | "vertical"
  className?: string
}

export function AngelBrand({ 
  size = "md", 
  showText = true,
  variant = "horizontal",
  className 
}: AngelBrandProps) {
  const getTextSize = () => {
    switch (size) {
      case "sm":
        return "text-sm"
      case "lg":
        return "text-xl"
      default:
        return "text-lg"
    }
  }

  const getLogoSize = () => {
    switch (size) {
      case "sm":
        return "sm"
      case "lg":
        return "lg"
      default:
        return "md"
    }
  }

  return (
    <div className={cn(
      "flex items-center gap-3",
      variant === "vertical" && "flex-col gap-2",
      className
    )}>
      <AngelLogo size={getLogoSize as any} variant="default" />
      {showText && (
        <div className={cn(
          variant === "vertical" && "text-center"
        )}>
          <h1 className={cn(
            "font-bold text-gray-800 dark:text-gray-100",
            getTextSize()
          )}>
            天使加密
          </h1>
          <p className="text-xs text-gray-600 dark:text-gray-400 leading-tight">
            Angel Crypto
          </p>
        </div>
      )}
    </div>
  )
} 