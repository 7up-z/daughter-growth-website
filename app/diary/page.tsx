import Image from "next/image"
import Link from "next/link"
import { redirect } from "next/navigation"
import { ArrowRight, Pencil } from "lucide-react"
import { ThemedHeader, ThemedShell } from "@/components/ui/theme-shell"
import { getFamilySession } from "@/lib/auth"
import { diaryDateInput, diaryIntro, visibleDiaries } from "@/lib/private-diary"
import { prisma } from "@/lib/prisma"

export default async function DiaryPage() {
  const session = await getFamilySession()
  if (!session) redirect("/login")

  const diaries = await prisma.privateDiary.findMany({
    where: visibleDiaries(session.user.id),
    select: { id: true, title: true, diaryDate: true, authorId: true, author: { select: { nickname: true, username: true } } },
    orderBy: [{ diaryDate: "desc" }, { createdAt: "desc" }],
  })

  return (
    <ThemedShell>
      <ThemedHeader title="私密日记" action={
        <Link href="/diary/new" className="family-button family-button-primary" prefetch={false}>
          <Pencil size={17} aria-hidden="true" /> 写私密日记
        </Link>
      } />
      <main>
        <header className="diary-editor-heading">
          <div className="family-subpage-title">
            <h1 className="yearbook-display">私密日记</h1>
            <p>{diaryIntro}</p>
          </div>
          <Image className="editorial-ornament" src="/images/risograph-envelope.webp" alt="" width={166} height={120} />
        </header>
        {diaries.length === 0 ? (
          <p className="editorial-empty">还没有你可以阅读的日记。</p>
        ) : (
          <ul className="diary-index">
            {diaries.map((entry) => (
              <li key={entry.id}>
                <Link href={`/diary/${entry.id}`} prefetch={false} className="diary-index-row">
                  <div className="diary-index-meta">
                    <time dateTime={diaryDateInput(entry.diaryDate)}>{diaryDateInput(entry.diaryDate)}</time>
                    <span>{entry.authorId === session.user.id ? "我写的" : entry.author.nickname || entry.author.username}</span>
                  </div>
                  <h2 className="yearbook-display">{entry.title}</h2>
                  <ArrowRight size={19} aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </ThemedShell>
  )
}
