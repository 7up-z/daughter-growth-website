"use client"

import Link from "next/link"
import { BookOpen, Camera, Video, Heart } from "lucide-react"

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

      {/* Hero 区域 */}
      <section className="py-24 lg:py-32">
        <div className="max-w-5xl mx-auto px-6">
          <div className="max-w-2xl">
            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-6">
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

      {/* 功能介绍 */}
      <section className="py-16 border-t border-[var(--theme-border)]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-[var(--theme-bg-tertiary)] flex items-center justify-center flex-shrink-0">
                <Video className="w-5 h-5 text-[var(--theme-text-secondary)]" />
              </div>
              <div>
                <h3 className="font-medium mb-1">生日视频</h3>
                <p className="text-sm text-[var(--theme-text-muted)]">
                  记录每一年生日
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-[var(--theme-bg-tertiary)] flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-5 h-5 text-[var(--theme-text-secondary)]" />
              </div>
              <div>
                <h3 className="font-medium mb-1">旅行日记</h3>
                <p className="text-sm text-[var(--theme-text-muted)]">
                  珍藏旅途回忆
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-[var(--theme-bg-tertiary)] flex items-center justify-center flex-shrink-0">
                <Camera className="w-5 h-5 text-[var(--theme-text-secondary)]" />
              </div>
              <div>
                <h3 className="font-medium mb-1">摄影记录</h3>
                <p className="text-sm text-[var(--theme-text-muted)]">
                  定格美好瞬间
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-[var(--theme-bg-tertiary)] flex items-center justify-center flex-shrink-0">
                <Heart className="w-5 h-5 text-[var(--theme-text-secondary)]" />
              </div>
              <div>
                <h3 className="font-medium mb-1">留言板</h3>
                <p className="text-sm text-[var(--theme-text-muted)]">
                  写下想说的话
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 页脚 */}
      <footer className="border-t border-[var(--theme-border)] py-8">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex justify-between items-center text-sm text-[var(--theme-text-muted)]">
            <span>成长记录</span>
            <span>Since 2019</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
