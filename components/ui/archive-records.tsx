"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Cake, Camera, ChevronRight, MapPin, MessageCircle } from "lucide-react"
import { memoryCalendarDate, type MemoryRecord } from "@/lib/memory-archive"

const recordTypes = {
  photo: { label: "照片", icon: Camera },
  travel: { label: "旅行", icon: MapPin },
  birthday: { label: "生日", icon: Cake },
  message: { label: "留言", icon: MessageCircle },
}

function RecordImage({ src }: { src: string }) {
  const [imageFailed, setImageFailed] = useState(false)
  if (imageFailed) return null

  return (
    <span className="archive-record-image">
      <Image
        src={src}
        alt=""
        fill
        unoptimized
        sizes="(max-width: 640px) 90vw, 310px"
        referrerPolicy="no-referrer"
        onError={() => setImageFailed(true)}
      />
    </span>
  )
}

export function ArchiveRecords({ records }: { records: MemoryRecord[] }) {
  const groups = new Map<string, MemoryRecord[]>()
  for (const record of records) {
    const date = memoryCalendarDate(record)
    const key = date ? `${date.month}月` : "仅记载年份"
    const group = groups.get(key)
    if (group) group.push(record)
    else groups.set(key, [record])
  }

  return (
    <div className="archive-records">
      {Array.from(groups, ([label, group]) => (
        <section className="archive-month" key={label}>
          <h2 className="archive-month-title">{label}</h2>
          <ul>
            {group.map((record) => {
              const date = memoryCalendarDate(record)
              const type = recordTypes[record.type]
              const Icon = type.icon
              const image = record.imageUrl && /^(?:https?:\/\/|data:image\/|\/(?!\/))/i.test(record.imageUrl)
                ? record.imageUrl
                : null

              return (
                <li key={`${record.type}-${record.id}`} className="archive-record">
                  <Link href={record.href} className="archive-record-link">
                    <div className="archive-record-date">
                      {date ? <time dateTime={date.iso}>{date.label}</time> : <span>{record.year}年</span>}
                      {record.usesArchiveDate && <span className="archive-record-detail">归档日期</span>}
                    </div>
                    <div className="archive-record-copy">
                      <h3>{record.title}</h3>
                      {record.type === "travel" && record.detail !== "旅行记录" && (
                        <p className="archive-record-detail">{record.detail}</p>
                      )}
                    </div>
                    {image && <RecordImage key={image} src={image} />}
                    <span className="archive-record-type">
                      <Icon size={17} aria-hidden="true" />
                      <span>{record.type === "photo" ? record.detail : type.label}</span>
                      <ChevronRight className="archive-record-arrow" size={15} aria-hidden="true" />
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </section>
      ))}
    </div>
  )
}
