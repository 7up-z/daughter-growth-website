"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { useSession } from "next-auth/react"

type Theme = "warm" | "cool" | "minimal" | "vintage" | "modern"

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const themes: Record<Theme, {
  name: string
  colors: {
    primary: string
    secondary: string
    background: string
    surface: string
    text: string
    textMuted: string
    accent: string
    border: string
  }
}> = {
  warm: {
    name: "温馨暖色",
    colors: {
      primary: "#E8B4A2",
      secondary: "#F5E6D3",
      background: "#FFF8F0",
      surface: "#FFFFFF",
      text: "#5C4A3D",
      textMuted: "#8B7355",
      accent: "#D4A574",
      border: "#E8D5C4",
    }
  },
  cool: {
    name: "清新冷色",
    colors: {
      primary: "#7BA7BC",
      secondary: "#E8F4F8",
      background: "#F0F7FA",
      surface: "#FFFFFF",
      text: "#2C3E50",
      textMuted: "#5D6D7E",
      accent: "#5DADE2",
      border: "#D4E6F1",
    }
  },
  minimal: {
    name: "极简黑白",
    colors: {
      primary: "#2C2C2C",
      secondary: "#F5F5F5",
      background: "#FAFAFA",
      surface: "#FFFFFF",
      text: "#1A1A1A",
      textMuted: "#666666",
      accent: "#000000",
      border: "#E0E0E0",
    }
  },
  vintage: {
    name: "复古胶片",
    colors: {
      primary: "#8B7355",
      secondary: "#E8DCC4",
      background: "#F5F0E8",
      surface: "#FFFCF8",
      text: "#4A4035",
      textMuted: "#7A6B5A",
      accent: "#C4A77D",
      border: "#D4C4A8",
    }
  },
  modern: {
    name: "现代时尚",
    colors: {
      primary: "#6366F1",
      secondary: "#E0E7FF",
      background: "#F8FAFC",
      surface: "#FFFFFF",
      text: "#1E293B",
      textMuted: "#64748B",
      accent: "#8B5CF6",
      border: "#E2E8F0",
    }
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession()
  const [theme, setThemeState] = useState<Theme>("warm")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // 从本地存储或session中获取主题
    const savedTheme = localStorage.getItem("theme") as Theme
    if (savedTheme && themes[savedTheme]) {
      setThemeState(savedTheme)
    } else if (session?.user?.theme) {
      setThemeState(session.user.theme as Theme)
    }
  }, [session])

  useEffect(() => {
    if (!mounted) return

    const themeConfig = themes[theme]
    const root = document.documentElement

    // 设置CSS变量
    Object.entries(themeConfig.colors).forEach(([key, value]) => {
      root.style.setProperty(`--theme-${key}`, value)
    })

    // 保存到本地存储
    localStorage.setItem("theme", theme)
  }, [theme, mounted])

  const setTheme = async (newTheme: Theme) => {
    setThemeState(newTheme)
    
    // 如果已登录，同步到服务器
    if (session?.user) {
      try {
        await fetch("/api/user/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ theme: newTheme })
        })
      } catch (error) {
        console.error("同步主题失败:", error)
      }
    }
  }

  if (!mounted) {
    return <>{children}</>
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}

export { themes }
export type { Theme }
