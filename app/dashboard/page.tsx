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
  LogOut,
  Menu,
  X,
  MessageCircle,
  Sparkles
} from "lucide-react"
import { signOut } from "next-auth/react"

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--theme-background)]">
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

  const features = [
    {
      href: "/birthday",
      title: "生日视频",
      subtitle: "记录每年的成长",
      icon: Video,
      color: "from-rose-400 to-orange-400",
      image: "🎂"
    },
    {
      href: "/travel",
      title: "旅行日记",
      subtitle: "珍藏旅途回忆",
      icon: BookOpen,
      color: "from-cyan-400 to-blue-500",
      image: "✈️"
    },
    {
      href: "/photos",
      title: "摄影记录",
      subtitle: "定格美好瞬间",
      icon: Camera,
      color: "from-violet-400 to-purple-500",
      image: "📸"
    }
  ]

  return (
    <div className="min-h-screen bg-[var(--theme-background)]">
      {/* 杂志风导航栏 */}
      <header className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[var(--theme-primary)] to-[var(--theme-accent)] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-[var(--theme-text)]">
                  成长记录
                </span>
                <span className="block text-[10px] uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">
                  Growth Diary
                </span>
              </div>
            </Link>

            {/* 桌面端导航 */}
            <nav className="hidden md:flex items-center space-x-8">
              {menuItems.slice(0, 5).map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm font-medium text-[var(--theme-text)] hover:text-[var(--theme-primary)] transition-colors tracking-wide"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* 右侧操作区 */}
            <div className="flex items-center space-x-4">
              {/* 用户头像 */}
              <Link
                href="/profile"
                className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold text-[var(--theme-text)]">
                    {session.user.nickname || session.user.username}
                  </p>
                  <p className="text-xs text-[var(--theme-text-muted)] uppercase tracking-wider">
                    {(session.user as any).role === 'admin' ? '管理员' : '用户'}
                  </p>
                </div>
                {session.user.avatar ? (
                  <img
                    src={session.user.avatar}
                    alt={session.user.nickname || session.user.username}
                    className="w-10 h-10 object-cover border-2 border-[var(--theme-primary)]"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gradient-to-br from-[var(--theme-primary)] to-[var(--theme-accent)] flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                )}
              </Link>

              {/* 退出登录 */}
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="p-2 hover:bg-black/5 transition-colors"
                title="退出登录"
              >
                <LogOut className="w-5 h-5 text-[var(--theme-text-muted)]" />
              </button>

              {/* 移动端菜单按钮 */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 hover:bg-black/5 transition-colors"
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
          <div className="md:hidden border-t border-[var(--theme-border)] bg-white">
            <nav className="px-6 py-4 space-y-1">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-3 px-4 py-3 text-[var(--theme-text)] hover:bg-[var(--theme-secondary)] transition-colors"
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              ))}
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="w-full flex items-center space-x-3 px-4 py-3 text-red-500 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>退出登录</span>
              </button>
            </nav>
          </div>
        )}
      </header>

      {/* 主内容区 */}
      <main className="pt-20">
        {/* 杂志风 Hero 区域 */}
        <section className="relative py-20 lg:py-32 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* 左侧文字 */}
              <div className="animate-fade-in">
                <span className="magazine-subtitle mb-4 block">
                  Welcome Back
                </span>
                <h1 className="magazine-title text-5xl lg:text-7xl mb-6">
                  欢迎回来，
                  <br />
                  <span className="gradient-text">
                    {session.user.nickname || session.user.username}
                  </span>
                </h1>
                <div className="magazine-divider" />
                <p className="text-lg text-[var(--theme-text-muted)] mb-8 max-w-md">
                  今天想要记录什么美好瞬间呢？每一个成长的足迹都值得被珍藏。
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link
                    href="/travel/new"
                    className="btn-primary inline-flex items-center space-x-2"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>写日记</span>
                  </Link>
                  <Link
                    href="/photos/new"
                    className="inline-flex items-center space-x-2 px-6 py-3 border-2 border-[var(--theme-text)] text-[var(--theme-text)] hover:bg-[var(--theme-text)] hover:text-white transition-all"
                  >
                    <Camera className="w-4 h-4" />
                    <span>传照片</span>
                  </Link>
                </div>
              </div>

              {/* 右侧装饰 */}
              <div className="hidden lg:flex justify-center items-center animate-float">
                <div className="relative">
                  <div className="w-80 h-80 bg-gradient-to-br from-[var(--theme-primary)] to-[var(--theme-accent)] opacity-20 blur-3xl absolute" />
                  <div className="relative bg-white p-8 shadow-2xl">
                    <div className="text-8xl mb-4">👧</div>
                    <p className="text-center text-[var(--theme-text-muted)] italic">
                      "记录每一个成长的瞬间"
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 功能入口 - 杂志风卡片 */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-12">
              <span className="magazine-subtitle mb-4 block">Features</span>
              <h2 className="magazine-title text-4xl">功能入口</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Link
                  key={feature.href}
                  href={feature.href}
                  className="group relative overflow-hidden bg-[var(--theme-background)] card-hover"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* 渐变背景 */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                  
                  <div className="relative p-8">
                    {/* 图标 */}
                    <div className="text-5xl mb-6">{feature.image}</div>
                    
                    {/* 内容 */}
                    <h3 className="text-2xl font-bold mb-2 text-[var(--theme-text)]">
                      {feature.title}
                    </h3>
                    <p className="text-[var(--theme-text-muted)] mb-6">
                      {feature.subtitle}
                    </p>
                    
                    {/* 箭头 */}
                    <div className="flex items-center text-[var(--theme-primary)] font-medium">
                      <span className="mr-2">进入查看</span>
                      <span className="transform group-hover:translate-x-2 transition-transform">→</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* 最新动态 - 杂志风列表 */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12">
              {/* 最新日记 */}
              <div>
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <span className="magazine-subtitle mb-2 block">Latest</span>
                    <h3 className="text-2xl font-bold">最新日记</h3>
                  </div>
                  <Link 
                    href="/travel" 
                    className="text-sm text-[var(--theme-primary)] hover:underline"
                  >
                    查看全部 →
                  </Link>
                </div>
                <div className="bg-white p-8 shadow-lg">
                  <p className="text-[var(--theme-text-muted)] text-center py-8">
                    暂无日记，开始记录第一篇吧！
                  </p>
                  <Link 
                    href="/travel/new"
                    className="block text-center text-[var(--theme-primary)] hover:underline"
                  >
                    写第一篇日记 →
                  </Link>
                </div>
              </div>

              {/* 最新照片 */}
              <div>
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <span className="magazine-subtitle mb-2 block">Gallery</span>
                    <h3 className="text-2xl font-bold">最新照片</h3>
                  </div>
                  <Link 
                    href="/photos" 
                    className="text-sm text-[var(--theme-primary)] hover:underline"
                  >
                    查看全部 →
                  </Link>
                </div>
                <div className="bg-white p-8 shadow-lg">
                  <p className="text-[var(--theme-text-muted)] text-center py-8">
                    暂无照片，上传第一张照片吧！
                  </p>
                  <Link 
                    href="/photos/new"
                    className="block text-center text-[var(--theme-primary)] hover:underline"
                  >
                    上传第一张照片 →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 杂志风页脚 */}
      <footer className="bg-[var(--theme-dark)] text-white py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <span className="text-2xl font-bold tracking-tight">成长记录</span>
              <p className="text-sm text-gray-400 mt-1">记录每一个美好瞬间</p>
            </div>
            <p className="text-sm text-gray-400">
              © 2024 女儿成长记录 · 用爱记录成长
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
