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
  Calendar,
  Star
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
            <div className="w-16 h-16 border-4 border-[var(--theme-primary)] mx-auto mb-4" />
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
      subtitle: "记录每一年的成长",
      icon: Video,
      year: "2019-2024"
    },
    {
      href: "/travel",
      title: "旅行日记",
      subtitle: "珍藏旅途回忆",
      icon: BookOpen,
      year: "游记"
    },
    {
      href: "/photos",
      title: "摄影记录",
      subtitle: "定格美好瞬间",
      icon: Camera,
      year: "相册"
    }
  ]

  return (
    <div className="min-h-screen bg-[var(--theme-background)]">
      {/* 复古导航栏 */}
      <header className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center space-x-3">
              <div className="w-10 h-10 border-2 border-[var(--theme-primary)] flex items-center justify-center bg-[var(--theme-surface)]">
                <Heart className="w-5 h-5 text-[var(--theme-primary)]" />
              </div>
              <div>
                <span className="text-lg font-semibold tracking-wide text-[var(--theme-text)]">
                  成长记录
                </span>
                <span className="block text-[10px] uppercase tracking-[0.3em] text-[var(--theme-text-muted)]">
                  Since 2019
                </span>
              </div>
            </Link>

            {/* 桌面端导航 */}
            <nav className="hidden md:flex items-center space-x-8">
              {menuItems.slice(0, 5).map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm text-[var(--theme-text)] hover:text-[var(--theme-primary)] transition-colors tracking-wide"
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
                  <p className="text-sm font-medium text-[var(--theme-text)]">
                    {session.user.nickname || session.user.username}
                  </p>
                  <p className="text-xs text-[var(--theme-text-muted)] uppercase tracking-wider">
                    {(session.user as any).role === 'admin' ? '管理员' : '家庭成员'}
                  </p>
                </div>
                {session.user.avatar ? (
                  <div className="w-10 h-10 border-2 border-[var(--theme-primary)] p-0.5 bg-[var(--theme-surface)]">
                    <img
                      src={session.user.avatar}
                      alt={session.user.nickname || session.user.username}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-10 h-10 border-2 border-[var(--theme-primary)] flex items-center justify-center bg-[var(--theme-surface)]">
                    <User className="w-5 h-5 text-[var(--theme-primary)]" />
                  </div>
                )}
              </Link>

              {/* 退出登录 */}
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="p-2 hover:bg-[var(--theme-secondary)] transition-colors"
                title="退出登录"
              >
                <LogOut className="w-5 h-5 text-[var(--theme-text-muted)]" />
              </button>

              {/* 移动端菜单按钮 */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 hover:bg-[var(--theme-secondary)] transition-colors"
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
          <div className="md:hidden border-t-2 border-[var(--theme-border)] bg-[var(--theme-surface)]">
            <nav className="px-6 py-4 space-y-1">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-3 px-4 py-3 text-[var(--theme-text)] hover:bg-[var(--theme-secondary)] transition-colors border-b border-[var(--theme-border)] last:border-0"
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              ))}
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors"
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
        {/* 复古 Hero 区域 */}
        <section className="relative py-16 lg:py-24">
          <div className="max-w-4xl mx-auto px-6 text-center">
            {/* 装饰线 */}
            <div className="vintage-ornament mb-8">
              <Star className="w-4 h-4 text-[var(--theme-primary)]" />
            </div>
            
            <span className="vintage-subtitle mb-4 block">
              Family Memories
            </span>
            
            <h1 className="vintage-title text-4xl lg:text-5xl mb-6 text-[var(--theme-text)]">
              欢迎回来，
              <span className="block mt-2 text-[var(--theme-primary)]">
                {session.user.nickname || session.user.username}
              </span>
            </h1>
            
            <div className="vintage-divider mx-auto" />
            
            <p className="text-lg text-[var(--theme-text-muted)] mb-8 max-w-lg mx-auto">
              时光荏苒，岁月如歌。在这里记录女儿成长的每一个珍贵瞬间。
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/travel/new"
                className="btn-primary inline-flex items-center space-x-2"
              >
                <BookOpen className="w-4 h-4" />
                <span>写日记</span>
              </Link>
              <Link
                href="/photos/new"
                className="inline-flex items-center space-x-2 px-6 py-3 border-2 border-[var(--theme-dark)] text-[var(--theme-dark)] hover:bg-[var(--theme-dark)] hover:text-[var(--theme-surface)] transition-all"
              >
                <Camera className="w-4 h-4" />
                <span>传照片</span>
              </Link>
            </div>

            {/* 装饰线 */}
            <div className="vintage-ornament mt-12">
              <Calendar className="w-4 h-4 text-[var(--theme-primary)]" />
            </div>
          </div>
        </section>

        {/* 功能入口 - 复古卡片 */}
        <section className="py-12 bg-[var(--theme-surface)] border-y-2 border-[var(--theme-border)]">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-12">
              <span className="vintage-subtitle mb-4 block">Features</span>
              <h2 className="vintage-title text-3xl">功能入口</h2>
              <div className="vintage-divider mx-auto mt-4" />
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Link
                  key={feature.href}
                  href={feature.href}
                  className="group bg-[var(--theme-background)] card-hover p-8 text-center"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* 年份标签 */}
                  <span className="vintage-tag mb-6 inline-block">
                    {feature.year}
                  </span>
                  
                  {/* 图标 */}
                  <div className="w-16 h-16 mx-auto mb-6 border-2 border-[var(--theme-primary)] flex items-center justify-center bg-[var(--theme-surface)] group-hover:bg-[var(--theme-primary)] transition-colors">
                    <feature.icon className="w-8 h-8 text-[var(--theme-primary)] group-hover:text-white transition-colors" />
                  </div>
                  
                  {/* 内容 */}
                  <h3 className="text-xl font-semibold mb-2 text-[var(--theme-text)]">
                    {feature.title}
                  </h3>
                  <p className="text-[var(--theme-text-muted)] text-sm">
                    {feature.subtitle}
                  </p>
                  
                  {/* 箭头 */}
                  <div className="mt-6 text-[var(--theme-primary)] opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-sm tracking-widest">进入查看 →</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* 最新动态 - 复古列表 */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-6">
            <div className="text-center mb-12">
              <span className="vintage-subtitle mb-4 block">Recent</span>
              <h2 className="vintage-title text-3xl">最新动态</h2>
              <div className="vintage-divider mx-auto mt-4" />
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* 最新日记 */}
              <div className="vintage-frame">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-[var(--theme-border)]">
                  <h3 className="text-lg font-semibold">最新日记</h3>
                  <Link 
                    href="/travel" 
                    className="text-sm text-[var(--theme-primary)] hover:underline"
                  >
                    查看全部 →
                  </Link>
                </div>
                <div className="py-8 text-center">
                  <p className="text-[var(--theme-text-muted)] mb-4">
                    暂无日记，开始记录第一篇吧！
                  </p>
                  <Link 
                    href="/travel/new"
                    className="text-[var(--theme-primary)] hover:underline text-sm"
                  >
                    写第一篇日记 →
                  </Link>
                </div>
              </div>

              {/* 最新照片 */}
              <div className="vintage-frame">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-[var(--theme-border)]">
                  <h3 className="text-lg font-semibold">最新照片</h3>
                  <Link 
                    href="/photos" 
                    className="text-sm text-[var(--theme-primary)] hover:underline"
                  >
                    查看全部 →
                  </Link>
                </div>
                <div className="py-8 text-center">
                  <p className="text-[var(--theme-text-muted)] mb-4">
                    暂无照片，上传第一张照片吧！
                  </p>
                  <Link 
                    href="/photos/new"
                    className="text-[var(--theme-primary)] hover:underline text-sm"
                  >
                    上传第一张照片 →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 复古页脚 */}
      <footer className="bg-[var(--theme-dark)] text-[var(--theme-surface)] py-12 border-t-4 border-[var(--theme-primary)]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="vintage-ornament mb-6 text-[var(--theme-surface)]/50">
            <Heart className="w-4 h-4" />
          </div>
          <p className="text-lg font-light tracking-wide mb-2">
            女儿成长记录
          </p>
          <p className="text-sm text-[var(--theme-surface)]/60">
            © 2019-2024 · 用爱记录每一个瞬间
          </p>
        </div>
      </footer>
    </div>
  )
}
