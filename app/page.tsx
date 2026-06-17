"use client"

import Link from "next/link"
import { ArrowRight, Heart, LockKeyhole, Sparkles, UserRound } from "lucide-react"
import { useTheme } from "@/components/providers/theme-provider"
import { appThemeStyles } from "@/lib/app-theme"
import { CompactThemeSelector } from "@/components/ui/compact-theme-selector"
import { HeroMemoryArt } from "@/components/ui/hero-memory-art"
import { MemoryModuleGrid } from "@/components/ui/memory-module-grid"
import { RecentActivity } from "@/components/ui/recent-activity"
import { ThemeOnboarding } from "@/components/ui/theme-onboarding"
import { memoryModules } from "@/lib/memory-modules"

export default function HomePage() {
  const { theme } = useTheme()
  const current = appThemeStyles[theme]

  return (
    <div className={`min-h-screen transition-colors duration-500 ${current.shell}`}>
      <ThemeOnboarding />
      <div className="mx-auto max-w-[1480px] px-4 py-4 sm:px-6 lg:px-8">
        <header className={`sticky top-4 z-20 rounded-[1.75rem] border ${current.header}`}>
          <div className="flex min-h-16 items-center justify-between gap-4 px-5 py-3 lg:px-8">
            <Link href="/" className="flex min-w-0 items-center gap-3 text-lg font-bold tracking-tight lg:text-2xl">
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${current.cardIcon}`}>
                <Heart className="h-5 w-5" />
              </span>
              <span className="truncate">Family Memories · 成长记录</span>
            </Link>
            <nav className="hidden items-center gap-5 text-sm font-medium xl:flex">
              {memoryModules.map((item) => (
                <Link key={item.key} href="/login" className="opacity-80 transition hover:opacity-100">
                  {item.navTitle}
                </Link>
              ))}
            </nav>
            <Link href="/login" className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition ${current.primaryButton}`}>
              <UserRound className="h-4 w-4" />
              登录
            </Link>
          </div>
        </header>

        <main>
          <section className={`relative mt-5 overflow-hidden rounded-[2rem] border px-6 py-14 sm:px-10 lg:px-16 lg:py-20 ${current.hero}`}>
            <HeroMemoryArt />

            <div className="relative grid items-center gap-12 lg:grid-cols-[minmax(0,0.86fr)_minmax(360px,0.54fr)]">
              <div className="max-w-3xl">
                <p className={`mb-5 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${current.pickerCard}`}>
                  <Sparkles className="h-4 w-4" />
                  家庭私域成长记忆空间
                </p>
                <h1 className="break-keep text-[clamp(2.8rem,7vw,6.25rem)] font-black leading-[0.98] tracking-tight">
                  把每一个平凡的日子，封存为家的记忆胶囊
                </h1>
                <p className={`mt-6 max-w-2xl text-base leading-8 sm:text-xl ${current.secondaryText}`}>
                  记录成长、珍藏影像、保存足迹，也留下家人之间最温暖的话。
                </p>
                <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center">
                  <Link href="/login" className={`inline-flex items-center justify-center gap-3 rounded-full px-8 py-4 text-lg font-bold transition ${current.primaryButton}`}>
                    开始记录
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                  <a href="#theme-selector" className={`inline-flex items-center justify-center gap-3 rounded-full border px-8 py-4 text-lg font-bold transition ${current.pickerCard}`}>
                    选择主题
                  </a>
                </div>
                <div className={`mt-7 inline-flex items-center gap-2 text-sm font-semibold ${current.secondaryText}`}>
                  <LockKeyhole className="h-4 w-4" />
                  邀请制访问 · 相册权限 · 仅家人可见
                </div>
              </div>

              <div className="hidden min-h-[390px] lg:block" />
            </div>
          </section>

          <MemoryModuleGrid modules={memoryModules} locked />

          <div id="theme-selector">
            <CompactThemeSelector />
          </div>

          <RecentActivity />
        </main>

        <footer className={`my-8 rounded-[1.5rem] border px-6 py-5 text-sm ${current.pickerCard}`}>
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <span className="font-bold">Family Memories · 成长记录</span>
            <span className="opacity-60">Since 2014</span>
          </div>
        </footer>
      </div>
    </div>
  )
}

