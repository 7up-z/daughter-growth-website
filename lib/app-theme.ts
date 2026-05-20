import type { Theme } from "@/components/providers/theme-provider"

export type AppThemeStyle = {
  eyebrow: string
  title: string
  subtitle: string
  shell: string
  header: string
  hero: string
  heroGlow: string
  primaryButton: string
  secondaryText: string
  card: string
  cardIcon: string
  cardNumber: string
  featureGrid: string
  quote: string
  preview: string
  pickerCard: string
}

export const themeOrder: Theme[] = ["paper", "cinematic", "playful", "future"]

export const appThemeStyles: Record<Theme, AppThemeStyle> = {
  paper: {
    eyebrow: "Family Album · 温馨绘本",
    title: "Family Memories",
    subtitle: "把生日、旅行、相册和日记收进同一册柔和的家庭故事。",
    shell: "bg-[#f7efe3] text-[#3f3526]",
    header: "border-[#e2d2b7]/80 bg-[#fffaf0]/85 shadow-[0_18px_60px_rgba(104,80,48,0.12)] backdrop-blur-xl",
    hero: "border-[#e7d8c0] bg-[#fff8ed] shadow-[0_24px_70px_rgba(100,74,44,0.16)]",
    heroGlow: "from-[#d6b98d]/35 via-[#fff7e8]/55 to-[#8ea36a]/20",
    primaryButton: "bg-[#c86d49] text-white shadow-[0_14px_28px_rgba(200,109,73,0.28)] hover:bg-[#b95e3e]",
    secondaryText: "text-[#766b52]",
    card: "border-[#e5d6bf] bg-[#fffdf8] shadow-[0_14px_40px_rgba(97,73,45,0.10)] hover:-translate-y-1 hover:shadow-[0_18px_48px_rgba(97,73,45,0.16)]",
    cardIcon: "bg-[#746b3f] text-[#fff9eb]",
    cardNumber: "text-[#b58b58]",
    featureGrid: "bg-[#fff8ed]/80 border-[#eadcc6]",
    quote: "bg-[#fff7e9] border-[#ead8be] text-[#5b523b]",
    preview: "bg-[#f8ead6] border-[#dfc9a8]",
    pickerCard: "bg-[#fffdf8] border-[#dfc9a8]",
  },
  cinematic: {
    eyebrow: "Time Capsule · 电影相册",
    title: "Family Memories",
    subtitle: "用安静的光影保存每一个长大的瞬间。",
    shell: "bg-[#080706] text-[#f4e7d0]",
    header: "border-[#5a3c1f]/80 bg-black/70 shadow-[0_18px_70px_rgba(0,0,0,0.45)] backdrop-blur-xl",
    hero: "border-[#704820] bg-[radial-gradient(circle_at_76%_24%,rgba(225,182,110,0.28),transparent_30%),linear-gradient(135deg,#17110c_0%,#050505_70%)] shadow-[0_30px_90px_rgba(0,0,0,0.55)]",
    heroGlow: "from-[#e1b66e]/35 via-transparent to-[#7d4b20]/25",
    primaryButton: "bg-gradient-to-r from-[#ffe0a3] to-[#b77a33] text-[#120c07] shadow-[0_16px_36px_rgba(201,154,85,0.32)] hover:brightness-110",
    secondaryText: "text-[#b99a72]",
    card: "border-[#6b4725] bg-[#14100c] shadow-[0_18px_50px_rgba(0,0,0,0.45)] hover:-translate-y-1 hover:border-[#d29b50]",
    cardIcon: "bg-[#c99a55] text-[#120c07]",
    cardNumber: "text-[#d9ab67]",
    featureGrid: "bg-[#0d0a08]/90 border-[#5a3c1f]",
    quote: "bg-[#120e0a] border-[#5a3c1f] text-[#e6c896]",
    preview: "bg-[#1b130b] border-[#704820]",
    pickerCard: "bg-[#15110c] border-[#5a3c1f]",
  },
  playful: {
    eyebrow: "Our Story Every Day · 绘本拼贴",
    title: "Family Memories",
    subtitle: "用小照片、小故事和温暖色块拼成每天都能翻看的成长页。",
    shell: "bg-[#fff8e8] text-[#16120d]",
    header: "border-black/10 bg-[#fffaf0]/92 shadow-[0_12px_40px_rgba(0,0,0,0.08)] backdrop-blur-xl",
    hero: "border-black bg-[radial-gradient(circle_at_84%_24%,rgba(36,91,255,0.16),transparent_26%),linear-gradient(135deg,#fff9ea_0%,#ffe7cf_100%)] shadow-[10px_10px_0_#111]",
    heroGlow: "from-[#ff5a4e]/35 via-[#ffe45c]/45 to-[#245bff]/25",
    primaryButton: "bg-[#ff5a4e] text-black border-2 border-black shadow-[7px_7px_0_#111] hover:-translate-y-0.5 hover:shadow-[9px_9px_0_#111]",
    secondaryText: "text-[#403b32]",
    card: "border-2 border-black bg-white shadow-[6px_6px_0_#111] hover:-translate-y-1 hover:shadow-[8px_8px_0_#111]",
    cardIcon: "bg-black text-white",
    cardNumber: "text-[#ff5a4e]",
    featureGrid: "bg-[#fff4d6] border-2 border-black",
    quote: "bg-[#ffcfda] border-2 border-black text-black",
    preview: "bg-[#ffe45c] border-2 border-black",
    pickerCard: "bg-white border-2 border-black",
  },
  future: {
    eyebrow: "Memory Capsule · 清透相册",
    title: "Family Memories",
    subtitle: "把家庭记录整理成清爽、轻盈、可持续补充的记忆空间。",
    shell: "bg-[#f4f7ff] text-[#151c48]",
    header: "border-white/70 bg-white/55 shadow-[0_18px_70px_rgba(92,112,255,0.18)] backdrop-blur-2xl",
    hero: "border-white/80 bg-[radial-gradient(circle_at_76%_20%,rgba(155,108,255,0.24),transparent_30%),linear-gradient(135deg,rgba(255,255,255,0.86)_0%,rgba(219,229,255,0.72)_100%)] shadow-[0_30px_90px_rgba(77,124,254,0.20)] backdrop-blur-2xl",
    heroGlow: "from-[#4d7cfe]/25 via-[#ffffff]/60 to-[#9b6cff]/25",
    primaryButton: "bg-gradient-to-r from-[#4d7cfe] to-[#9b6cff] text-white shadow-[0_16px_38px_rgba(77,124,254,0.32)] hover:brightness-110",
    secondaryText: "text-[#6670a0]",
    card: "border-white/80 bg-white/62 shadow-[0_18px_52px_rgba(77,124,254,0.16)] backdrop-blur-xl hover:-translate-y-1 hover:bg-white/78",
    cardIcon: "bg-gradient-to-br from-[#4d7cfe] to-[#9b6cff] text-white",
    cardNumber: "text-[#5877ff]",
    featureGrid: "bg-white/45 border-white/75 backdrop-blur-xl",
    quote: "bg-white/58 border-white/80 text-[#48517f] backdrop-blur-xl",
    preview: "bg-white/45 border-white/75 backdrop-blur-xl",
    pickerCard: "bg-white/60 border-white/80 backdrop-blur-xl",
  },
}
