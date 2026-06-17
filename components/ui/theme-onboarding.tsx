"use client"

import { useEffect, useState } from "react"
import { Check, Palette, X } from "lucide-react"
import { Theme, themes, useTheme } from "@/components/providers/theme-provider"
import { appThemeStyles, themeOrder } from "@/lib/app-theme"
import { useCurrentThemeStyle } from "@/components/ui/theme-shell"

const onboardingKey = "family-memory-theme-onboarding-v1"

export function ThemeOnboarding() {
  const { theme, setTheme } = useTheme()
  const current = useCurrentThemeStyle()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (localStorage.getItem(onboardingKey)) return
    const timer = window.setTimeout(() => setOpen(true), 600)
    return () => window.clearTimeout(timer)
  }, [])

  if (!open) return null

  const close = () => {
    localStorage.setItem(onboardingKey, "done")
    setOpen(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/35 p-4 backdrop-blur-sm sm:items-center">
      <section className={`w-full max-w-2xl rounded-[2rem] border p-5 shadow-2xl sm:p-6 ${current.pickerCard}`}>
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className={`mb-3 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-black ${current.cardIcon}`}>
              <Palette className="h-4 w-4" />
              家庭记忆主题
            </p>
            <h2 className="break-keep text-2xl font-black">选择你的家庭记忆主题</h2>
          </div>
          <button
            type="button"
            onClick={close}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-current/10 transition hover:bg-current/15"
            aria-label="关闭"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {themeOrder.map((themeKey: Theme) => {
            const style = appThemeStyles[themeKey]
            const isActive = theme === themeKey
            return (
              <button
                key={themeKey}
                type="button"
                onClick={() => {
                  void setTheme(themeKey)
                  close()
                }}
                className={`rounded-[1.25rem] border p-4 text-left transition ${style.card}`}
              >
                <span className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-3">
                    <span
                      className="h-5 w-5 rounded-full border border-current/20"
                      style={{ backgroundColor: themes[themeKey].colors.primary }}
                    />
                    <span className="font-black">{themes[themeKey].name}</span>
                  </span>
                  {isActive && <Check className="h-4 w-4" />}
                </span>
                <span className={`mt-3 block text-sm font-semibold ${style.secondaryText}`}>
                  {style.eyebrow}
                </span>
              </button>
            )
          })}
        </div>
      </section>
    </div>
  )
}

