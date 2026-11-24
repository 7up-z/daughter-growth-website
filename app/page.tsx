import Image from "next/image"
import Link from "next/link"
import { ArrowRight, LockKeyhole, UserRound } from "lucide-react"
import { FamilyMasthead } from "@/components/ui/family-masthead"
import { currentFamilyYear } from "@/lib/memory-archive"

export default function HomePage() {
  const currentYear = currentFamilyYear()
  const sampleYears = [currentYear - 2, currentYear - 1, currentYear]

  return (
    <div className="yearbook-shell">
      <div className="yearbook-container">
        <FamilyMasthead publicView />
        <main className="yearbook-cover">
          <section className="yearbook-cover-main" aria-labelledby="cover-title">
            <div className="yearbook-cover-copy">
              <h1 id="cover-title" className="yearbook-display yearbook-cover-title">
                <span>一年一年，</span>
                <span>慢慢长大</span>
              </h1>
              <p className="yearbook-cover-caption">把成长的每一页，留给家人慢慢翻看。</p>
              <Link href="/login" className="family-button family-button-warm yearbook-cover-login">
                <UserRound size={19} aria-hidden="true" />
                家人登录
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <p className="yearbook-cover-privacy">
                <LockKeyhole size={16} aria-hidden="true" />
                仅受邀家人可见
              </p>
            </div>
            <div className="yearbook-cover-art">
              <Image
                src="/images/growth-yearbook-cover.webp"
                alt=""
                fill
                preload
                sizes="(min-width: 1280px) 760px, (min-width: 768px) 65vw, 100vw"
              />
            </div>
          </section>

          <section aria-label="年份示例" className="yearbook-sample">
            <p>年份示例</p>
            <ol>
              {sampleYears.map((year) => (
                <li key={year} data-latest={year === currentYear ? "true" : undefined}>
                  <span>{year}</span>
                </li>
              ))}
            </ol>
          </section>
        </main>
      </div>
    </div>
  )
}
