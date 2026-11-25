"use client"

import { useState, type FormEvent } from "react"
import Link from "next/link"
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
    <form className="mt-7 space-y-6" onSubmit={submit}>
      {error && <p role="alert" className="place-submit-error">{error}</p>}
      <label className="block">
        <span className="mb-2 block text-sm font-semibold">标题</span>
        <input className="input" required maxLength={100} value={draft.title}
          onChange={(event) => setDraft({ ...draft, title: event.target.value })} />
      </label>
      <label className="block max-w-64">
        <span className="mb-2 block text-sm font-semibold">记录日期</span>
        <input className="input" required type="date" value={draft.diaryDate}
          onChange={(event) => setDraft({ ...draft, diaryDate: event.target.value })} />
      </label>
      <label className="block">
        <span className="mb-2 block text-sm font-semibold">正文</span>
        <textarea className="input min-h-56 resize-y leading-relaxed" required maxLength={10000} value={draft.content}
          onChange={(event) => setDraft({ ...draft, content: event.target.value })} />
      </label>

      <fieldset className="space-y-4 rounded-lg border border-[var(--yearbook-rule)] p-4 sm:p-5">
        <legend className="px-2 font-semibold">可见范围</legend>
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
                      className="rounded-md border border-[var(--yearbook-rule)] px-2.5 py-1.5 text-sm"
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

        <p className="text-sm leading-relaxed text-[var(--yearbook-muted)]">
          {draft.audience === "OWNER" ? "这篇日记只有你可以查看。"
            : draft.audience === "FAMILY" ? "开放时间到达前，只有你可以查看。"
            : "留空则所选成员可立即阅读，设定时间后需等到该时刻。"}
        </p>
      </fieldset>

      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={saving} className="family-button family-button-primary">
          {saving ? "正在保存…" : "保存日记"}
        </button>
        <Link href={draft.id ? `/diary/${draft.id}` : "/diary"} prefetch={false} className="family-button family-button-outline">取消</Link>
      </div>
    </form>
  )
}
