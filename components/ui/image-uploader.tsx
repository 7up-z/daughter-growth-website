"use client"

import { useState, useRef } from "react"
import { Upload, X, Image as ImageIcon } from "lucide-react"

interface ImageUploaderProps {
  value: string
  onChange: (url: string) => void
  label?: string
  previewClassName?: string
}

export function ImageUploader({ value, onChange, label = "上传图片", previewClassName = "aspect-video" }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string>(value)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 验证文件类型
    if (!file.type.startsWith("image/")) {
      alert("只能上传图片文件")
      return
    }

    // 验证文件大小 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert("图片大小不能超过10MB")
      return
    }

    // 显示本地预览
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // 上传到服务器
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("image", file)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        onChange(data.url)
      } else {
        const error = await response.json()
        alert(error.error || "上传失败")
        // 恢复原来的值
        setPreview(value)
      }
    } catch (error) {
      console.error("上传错误:", error)
      alert("上传失败，请重试")
      setPreview(value)
    } finally {
      setUploading(false)
    }
  }

  const handleClear = () => {
    setPreview("")
    onChange("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">{label}</label>
      
      {preview ? (
        <div className={`relative ${previewClassName} rounded-xl overflow-hidden border border-[var(--theme-border)]`}>
          <img
            src={preview}
            alt="预览"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
            <button
              type="button"
              onClick={handleClear}
              className="p-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          {uploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className={`w-full ${previewClassName} rounded-xl border-2 border-dashed border-[var(--theme-border)] hover:border-[var(--theme-primary)] transition-colors flex flex-col items-center justify-center space-y-2 ${uploading ? 'opacity-50' : ''}`}
        >
          {uploading ? (
            <>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--theme-primary)]" />
              <span className="text-sm text-[var(--theme-text-muted)]">上传中...</span>
            </>
          ) : (
            <>
              <ImageIcon className="w-10 h-10 text-[var(--theme-text-muted)]" />
              <span className="text-sm text-[var(--theme-text-muted)]">点击选择图片</span>
              <span className="text-xs text-[var(--theme-text-muted)]">支持 JPG、PNG、GIF，最大 10MB</span>
            </>
          )}
        </button>
      )}
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  )
}
