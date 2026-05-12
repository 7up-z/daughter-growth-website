"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { User, Camera, Upload, Save, Palette } from "lucide-react"
import { useTheme, themes, Theme } from "@/components/providers/theme-provider"
import { ThemedHeader, ThemedLoading, ThemedPageHero, ThemedShell, useCurrentThemeStyle } from "@/components/ui/theme-shell"
import { appThemeStyles, themeOrder } from "@/lib/app-theme"

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
  const current = useCurrentThemeStyle()
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
    } catch {
      setMessage("保存失败，请重试")
    } finally {
      setSaving(false)
    }
  }

  if (status === "loading" || loading) {
    return <ThemedLoading label="正在加载..." />
  }

  if (!session || !profile) {
    return null
  }

  return (
    <ThemedShell maxWidth="max-w-4xl">
      <ThemedHeader title="个人中心" />

      <main>
        <ThemedPageHero
          eyebrow="Profile"
          title="个人中心"
          description="管理昵称、头像和主题风格，让每个页面都保持同一套家庭相册氛围。"
          icon={<User className="h-4 w-4" />}
        />

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* 左侧：头像和基本信息 */}
          <div className="lg:col-span-1">
            <div className={`rounded-[2rem] border p-6 ${current.card}`}>
              <div className="text-center">
                {/* 头像上传 */}
                <div className="relative inline-block mb-4">
                  <button
                    type="button"
                    onClick={() => document.getElementById("avatar-upload")?.click()}
                    disabled={avatarUploading}
                    className="relative h-32 w-32 overflow-hidden rounded-full border-4 border-current/20 transition-opacity hover:opacity-80 disabled:opacity-60"
                  >
                    {formData.avatar ? (
                      <img
                        src={formData.avatar}
                        alt="头像"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className={`flex h-full w-full items-center justify-center ${current.preview}`}>
                        <User className="w-16 h-16 opacity-55" />
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
                    className={`absolute bottom-0 right-0 flex h-10 w-10 items-center justify-center rounded-full shadow-lg transition disabled:opacity-60 ${current.cardIcon}`}
                  >
                    {avatarUploading ? (
                      <div className="w-5 h-5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                    ) : (
                      <Upload className="w-5 h-5" />
                    )}
                  </button>
                </div>

                <h2 className="mb-1 text-xl font-black">
                  {profile.nickname || profile.username}
                </h2>
                <p className={`mb-4 text-sm ${current.secondaryText}`}>
                  @{profile.username}
                </p>

                <div className={`text-sm ${current.secondaryText}`}>
                  <p>注册时间</p>
                  <p className="font-black">
                    {new Date(profile.createdAt).toLocaleDateString("zh-CN")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 右侧：设置表单 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 个人资料 */}
            <div className={`rounded-[2rem] border p-6 ${current.card}`}>
              <h3 className="mb-6 flex items-center text-lg font-black">
                <User className="mr-2 h-5 w-5" />
                个人资料
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">用户名</label>
                  <input
                    type="text"
                    value={profile.username}
                    disabled
                    className="input cursor-not-allowed opacity-70"
                  />
                  <p className={`mt-1 text-xs ${current.secondaryText}`}>
                    用户名不可修改
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">邮箱</label>
                  <input
                    type="email"
                    value={profile.email}
                    disabled
                    className="input cursor-not-allowed opacity-70"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">昵称</label>
                  <input
                    type="text"
                    value={formData.nickname}
                    onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                    className="input"
                    placeholder="设置一个可爱的昵称"
                  />
                </div>
              </div>
            </div>

            {/* 主题设置 */}
            <div className={`rounded-[2rem] border p-6 ${current.card}`}>
              <h3 className="mb-6 flex items-center text-lg font-black">
                <Palette className="mr-2 h-5 w-5" />
                主题风格
              </h3>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {themeOrder.map((t: Theme) => (
                  <button
                    key={t}
                    onClick={() => setTheme(t)}
                    className={`rounded-[1.25rem] border p-4 text-left transition ${
                      theme === t
                        ? `${appThemeStyles[t].pickerCard} ring-4 ring-current/15`
                        : appThemeStyles[t].pickerCard
                    }`}
                  >
                    <div
                      className="w-full h-12 rounded-lg mb-3"
                      style={{
                        background: `linear-gradient(135deg, ${themes[t].colors.primary} 0%, ${themes[t].colors.secondary} 100%)`,
                      }}
                    />
                    <p className="text-sm font-black">{themes[t].name}</p>
                    {theme === t && (
                      <p className="mt-1 text-xs font-bold opacity-70">当前使用</p>
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
                  className={`inline-flex items-center gap-2 rounded-full px-6 py-3 font-black transition disabled:opacity-60 ${current.primaryButton}`}
                >
                  <Save className="w-5 h-5" />
                  <span>{saving ? "保存中..." : "保存修改"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </ThemedShell>
  )
}
