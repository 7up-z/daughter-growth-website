import Image from "next/image"
import { redirect } from "next/navigation"
import { ThemedHeader, ThemedShell } from "@/components/ui/theme-shell"
import { getFamilySession } from "@/lib/auth"
import { diaryMemberOptions, diaryReleaseInput } from "@/lib/private-diary"
import { DiaryForm } from "../diary-form"

export default async function NewDiaryPage() {
  const session = await getFamilySession()
  if (!session) redirect("/login")
  const members = await diaryMemberOptions(session.user.id)

  return (
    <ThemedShell>
      <ThemedHeader title="写私密日记" backHref="/diary" backLabel="返回私密日记" />
      <main>
        <header className="diary-editor-heading">
          <h1 className="yearbook-display">写私密日记</h1>
          <Image className="editorial-ornament" src="/images/risograph-envelope.webp" alt="" width={166} height={120} />
        </header>
        <DiaryForm members={members} initial={{
          title: "", content: "", diaryDate: diaryReleaseInput(new Date()).slice(0, 10),
          audience: "OWNER", openAt: "", readerIds: [],
        }} />
      </main>
    </ThemedShell>
  )
}
