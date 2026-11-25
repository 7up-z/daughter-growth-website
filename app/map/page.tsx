import { redirect } from "next/navigation"
import { FamilyMasthead } from "@/components/ui/family-masthead"
import { FootprintAtlas } from "@/components/map/footprint-atlas"
import { getFamilySession } from "@/lib/auth"

export default async function MapPage() {
  if (!(await getFamilySession())) redirect("/login")

  return (
    <div className="yearbook-shell chronicle-shell">
      <div className="yearbook-container">
        <FamilyMasthead />
        <main className="atlas-page">
          <header className="atlas-heading">
            <h1 className="yearbook-display">足迹地图</h1>
            <p>从一座城市，找到那天的旅行与照片。</p>
          </header>
          <FootprintAtlas />
        </main>
      </div>
    </div>
  )
}
