"use client"

export const dynamic = 'force-dynamic';

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import Link from "next/link"
import { signOut } from "next-auth/react"
import {
  Video,
  BookOpen,
  Camera,
  MessageCircle,
  User,
  LogOut,
  Plus,
  ArrowRight,
  Heart,
  Sparkles
} from "lucide-react"
import { ThemedLoading, ThemedPageHero, ThemedShell, useCurrentThemeStyle } from "@/components/ui/theme-shell"

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const current = useCurrentThemeStyle()

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

  const navItems = [
    { href: "/travel", label: "旅行日记", icon: BookOpen, color: "emerald" },
    { href: "/photos", label: "照片", icon: Camera, color: "blue" },
    { href: "/birthday", label: "生日", icon: Video, color: "amber" },
    { href: "/messages", label: "留言", icon: MessageCircle, color: "pink" },
  ]

  const features = [
    {
      href: "/travel",
      title: "旅行日记",
      subtitle: "记录旅途中的美好时光",
      icon: BookOpen,
      color: "emerald",
      count: 0
    },
    {
      href: "/photos",
      title: "照片",
      subtitle: "珍藏每一张照片",
      icon: Camera,
      color: "blue",
      count: 0
    },
    {
      href: "/birthday",
      title: "生日记录",
      subtitle: "记录成长每一岁",
      icon: Video,
      color: "amber",
      count: 0
    }
  ]

  return (
    <ThemedShell>
      <header className={`sticky top-4 z-30 rounded-[1.75rem] border ${current.header}`}>
        <div className="flex min-h-16 items-center justify-between gap-4 px-4 py-3 sm:px-5 lg:px-6">
          <Link href="/dashboard" className="flex items-center gap-3 text-lg font-black tracking-tight">
            <span className={`flex h-10 w-10 items-center justify-center rounded-full ${current.cardIcon}`}>
              <Heart className="h-5 w-5" />
            </span>
            <span className="hidden sm:inline">Family Memories · 成长记录</span>
          </Link>

          <nav className="hidden items-center gap-5 text-sm font-bold lg:flex">
              {navItems.map((item) => {
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`transition hover:opacity-100 ${current.secondaryText}`}
                  >
                    {item.label}
                  </Link>
                )
              })}
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/profile" className={`flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-bold ${current.pickerCard}`}>
              <span className="hidden sm:inline">{session.user.nickname || session.user.username}</span>
              <span className={`flex h-8 w-8 items-center justify-center overflow-hidden rounded-full ${current.cardIcon}`}>
                {session.user.avatar ? (
                  <img src={session.user.avatar} alt="" className="h-full w-full object-cover" />
                ) : (
                  <User className="h-4 w-4" />
                )}
              </span>
            </Link>
            <button
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
        <ThemedPageHero
          eyebrow="Welcome"
          title={`${session.user.nickname || session.user.username}，今天想记录什么？`}
          description="旅行、照片、生日影像和留言都在这里。首页的主题风格会延续到每一个记录入口。"
          icon={<Sparkles className="h-4 w-4" />}
        />

        <section className={`mt-6 rounded-[2rem] border p-5 sm:p-6 ${current.featureGrid}`}>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-black">快速入口</h2>
              <Link href="/profile" className={`text-sm font-bold ${current.secondaryText}`}>
                个人设置
              </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <Link
                href="/travel/new"
                className={`group rounded-[1.5rem] border p-6 transition ${current.card}`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="mb-1 text-lg font-black">写日记</h3>
                    <p className={`text-sm ${current.secondaryText}`}>
                      记录今天的美好
                    </p>
                  </div>
                  <span className={`flex h-10 w-10 items-center justify-center rounded-full ${current.cardIcon}`}>
                    <Plus className="h-5 w-5" />
                  </span>
                </div>
              </Link>

              <Link
                href="/photos/new"
                className={`group rounded-[1.5rem] border p-6 transition ${current.card}`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="mb-1 text-lg font-black">上传照片</h3>
                    <p className={`text-sm ${current.secondaryText}`}>
                      珍藏美好瞬间
                    </p>
                  </div>
                  <span className={`flex h-10 w-10 items-center justify-center rounded-full ${current.cardIcon}`}>
                    <Plus className="h-5 w-5" />
                  </span>
                </div>
              </Link>

              <Link
                href="/messages"
                className={`group rounded-[1.5rem] border p-6 transition ${current.card}`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="mb-1 text-lg font-black">留言板</h3>
                    <p className={`text-sm ${current.secondaryText}`}>
                      写下想说的话
                    </p>
                  </div>
                  <span className={`flex h-10 w-10 items-center justify-center rounded-full ${current.cardIcon}`}>
                    <ArrowRight className="h-5 w-5" />
                  </span>
                </div>
              </Link>
            </div>
        </section>

        <section className="py-8">
            <h2 className="mb-6 text-xl font-black">功能模块</h2>

            <div className="grid gap-4 md:grid-cols-3">
              {features.map((feature) => {
                return (
                  <Link
                    key={feature.href}
                    href={feature.href}
                    className={`group rounded-[1.5rem] border p-6 transition ${current.card}`}
                  >
                    <div className="mb-4 flex items-center gap-4">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl transition group-hover:scale-110 ${current.cardIcon}`}>
                        <feature.icon className="h-6 w-6" />
                      </div>
                      <h3 className="font-black">
                        {feature.title}
                      </h3>
                    </div>
                    <p className={`mb-3 text-sm ${current.secondaryText}`}>
                      {feature.subtitle}
                    </p>
                    <span className={`text-xs font-bold ${current.secondaryText}`}>
                      {feature.count} 条记录
                    </span>
                  </Link>
                )
              })}
            </div>
        </section>

        <section className={`rounded-[2rem] border p-5 sm:p-6 ${current.quote}`}>
            <div className="grid gap-4 md:grid-cols-4">
              {navItems.map((item) => {
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="group flex items-center gap-3 rounded-2xl border border-current/15 bg-current/5 p-4 transition hover:bg-current/10"
                  >
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${current.cardIcon}`}>
                      <item.icon className="h-5 w-5" />
                    </div>
                    <span className="font-black">
                      {item.label}
                    </span>
                  </Link>
                )
              })}
            </div>
        </section>
      </main>

      <footer className={`mt-8 rounded-[1.5rem] border px-6 py-5 text-sm ${current.pickerCard}`}>
          <div className={`flex justify-between gap-2 ${current.secondaryText}`}>
            <span>成长记录</span>
            <span>Since 2014</span>
          </div>
      </footer>
    </ThemedShell>
  )
}
