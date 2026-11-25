import Image from "next/image"
import Link from "next/link"
import { ArrowRight, LockKeyhole } from "lucide-react"
import { FamilyMasthead } from "@/components/ui/family-masthead"
import { currentFamilyYear } from "@/lib/memory-archive"
import { memoryModules } from "@/lib/memory-modules"

export default function HomePage() {
  return (
    <div className="yearbook-shell risograph-cover">
      <div className="yearbook-container">
        <FamilyMasthead publicView />
      </div>
      <main>
        <section className="cover-spread" aria-labelledby="cover-title">
          <div className="cover-copy">
            <p className="cover-edition">{currentFamilyYear()} 年卷</p>
            <h1 id="cover-title" className="yearbook-display">成长<br />编年志</h1>
            <p className="cover-tagline">一年一年，慢慢长大</p>
            <Link href="/login" className="family-button cover-login">家人登录</Link>
            <p className="cover-privacy"><LockKeyhole size={15} aria-hidden="true" /> 仅受邀家人可见</p>
          </div>
          <figure className="cover-art">
            <Image
              src="/images/risograph-cover.webp"
              alt="以紫墨和荧光绿叠印的秋日银杏林"
              fill
              preload
              sizes="(min-width: 721px) 49vw, 100vw"
            />
          </figure>
        </section>
        <nav className="cover-index" aria-label="年卷目录">
          {memoryModules.slice(0, 3).map((module) => (
            <Link key={module.href} href="/login" className="cover-index-link">
              <span>{module.title}</span>
              <ArrowRight size={32} aria-hidden="true" />
            </Link>
          ))}
        </nav>
      </main>
    </div>
  )
}
