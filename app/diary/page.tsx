import Link from "next/link"
import { redirect } from "next/navigation"
import { Pencil } from "lucide-react"
import { ThemedHeader, ThemedPageHero, ThemedShell } from "@/components/ui/theme-shell"
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
    <ThemedShell maxWidth="max-w-5xl">
      <ThemedHeader title="私密日记" action={
        <Link href="/diary/new" className="family-button family-button-primary" prefetch={false}>
          <Pencil size={17} aria-hidden="true" /> 写私密日记
        </Link>
      } />
      <main>
        <ThemedPageHero title="私密日记" description={diaryIntro} />
        {diaries.length === 0 ? (
          <p className="py-8 text-sm text-[var(--yearbook-muted)]">还没有你可以阅读的日记。</p>
        ) : (
          <ul className="mt-5 divide-y divide-[var(--yearbook-rule)]">
            {diaries.map((entry) => (
              <li key={entry.id}>
                <Link href={`/diary/${entry.id}`} prefetch={false} className="block py-5 hover:text-[var(--yearbook-warm)]">
                  <div className="flex flex-wrap items-center gap-2 text-sm text-[var(--yearbook-muted)]">
                    <time dateTime={diaryDateInput(entry.diaryDate)}>{diaryDateInput(entry.diaryDate)}</time>
                    <span>{entry.authorId === session.user.id ? "我写的" : entry.author.nickname || entry.author.username}</span>
                  </div>
                  <h2 className="yearbook-display mt-2 break-words text-2xl">{entry.title}</h2>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </ThemedShell>
  )
}
