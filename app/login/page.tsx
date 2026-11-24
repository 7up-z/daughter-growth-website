"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { LockKeyhole } from "lucide-react"
import { FamilyMasthead } from "@/components/ui/family-masthead"
import { ThemedShell } from "@/components/ui/theme-shell"

export default function LoginPage() {
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    invitationCode: "",
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

        if (!result?.ok || result.error) {
          setError(result?.error === "FamilyAccessRequired" ? "请联系管理员开通家庭访问权限" : "用户名或密码错误")
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
            invitationCode: formData.invitationCode.trim(),
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

          if (!result?.ok || result.error) {
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
      <FamilyMasthead publicView />
      <main className="family-login archive-main">
        <h1 className="yearbook-display">{isLogin ? "家人登录" : "接受家庭邀请"}</h1>
        <p className="mb-6 mt-2 flex items-center gap-2 text-sm text-[var(--yearbook-muted)]">
          <LockKeyhole size={16} aria-hidden="true" />
          仅受邀家人可见
        </p>
        {error && (
          <div role="alert" className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="family-username" className="mb-2 block text-sm font-bold">用户名</label>
            <input
              id="family-username"
              autoComplete="username"
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
                <label htmlFor="invitation" className="mb-2 block text-sm font-bold">家庭邀请码</label>
                <input
                  id="invitation"
                  value={formData.invitationCode}
                  onChange={(e) => setFormData({ ...formData, invitationCode: e.target.value })}
                  className="input"
                  placeholder="请输入管理员发给你的邀请码"
                  autoComplete="off"
                  required
                />
              </div>
              <div>
                <label htmlFor="family-email" className="mb-2 block text-sm font-bold">受邀邮箱</label>
                <input
                  id="family-email"
                  autoComplete="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input"
                  placeholder="请输入邮箱"
                  required
                />
              </div>
              <div>
                <label htmlFor="family-nickname" className="mb-2 block text-sm font-bold">昵称（可选）</label>
                <input
                  id="family-nickname"
                  autoComplete="nickname"
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
            <label htmlFor="family-password" className="mb-2 block text-sm font-bold">密码</label>
            <input
              id="family-password"
              autoComplete={isLogin ? "current-password" : "new-password"}
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
              <label htmlFor="family-confirm-password" className="mb-2 block text-sm font-bold">确认密码</label>
              <input
                id="family-confirm-password"
                autoComplete="new-password"
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
            className="family-button family-button-warm"
          >
            {loading ? "请稍候..." : isLogin ? "登录" : "注册"}
          </button>
        </form>

        <div className="mt-6 border-t border-current/15 pt-6 text-center">
          <p className="text-sm text-[var(--yearbook-muted)]">
            {isLogin ? "还没有账户？" : "已有账户？"}
            <button
              onClick={() => {
                setIsLogin(!isLogin)
                setError("")
              }}
              className="ml-1 font-semibold underline underline-offset-4"
            >
              {isLogin ? "使用家庭邀请码" : "立即登录"}
            </button>
          </p>
        </div>

        <Link href="/" className="family-text-link mt-5">返回首页</Link>
      </main>
    </ThemedShell>
  )
}
