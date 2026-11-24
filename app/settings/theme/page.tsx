"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Check } from "lucide-react"
import { Theme, themes, useTheme } from "@/components/providers/theme-provider"
import { appThemeStyles, themeOrder } from "@/lib/app-theme"
import { ThemedHeader, ThemedLoading, ThemedPageHero, ThemedShell } from "@/components/ui/theme-shell"

export default function ThemeSettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  if (status === "loading") {
    return <ThemedLoading />
  }

  if (!session) return null

  return (
    <ThemedShell maxWidth="max-w-5xl">
      <ThemedHeader title="主题设置" />
      <main>
        <ThemedPageHero
          title="主题设置"
          description="选择后会保存在本机；登录状态下也会同步到个人资料。"
        />

        <section className="mt-6 grid gap-4 md:grid-cols-2">
          {themeOrder.map((themeKey: Theme) => {
            const style = appThemeStyles[themeKey]
            const isActive = theme === themeKey
            return (
              <button
                key={themeKey}
                type="button"
                onClick={() => void setTheme(themeKey)}
                className={`rounded-[1.5rem] border p-5 text-left transition ${style.card}`}
              >
                <span className="flex items-center justify-between gap-4">
                  <span className="flex items-center gap-3">
                    <span
                      className="h-6 w-6 rounded-full border border-current/20"
                      style={{ backgroundColor: themes[themeKey].colors.primary }}
                    />
                    <span className="text-xl font-black">{themes[themeKey].name}</span>
                  </span>
                  {isActive && (
                    <span className={`flex h-9 w-9 items-center justify-center rounded-full ${style.cardIcon}`}>
                      <Check className="h-4 w-4" />
                    </span>
                  )}
                </span>
                <span className={`mt-4 block text-sm font-semibold ${style.secondaryText}`}>
                  {style.eyebrow}
                </span>
              </button>
            )
          })}
        </section>
      </main>
    </ThemedShell>
  )
}
