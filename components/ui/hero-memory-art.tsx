import Image from "next/image"

type HeroMemoryArtProps = {
  mode?: "public" | "dashboard"
}

export function HeroMemoryArt({ mode = "public" }: HeroMemoryArtProps) {
  const isDashboard = mode === "dashboard"

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <Image
        src="/images/family-watercolor-hero.png"
        alt=""
        fill
        priority={!isDashboard}
        sizes="100vw"
        className="object-cover opacity-95"
        style={{ objectPosition: "67% 50%" }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,250,240,0.96)_0%,rgba(255,250,240,0.88)_31%,rgba(255,250,240,0.48)_58%,rgba(255,250,240,0.10)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,248,235,0.16)_0%,rgba(255,248,235,0.76)_100%)]" />
      <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-current/10 to-transparent opacity-30" />
    </div>
  )
}
