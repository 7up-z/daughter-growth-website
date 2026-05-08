"use client"

import Link from "next/link"
import { BookOpen, Camera, Video, Heart, ArrowRight } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* 简洁顶部导航 */}
      <header className="border-b border-[var(--theme-border)]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-lg font-semibold tracking-tight">
              成长记录
            </Link>
            <nav className="flex items-center gap-6">
              <Link
                href="/login"
                className="text-sm text-[var(--theme-text-secondary)] hover:text-[var(--theme-text)]"
              >
                登录
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero 区域 - 增加暖色调装饰 */}
      <section className="py-24 lg:py-32 relative overflow-hidden">
        {/* 装饰背景 */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-amber-100/50 to-orange-100/30 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-20 w-48 h-48 bg-gradient-to-tr from-blue-100/40 to-indigo-100/30 rounded-full blur-3xl" />
        </div>
        
        <div className="max-w-5xl mx-auto px-6 relative">
          <div className="max-w-2xl">
            <p className="text-sm font-medium text-amber-600 mb-4 tracking-wide">
              Family Memories
            </p>
            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-6 text-[var(--theme-text)]">
              成长记录
            </h1>
            <p className="text-xl text-[var(--theme-text-secondary)] leading-relaxed mb-8">
              用心记录每一个珍贵瞬间，珍藏家人共同的回忆。
            </p>
            <Link href="/login" className="btn btn-primary">
              开始记录
            </Link>
          </div>
        </div>
      </section>

      {/* 功能介绍 - 增加卡片色彩 */}
      <section className="py-16 border-t border-[var(--theme-border)] bg-gradient-to-b from-white to-gray-50/50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* 生日视频卡片 */}
            <Link 
              href="/login"
              className="group p-6 bg-white border border-[var(--theme-border)] rounded-xl hover:border-amber-200 hover:shadow-lg transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Video className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold mb-2 group-hover:text-amber-600 transition-colors">生日视频</h3>
              <p className="text-sm text-[var(--theme-text-muted)] mb-3">
                记录每一年生日
              </p>
              <span className="text-xs text-amber-600 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                前往 <ArrowRight className="w-3 h-3" />
              </span>
            </Link>

            {/* 旅行日记卡片 */}
            <Link 
              href="/login"
              className="group p-6 bg-white border border-[var(--theme-border)] rounded-xl hover:border-emerald-200 hover:shadow-lg transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold mb-2 group-hover:text-emerald-600 transition-colors">旅行日记</h3>
              <p className="text-sm text-[var(--theme-text-muted)] mb-3">
                珍藏旅途回忆
              </p>
              <span className="text-xs text-emerald-600 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                前往 <ArrowRight className="w-3 h-3" />
              </span>
            </Link>

            {/* 摄影记录卡片 */}
            <Link 
              href="/login"
              className="group p-6 bg-white border border-[var(--theme-border)] rounded-xl hover:border-blue-200 hover:shadow-lg transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Camera className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold mb-2 group-hover:text-blue-600 transition-colors">摄影记录</h3>
              <p className="text-sm text-[var(--theme-text-muted)] mb-3">
                定格美好瞬间
              </p>
              <span className="text-xs text-blue-600 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                前往 <ArrowRight className="w-3 h-3" />
              </span>
            </Link>

            {/* 留言板卡片 */}
            <Link 
              href="/login"
              className="group p-6 bg-white border border-[var(--theme-border)] rounded-xl hover:border-pink-200 hover:shadow-lg transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold mb-2 group-hover:text-pink-600 transition-colors">留言板</h3>
              <p className="text-sm text-[var(--theme-text-muted)] mb-3">
                写下想说的话
              </p>
              <span className="text-xs text-pink-600 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                前往 <ArrowRight className="w-3 h-3" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* 温馨提醒 */}
      <section className="py-12 bg-gradient-to-r from-amber-50 via-orange-50 to-rose-50">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <p className="text-[var(--theme-text-secondary)]">
            每一个平凡的日子，都值得被记录
          </p>
        </div>
      </section>

      {/* 页脚 */}
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
