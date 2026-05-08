"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"

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
    } catch (err) {
      setError("操作失败，请稍后重试")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* 极简 Logo */}
        <div className="text-center mb-12">
          <Link href="/" className="inline-block">
            <h1 className="text-2xl font-bold tracking-tight">
              成长记录
            </h1>
          </Link>
          <p className="text-[var(--theme-text-muted)] mt-2 text-sm">
            记录每一个美好瞬间
          </p>
        </div>

        {/* 表单卡片 */}
        <div className="card p-8">
          <h2 className="text-xl font-semibold mb-6">
            {isLogin ? "登录" : "注册"}
          </h2>

          {error && (
            <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">用户名</label>
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
                  <label className="block text-sm font-medium mb-1.5">邮箱</label>
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
                  <label className="block text-sm font-medium mb-1.5">昵称（可选）</label>
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
              <label className="block text-sm font-medium mb-1.5">密码</label>
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
                <label className="block text-sm font-medium mb-1.5">确认密码</label>
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
              className="btn btn-primary w-full mt-6"
            >
              {loading ? "请稍候..." : isLogin ? "登录" : "注册"}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-[var(--theme-border)] text-center">
            <p className="text-sm text-[var(--theme-text-secondary)]">
              {isLogin ? "还没有账户？" : "已有账户？"}
              <button
                onClick={() => {
                  setIsLogin(!isLogin)
                  setError("")
                }}
                className="ml-1 link-accent font-medium"
              >
                {isLogin ? "立即注册" : "立即登录"}
              </button>
            </p>
          </div>
        </div>

        {/* 底部链接 */}
        <div className="text-center mt-8">
          <Link href="/" className="text-sm text-[var(--theme-text-muted)] link">
            返回首页
          </Link>
        </div>
      </div>
    </div>
  )
}
