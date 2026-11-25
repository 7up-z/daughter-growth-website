"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Cake, Camera, MapPin, MessageCircle } from "lucide-react"
import { memoryCalendarDate, type MemoryRecord } from "@/lib/memory-archive"

const recordTypes = {
  photo: { label: "照片", icon: Camera },
  travel: { label: "旅行", icon: MapPin },
  birthday: { label: "生日", icon: Cake },
  message: { label: "家庭留言", icon: MessageCircle },
}

function visibleImage(record: MemoryRecord) {
  return record.imageUrl && /^(?:https?:\/\/|data:image\/|\/(?!\/))/i.test(record.imageUrl) ? record.imageUrl : null
}

function StoryPhoto({ src, feature }: { src: string; feature: boolean }) {
  const [failed, setFailed] = useState(false)
  if (failed) return null
  return (
    <span className="chronicle-story-photo">
      <Image src={src} alt="" fill unoptimized referrerPolicy="no-referrer"
        sizes={feature ? "(max-width: 700px) 92vw, 58vw" : "(max-width: 700px) 28vw, 180px"}
        onError={() => setFailed(true)} />
    </span>
  )
}

function Story({ record, feature, standalone }: { record: MemoryRecord; feature?: boolean; standalone?: boolean }) {
  const date = memoryCalendarDate(record)
  const { label, icon: Icon } = recordTypes[record.type]
  const image = visibleImage(record)
  const note = record.type === "message"
  const title = record.title.trim() || label
  const excerpt = note ? record.preview : feature ? record.preview : undefined

  return (
    <Link href={record.href} className={`chronicle-story ${feature ? "chronicle-story-feature" : ""} ${standalone ? "chronicle-story-standalone" : ""} ${note ? "chronicle-story-note" : ""}`}>
      {image && <StoryPhoto key={image} src={image} feature={!!feature} />}
      <div className="chronicle-story-copy">
        <div className="chronicle-story-meta">
          {date ? <time dateTime={date.iso}>{date.label}</time> : <span>{record.year}年</span>}
          {record.usesArchiveDate && <span>归档日期</span>}
          <span className="chronicle-story-type"><Icon size={15} aria-hidden="true" /> {label}</span>
        </div>
        {note ? (
          <blockquote className="chronicle-note-text">{excerpt || title}</blockquote>
        ) : (
          <>
            <h3 className="yearbook-display">{title}</h3>
            {record.detail && record.detail !== label && <p className="chronicle-story-detail">{record.detail}</p>}
            {excerpt && <p className="chronicle-story-excerpt">{excerpt}</p>}
          </>
        )}
      </div>
    </Link>
  )
}

export function ArchiveRecords({ records }: { records: MemoryRecord[] }) {
  const groups = new Map<string, MemoryRecord[]>()
  for (const record of records) {
    const date = memoryCalendarDate(record)
    const key = date ? `${date.month}月` : "年度记录"
    const group = groups.get(key)
    if (group) group.push(record)
    else groups.set(key, [record])
  }

  return (
    <div className="chronicle-chapters">
      {Array.from(groups, ([label, group]) => {
        const feature = group.find(visibleImage) ?? group[0]
        const rest = group.filter((record) => record !== feature)
        return (
          <section className="chronicle-chapter" key={label}>
            <h2 className="chronicle-chapter-name">{label}</h2>
            <div className={`chronicle-month-spread ${rest.length ? "chronicle-month-with-side" : ""}`}>
              <Story record={feature} feature standalone={!rest.length} />
              {!!rest.length && (
                <ul className="chronicle-side-stories">
                  {rest.map((record) => <li key={`${record.type}:${record.id}`}><Story record={record} /></li>)}
                </ul>
              )}
            </div>
          </section>
        )
      })}
    </div>
  )
}
