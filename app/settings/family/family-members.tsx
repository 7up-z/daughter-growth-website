"use client"

import { useEffect, useState } from "react"
import { ThemedHeader, ThemedPageHero, ThemedShell, useCurrentThemeStyle } from "@/components/ui/theme-shell"

type Member = {
  id: string
  username: string
  nickname: string | null
  email: string
  role: string
  accessStatus: "PENDING" | "ACTIVE" | "REVOKED"
}

type Invitation = { id: string; email: string; expiresAt: string }
type Directory = { members: Member[]; invitations: Invitation[] }

const statusLabels = { PENDING: "待确认", ACTIVE: "可访问", REVOKED: "已撤销" }
const membersUrl = "/api/family/members"

async function readMembers(signal?: AbortSignal): Promise<Directory> {
  const response = await fetch(membersUrl, { signal, cache: "no-store" })
  if (!response.ok) throw new Error("无法读取家庭成员")
  return response.json()
}

export function FamilyMembers() {
  const current = useCurrentThemeStyle()
  const [directory, setDirectory] = useState<Directory | null>(null)
  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [feedback, setFeedback] = useState("")
  const [busy, setBusy] = useState(false)
  const [retry, setRetry] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    readMembers(controller.signal).then(setDirectory).catch(() => {
      if (!controller.signal.aborted) setFeedback("无法读取家庭成员，请重试。")
    })
    return () => controller.abort()
  }, [retry])

  async function change(url: string, options: RequestInit) {
    setBusy(true)
    setFeedback("")
    try {
      const response = await fetch(url, options)
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "操作失败")
      if (data.code) {
        setCode(data.code)
        setEmail("")
      }
      setFeedback(data.message || "邀请码已生成")
      setDirectory(await readMembers())
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "操作失败，请重试")
    } finally {
      setBusy(false)
    }
  }

  function invite(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setCode("")
    void change(membersUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })
  }

  function updateAccess(member: Member) {
    const accessStatus = member.accessStatus === "ACTIVE" ? "REVOKED" : "ACTIVE"
    if (accessStatus === "REVOKED" && !window.confirm(`撤销 ${member.username} 的家庭访问权限？`)) return
    void change(membersUrl, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: member.id, accessStatus }),
    })
  }

  return (
    <ThemedShell maxWidth="max-w-4xl">
      <ThemedHeader title="家庭成员" backHref="/profile" />
      <main>
        <ThemedPageHero
          title="家庭成员"
          description="给家人留一个位置，等他们推门进来。"
        />
        <section className={`mt-6 space-y-4 rounded-[1.5rem] border p-5 ${current.card}`}>
          <h2 className="text-lg font-black">邀请家人</h2>
          <form onSubmit={invite} className="flex flex-col items-end gap-3 sm:flex-row">
            <label className="grid w-full gap-2 text-sm font-bold">
              受邀邮箱
              <input type="email" required maxLength={254} className="input" value={email} onChange={(event) => setEmail(event.target.value)} />
            </label>
            <button type="submit" disabled={busy} className={`shrink-0 rounded-full px-5 py-2 font-bold ${current.primaryButton}`}>
              生成邀请码
            </button>
          </form>
          {code && (
            <div className="space-y-2">
              <p className="text-sm">将邀请码单独发给受邀家人。邀请码 7 天有效，仅可使用一次。</p>
              <input aria-label="刚生成的邀请码" readOnly value={code} className="input font-mono" onFocus={(event) => event.currentTarget.select()} />
            </div>
          )}
          {feedback && <p role="status" className="text-sm font-semibold">{feedback}</p>}
          {!directory && feedback && (
            <button type="button" className="text-sm font-bold underline" onClick={() => setRetry(retry + 1)}>重试</button>
          )}
        </section>
        {directory && (
          <>
            <section className={`mt-5 space-y-3 rounded-[1.5rem] border p-5 ${current.card}`}>
              <h2 className="text-lg font-black">成员账号</h2>
              <ul className="divide-y divide-current/15">
                {directory.members.map((member) => (
                  <li key={member.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                    <div className="min-w-0 break-all">
                      <p className="font-bold">{member.nickname || member.username} · {member.role === "admin" ? "管理员" : statusLabels[member.accessStatus]}</p>
                      <p className={`text-sm ${current.secondaryText}`}>{member.email}</p>
                    </div>
                    {member.role !== "admin" && (
                      <button type="button" disabled={busy} onClick={() => updateAccess(member)} className={`rounded-full border px-4 py-2 text-sm font-bold ${current.pickerCard}`}>
                        {member.accessStatus === "ACTIVE" ? "撤销访问" : "开通访问"}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </section>
            {directory.invitations.length > 0 && (
              <section className={`mt-5 space-y-3 rounded-[1.5rem] border p-5 ${current.card}`}>
                <h2 className="text-lg font-black">待使用的邀请</h2>
                <ul className="divide-y divide-current/15">
                  {directory.invitations.map((invitation) => (
                    <li key={invitation.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                      <div className="min-w-0 break-all">
                        <p className="font-bold">{invitation.email}</p>
                        <p className={`text-sm ${current.secondaryText}`}>{new Date(invitation.expiresAt).toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" })} 到期</p>
                      </div>
                      <button type="button" disabled={busy} onClick={() => void change(`${membersUrl}?id=${encodeURIComponent(invitation.id)}`, { method: "DELETE" })} className={`rounded-full border px-4 py-2 text-sm font-bold ${current.pickerCard}`}>
                        撤销邀请
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </>
        )}
      </main>
    </ThemedShell>
  )
}
