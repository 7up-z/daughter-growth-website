import type { Theme } from "@/components/providers/theme-provider"

export type AppThemeStyle = {
  eyebrow: string
  primaryButton: string
  secondaryText: string
  card: string
  cardIcon: string
  preview: string
  pickerCard: string
}

export const themeOrder: Theme[] = ["paper", "cinematic", "playful", "future"]

export const appThemeStyles: Record<Theme, AppThemeStyle> = {
  paper: {
    eyebrow: "Family Album · 温馨绘本",
    primaryButton: "bg-[#546245] text-white hover:bg-[#45533a]",
    secondaryText: "text-[#685d4c]",
    card: "border-[#ded6c7] bg-[#fdfaf3]",
    cardIcon: "bg-[#546245] text-[#fff9eb]",
    preview: "bg-[#f8ead6] border-[#dfc9a8]",
    pickerCard: "bg-[#fffdf8] border-[#dfc9a8]",
  },
  cinematic: {
    eyebrow: "Time Capsule · 电影相册",
    primaryButton: "bg-gradient-to-r from-[#ffe0a3] to-[#b77a33] text-[#120c07] shadow-[0_16px_36px_rgba(201,154,85,0.32)] hover:brightness-110",
    secondaryText: "text-[#b99a72]",
    card: "border-[#514237] bg-[#1e1813]",
    cardIcon: "bg-[#c99a55] text-[#120c07]",
    preview: "bg-[#1b130b] border-[#704820]",
    pickerCard: "bg-[#15110c] border-[#5a3c1f]",
  },
  playful: {
    eyebrow: "Our Story Every Day · 绘本拼贴",
    primaryButton: "bg-[#ff5a4e] text-black border-2 border-black shadow-[7px_7px_0_#111] hover:-translate-y-0.5 hover:shadow-[9px_9px_0_#111]",
    secondaryText: "text-[#403b32]",
    card: "border-[#d8c8ac] bg-[#fffdf6]",
    cardIcon: "bg-black text-white",
    preview: "bg-[#ffe45c] border-2 border-black",
    pickerCard: "bg-white border-2 border-black",
  },
  future: {
    eyebrow: "Memory Capsule · 清透相册",
    primaryButton: "bg-gradient-to-r from-[#4d7cfe] to-[#9b6cff] text-white shadow-[0_16px_38px_rgba(77,124,254,0.32)] hover:brightness-110",
    secondaryText: "text-[#6670a0]",
    card: "border-[#d5dcf1] bg-[#fafbff]",
    cardIcon: "bg-gradient-to-br from-[#4d7cfe] to-[#9b6cff] text-white",
    preview: "bg-white/45 border-white/75 backdrop-blur-xl",
    pickerCard: "bg-white/60 border-white/80 backdrop-blur-xl",
  },
}
