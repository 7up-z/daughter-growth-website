"use client"

import { useState, type FormEvent } from "react"
import Link from "next/link"
import { ArrowRight, MapPin, Pencil } from "lucide-react"
import { parseEntryPlace, placeName, type EntryPlace, type EntryType, type PlaceDraft } from "@/lib/entry-place"
import { emptyPlace, PlaceFields } from "./place-fields"

export function EntryPlaceEditor({ id, type, place, legacyLabel, canEdit, onSaved }: {
  id: string
  type: EntryType
  place: EntryPlace | null
  legacyLabel?: string | null
  canEdit: boolean
  onSaved: (place: EntryPlace | null) => void
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<PlaceDraft | null>(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (saving) return
    setSaving(true)
    setMessage("")
    try {
      const response = await fetch("/api/memory/places", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, type, place: parseEntryPlace(draft) }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "保存地点失败")
      onSaved(data.place)
      setEditing(false)
      setMessage("地点已保存")
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "保存地点失败，请重试")
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="entry-place">
      <div className="entry-place-caption">
        <MapPin size={17} aria-hidden="true" />
        <span>{place ? placeName(place) : legacyLabel || "未记录地点"}</span>
        {canEdit && !editing && (
          <button type="button" className="place-link" onClick={() => {
            setDraft(place ?? emptyPlace(legacyLabel ?? ""))
            setMessage("")
            setEditing(true)
          }}><Pencil size={15} aria-hidden="true" /> {place ? "编辑地点" : "补记地点"}</button>
        )}
      </div>
      {place && !editing && (
        <Link
          href={`/map?entry=${encodeURIComponent(`${type}:${id}`)}`}
          className="family-text-link"
          prefetch={false}
        >
          在足迹地图查看 <ArrowRight size={15} aria-hidden="true" />
        </Link>
      )}
      {editing && (
        <form className="entry-place-form" onSubmit={submit}>
          <PlaceFields value={draft} onChange={setDraft} legacyLabel={legacyLabel ?? ""} />
          <div className="place-actions">
            <button type="submit" className="place-save" disabled={saving}>{saving ? "保存中…" : "保存地点"}</button>
            <button type="button" className="place-link" disabled={saving} onClick={() => { setEditing(false); setMessage("") }}>取消</button>
          </div>
        </form>
      )}
      {message && <p className="place-hint" role="status">{message}</p>}
    </section>
  )
}
