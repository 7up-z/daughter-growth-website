import Image from "next/image"
import Link from "next/link"
import { ArrowRight, LockKeyhole } from "lucide-react"
import { FamilyMasthead } from "@/components/ui/family-masthead"
import { currentFamilyYear } from "@/lib/memory-archive"

export default function HomePage() {
  const year = currentFamilyYear()

  return (
    <div className="yearbook-shell chronicle-shell">
      <div className="yearbook-container">
        <FamilyMasthead publicView />
        <main className="magazine-cover">
          <div className="magazine-edition"><span>小咩家庭纪念册</span><span>{year} 年卷</span></div>
          <h1 className="yearbook-display magazine-name">成长编年志</h1>
          <div className="magazine-spread">
            <figure className="magazine-photo">
              <div className="magazine-image">
                <Image src="/images/chronicle-cover.webp" alt="秋日银杏树下，一家人沿小路散步的插图"
                  fill preload sizes="(min-width: 1100px) 820px, (min-width: 700px) 66vw, 100vw" />
              </div>
              <figcaption>封面摄影插画 · 秋日银杏</figcaption>
            </figure>
            <section className="magazine-intro" aria-label="封面故事">
              <p className="magazine-story-title">一年一年，<br />慢慢长大</p>
              <p className="magazine-story-caption">把旅行、照片和那些平常的小事，留给家人慢慢翻看。</p>
              <Link href="/login" className="family-button family-button-warm magazine-login">
                家人登录 <ArrowRight size={19} aria-hidden="true" />
              </Link>
              <p className="magazine-privacy"><LockKeyhole size={15} aria-hidden="true" /> 仅受邀家人可见</p>
            </section>
          </div>
        </main>
      </div>
    </div>
  )
}
