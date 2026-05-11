"use client"

import Link from "next/link"
import {
  ArrowRight,
  BookOpen,
  Camera,
  Cake,
  Check,
  Clock3,
  Film,
  Heart,
  LockKeyhole,
  Map,
  MessageSquare,
  Palette,
  Sparkles,
  UserRound,
} from "lucide-react"
import { Theme, themes, useTheme } from "@/components/providers/theme-provider"

type HomeThemeStyle = {
  eyebrow: string
  title: string
  subtitle: string
  shell: string
  header: string
  hero: string
  heroGlow: string
  primaryButton: string
  secondaryText: string
  card: string
  cardIcon: string
  cardNumber: string
  featureGrid: string
  quote: string
  preview: string
  pickerCard: string
}

const themeOrder: Theme[] = ["paper", "cinematic", "playful", "future"]

const homeThemeStyles: Record<Theme, HomeThemeStyle> = {
  paper: {
    eyebrow: "Family Album · 手帐纸感",
    title: "把每一个平凡的日子，封存为家的记忆胶囊。",
    subtitle: "米色纸张、植物拓印与照片拼贴，让首页像一本温柔展开的家庭相册。",
    shell: "bg-[#f6eddf] text-[#3f3a22]",
    header: "border-[#e2d2b7]/80 bg-[#fffaf0]/85 shadow-[0_18px_60px_rgba(104,80,48,0.12)] backdrop-blur-xl",
    hero: "border-[#e7d8c0] bg-[radial-gradient(circle_at_18%_20%,rgba(255,255,255,0.95),transparent_34%),linear-gradient(135deg,#fffaf0_0%,#f0dfc5_100%)] shadow-[0_24px_70px_rgba(100,74,44,0.16)]",
    heroGlow: "from-[#d6b98d]/40 via-[#fff7e8]/60 to-[#8ea36a]/20",
    primaryButton: "bg-[#c86d49] text-white shadow-[0_14px_28px_rgba(200,109,73,0.28)] hover:bg-[#b95e3e]",
    secondaryText: "text-[#766b52]",
    card: "border-[#e5d6bf] bg-[#fffdf8] shadow-[0_14px_40px_rgba(97,73,45,0.10)] hover:-translate-y-1 hover:shadow-[0_18px_48px_rgba(97,73,45,0.16)]",
    cardIcon: "bg-[#746b3f] text-[#fff9eb]",
    cardNumber: "text-[#b58b58]",
    featureGrid: "bg-[#fff8ed]/80 border-[#eadcc6]",
    quote: "bg-[#fff7e9] border-[#ead8be] text-[#5b523b]",
    preview: "bg-[#f8ead6] border-[#dfc9a8]",
    pickerCard: "bg-[#fffdf8] border-[#dfc9a8]",
  },
  cinematic: {
    eyebrow: "Time Capsule · 暗金胶片",
    title: "把珍贵的瞬间，封存在时光胶囊里。",
    subtitle: "黑金电影感、金属胶囊和暖色高光，适合更具仪式感的家庭记忆入口。",
    shell: "bg-[#080706] text-[#f4e7d0]",
    header: "border-[#5a3c1f]/80 bg-black/70 shadow-[0_18px_70px_rgba(0,0,0,0.45)] backdrop-blur-xl",
    hero: "border-[#704820] bg-[radial-gradient(circle_at_76%_24%,rgba(225,182,110,0.28),transparent_30%),linear-gradient(135deg,#17110c_0%,#050505_70%)] shadow-[0_30px_90px_rgba(0,0,0,0.55)]",
    heroGlow: "from-[#e1b66e]/35 via-transparent to-[#7d4b20]/25",
    primaryButton: "bg-gradient-to-r from-[#ffe0a3] to-[#b77a33] text-[#120c07] shadow-[0_16px_36px_rgba(201,154,85,0.32)] hover:brightness-110",
    secondaryText: "text-[#b99a72]",
    card: "border-[#6b4725] bg-[#14100c] shadow-[0_18px_50px_rgba(0,0,0,0.45)] hover:-translate-y-1 hover:border-[#d29b50]",
    cardIcon: "bg-[#c99a55] text-[#120c07]",
    cardNumber: "text-[#d9ab67]",
    featureGrid: "bg-[#0d0a08]/90 border-[#5a3c1f]",
    quote: "bg-[#120e0a] border-[#5a3c1f] text-[#e6c896]",
    preview: "bg-[#1b130b] border-[#704820]",
    pickerCard: "bg-[#15110c] border-[#5a3c1f]",
  },
  playful: {
    eyebrow: "Our Story Every Day · 亲子拼贴",
    title: "把平凡的日子，装进家族时光胶囊。",
    subtitle: "粗体标题、贴纸箭头和明快色块，让记录这件事变得像亲子游戏一样有趣。",
    shell: "bg-[#fff8e8] text-[#080808]",
    header: "border-black/10 bg-[#fffaf0]/92 shadow-[0_12px_40px_rgba(0,0,0,0.08)] backdrop-blur-xl",
    hero: "border-black bg-[radial-gradient(circle_at_84%_24%,rgba(36,91,255,0.16),transparent_26%),linear-gradient(135deg,#fff9ea_0%,#ffe7cf_100%)] shadow-[10px_10px_0_#111]",
    heroGlow: "from-[#ff5a4e]/35 via-[#ffe45c]/45 to-[#245bff]/25",
    primaryButton: "bg-[#ff5a4e] text-black border-2 border-black shadow-[7px_7px_0_#111] hover:-translate-y-0.5 hover:shadow-[9px_9px_0_#111]",
    secondaryText: "text-[#403b32]",
    card: "border-2 border-black bg-white shadow-[6px_6px_0_#111] hover:-translate-y-1 hover:shadow-[8px_8px_0_#111]",
    cardIcon: "bg-black text-white",
    cardNumber: "text-[#ff5a4e]",
    featureGrid: "bg-[#fff4d6] border-2 border-black",
    quote: "bg-[#ffcfda] border-2 border-black text-black",
    preview: "bg-[#ffe45c] border-2 border-black",
    pickerCard: "bg-white border-2 border-black",
  },
  future: {
    eyebrow: "Memory Capsule · 未来胶囊",
    title: "把平凡的日子，封存在家族的时光胶囊里。",
    subtitle: "玻璃拟态、蓝紫渐变与漂浮照片，营造轻盈、梦幻、科技感的成长空间。",
    shell: "bg-[#f4f7ff] text-[#151c48]",
    header: "border-white/70 bg-white/55 shadow-[0_18px_70px_rgba(92,112,255,0.18)] backdrop-blur-2xl",
    hero: "border-white/80 bg-[radial-gradient(circle_at_76%_20%,rgba(155,108,255,0.24),transparent_30%),linear-gradient(135deg,rgba(255,255,255,0.86)_0%,rgba(219,229,255,0.72)_100%)] shadow-[0_30px_90px_rgba(77,124,254,0.20)] backdrop-blur-2xl",
    heroGlow: "from-[#4d7cfe]/25 via-[#ffffff]/60 to-[#9b6cff]/25",
    primaryButton: "bg-gradient-to-r from-[#4d7cfe] to-[#9b6cff] text-white shadow-[0_16px_38px_rgba(77,124,254,0.32)] hover:brightness-110",
    secondaryText: "text-[#6670a0]",
    card: "border-white/80 bg-white/62 shadow-[0_18px_52px_rgba(77,124,254,0.16)] backdrop-blur-xl hover:-translate-y-1 hover:bg-white/78",
    cardIcon: "bg-gradient-to-br from-[#4d7cfe] to-[#9b6cff] text-white",
    cardNumber: "text-[#5877ff]",
    featureGrid: "bg-white/45 border-white/75 backdrop-blur-xl",
    quote: "bg-white/58 border-white/80 text-[#48517f] backdrop-blur-xl",
    preview: "bg-white/45 border-white/75 backdrop-blur-xl",
    pickerCard: "bg-white/60 border-white/80 backdrop-blur-xl",
  },
}

const features = [
  { title: "成长时间线", subtitle: "记录每一步成长", icon: Clock3, href: "/login" },
  { title: "生日影像", subtitle: "珍藏每一次生日", icon: Cake, href: "/login" },
  { title: "旅行地图", subtitle: "收藏一家人的足迹", icon: Map, href: "/login" },
  { title: "摄影相册", subtitle: "定格生活的美好", icon: Camera, href: "/login" },
  { title: "家庭留言", subtitle: "写下爱与祝福", icon: MessageSquare, href: "/login" },
  { title: "年度回顾", subtitle: "重温一年的高光", icon: Film, href: "/login" },
]

function ThemePreview({ themeKey }: { themeKey: Theme }) {
  const preview = homeThemeStyles[themeKey]

  return (
    <div className={`relative h-24 overflow-hidden rounded-2xl border ${preview.preview}`}>
      <div className={`absolute inset-0 bg-gradient-to-br ${preview.heroGlow}`} />
      <div className="absolute left-4 top-4 h-10 w-14 rotate-[-8deg] rounded-lg bg-white/75 shadow-lg" />
      <div className="absolute right-5 top-5 h-11 w-16 rotate-[8deg] rounded-lg bg-black/15 shadow-lg" />
      <div className="absolute bottom-3 left-5 h-2 w-20 rounded-full bg-current/30" />
      <div className="absolute bottom-3 right-5 h-8 w-8 rounded-full bg-current/20" />
    </div>
  )
}

export default function HomePage() {
  const { theme, setTheme } = useTheme()
  const current = homeThemeStyles[theme]

  return (
    <div className={`min-h-screen transition-colors duration-500 ${current.shell}`}>
      <div className="mx-auto max-w-[1480px] px-4 py-4 sm:px-6 lg:px-8">
        <header className={`sticky top-4 z-20 rounded-[1.75rem] border ${current.header}`}>
          <div className="flex min-h-16 items-center justify-between gap-4 px-5 py-3 lg:px-8">
            <Link href="/" className="flex items-center gap-3 text-lg font-bold tracking-tight lg:text-2xl">
              <span className={`flex h-10 w-10 items-center justify-center rounded-full ${current.cardIcon}`}>
                <Heart className="h-5 w-5" />
              </span>
              <span>Family Memories · 成长记录</span>
            </Link>
            <nav className="hidden items-center gap-5 text-sm font-medium xl:flex">
              {features.map((item) => (
                <Link key={item.title} href={item.href} className="opacity-80 transition hover:opacity-100">
                  {item.title}
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
            <div className={`absolute inset-0 bg-gradient-to-br ${current.heroGlow}`} />
            <div className="absolute -left-14 top-12 h-44 w-44 rounded-full border border-current/10" />
            <div className="absolute right-10 top-12 hidden h-72 w-72 rounded-full border border-current/10 lg:block" />

            <div className="relative grid items-center gap-12 lg:grid-cols-[1fr_0.9fr]">
              <div className="max-w-3xl">
                <p className={`mb-5 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${current.pickerCard}`}>
                  <Sparkles className="h-4 w-4" />
                  {current.eyebrow}
                </p>
                <h1 className="text-5xl font-black leading-tight tracking-tight sm:text-6xl lg:text-7xl">
                  {current.title}
                </h1>
                <p className={`mt-6 max-w-2xl text-lg leading-8 sm:text-xl ${current.secondaryText}`}>
                  {current.subtitle}
                </p>
                <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center">
                  <Link href="/login" className={`inline-flex items-center justify-center gap-3 rounded-full px-8 py-4 text-lg font-bold transition ${current.primaryButton}`}>
                    开始记录
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                  <span className={`inline-flex items-center gap-2 text-sm font-semibold ${current.secondaryText}`}>
                    <LockKeyhole className="h-4 w-4" />
                    邀请制访问 · 相册权限 · 仅家人可见
                  </span>
                </div>
              </div>

              <div className="relative min-h-[360px]">
                <div className={`absolute right-8 top-4 h-64 w-72 rotate-6 rounded-[2rem] border p-4 ${current.preview}`}>
                  <div className="h-40 rounded-2xl bg-gradient-to-br from-white/80 to-black/10" />
                  <p className="mt-4 text-center text-sm font-semibold opacity-75">记录平凡日常，留住家的温度</p>
                </div>
                <div className={`absolute left-0 top-20 h-52 w-64 -rotate-6 rounded-[2rem] border p-4 ${current.card}`}>
                  <div className="flex h-full items-end rounded-2xl bg-gradient-to-br from-current/10 to-current/25 p-4">
                    <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-bold text-black/70">Family</span>
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
                  Choose your home theme
                </p>
                <h2 className="mt-2 text-2xl font-black tracking-tight">四种首页设计方案，可随时切换</h2>
              </div>
              <p className={`max-w-xl text-sm leading-6 ${current.secondaryText}`}>
                主题会保存在本机；登录后会同步到个人资料。首页保留一个明确入口，不打断“开始记录”的主流程。
              </p>
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
                    className={`group rounded-[1.5rem] border p-4 text-left transition hover:-translate-y-1 ${homeThemeStyles[themeKey].pickerCard} ${isActive ? "ring-4 ring-current/15" : "opacity-86 hover:opacity-100"}`}
                    aria-pressed={isActive}
                  >
                    <ThemePreview themeKey={themeKey} />
                    <div className="mt-4 flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-black">{item.name}</h3>
                        <p className="mt-1 text-sm leading-6 opacity-70">{item.description}</p>
                      </div>
                      <span className={`mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${isActive ? homeThemeStyles[themeKey].cardIcon : "bg-current/10"}`}>
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

          <section className={`my-8 overflow-hidden rounded-[2rem] border p-8 sm:p-10 ${current.quote}`}>
            <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-center">
              <div>
                <p className="text-3xl font-black leading-relaxed sm:text-4xl">记忆会褪色，爱与陪伴永不褪色。</p>
                <p className="mt-4 text-sm font-semibold opacity-70">Family Memories · 成长记录</p>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <Camera className="mx-auto mb-2 h-6 w-6" />
                  <p className="text-2xl font-black">照片</p>
                  <p className="text-xs opacity-65">珍藏瞬间</p>
                </div>
                <div>
                  <Film className="mx-auto mb-2 h-6 w-6" />
                  <p className="text-2xl font-black">影像</p>
                  <p className="text-xs opacity-65">记录成长</p>
                </div>
                <div>
                  <BookOpen className="mx-auto mb-2 h-6 w-6" />
                  <p className="text-2xl font-black">日记</p>
                  <p className="text-xs opacity-65">留住故事</p>
                </div>
              </div>
            </div>
          </section>
        </main>

        <footer className={`mb-4 rounded-[1.5rem] border px-6 py-5 text-sm ${current.pickerCard}`}>
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <span className="font-bold">Family Memories · 成长记录</span>
            <span className="opacity-60">Since 2014 · 每一个平凡的日子，都值得被记录</span>
          </div>
        </footer>
      </div>
    </div>
  )
}
