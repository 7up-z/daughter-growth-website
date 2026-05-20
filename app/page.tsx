"use client"

import Link from "next/link"
import Image from "next/image"
import {
  ArrowRight,
  BookOpen,
  Camera,
  Cake,
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
import { HeroMemoryArt } from "@/components/ui/hero-memory-art"

const features = [
  {
    title: "旅行日记",
    subtitle: "记录一家人的足迹",
    icon: Map,
    href: "/login",
    cover: "/images/module-travel-diary.svg",
    overlay: "bg-gradient-to-t from-[#294d2e]/34 via-transparent to-white/8",
  },
  {
    title: "摄影相册",
    subtitle: "定格生活的美好",
    icon: Camera,
    href: "/login",
    cover: "/images/module-photo-album.svg",
    overlay: "bg-gradient-to-t from-[#5b3e23]/32 via-transparent to-white/8",
  },
  {
    title: "生日影像",
    subtitle: "珍藏每一次生日",
    icon: Cake,
    href: "/login",
    cover: "/images/module-birthday-video.svg",
    overlay: "bg-gradient-to-t from-[#7c3144]/34 via-transparent to-white/8",
  },
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
            <Link href="/" className="flex min-w-0 items-center gap-3 text-lg font-bold tracking-tight lg:text-2xl">
              <span className={`flex h-10 w-10 items-center justify-center rounded-full ${current.cardIcon}`}>
                <Heart className="h-5 w-5" />
              </span>
              <span className="truncate">Family Memories · 成长记录</span>
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
            <HeroMemoryArt />

            <div className="relative grid items-center gap-12 lg:grid-cols-[minmax(0,0.86fr)_minmax(360px,0.54fr)]">
              <div className="max-w-3xl">
                <p className={`mb-5 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${current.pickerCard}`}>
                  <Sparkles className="h-4 w-4" />
                  {current.eyebrow}
                </p>
                <h1 className="break-keep text-[clamp(3rem,8vw,6.75rem)] font-black leading-[0.96] tracking-tight">
                  <span className="block whitespace-nowrap">Family Memories</span>
                  <span className="mt-3 block text-[0.46em] leading-tight text-current/78">成长记录</span>
                </h1>
                {current.subtitle && (
                  <p className={`mt-6 max-w-2xl text-base leading-8 sm:text-xl ${current.secondaryText}`}>
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

              <div className="hidden min-h-[390px] lg:block" />
            </div>
          </section>

          <section className={`mt-5 rounded-[2rem] border p-4 sm:p-6 ${current.featureGrid}`}>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {features.map((item, index) => {
                const Icon = item.icon
                return (
                  <Link key={item.title} href={item.href} className={`group overflow-hidden rounded-[1.5rem] border transition ${current.card}`}>
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <Image
                        src={item.cover}
                        alt=""
                        fill
                        sizes="(min-width: 1280px) 30vw, (min-width: 768px) 46vw, 92vw"
                        className="object-cover transition duration-500 group-hover:scale-[1.03]"
                      />
                      <div className={`absolute inset-0 ${item.overlay}`} />
                      <span className={`absolute left-4 top-4 rounded-full border px-3 py-1 text-xs font-black ${current.pickerCard}`}>0{index + 1}</span>
                      <span className={`absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full ${current.cardIcon}`}>
                        <Icon className="h-5 w-5" />
                      </span>
                    </div>
                    <div className="p-6">
                      <h3 className="break-keep text-2xl font-black">{item.title}</h3>
                      <p className={`mt-2 text-sm font-semibold ${current.secondaryText}`}>{item.subtitle}</p>
                      <span className="mt-6 inline-flex h-10 w-10 items-center justify-center rounded-full bg-current/10 transition group-hover:translate-x-1">
                        <ArrowRight className="h-5 w-5" />
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>

          <CompactThemeSelector />

          <section className={`my-8 overflow-hidden rounded-[2rem] border p-8 sm:p-10 ${current.quote}`}>
            <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-center">
              <div>
                <p className="break-keep text-3xl font-black leading-relaxed sm:text-4xl">Family Memories</p>
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
