"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { Heart, User, Camera, ChevronLeft, Upload, Save, Palette } from "lucide-react"
import { useTheme, themes, Theme } from "@/components/providers/theme-provider"

interface UserProfile {
  id: string
  username: string
  email: string
  nickname: string | null
  avatar: string | null
  theme: string
  createdAt: string
}

export default function ProfilePage() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [formData, setFormData] = useState({
    nickname: "",
    avatar: "",
  })
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  const fetchProfile = useCallback(async () => {
    try {
      const response = await fetch("/api/user/profile")
      if (response.ok) {
        const data = await response.json()
        setProfile(data)
        setFormData({
          nickname: data.nickname || "",
          avatar: data.avatar || "",
        })
      }
    } catch (error) {
      console.error("获取用户信息失败:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!session?.user) return

    const timer = window.setTimeout(() => {
      void fetchProfile()
    }, 0)
    return () => window.clearTimeout(timer)
  }, [session, fetchProfile])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      setMessage("只能上传图片文件")
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setMessage("图片大小不能超过10MB")
      return
    }

    setAvatarUploading(true)
    setMessage("")

    try {
      const uploadFormData = new FormData()
      uploadFormData.append("image", file)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: uploadFormData,
      })
      const data = await response.json()

      if (response.ok) {
        setFormData({ ...formData, avatar: data.url })
        setMessage("头像上传成功，请保存修改")
      } else {
        setMessage(data.error || "头像上传失败")
      }
    } catch (error) {
      console.error("头像上传失败:", error)
      setMessage("头像上传失败，请重试")
    } finally {
      setAvatarUploading(false)
      e.target.value = ""
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage("")

    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const data = await response.json()
        setProfile(data)
        setMessage("保存成功！")
        // 更新session
        await update({
          ...session,
          user: {
            ...session?.user,
            nickname: data.nickname,
            avatar: data.avatar,
          },
        })
      } else {
        setMessage("保存失败，请重试")
      }
    } catch (error) {
      setMessage("保存失败，请重试")
    } finally {
      setSaving(false)
    }
  }

  if (status === "loading" || loading) {
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

  if (!session || !profile) {
    return null
  }

  return (
    <div className="min-h-screen">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-50 glass border-b border-[var(--theme-border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard"
                className="p-2 rounded-lg hover:bg-[var(--theme-secondary)] transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </Link>
              <Link href="/dashboard" className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-[var(--theme-primary)] flex items-center justify-center">
                  <Heart className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold hidden sm:block">成长记录</span>
              </Link>
            </div>
            <h1 className="text-lg font-semibold">个人中心</h1>
            <div className="w-20" />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面标题 */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[var(--theme-secondary)] mb-6">
            <User className="w-10 h-10 text-[var(--theme-primary)]" />
          </div>
          <h1 className="text-3xl font-bold mb-4">个人中心</h1>
          <p className="text-[var(--theme-text-muted)]">
            管理您的个人资料和偏好设置
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧：头像和基本信息 */}
          <div className="lg:col-span-1">
            <div className="bg-[var(--theme-surface)] rounded-2xl p-6 shadow-lg border border-[var(--theme-border)]">
              <div className="text-center">
                {/* 头像上传 */}
                <div className="relative inline-block mb-4">
                  <button
                    type="button"
                    onClick={() => document.getElementById("avatar-upload")?.click()}
                    disabled={avatarUploading}
                    className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-[var(--theme-primary)] hover:opacity-80 transition-opacity disabled:opacity-60"
                  >
                    {formData.avatar ? (
                      <img
                        src={formData.avatar}
                        alt="头像"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-[var(--theme-secondary)] flex items-center justify-center">
                        <User className="w-16 h-16 text-[var(--theme-text-muted)]" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <Camera className="w-8 h-8 text-white" />
                    </div>
                  </button>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => document.getElementById("avatar-upload")?.click()}
                    disabled={avatarUploading}
                    className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-[var(--theme-primary)] text-white flex items-center justify-center shadow-lg hover:bg-[var(--theme-accent)] transition-colors disabled:opacity-60"
                  >
                    {avatarUploading ? (
                      <div className="w-5 h-5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                    ) : (
                      <Upload className="w-5 h-5" />
                    )}
                  </button>
                </div>

                <h2 className="text-xl font-bold mb-1">
                  {profile.nickname || profile.username}
                </h2>
                <p className="text-[var(--theme-text-muted)] text-sm mb-4">
                  @{profile.username}
                </p>

                <div className="text-sm text-[var(--theme-text-muted)]">
                  <p>注册时间</p>
                  <p className="font-medium text-[var(--theme-text)]">
                    {new Date(profile.createdAt).toLocaleDateString("zh-CN")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 右侧：设置表单 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 个人资料 */}
            <div className="bg-[var(--theme-surface)] rounded-2xl p-6 shadow-lg border border-[var(--theme-border)]">
              <h3 className="text-lg font-bold mb-6 flex items-center">
                <User className="w-5 h-5 mr-2 text-[var(--theme-primary)]" />
                个人资料
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">用户名</label>
                  <input
                    type="text"
                    value={profile.username}
                    disabled
                    className="input-field w-full bg-[var(--theme-secondary)] cursor-not-allowed"
                  />
                  <p className="text-xs text-[var(--theme-text-muted)] mt-1">
                    用户名不可修改
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">邮箱</label>
                  <input
                    type="email"
                    value={profile.email}
                    disabled
                    className="input-field w-full bg-[var(--theme-secondary)] cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">昵称</label>
                  <input
                    type="text"
                    value={formData.nickname}
                    onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                    className="input-field w-full"
                    placeholder="设置一个可爱的昵称"
                  />
                </div>
              </div>
            </div>

            {/* 主题设置 */}
            <div className="bg-[var(--theme-surface)] rounded-2xl p-6 shadow-lg border border-[var(--theme-border)]">
              <h3 className="text-lg font-bold mb-6 flex items-center">
                <Palette className="w-5 h-5 mr-2 text-[var(--theme-primary)]" />
                主题风格
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {(Object.keys(themes) as Theme[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTheme(t)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      theme === t
                        ? "border-[var(--theme-primary)] bg-[var(--theme-secondary)]"
                        : "border-[var(--theme-border)] hover:border-[var(--theme-primary)]"
                    }`}
                  >
                    <div
                      className="w-full h-12 rounded-lg mb-3"
                      style={{
                        background: `linear-gradient(135deg, ${themes[t].colors.primary} 0%, ${themes[t].colors.secondary} 100%)`,
                      }}
                    />
                    <p className="font-medium text-sm">{themes[t].name}</p>
                    {theme === t && (
                      <p className="text-xs text-[var(--theme-primary)] mt-1">当前使用</p>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* 保存按钮 */}
            <div className="flex items-center justify-between">
              {message && (
                <p className={`text-sm ${message.includes("成功") ? "text-green-600" : "text-red-600"}`}>
                  {message}
                </p>
              )}
              <div className="ml-auto">
                <button
                  onClick={handleSave}
                  disabled={saving || avatarUploading}
                  className="btn-primary flex items-center space-x-2 disabled:opacity-50"
                >
                  <Save className="w-5 h-5" />
                  <span>{saving ? "保存中..." : "保存修改"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
