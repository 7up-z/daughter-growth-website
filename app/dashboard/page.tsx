"use client"

export const dynamic = "force-dynamic"

import { useEffect } from "react"
import Link from "next/link"
import { signOut, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import {
  ArrowRight,
  BookOpen,
  Cake,
  Camera,
  Check,
  Film,
  Heart,
  LogOut,
  Map,
  MessageSquare,
  Palette,
  Sparkles,
  User,
} from "lucide-react"
import { Theme, themes, useTheme } from "@/components/providers/theme-provider"
import { ThemedLoading } from "@/components/ui/theme-shell"
import { appThemeStyles, themeOrder } from "@/lib/app-theme"

const features = [
  { title: "旅行日记", subtitle: "记录一家人的足迹", icon: Map, href: "/travel" },
  { title: "摄影相册", subtitle: "定格生活的美好", icon: Camera, href: "/photos" },
  { title: "生日影像", subtitle: "珍藏每一次生日", icon: Cake, href: "/birthday" },
  { title: "家庭留言", subtitle: "写下爱与祝福", icon: MessageSquare, href: "/messages" },
  { title: "写新日记", subtitle: "补上今天的故事", icon: BookOpen, href: "/travel/new" },
  { title: "上传照片", subtitle: "收藏新的瞬间", icon: Film, href: "/photos/new" },
]

function ThemePreview({ themeKey }: { themeKey: Theme }) {
  const preview = appThemeStyles[themeKey]

  return (
    <div className={`relative h-20 overflow-hidden rounded-2xl border ${preview.preview}`}>
      <div className={`absolute inset-0 bg-gradient-to-br ${preview.heroGlow}`} />
      <div className="absolute left-4 top-4 h-9 w-14 rotate-[-8deg] rounded-lg bg-white/75 shadow-lg" />
      <div className="absolute right-5 top-4 h-10 w-16 rotate-[8deg] rounded-lg bg-black/15 shadow-lg" />
      <div className="absolute bottom-3 left-5 h-2 w-20 rounded-full bg-current/30" />
    </div>
  )
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
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
              {features.slice(0, 4).map((item) => (
                <Link key={item.title} href={item.href} className="opacity-80 transition hover:opacity-100">
                  {item.title}
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
            <div className={`absolute inset-0 bg-gradient-to-br ${current.heroGlow}`} />
            <div className="absolute -left-14 top-12 h-44 w-44 rounded-full border border-current/10" />
            <div className="absolute right-10 top-12 hidden h-72 w-72 rounded-full border border-current/10 lg:block" />

            <div className="relative grid items-center gap-12 lg:grid-cols-[1fr_0.9fr]">
              <div className="max-w-3xl">
                <p className={`mb-5 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${current.pickerCard}`}>
                  <Sparkles className="h-4 w-4" />
                  Welcome back · {displayName}
                </p>
                <h1 className="text-5xl font-black leading-tight tracking-tight sm:text-6xl lg:text-7xl">
                  把今天的日子，继续放进家的记忆胶囊。
                </h1>
                <p className={`mt-6 max-w-2xl text-lg leading-8 sm:text-xl ${current.secondaryText}`}>
                  这里就是登录后的首页。旅行、照片、生日影像和留言只保留一组清晰入口，减少重复跳转。
                </p>
                <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center">
                  <Link href="/travel/new" className={`inline-flex items-center justify-center gap-3 rounded-full px-8 py-4 text-lg font-bold transition ${current.primaryButton}`}>
                    写一篇日记
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                  <Link href="/photos/new" className={`inline-flex items-center justify-center gap-3 rounded-full px-8 py-4 text-lg font-bold transition ${current.pickerCard}`}>
                    上传照片
                    <Camera className="h-5 w-5" />
                  </Link>
                </div>
              </div>

              <div className="relative min-h-[360px]">
                <div className={`absolute right-8 top-4 h-64 w-72 rotate-6 rounded-[2rem] border p-4 ${current.preview}`}>
                  <div className="h-40 rounded-2xl bg-gradient-to-br from-white/80 to-black/10" />
                  <p className="mt-4 text-center text-sm font-semibold opacity-75">记录日常，留住家的温度</p>
                </div>
                <div className={`absolute left-0 top-20 h-52 w-64 -rotate-6 rounded-[2rem] border p-4 ${current.card}`}>
                  <div className="flex h-full items-end rounded-2xl bg-gradient-to-br from-current/10 to-current/25 p-4">
                    <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-bold text-black/70">Today</span>
                  </div>
                </div>
                <div className={`absolute bottom-0 right-0 h-44 w-56 rotate-3 rounded-[2rem] border p-4 ${current.card}`}>
                  <div className="grid h-full grid-cols-2 gap-2">
                    <div className="rounded-2xl bg-current/10" />
                    <div className="rounded-2xl bg-current/20" />
                    <div className="rounded-2xl bg-current/20" />
                    <div className="rounded-2xl bg-current/10" />
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="py-10">
            <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.2em] opacity-60">
                  <Palette className="h-4 w-4" />
                  Theme
                </p>
                <h2 className="mt-2 text-2xl font-black tracking-tight">沿用首页的四种视觉风格</h2>
              </div>
              <Link href="/profile" className={`text-sm font-bold ${current.secondaryText}`}>
                个人资料与头像设置
              </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {themeOrder.map((themeKey) => {
                const item = themes[themeKey]
                const isActive = theme === themeKey

                return (
                  <button
                    key={themeKey}
                    type="button"
                    onClick={() => setTheme(themeKey)}
                    className={`group rounded-[1.5rem] border p-4 text-left transition hover:-translate-y-1 ${appThemeStyles[themeKey].pickerCard} ${isActive ? "ring-4 ring-current/15" : "opacity-86 hover:opacity-100"}`}
                    aria-pressed={isActive}
                  >
                    <ThemePreview themeKey={themeKey} />
                    <div className="mt-4 flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-black">{item.name}</h3>
                        <p className="mt-1 text-sm leading-6 opacity-70">{item.description}</p>
                      </div>
                      <span className={`mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${isActive ? appThemeStyles[themeKey].cardIcon : "bg-current/10"}`}>
                        {isActive && <Check className="h-4 w-4" />}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          </section>

          <section className={`rounded-[2rem] border p-4 sm:p-6 ${current.featureGrid}`}>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {features.map((item, index) => {
                const Icon = item.icon
                return (
                  <Link key={item.title} href={item.href} className={`group min-h-52 rounded-[1.5rem] border p-6 transition ${current.card}`}>
                    <div className="flex items-start justify-between">
                      <span className={`text-2xl font-black ${current.cardNumber}`}>0{index + 1}.</span>
                      <span className={`flex h-12 w-12 items-center justify-center rounded-2xl transition group-hover:scale-110 ${current.cardIcon}`}>
                        <Icon className="h-6 w-6" />
                      </span>
                    </div>
                    <h3 className="mt-8 text-2xl font-black">{item.title}</h3>
                    <p className={`mt-2 text-sm leading-6 ${current.secondaryText}`}>{item.subtitle}</p>
                    <span className="mt-8 inline-flex h-10 w-10 items-center justify-center rounded-full bg-current/10 transition group-hover:translate-x-1">
                      <ArrowRight className="h-5 w-5" />
                    </span>
                  </Link>
                )
              })}
            </div>
          </section>
        </main>

        <footer className={`my-8 rounded-[1.5rem] border px-6 py-5 text-sm ${current.pickerCard}`}>
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <span className="font-bold">Family Memories · 成长记录</span>
            <span className="opacity-60">Since 2014 · 每一个平凡的日子，都值得被记录</span>
          </div>
        </footer>
      </div>
    </div>
  )
}
