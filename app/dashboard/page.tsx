"use client"

export const dynamic = "force-dynamic"

import { useEffect } from "react"
import Link from "next/link"
import { signOut, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { ArrowRight, Camera, Heart, LogOut, Sparkles, User } from "lucide-react"
import { useTheme } from "@/components/providers/theme-provider"
import { ThemedLoading } from "@/components/ui/theme-shell"
import { appThemeStyles } from "@/lib/app-theme"
import { CompactThemeSelector } from "@/components/ui/compact-theme-selector"
import { HeroMemoryArt } from "@/components/ui/hero-memory-art"
import { MemoryModuleGrid } from "@/components/ui/memory-module-grid"
import { RecentActivity } from "@/components/ui/recent-activity"
import { memoryModules } from "@/lib/memory-modules"

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { theme } = useTheme()
  const current = appThemeStyles[theme]
  const displayName = session?.user.nickname || session?.user.username || "家人"

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  if (status === "loading") {
    return <ThemedLoading />
  }

  if (!session) {
    return null
  }

  return (
    <div className={`min-h-screen transition-colors duration-500 ${current.shell}`}>
      <div className="mx-auto max-w-[1480px] px-4 py-4 sm:px-6 lg:px-8">
        <header className={`sticky top-4 z-20 rounded-[1.75rem] border ${current.header}`}>
          <div className="flex min-h-16 items-center justify-between gap-4 px-5 py-3 lg:px-8">
            <Link href="/dashboard" className="flex min-w-0 items-center gap-3 text-lg font-bold tracking-tight lg:text-2xl">
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${current.cardIcon}`}>
                <Heart className="h-5 w-5" />
              </span>
              <span className="truncate">Family Memories · 成长记录</span>
            </Link>

            <nav className="hidden items-center gap-5 text-sm font-medium xl:flex">
              {memoryModules.map((item) => (
                <Link key={item.key} href={item.href} className="opacity-80 transition hover:opacity-100">
                  {item.navTitle}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <Link href="/profile" className={`flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-bold ${current.pickerCard}`}>
                <span className="hidden sm:inline">{displayName}</span>
                <span className={`flex h-8 w-8 items-center justify-center overflow-hidden rounded-full ${current.cardIcon}`}>
                  {session.user.avatar ? (
                    <img src={session.user.avatar} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                </span>
              </Link>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-current/10 transition hover:bg-current/15"
                title="退出登录"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </header>

        <main>
          <section className={`relative mt-5 overflow-hidden rounded-[2rem] border px-6 py-14 sm:px-10 lg:px-16 lg:py-20 ${current.hero}`}>
            <HeroMemoryArt mode="dashboard" />

            <div className="relative grid items-center gap-12 lg:grid-cols-[minmax(0,0.86fr)_minmax(360px,0.54fr)]">
              <div className="max-w-3xl">
                <p className={`mb-5 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${current.pickerCard}`}>
                  <Sparkles className="h-4 w-4" />
                  Welcome back · {displayName}
                </p>
                <h1 className="break-keep text-[clamp(2.8rem,7vw,6.25rem)] font-black leading-[0.98] tracking-tight">
                  今天也给家的记忆册添上一页
                </h1>
                <p className={`mt-6 max-w-2xl text-base leading-8 sm:text-xl ${current.secondaryText}`}>
                  从时间线、生日影像、旅行地图、摄影相册、留言和年度回顾继续整理新的故事。
                </p>
                <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center">
                  <Link href="/travel/new" className={`inline-flex items-center justify-center gap-3 rounded-full px-8 py-4 text-lg font-bold transition ${current.primaryButton}`}>
                    写一篇日记
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                  <Link href="/gallery/new" className={`inline-flex items-center justify-center gap-3 rounded-full px-8 py-4 text-lg font-bold transition ${current.pickerCard}`}>
                    上传照片
                    <Camera className="h-5 w-5" />
                  </Link>
                </div>
              </div>

              <div className="hidden min-h-[390px] lg:block" />
            </div>
          </section>

          <MemoryModuleGrid modules={memoryModules} />

          <CompactThemeSelector />

          <RecentActivity privateData />
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

