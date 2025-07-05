"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'system'

interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

interface ThemeProviderState {
  theme: Theme
  setTheme: (theme: Theme) => void
  isDark: boolean
  toggleTheme: () => void
}

const initialState: ThemeProviderState = {
  theme: 'system',
  setTheme: () => null,
  isDark: false,
  toggleTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'angel-theme',
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme)
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const root = window.document.documentElement
    const storedTheme = localStorage.getItem(storageKey) as Theme

    if (storedTheme) {
      setTheme(storedTheme)
    }

    const updateTheme = (currentTheme: Theme) => {
      root.classList.remove('light', 'dark')

      if (currentTheme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light'
        root.classList.add(systemTheme)
        setIsDark(systemTheme === 'dark')
      } else {
        root.classList.add(currentTheme)
        setIsDark(currentTheme === 'dark')
      }
    }

    updateTheme(storedTheme || defaultTheme)

    // 监听系统主题变化
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      if (theme === 'system') {
        updateTheme('system')
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme, defaultTheme, storageKey])

  const value = {
    theme,
    setTheme: (newTheme: Theme) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem(storageKey, newTheme)
      }
      setTheme(newTheme)
    },
    isDark,
    toggleTheme: () => {
      const newTheme = isDark ? 'light' : 'dark'
      if (typeof window !== 'undefined') {
        localStorage.setItem(storageKey, newTheme)
      }
      setTheme(newTheme)
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider')

  return context
}
