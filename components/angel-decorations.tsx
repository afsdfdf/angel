"use client"

export function AngelWings({ className = "" }: { className?: string }) {
  return (
    <div className={`absolute pointer-events-none ${className}`}>
      <svg width="160" height="120" viewBox="0 0 160 120" fill="none" className="opacity-30">
        {/* 主翅膀 */}
        <path
          d="M30 60C30 25 50 10 70 18C78 22 82 32 85 45C88 32 92 22 100 18C120 10 140 25 140 60C140 75 132 85 118 85C104 85 95 75 88 65C85 75 80 85 70 85C60 85 55 75 52 65C45 75 36 85 22 85C8 85 0 75 0 60C0 25 20 10 30 60Z"
          fill="url(#wingGradient)"
          stroke="url(#wingStroke)"
          strokeWidth="1"
        />
        
        {/* 羽毛细节 */}
        <g opacity="0.6">
          {Array.from({ length: 8 }, (_, i) => {
            const x = 25 + i * 15
            const y = 45 + Math.sin(i * 0.5) * 10
            return (
              <path
                key={i}
                d={`M${x} ${y} Q${x + 5} ${y - 8} ${x + 10} ${y} Q${x + 5} ${y + 8} ${x} ${y}`}
                fill="url(#featherGradient)"
                opacity="0.4"
              />
            )
          })}
        </g>
        
        {/* 光芒效果 */}
        <g opacity="0.3">
          {Array.from({ length: 12 }, (_, i) => {
            const angle = (i * 30 * Math.PI) / 180
            const x1 = 80 + Math.cos(angle) * 20
            const y1 = 60 + Math.sin(angle) * 20
            const x2 = 80 + Math.cos(angle) * 60
            const y2 = 60 + Math.sin(angle) * 60
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="url(#lightGradient)"
                strokeWidth="1"
                opacity="0.5"
              />
            )
          })}
        </g>
        
        <defs>
          <linearGradient id="wingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.8" />
            <stop offset="30%" stopColor="#f59e0b" stopOpacity="0.6" />
            <stop offset="60%" stopColor="#d97706" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#92400e" stopOpacity="0.2" />
          </linearGradient>
          <linearGradient id="wingStroke" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#d97706" stopOpacity="0.3" />
          </linearGradient>
          <linearGradient id="featherGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.3" />
          </linearGradient>
          <linearGradient id="lightGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.1" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}

export function AngelHalo({ className = "" }: { className?: string }) {
  return (
    <div className={`absolute pointer-events-none ${className}`}>
      <svg width="100" height="40" viewBox="0 0 100 40" fill="none" className="opacity-40">
        {/* 主光环 */}
        <ellipse cx="50" cy="20" rx="40" ry="12" stroke="url(#haloGradient)" strokeWidth="3" fill="none" />
        <ellipse cx="50" cy="20" rx="35" ry="10" stroke="url(#haloInner)" strokeWidth="2" fill="none" />
        
        {/* 光芒装饰 */}
        <g opacity="0.6">
          {Array.from({ length: 16 }, (_, i) => {
            const angle = (i * 22.5 * Math.PI) / 180
            const x1 = 50 + Math.cos(angle) * 30
            const y1 = 20 + Math.sin(angle) * 9
            const x2 = 50 + Math.cos(angle) * 45
            const y2 = 20 + Math.sin(angle) * 14
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="url(#haloRay)"
                strokeWidth="1"
                opacity="0.7"
              />
            )
          })}
        </g>
        
        {/* 皇冠装饰 */}
        <g transform="translate(50, 20)">
          <path
            d="M-15,-8 L-10,-15 L-5,-12 L0,-18 L5,-12 L10,-15 L15,-8 L12,-5 L8,-6 L4,-3 L0,-6 L-4,-3 L-8,-6 L-12,-5 Z"
            fill="url(#crownGradient)"
            stroke="url(#crownStroke)"
            strokeWidth="1"
            opacity="0.8"
          />
          {/* 宝石装饰 */}
          <circle cx="0" cy="-10" r="2" fill="#fbbf24" opacity="0.9" />
          <circle cx="-8" cy="-8" r="1.5" fill="#f59e0b" opacity="0.7" />
          <circle cx="8" cy="-8" r="1.5" fill="#f59e0b" opacity="0.7" />
        </g>
        
        <defs>
          <linearGradient id="haloGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.9" />
            <stop offset="25%" stopColor="#f59e0b" stopOpacity="1" />
            <stop offset="50%" stopColor="#fbbf24" stopOpacity="1" />
            <stop offset="75%" stopColor="#f59e0b" stopOpacity="1" />
            <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.9" />
          </linearGradient>
          <linearGradient id="haloInner" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.6" />
            <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.6" />
          </linearGradient>
          <linearGradient id="haloRay" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.3" />
          </linearGradient>
          <linearGradient id="crownGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#d97706" stopOpacity="0.5" />
          </linearGradient>
          <linearGradient id="crownStroke" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#d97706" stopOpacity="0.4" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}

export function CelestialPattern({ className = "" }: { className?: string }) {
  return (
    <div className={`absolute pointer-events-none ${className}`}>
      <svg width="300" height="300" viewBox="0 0 300 300" fill="none" className="opacity-20">
        <g>
          {/* 多层同心圆 */}
          <circle cx="150" cy="150" r="120" stroke="url(#celestialGradient1)" strokeWidth="2" fill="none" />
          <circle cx="150" cy="150" r="90" stroke="url(#celestialGradient2)" strokeWidth="1.5" fill="none" />
          <circle cx="150" cy="150" r="60" stroke="url(#celestialGradient3)" strokeWidth="1" fill="none" />
          <circle cx="150" cy="150" r="30" stroke="url(#celestialGradient4)" strokeWidth="0.5" fill="none" />

          {/* 主放射线 */}
          {Array.from({ length: 24 }, (_, i) => {
            const angle = (i * 15 * Math.PI) / 180
            const x1 = 150 + Math.cos(angle) * 20
            const y1 = 150 + Math.sin(angle) * 20
            const x2 = 150 + Math.cos(angle) * 130
            const y2 = 150 + Math.sin(angle) * 130
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="url(#rayGradient)"
                strokeWidth="1"
                opacity="0.4"
              />
            )
          })}

          {/* 星座装饰 */}
          {Array.from({ length: 12 }, (_, i) => {
            const angle = (i * 30 * Math.PI) / 180
            const x = 150 + Math.cos(angle) * 100
            const y = 150 + Math.sin(angle) * 100
            return (
              <g key={i}>
                <path
                  d={`M${x},${y - 6} L${x + 3},${y - 2} L${x + 6},${y} L${x + 3},${y + 2} L${x},${y + 6} L${x - 3},${y + 2} L${x - 6},${y} L${x - 3},${y - 2} Z`}
                  fill="url(#starGradient)"
                  opacity="0.6"
                />
                <circle cx={x} cy={y} r="2" fill="#fbbf24" opacity="0.8" />
              </g>
            )
          })}
          
          {/* 内部星星群 */}
          {Array.from({ length: 8 }, (_, i) => {
            const angle = (i * 45 * Math.PI) / 180
            const x = 150 + Math.cos(angle) * 45
            const y = 150 + Math.sin(angle) * 45
            return (
              <g key={i}>
                <path
                  d={`M${x},${y - 3} L${x + 1.5},${y - 1} L${x + 3},${y} L${x + 1.5},${y + 1} L${x},${y + 3} L${x - 1.5},${y + 1} L${x - 3},${y} L${x - 1.5},${y - 1} Z`}
                  fill="url(#miniStarGradient)"
                  opacity="0.5"
                />
              </g>
            )
          })}
        </g>
        
        <defs>
          <radialGradient id="celestialGradient1" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#d97706" stopOpacity="0.2" />
          </radialGradient>
          <radialGradient id="celestialGradient2" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#92400e" stopOpacity="0.1" />
          </radialGradient>
          <radialGradient id="celestialGradient3" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.1" />
          </radialGradient>
          <radialGradient id="celestialGradient4" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#d97706" stopOpacity="0.2" />
          </radialGradient>
          <linearGradient id="rayGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.6" />
            <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#d97706" stopOpacity="0.1" />
          </linearGradient>
          <radialGradient id="starGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.4" />
          </radialGradient>
          <radialGradient id="miniStarGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.3" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  )
}

export function FloatingParticles({ className = "" }: { className?: string }) {
  return (
    <div className={`absolute pointer-events-none ${className}`}>
      {/* 大型粒子 */}
      {Array.from({ length: 15 }, (_, i) => (
        <div
          key={`large-${i}`}
          className="absolute w-2 h-2 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full opacity-40 starlight"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${3 + Math.random() * 3}s`,
          }}
        />
      ))}
      
      {/* 中型粒子 */}
      {Array.from({ length: 25 }, (_, i) => (
        <div
          key={`medium-${i}`}
          className="absolute w-1.5 h-1.5 bg-gradient-to-br from-yellow-300 to-amber-400 rounded-full opacity-30 celestial-float"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 8}s`,
            animationDuration: `${6 + Math.random() * 4}s`,
          }}
        />
      ))}
      
      {/* 小型粒子 */}
      {Array.from({ length: 40 }, (_, i) => (
        <div
          key={`small-${i}`}
          className="absolute w-1 h-1 bg-gradient-to-br from-yellow-200 to-yellow-400 rounded-full opacity-20 particle-float"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 10}s`,
            animationDuration: `${8 + Math.random() * 4}s`,
          }}
        />
      ))}
      
      {/* 微型星尘 */}
      {Array.from({ length: 60 }, (_, i) => (
        <div
          key={`tiny-${i}`}
          className="absolute w-0.5 h-0.5 bg-yellow-300 rounded-full opacity-15 pulse-enhanced"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 15}s`,
            animationDuration: `${10 + Math.random() * 5}s`,
          }}
        />
      ))}
    </div>
  )
}

// 新增：皇冠装饰组件
export function AngelCrown({ className = "" }: { className?: string }) {
  return (
    <div className={`absolute pointer-events-none ${className}`}>
      <svg width="80" height="60" viewBox="0 0 80 60" fill="none" className="opacity-50">
        <g transform="translate(40, 30)">
          {/* 主皇冠 */}
          <path
            d="M-30,10 L-25,0 L-20,8 L-15,-5 L-10,6 L-5,-8 L0,-12 L5,-8 L10,6 L15,-5 L20,8 L25,0 L30,10 L25,15 L20,12 L15,14 L10,11 L5,13 L0,10 L-5,13 L-10,11 L-15,14 L-20,12 L-25,15 Z"
            fill="url(#crownMainGradient)"
            stroke="url(#crownMainStroke)"
            strokeWidth="1"
          />
          
          {/* 宝石装饰 */}
          <circle cx="0" cy="-8" r="3" fill="url(#gemGradient)" opacity="0.9" />
          <circle cx="-12" cy="-2" r="2" fill="url(#gemGradient2)" opacity="0.8" />
          <circle cx="12" cy="-2" r="2" fill="url(#gemGradient2)" opacity="0.8" />
          <circle cx="-20" cy="4" r="1.5" fill="url(#gemGradient3)" opacity="0.7" />
          <circle cx="20" cy="4" r="1.5" fill="url(#gemGradient3)" opacity="0.7" />
          
          {/* 光芒效果 */}
          <g opacity="0.6">
            {Array.from({ length: 8 }, (_, i) => {
              const angle = (i * 45 * Math.PI) / 180
              const x1 = Math.cos(angle) * 15
              const y1 = Math.sin(angle) * 15
              const x2 = Math.cos(angle) * 35
              const y2 = Math.sin(angle) * 35
              return (
                <line
                  key={i}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="url(#crownRayGradient)"
                  strokeWidth="1"
                  opacity="0.5"
                />
              )
            })}
          </g>
        </g>
        
        <defs>
          <linearGradient id="crownMainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#d97706" stopOpacity="0.6" />
          </linearGradient>
          <linearGradient id="crownMainStroke" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#92400e" stopOpacity="0.4" />
          </linearGradient>
          <radialGradient id="gemGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="1" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.7" />
          </radialGradient>
          <radialGradient id="gemGradient2" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#d97706" stopOpacity="0.6" />
          </radialGradient>
          <radialGradient id="gemGradient3" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#d97706" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#92400e" stopOpacity="0.5" />
          </radialGradient>
          <linearGradient id="crownRayGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.2" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}

// 主装饰组件 - 组合所有天使装饰元素
export function AngelDecorations({ className = "" }: { className?: string }) {
  return (
    <div className={`relative ${className}`}>
      {/* 背景天体图案 */}
      <CelestialPattern className="absolute inset-0 -z-10" />
      
      {/* 浮动粒子 */}
      <FloatingParticles className="absolute inset-0 -z-10" />
      
      {/* 天使翅膀 - 左右各一个 */}
      <AngelWings className="absolute -top-4 -left-8 transform rotate-12" />
      <AngelWings className="absolute -top-4 -right-8 transform -rotate-12 scale-x-[-1]" />
      
      {/* 天使光环 - 居中顶部 */}
      <AngelHalo className="absolute -top-6 left-1/2 transform -translate-x-1/2" />
      
      {/* 天使皇冠 - 中心位置 */}
      <AngelCrown className="absolute -top-8 left-1/2 transform -translate-x-1/2" />
      
      {/* 内容区域 */}
      <div className="relative z-10 min-h-[60px]">
        {/* 这里可以放置内容 */}
      </div>
    </div>
  )
}
