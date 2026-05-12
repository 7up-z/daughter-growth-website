"use client"

import Link from "next/link"
import Image from "next/image"
import {
  ArrowRight,
  BookOpen,
  Camera,
  Cake,
  Clock3,
  Film,
  Heart,
  LockKeyhole,
  Map,
  Sparkles,
  UserRound,
} from "lucide-react"
import { useTheme } from "@/components/providers/theme-provider"
import { appThemeStyles } from "@/lib/app-theme"
import { CompactThemeSelector } from "@/components/ui/compact-theme-selector"

const features = [
  { title: "成长时间线", subtitle: "记录每一步成长", icon: Clock3, href: "/login" },
  { title: "生日影像", subtitle: "珍藏每一次生日", icon: Cake, href: "/login" },
  { title: "旅行地图", subtitle: "收藏一家人的足迹", icon: Map, href: "/login" },
]

const navItems = [
  ...features,
  { title: "留言", href: "/login" },
]

export default function HomePage() {
  const { theme } = useTheme()
  const current = appThemeStyles[theme]

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
              {navItems.map((item) => (
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
                {current.subtitle && (
                  <p className={`mt-6 max-w-2xl text-lg leading-8 sm:text-xl ${current.secondaryText}`}>
                    {current.subtitle}
                  </p>
                )}
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

              <div className="relative min-h-[390px]">
                <div className={`absolute right-0 top-0 h-72 w-[25rem] rotate-3 overflow-hidden rounded-[2rem] border p-3 ${current.preview}`}>
                  <Image
                    src="/images/family-watercolor-hero.png"
                    alt=""
                    width={1200}
                    height={750}
                    className="h-full w-full rounded-[1.5rem] object-cover object-center"
                    priority
                  />
                </div>
                <div className={`absolute left-0 top-24 h-52 w-64 -rotate-6 overflow-hidden rounded-[2rem] border p-3 ${current.card}`}>
                  <Image
                    src="/images/family-watercolor-hero.png"
                    alt=""
                    width={1200}
                    height={750}
                    className="h-full w-full rounded-[1.5rem] object-cover object-left"
                  />
                </div>
                <div className={`absolute bottom-0 right-0 h-44 w-56 rotate-3 rounded-[2rem] border p-4 ${current.card}`}>
                  <div className="grid h-full grid-cols-2 gap-2 overflow-hidden rounded-2xl">
                    <Image src="/images/family-watercolor-hero.png" alt="" width={300} height={220} className="h-full w-full object-cover object-[70%_45%]" />
                    <Image src="/images/family-watercolor-hero.png" alt="" width={300} height={220} className="h-full w-full object-cover object-[20%_55%]" />
                    <Image src="/images/family-watercolor-hero.png" alt="" width={300} height={220} className="h-full w-full object-cover object-[83%_70%]" />
                    <Image src="/images/family-watercolor-hero.png" alt="" width={300} height={220} className="h-full w-full object-cover object-[45%_70%]" />
                  </div>
                </div>
              </div>
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
                    <span className="mt-8 inline-flex h-10 w-10 items-center justify-center rounded-full bg-current/10 transition group-hover:translate-x-1">
                      <ArrowRight className="h-5 w-5" />
                    </span>
                  </Link>
                )
              })}
            </div>
          </section>

          <CompactThemeSelector />

          <section className={`my-8 overflow-hidden rounded-[2rem] border p-8 sm:p-10 ${current.quote}`}>
            <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-center">
              <div>
                <p className="text-3xl font-black leading-relaxed sm:text-4xl">Family Memories</p>
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
            <span className="opacity-60">Since 2014</span>
          </div>
        </footer>
      </div>
    </div>
  )
}
