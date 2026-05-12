"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Heart, LockKeyhole, Sparkles, UserRound } from "lucide-react"
import { ThemedShell, useCurrentThemeStyle } from "@/components/ui/theme-shell"

export default function LoginPage() {
  const router = useRouter()
  const current = useCurrentThemeStyle()
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    nickname: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      if (isLogin) {
        const result = await signIn("credentials", {
          username: formData.username,
          password: formData.password,
          redirect: false,
        })

        if (result?.error) {
          setError("用户名或密码错误")
        } else {
          router.push("/dashboard")
          router.refresh()
        }
      } else {
        if (formData.password !== formData.confirmPassword) {
          setError("两次输入的密码不一致")
          setLoading(false)
          return
        }

        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: formData.username,
            email: formData.email,
            password: formData.password,
            nickname: formData.nickname || formData.username,
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          setError(data.error || "注册失败")
        } else {
          const result = await signIn("credentials", {
            username: formData.username,
            password: formData.password,
            redirect: false,
          })

          if (result?.error) {
            setError("注册成功但登录失败，请手动登录")
            setIsLogin(true)
          } else {
            router.push("/dashboard")
            router.refresh()
          }
        }
      }
    } catch {
      setError("操作失败，请稍后重试")
    } finally {
      setLoading(false)
    }
  }

  return (
    <ThemedShell maxWidth="max-w-6xl">
      <div className="grid min-h-[calc(100vh-2rem)] items-center gap-6 py-6 lg:grid-cols-[1fr_0.9fr]">
        <section className={`relative overflow-hidden rounded-[2rem] border px-6 py-10 sm:px-10 lg:min-h-[620px] ${current.hero}`}>
          <div className={`absolute inset-0 bg-gradient-to-br ${current.heroGlow}`} />
          <div className="absolute -left-16 top-10 h-44 w-44 rounded-full border border-current/10" />
          <div className="relative flex h-full flex-col justify-between gap-14">
            <div>
              <Link href="/" className="inline-flex items-center gap-3 text-lg font-black">
                <span className={`flex h-11 w-11 items-center justify-center rounded-full ${current.cardIcon}`}>
                  <Heart className="h-5 w-5" />
                </span>
                Family Memories · 成长记录
              </Link>
              <p className={`mt-5 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold ${current.pickerCard}`}>
                <Sparkles className="h-4 w-4" />
                家人专属入口
              </p>
              <h1 className="mt-5 max-w-2xl text-4xl font-black leading-tight tracking-tight sm:text-5xl">
                登录后继续收藏每一个值得纪念的日子。
              </h1>
              <p className={`mt-5 max-w-xl text-base leading-8 ${current.secondaryText}`}>
                旅行、照片、生日影像和留言都会保存在同一个家庭记忆空间里。
              </p>
            </div>
            <div className={`grid gap-3 rounded-[1.5rem] border p-4 ${current.pickerCard}`}>
              {["邀请制访问", "相册权限", "主题随个人资料同步"].map((item) => (
                <div key={item} className="flex items-center gap-3 text-sm font-semibold">
                  <span className={`flex h-9 w-9 items-center justify-center rounded-full ${current.cardIcon}`}>
                    <LockKeyhole className="h-4 w-4" />
                  </span>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className={`rounded-[2rem] border p-6 sm:p-8 ${current.card}`}>
          <div className="mb-8 flex items-center justify-between gap-4">
            <div>
              <p className={`text-sm font-bold uppercase tracking-[0.18em] ${current.secondaryText}`}>
                {isLogin ? "Welcome back" : "Join family"}
              </p>
              <h2 className="mt-2 text-3xl font-black tracking-tight">
                {isLogin ? "登录" : "注册"}
              </h2>
            </div>
            <span className={`flex h-12 w-12 items-center justify-center rounded-full ${current.cardIcon}`}>
              <UserRound className="h-6 w-6" />
            </span>
          </div>

          {error && (
            <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-bold">用户名</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="input"
                placeholder="请输入用户名"
                required
              />
            </div>

            {!isLogin && (
              <>
                <div>
                  <label className="mb-2 block text-sm font-bold">邮箱</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input"
                    placeholder="请输入邮箱"
                    required
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-bold">昵称（可选）</label>
                  <input
                    type="text"
                    value={formData.nickname}
                    onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                    className="input"
                    placeholder="设置一个昵称"
                  />
                </div>
              </>
            )}

            <div>
              <label className="mb-2 block text-sm font-bold">密码</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="input"
                placeholder="请输入密码"
                required
              />
            </div>

            {!isLogin && (
              <div>
                <label className="mb-2 block text-sm font-bold">确认密码</label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="input"
                  placeholder="再次输入密码"
                  required
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`mt-6 inline-flex w-full items-center justify-center rounded-full px-6 py-3 text-base font-black transition disabled:opacity-60 ${current.primaryButton}`}
            >
              {loading ? "请稍候..." : isLogin ? "登录" : "注册"}
            </button>
          </form>

          <div className="mt-6 border-t border-current/15 pt-6 text-center">
            <p className={`text-sm ${current.secondaryText}`}>
              {isLogin ? "还没有账户？" : "已有账户？"}
              <button
                onClick={() => {
                  setIsLogin(!isLogin)
                  setError("")
                }}
                className="ml-1 font-black underline underline-offset-4"
              >
                {isLogin ? "立即注册" : "立即登录"}
              </button>
            </p>
          </div>

          <Link href="/" className={`mt-8 inline-flex items-center gap-2 text-sm font-bold ${current.secondaryText}`}>
            <ArrowLeft className="h-4 w-4" />
            返回首页
          </Link>
        </section>
      </div>
    </ThemedShell>
  )
}
