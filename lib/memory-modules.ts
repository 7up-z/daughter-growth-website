export type MemoryModuleKey =
  | "timeline"
  | "birthday"
  | "travel"
  | "gallery"
  | "messages"
  | "yearReview"

export type MemoryModule = {
  key: MemoryModuleKey
  title: string
  navTitle: string
  subtitle: string
  action: string
  href: string
  cover: string
  overlay: string
  icon: "timeline" | "birthday" | "travel" | "gallery" | "messages" | "yearReview"
}

export const memoryModules: MemoryModule[] = [
  {
    key: "timeline",
    title: "成长时间线",
    navTitle: "成长时间线",
    subtitle: "按年份、月份和重要节点回看成长故事",
    action: "查看时间线",
    href: "/timeline",
    cover: "/images/family-watercolor-hero.png",
    overlay: "bg-gradient-to-t from-[#5f5730]/44 via-transparent to-white/10",
    icon: "timeline",
  },
  {
    key: "birthday",
    title: "生日影像",
    navTitle: "生日影像",
    subtitle: "珍藏每一年生日视频、照片和祝福",
    action: "打开影像",
    href: "/birthday",
    cover: "/images/module-birthday-video.png",
    overlay: "bg-gradient-to-t from-[#7c3144]/38 via-transparent to-white/8",
    icon: "birthday",
  },
  {
    key: "travel",
    title: "旅行地图",
    navTitle: "旅行地图",
    subtitle: "记录一家人的城市足迹和路上故事",
    action: "打开地图",
    href: "/travel",
    cover: "/images/module-travel-diary.png",
    overlay: "bg-gradient-to-t from-[#294d2e]/38 via-transparent to-white/8",
    icon: "travel",
  },
  {
    key: "gallery",
    title: "摄影相册",
    navTitle: "摄影相册",
    subtitle: "整理日常、旅行、生日和节日照片",
    action: "进入相册",
    href: "/gallery",
    cover: "/images/module-photo-album.png",
    overlay: "bg-gradient-to-t from-[#5b3e23]/36 via-transparent to-white/8",
    icon: "gallery",
  },
  {
    key: "messages",
    title: "家庭留言",
    navTitle: "家庭留言",
    subtitle: "保存家人写下的祝福、心里话和回应",
    action: "查看留言",
    href: "/messages",
    cover: "/images/family-watercolor-hero.png",
    overlay: "bg-gradient-to-t from-[#7b4b58]/42 via-transparent to-white/10",
    icon: "messages",
  },
  {
    key: "yearReview",
    title: "年度回顾",
    navTitle: "年度回顾",
    subtitle: "汇总照片、影像、留言和旅行足迹",
    action: "查看回顾",
    href: "/year-review",
    cover: "/images/module-photo-album.png",
    overlay: "bg-gradient-to-t from-[#263f69]/42 via-transparent to-white/8",
    icon: "yearReview",
  },
]

