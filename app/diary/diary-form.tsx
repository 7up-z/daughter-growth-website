"use client"

import { useState, type FormEvent } from "react"
import Link from "next/link"
import { LockKeyhole } from "lucide-react"
import { useRouter } from "next/navigation"

type Audience = "OWNER" | "MEMBERS" | "FAMILY"
type Member = { id: string; name: string }
type DiaryDraft = {
  id?: string
  title: string
  content: string
  diaryDate: string
  audience: Audience
  openAt: string
  readerIds: string[]
}

export function DiaryForm({ initial, members }: { initial: DiaryDraft; members: Member[] }) {
  const router = useRouter()
  const [draft, setDraft] = useState(initial)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const selected = members.filter(({ id }) => draft.readerIds.includes(id))
  const remaining = members.filter(({ id }) => !draft.readerIds.includes(id))

  const ownerOnly = draft.audience === "OWNER"
  const hasReaders = draft.audience === "FAMILY" || selected.length > 0
  const readers = draft.audience === "FAMILY" ? "全体家人" : selected.map(({ name }) => name).join("、")
  const releaseLabel = draft.openAt.replace("T", " ")

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (saving) return
    setSaving(true)
    setError("")
    try {
      const response = await fetch("/api/diary", {
        method: draft.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      })
      const data = await response.json()
      if (!response.ok || typeof data.id !== "string") throw new Error(data.error || "保存失败，请稍后重试")
      router.replace(`/diary/${data.id}`)
      router.refresh()
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : "保存失败，请稍后重试")
      setSaving(false)
    }
  }

  return (
    <form className="diary-composition" onSubmit={submit}>
      <div className="diary-writing">
        <label className="block">
          <span className="mb-2 block text-sm font-semibold">标题</span>
          <input className="input diary-title-input" required maxLength={100} value={draft.title}
            onChange={(event) => setDraft({ ...draft, title: event.target.value })} />
        </label>
        <label className="block max-w-64">
          <span className="mb-2 block text-sm font-semibold">记录日期</span>
          <input className="input" required type="date" value={draft.diaryDate}
            onChange={(event) => setDraft({ ...draft, diaryDate: event.target.value })} />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-semibold">正文</span>
          <textarea className="input diary-text-input" required maxLength={10000} value={draft.content}
            onChange={(event) => setDraft({ ...draft, content: event.target.value })} />
        </label>
      </div>

      <fieldset className="diary-permissions" aria-labelledby="diary-visibility-heading">
        <h2 id="diary-visibility-heading" className="yearbook-display"><LockKeyhole size={24} aria-hidden="true" /> 可见范围</h2>
        <div className="max-w-sm">
          <label htmlFor="diary-audience" className="mb-2 block text-sm font-semibold">谁可以读</label>
          <select id="diary-audience" className="input" value={draft.audience}
            onChange={(event) => setDraft({ ...draft, audience: event.target.value as Audience })}>
            <option value="OWNER">仅自己</option>
            <option value="MEMBERS">指定成员</option>
            <option value="FAMILY">全体家人（定时开放）</option>
          </select>
        </div>

        {draft.audience === "MEMBERS" && (
          <div>
            <div className="max-w-sm">
              <label htmlFor="diary-readers" className="mb-2 block text-sm font-semibold">添加可读成员</label>
              <select id="diary-readers" className="input" value="" disabled={remaining.length === 0}
                onChange={(event) => {
                  const id = event.target.value
                  if (id) setDraft({ ...draft, readerIds: [...draft.readerIds, id] })
                }}>
                <option value="">{remaining.length ? "从家人中选择" : selected.length ? "已选完所有成员" : "暂无可选成员"}</option>
                {remaining.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}
              </select>
            </div>
            {selected.length > 0 && (
              <ul aria-label="已选成员" className="mt-3 flex flex-wrap gap-2">
                {selected.map((member) => (
                  <li key={member.id}>
                    <button type="button" aria-label={`移除 ${member.name}`}
                      className="diary-reader-chip"
                      onClick={() => setDraft({ ...draft, readerIds: draft.readerIds.filter((id) => id !== member.id) })}>
                      {member.name} <span aria-hidden="true">×</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {draft.audience !== "OWNER" && (
          <label className="block max-w-sm">
            <span className="mb-2 block text-sm font-semibold">
              开放时间（北京时间{draft.audience === "MEMBERS" ? "，选填" : ""}）
            </span>
            <input className="input" type="datetime-local" required={draft.audience === "FAMILY"} value={draft.openAt}
              onChange={(event) => setDraft({ ...draft, openAt: event.target.value })} />
          </label>
        )}

        <p className="diary-permissions-summary" aria-live="polite">
          {ownerOnly ? "这篇日记仅自己可读。" : !hasReaders ? "请选择可以阅读这篇日记的家人。"
            : releaseLabel ? <>开放前仅自己可读。<br />北京时间 {releaseLabel} 起，{readers}可读。</>
            : draft.audience === "FAMILY" ? "设置开放时间后，全体家人可从该时间起阅读。"
            : `保存后，${readers}即可阅读。`}
        </p>
      </fieldset>

      <div className="diary-submit">
        {error && <p role="alert" className="place-submit-error">{error}</p>}
        <button type="submit" disabled={saving} className="family-button family-button-primary">
          {saving ? "正在保存…" : "保存日记"}
        </button>
        <Link href={draft.id ? `/diary/${draft.id}` : "/diary"} prefetch={false} className="family-button family-button-outline">取消</Link>
      </div>
    </form>
  )
}
