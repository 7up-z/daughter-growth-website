"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { useSession } from "next-auth/react"

type Theme = "paper" | "cinematic" | "playful" | "future"

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const legacyThemeMap: Record<string, Theme> = {
  warm: "paper",
  vintage: "paper",
  minimal: "cinematic",
  cool: "future",
  modern: "future",
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const themes: Record<Theme, {
  name: string
  description: string
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
  paper: {
    name: "温馨绘本",
    description: "",
    colors: {
      primary: "#546245",
      secondary: "#EEE7D9",
      background: "#F8F6EF",
      surface: "#FFFDF8",
      text: "#3A382B",
      textMuted: "#6C6454",
      accent: "#A34F34",
      border: "#DED6C7",
    }
  },
  cinematic: {
    name: "电影相册",
    description: "",
    colors: {
      primary: "#C99A55",
      secondary: "#2A1D11",
      background: "#080706",
      surface: "#15110C",
      text: "#F4E7D0",
      textMuted: "#B99A72",
      accent: "#E1B66E",
      border: "#5A3C1F",
    }
  },
  playful: {
    name: "绘本拼贴",
    description: "",
    colors: {
      primary: "#FF5A4E",
      secondary: "#FFE45C",
      background: "#FFF8E8",
      surface: "#FFFFFF",
      text: "#080808",
      textMuted: "#4B463C",
      accent: "#245BFF",
      border: "#161616",
    }
  },
  future: {
    name: "清透相册",
    description: "",
    colors: {
      primary: "#4D7CFE",
      secondary: "#E9ECFF",
      background: "#F4F7FF",
      surface: "#FFFFFFCC",
      text: "#151C48",
      textMuted: "#6670A0",
      accent: "#9B6CFF",
      border: "#D7DEFF",
    }
  }
}

function normalizeTheme(value: unknown): Theme | null {
  if (typeof value !== "string") return null
  if (value in themes) return value as Theme
  return legacyThemeMap[value] ?? null
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession()
  const [localTheme, setLocalTheme] = useState<Theme | null>(null)
  const theme = localTheme ?? normalizeTheme(session?.user?.theme) ?? "paper"

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setLocalTheme((saved) => saved ?? normalizeTheme(localStorage.getItem("theme")))
    }, 0)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    const themeConfig = themes[theme]
    const root = document.documentElement

    root.dataset.theme = theme

    Object.entries(themeConfig.colors).forEach(([key, value]) => {
      root.style.setProperty(`--theme-${key}`, value)
    })

  }, [theme])

  const setTheme = async (newTheme: Theme) => {
    setLocalTheme(newTheme)
    localStorage.setItem("theme", newTheme)

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
