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
  ArrowRight
} from "lucide-react"

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[var(--theme-text-muted)]">加载中...</p>
      </div>
    )
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

  const colorMap: Record<string, { bg: string, text: string, border: string, hover: string }> = {
    emerald: { bg: "bg-emerald-500", text: "text-white", border: "border-emerald-200", hover: "hover:border-emerald-300 hover:text-emerald-600" },
    blue: { bg: "bg-blue-500", text: "text-white", border: "border-blue-200", hover: "hover:border-blue-300 hover:text-blue-600" },
    amber: { bg: "bg-amber-500", text: "text-white", border: "border-amber-200", hover: "hover:border-amber-300 hover:text-amber-600" },
    pink: { bg: "bg-pink-500", text: "text-white", border: "border-pink-200", hover: "hover:border-pink-300 hover:text-pink-600" },
  }

  return (
    <div className="min-h-screen">
      {/* 简洁顶部导航 */}
      <header className="border-b border-[var(--theme-border)]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center">
              <span className="text-lg font-semibold tracking-tight">
                成长记录
              </span>
            </Link>

            {/* 导航 */}
            <nav className="flex items-center gap-6">
              {navItems.map((item) => {
                const colors = colorMap[item.color]
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`text-sm text-[var(--theme-text-secondary)] hover:${item.color === 'emerald' ? 'text-emerald-600' : item.color === 'blue' ? 'text-blue-600' : item.color === 'amber' ? 'text-amber-600' : 'text-pink-600'} transition-colors`}
                  >
                    {item.label}
                  </Link>
                )
              })}
            </nav>

            {/* 用户信息 */}
            <div className="flex items-center gap-4">
              <Link
                href="/profile"
                className="flex items-center gap-2 text-sm"
              >
                <span className="text-[var(--theme-text-secondary)]">
                  {session.user.nickname || session.user.username}
                </span>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                  {session.user.avatar ? (
                    <img
                      src={session.user.avatar}
                      alt=""
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-4 h-4 text-amber-600" />
                  )}
                </div>
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="p-2 text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] transition-colors"
                title="退出登录"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 主内容 */}
      <main>
        {/* Hero 区域 */}
        <section className="py-16 relative overflow-hidden">
          {/* 装饰背景 */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-10 right-20 w-56 h-56 bg-gradient-to-br from-emerald-100/40 to-teal-100/30 rounded-full blur-3xl" />
            <div className="absolute bottom-10 left-10 w-40 h-40 bg-gradient-to-tr from-amber-100/40 to-orange-100/30 rounded-full blur-3xl" />
          </div>
          
          <div className="max-w-5xl mx-auto px-6 relative">
            <div className="max-w-2xl">
              <p className="text-sm font-medium text-amber-600 mb-3 tracking-wide">
                Welcome
              </p>
              <h1 className="text-3xl lg:text-4xl font-bold mb-4">
                {session.user.nickname || session.user.username}
              </h1>
              <p className="text-[var(--theme-text-secondary)] text-lg leading-relaxed">
                记录成长的每一个瞬间，珍藏家庭最美好的回忆。
              </p>
            </div>
          </div>
        </section>

        {/* 快捷入口 */}
        <section className="py-10 border-t border-[var(--theme-border)] bg-gradient-to-b from-white to-gray-50/50">
          <div className="max-w-5xl mx-auto px-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-semibold">快速入口</h2>
              <Link href="/profile" className="text-sm text-[var(--theme-text-secondary)] hover:text-[var(--theme-text)]">
                个人设置
              </Link>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* 写日记 */}
              <Link
                href="/travel/new"
                className="card p-6 hover:border-emerald-200 hover:shadow-lg transition-all group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium mb-1 group-hover:text-emerald-600 transition-colors">写日记</h3>
                    <p className="text-sm text-[var(--theme-text-muted)]">
                      记录今天的美好
                    </p>
                  </div>
                  <Plus className="w-5 h-5 text-[var(--theme-text-muted)] group-hover:text-emerald-500 transition-colors" />
                </div>
              </Link>

              {/* 上传照片 */}
              <Link
                href="/photos/new"
                className="card p-6 hover:border-blue-200 hover:shadow-lg transition-all group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium mb-1 group-hover:text-blue-600 transition-colors">上传照片</h3>
                    <p className="text-sm text-[var(--theme-text-muted)]">
                      珍藏美好瞬间
                    </p>
                  </div>
                  <Plus className="w-5 h-5 text-[var(--theme-text-muted)] group-hover:text-blue-500 transition-colors" />
                </div>
              </Link>

              {/* 查看留言 */}
              <Link
                href="/messages"
                className="card p-6 hover:border-pink-200 hover:shadow-lg transition-all group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium mb-1 group-hover:text-pink-600 transition-colors">留言板</h3>
                    <p className="text-sm text-[var(--theme-text-muted)]">
                      写下想说的话
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-[var(--theme-text-muted)] group-hover:text-pink-500 transition-colors" />
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* 功能模块 */}
        <section className="py-12 border-t border-[var(--theme-border)]">
          <div className="max-w-5xl mx-auto px-6">
            <h2 className="text-xl font-semibold mb-8">功能模块</h2>

            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature) => {
                const colors = colorMap[feature.color]
                return (
                  <Link
                    key={feature.href}
                    href={feature.href}
                    className="group"
                  >
                    <div className="flex items-center gap-4 mb-3">
                      <div className={`w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <feature.icon className={`w-6 h-6 ${colors.text}`} />
                      </div>
                      <h3 className={`font-medium group-hover:text-${feature.color}-600 transition-colors`}>
                        {feature.title}
                      </h3>
                    </div>
                    <p className="text-sm text-[var(--theme-text-muted)] mb-2">
                      {feature.subtitle}
                    </p>
                    <span className="text-xs text-[var(--theme-text-muted)]">
                      {feature.count} 条记录
                    </span>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>

        {/* 导航快捷 */}
        <section className="py-12 border-t border-[var(--theme-border)] bg-gradient-to-r from-amber-50 via-orange-50 to-rose-50">
          <div className="max-w-5xl mx-auto px-6">
            <div className="grid md:grid-cols-4 gap-4">
              {navItems.map((item) => {
                const colors = colorMap[item.color]
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 p-4 bg-white rounded-xl border border-[var(--theme-border)] hover:${colors.border} hover:shadow-md transition-all group`}
                  >
                    <div className={`w-10 h-10 rounded-lg ${colors.bg} flex items-center justify-center`}>
                      <item.icon className={`w-5 h-5 ${colors.text}`} />
                    </div>
                    <span className="font-medium group-hover:text-[var(--theme-text)] transition-colors">
                      {item.label}
                    </span>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      </main>

      {/* 简洁页脚 */}
      <footer className="border-t border-[var(--theme-border)] py-8">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex justify-between items-center text-sm text-[var(--theme-text-muted)]">
            <span>成长记录</span>
            <span>Since 2014</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
