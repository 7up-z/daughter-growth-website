"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowRight, CalendarHeart, Cake, Camera, Clock3, Map, MessageCircle } from "lucide-react"
import type { MemoryModule } from "@/lib/memory-modules"
import { useCurrentThemeStyle } from "@/components/ui/theme-shell"

const iconMap = {
  timeline: Clock3,
  birthday: Cake,
  travel: Map,
  gallery: Camera,
  messages: MessageCircle,
  yearReview: CalendarHeart,
}

export function MemoryModuleGrid({
  modules,
  locked,
}: {
  modules: MemoryModule[]
  locked?: boolean
}) {
  const current = useCurrentThemeStyle()

  return (
    <section className={`mt-5 rounded-[2rem] border p-4 sm:p-6 ${current.featureGrid}`}>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {modules.map((item, index) => {
          const Icon = iconMap[item.icon]
          const href = locked ? "/login" : item.href

          return (
            <Link
              key={item.key}
              href={href}
              className={`group overflow-hidden rounded-[1.5rem] border transition ${current.card}`}
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={item.cover}
                  alt=""
                  fill
                  loading={index > 2 ? "lazy" : "eager"}
                  sizes="(min-width: 1280px) 30vw, (min-width: 768px) 46vw, 92vw"
                  className="object-cover transition duration-500 group-hover:scale-[1.03]"
                />
                <div className={`absolute inset-0 ${item.overlay}`} />
                <span className={`absolute left-4 top-4 rounded-full border px-3 py-1 text-xs font-black ${current.pickerCard}`}>
                  0{index + 1}
                </span>
                <span className={`absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full ${current.cardIcon}`}>
                  <Icon className="h-5 w-5" />
                </span>
              </div>
              <div className="p-6">
                <h3 className="break-keep text-2xl font-black">{item.title}</h3>
                <p className={`mt-2 min-h-12 text-sm font-semibold leading-6 ${current.secondaryText}`}>{item.subtitle}</p>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-black">
                  {item.action}
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-current/10 transition group-hover:translate-x-1">
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </span>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}

