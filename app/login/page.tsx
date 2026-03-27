"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Heart, Sparkles, Camera, BookOpen } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
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
        // 登录
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
        // 注册
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
          // 注册成功后自动登录
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
    } catch (err) {
      setError("操作失败，请稍后重试")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* 左侧装饰区域 */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 gradient-bg" />
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-20 w-32 h-32 rounded-full bg-[var(--theme-primary)] blur-3xl" />
          <div className="absolute bottom-20 right-20 w-48 h-48 rounded-full bg-[var(--theme-accent)] blur-3xl" />
          <div className="absolute top-1/2 left-1/3 w-24 h-24 rounded-full bg-[var(--theme-primary)] blur-2xl" />
        </div>
        
        <div className="relative z-10 flex flex-col justify-center items-center w-full px-12">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-[var(--theme-surface)] flex items-center justify-center shadow-xl">
                  <Heart className="w-12 h-12 text-[var(--theme-primary)]" />
                </div>
                <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-[var(--theme-accent)]" />
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-4 gradient-text">
              小天使的成长记录
            </h1>
            <p className="text-lg text-[var(--theme-text-muted)] mb-8">
              记录每一个美好瞬间，珍藏每一份成长记忆
            </p>
            
            <div className="grid grid-cols-3 gap-6 mt-12">
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-xl bg-[var(--theme-surface)] flex items-center justify-center mb-3 shadow-lg">
                  <Camera className="w-7 h-7 text-[var(--theme-primary)]" />
                </div>
                <span className="text-sm text-[var(--theme-text-muted)]">生日视频</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-xl bg-[var(--theme-surface)] flex items-center justify-center mb-3 shadow-lg">
                  <BookOpen className="w-7 h-7 text-[var(--theme-primary)]" />
                </div>
                <span className="text-sm text-[var(--theme-text-muted)]">旅行日记</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-xl bg-[var(--theme-surface)] flex items-center justify-center mb-3 shadow-lg">
                  <Sparkles className="w-7 h-7 text-[var(--theme-primary)]" />
                </div>
                <span className="text-sm text-[var(--theme-text-muted)]">摄影记录</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 右侧登录表单 */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* 移动端标题 */}
          <div className="lg:hidden text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-[var(--theme-primary)] flex items-center justify-center">
                <Heart className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold gradient-text">小天使的成长记录</h1>
          </div>

          <div className="bg-[var(--theme-surface)] rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-center mb-2">
              {isLogin ? "欢迎回来" : "创建账户"}
            </h2>
            <p className="text-[var(--theme-text-muted)] text-center mb-6">
              {isLogin ? "登录以查看精彩内容" : "开始记录美好时光"}
            </p>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">用户名</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="input-field w-full"
                  placeholder="请输入用户名"
                  required
                />
              </div>

              {!isLogin && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">邮箱</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="input-field w-full"
                      placeholder="请输入邮箱"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">昵称（可选）</label>
                    <input
                      type="text"
                      value={formData.nickname}
                      onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                      className="input-field w-full"
                      placeholder="设置一个可爱的昵称"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">密码</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="input-field w-full"
                  placeholder="请输入密码"
                  required
                />
              </div>

              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium mb-2">确认密码</label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="input-field w-full"
                    placeholder="再次输入密码"
                    required
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "请稍候..." : isLogin ? "登录" : "注册"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-[var(--theme-text-muted)]">
                {isLogin ? "还没有账户？" : "已有账户？"}
                <button
                  onClick={() => {
                    setIsLogin(!isLogin)
                    setError("")
                  }}
                  className="ml-1 text-[var(--theme-primary)] hover:underline font-medium"
                >
                  {isLogin ? "立即注册" : "立即登录"}
                </button>
              </p>
            </div>
          </div>

          <p className="text-center mt-6 text-sm text-[var(--theme-text-muted)]">
            登录即表示您同意我们的服务条款
          </p>
        </div>
      </div>
    </div>
  )
}
