"use client"

import { Check, Palette } from "lucide-react"
import { Theme, themes, useTheme } from "@/components/providers/theme-provider"
import { appThemeStyles, themeOrder } from "@/lib/app-theme"

export function CompactThemeSelector() {
  const { theme, setTheme } = useTheme()
  const current = appThemeStyles[theme]

  return (
    <section className={`mt-6 rounded-[1.25rem] border px-4 py-3 ${current.pickerCard}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm font-black opacity-70">
          <Palette className="h-4 w-4" />
          主题
        </div>
        <div className="flex flex-wrap gap-2">
          {themeOrder.map((themeKey: Theme) => {
            const isActive = theme === themeKey
            const style = appThemeStyles[themeKey]

            return (
              <button
                key={themeKey}
                type="button"
                onClick={() => setTheme(themeKey)}
                className={`inline-flex h-9 items-center gap-2 rounded-full border px-3 text-xs font-black transition ${isActive ? style.cardIcon : "bg-current/5 hover:bg-current/10"}`}
                aria-pressed={isActive}
              >
                <span
                  className="h-3 w-3 rounded-full border border-current/20"
                  style={{ backgroundColor: themes[themeKey].colors.primary }}
                />
                {themes[themeKey].name}
                {isActive && <Check className="h-3.5 w-3.5" />}
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}
