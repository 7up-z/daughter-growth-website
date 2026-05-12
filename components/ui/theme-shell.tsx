"use client"

import Link from "next/link"
import { ChevronLeft, Heart } from "lucide-react"
import { useTheme } from "@/components/providers/theme-provider"
import { appThemeStyles } from "@/lib/app-theme"

export function useCurrentThemeStyle() {
  const { theme } = useTheme()
  return appThemeStyles[theme]
}

export function ThemedLoading({ label = "加载中..." }: { label?: string }) {
  const current = useCurrentThemeStyle()

  return (
    <div className={`min-h-screen ${current.shell}`}>
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className={`rounded-[1.5rem] border px-8 py-7 text-center ${current.pickerCard}`}>
          <div className={`mx-auto mb-4 flex h-14 w-14 animate-pulse items-center justify-center rounded-full ${current.cardIcon}`}>
            <Heart className="h-7 w-7" />
          </div>
          <p className={`text-sm font-semibold ${current.secondaryText}`}>{label}</p>
        </div>
      </div>
    </div>
  )
}

export function ThemedShell({
  children,
  maxWidth = "max-w-5xl",
}: {
  children: React.ReactNode
  maxWidth?: string
}) {
  const current = useCurrentThemeStyle()

  return (
    <div className={`min-h-screen transition-colors duration-500 ${current.shell}`}>
      <div className={`mx-auto ${maxWidth} px-4 py-4 sm:px-6 lg:px-8`}>
        {children}
      </div>
    </div>
  )
}

export function ThemedHeader({
  backHref = "/dashboard",
  title = "成长记录",
  action,
}: {
  backHref?: string
  title?: string
  action?: React.ReactNode
}) {
  const current = useCurrentThemeStyle()

  return (
    <header className={`sticky top-4 z-30 rounded-[1.75rem] border ${current.header}`}>
      <div className="flex min-h-16 items-center justify-between gap-3 px-4 py-3 sm:px-5 lg:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href={backHref}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-current/10 transition hover:bg-current/15"
            aria-label="返回"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <Link href="/dashboard" className="flex min-w-0 items-center gap-3 font-black tracking-tight">
            <span className={`hidden h-10 w-10 shrink-0 items-center justify-center rounded-full sm:flex ${current.cardIcon}`}>
              <Heart className="h-5 w-5" />
            </span>
            <span className="truncate text-base sm:text-lg">{title}</span>
          </Link>
        </div>
        {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
      </div>
    </header>
  )
}

export function ThemedPageHero({
  eyebrow,
  title,
  description,
  icon,
}: {
  eyebrow: string
  title: string
  description: string
  icon?: React.ReactNode
}) {
  const current = useCurrentThemeStyle()

  return (
    <section className={`relative mt-5 overflow-hidden rounded-[2rem] border px-6 py-10 sm:px-8 ${current.hero}`}>
      <div className={`absolute inset-0 bg-gradient-to-br ${current.heroGlow}`} />
      <div className="absolute -right-12 top-8 h-36 w-36 rounded-full border border-current/10" />
      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className={`mb-3 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold ${current.pickerCard}`}>
            {icon}
            {eyebrow}
          </p>
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">{title}</h1>
          <p className={`mt-3 max-w-2xl text-sm leading-7 sm:text-base ${current.secondaryText}`}>{description}</p>
        </div>
      </div>
    </section>
  )
}
