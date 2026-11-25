import { redirect } from "next/navigation"
import { FamilyMasthead } from "@/components/ui/family-masthead"
import { FootprintAtlas } from "@/components/map/footprint-atlas"
import { getFamilySession } from "@/lib/auth"

export default async function MapPage({ searchParams }: { searchParams: Promise<{ entry?: string | string[] }> }) {
  if (!(await getFamilySession())) redirect("/login")
  const { entry } = await searchParams
  const focus = typeof entry === "string" ? entry : undefined

  return (
    <div className="yearbook-shell chronicle-shell">
      <div className="yearbook-container">
        <FamilyMasthead />
        <main className="atlas-page">
          <header className="atlas-heading">
            <h1 className="yearbook-display">足迹地图</h1>
            <p>走过的地方，在地图上留下一个小点。点开它，还是那天的风和光。</p>
          </header>
          <FootprintAtlas key={focus} focus={focus} />
        </main>
      </div>
    </div>
  )
}
