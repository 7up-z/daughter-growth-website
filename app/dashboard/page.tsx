"use client"

export const dynamic = 'force-dynamic';

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { 
  Heart, 
  Camera, 
  BookOpen, 
  Video, 
  User, 
  Settings, 
  LogOut,
  Menu,
  X,
  Palette,
  MessageCircle
} from "lucide-react"
import { signOut } from "next-auth/react"
import { useTheme, themes, Theme } from "@/components/providers/theme-provider"

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [themeMenuOpen, setThemeMenuOpen] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse">
            <div className="w-16 h-16 rounded-full bg-[var(--theme-primary)] mx-auto mb-4" />
          </div>
          <p className="text-[var(--theme-text-muted)]">正在加载...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const menuItems = [
    { href: "/dashboard", label: "首页", icon: Heart },
    { href: "/birthday", label: "生日视频", icon: Video },
    { href: "/travel", label: "旅行日记", icon: BookOpen },
    { href: "/photos", label: "摄影记录", icon: Camera },
    { href: "/messages", label: "留言板", icon: MessageCircle },
    { href: "/profile", label: "个人中心", icon: User },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      {/* 顶部导航栏 */}
      <header className="sticky top-0 z-50 glass border-b border-[var(--theme-border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-[var(--theme-primary)] flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold hidden sm:block gradient-text">
                成长记录
              </span>
            </Link>

            {/* 桌面端导航 */}
            <nav className="hidden md:flex items-center space-x-1">
              {menuItems.slice(0, 5).map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg text-[var(--theme-text)] hover:bg-[var(--theme-secondary)] transition-colors"
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>

            {/* 右侧操作区 */}
            <div className="flex items-center space-x-4">
              {/* 主题切换 */}
              <div className="relative">
                <button
                  onClick={() => setThemeMenuOpen(!themeMenuOpen)}
                  className="p-2 rounded-lg hover:bg-[var(--theme-secondary)] transition-colors"
                  title="切换主题"
                >
                  <Palette className="w-5 h-5 text-[var(--theme-primary)]" />
                </button>

                {themeMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-[var(--theme-surface)] rounded-xl shadow-xl border border-[var(--theme-border)] py-2 z-50">
                    <p className="px-4 py-2 text-sm font-medium text-[var(--theme-text-muted)]">
                      选择主题风格
                    </p>
                    {(Object.keys(themes) as Theme[]).map((t) => (
                      <button
                        key={t}
                        onClick={() => {
                          setTheme(t)
                          setThemeMenuOpen(false)
                        }}
                        className={`w-full px-4 py-2 text-left text-sm hover:bg-[var(--theme-secondary)] transition-colors flex items-center space-x-2 ${
                          theme === t ? "bg-[var(--theme-secondary)]" : ""
                        }`}
                      >
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: themes[t].colors.primary }}
                        />
                        <span>{themes[t].name}</span>
                        {theme === t && (
                          <span className="ml-auto text-[var(--theme-primary)]">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 用户头像 */}
              <Link
                href="/profile"
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-[var(--theme-secondary)] transition-colors"
              >
                {session.user.avatar ? (
                  <img
                    src={session.user.avatar}
                    alt={session.user.nickname || session.user.username}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[var(--theme-primary)] flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
                <span className="hidden sm:block text-sm font-medium">
                  {session.user.nickname || session.user.username}
                </span>
              </Link>

              {/* 退出登录 */}
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="p-2 rounded-lg hover:bg-[var(--theme-secondary)] transition-colors"
                title="退出登录"
              >
                <LogOut className="w-5 h-5 text-[var(--theme-text-muted)]" />
              </button>

              {/* 移动端菜单按钮 */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-[var(--theme-secondary)] transition-colors"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* 移动端菜单 */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[var(--theme-border)] bg-[var(--theme-surface)]">
            <nav className="px-4 py-2 space-y-1">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg text-[var(--theme-text)] hover:bg-[var(--theme-secondary)] transition-colors"
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              ))}
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>退出登录</span>
              </button>
            </nav>
          </div>
        )}
      </header>

      {/* 主内容区 */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* 欢迎区域 */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold mb-2">
            欢迎回来，{session.user.nickname || session.user.username}！
          </h1>
          <p className="text-[var(--theme-text-muted)]">
            今天想要记录什么美好瞬间呢？
          </p>
        </div>

        {/* 快捷入口 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link
            href="/birthday"
            className="group bg-[var(--theme-surface)] rounded-2xl p-6 shadow-lg card-hover border border-[var(--theme-border)]"
          >
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 rounded-xl bg-pink-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Video className="w-7 h-7 text-pink-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">生日视频</h3>
                <p className="text-sm text-[var(--theme-text-muted)]">回顾每年的成长</p>
              </div>
            </div>
          </Link>

          <Link
            href="/travel"
            className="group bg-[var(--theme-surface)] rounded-2xl p-6 shadow-lg card-hover border border-[var(--theme-border)]"
          >
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                <BookOpen className="w-7 h-7 text-blue-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">旅行日记</h3>
                <p className="text-sm text-[var(--theme-text-muted)]">记录旅途点滴</p>
              </div>
            </div>
          </Link>

          <Link
            href="/photos"
            className="group bg-[var(--theme-surface)] rounded-2xl p-6 shadow-lg card-hover border border-[var(--theme-border)]"
          >
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 rounded-xl bg-purple-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Camera className="w-7 h-7 text-purple-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">摄影记录</h3>
                <p className="text-sm text-[var(--theme-text-muted)]">分享摄影作品</p>
              </div>
            </div>
          </Link>
        </div>

        {/* 最近动态 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-[var(--theme-surface)] rounded-2xl p-6 shadow-lg border border-[var(--theme-border)]">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <BookOpen className="w-5 h-5 mr-2 text-[var(--theme-primary)]" />
              最新日记
            </h2>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[var(--theme-secondary)]">
                <p className="text-sm text-[var(--theme-text-muted)] mb-2">暂无日记</p>
                <Link href="/travel/new" className="text-[var(--theme-primary)] hover:underline text-sm">
                  写第一篇日记 →
                </Link>
              </div>
            </div>
          </div>

          <div className="bg-[var(--theme-surface)] rounded-2xl p-6 shadow-lg border border-[var(--theme-border)]">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <Camera className="w-5 h-5 mr-2 text-[var(--theme-primary)]" />
              最新照片
            </h2>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[var(--theme-secondary)]">
                <p className="text-sm text-[var(--theme-text-muted)] mb-2">暂无照片</p>
                <Link href="/photos/new" className="text-[var(--theme-primary)] hover:underline text-sm">
                  上传第一张照片 →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 页脚 */}
      <footer className="border-t border-[var(--theme-border)] py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-[var(--theme-text-muted)]">
          <p>© 2024 小天使的成长记录 · 用爱记录每一个瞬间</p>
        </div>
      </footer>
    </div>
  )
}
