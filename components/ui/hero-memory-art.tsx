import { Cake, Camera, MapPin, Sparkles } from "lucide-react"

type HeroMemoryArtProps = {
  mode?: "public" | "dashboard"
}

const scrapbookPieces = [
  {
    className:
      "left-[8%] top-[10%] h-28 w-40 rotate-[-7deg] border-[#d9b37e]/70 bg-[linear-gradient(135deg,rgba(255,249,233,0.94),rgba(245,214,174,0.88)),radial-gradient(circle_at_22%_25%,rgba(200,109,73,0.26)_0_18%,transparent_19%)]",
    label: "2014",
  },
  {
    className:
      "right-[8%] top-[5%] h-32 w-32 rotate-[8deg] border-[#9db06e]/70 bg-[radial-gradient(circle_at_50%_45%,rgba(142,163,106,0.3)_0_32%,transparent_33%),linear-gradient(135deg,rgba(255,253,248,0.92),rgba(226,238,198,0.82))]",
    label: "生日",
  },
  {
    className:
      "left-[18%] bottom-[14%] h-24 w-48 rotate-[5deg] border-[#caa07d]/70 bg-[repeating-linear-gradient(90deg,rgba(90,60,31,0.18)_0_10px,transparent_10px_20px),linear-gradient(135deg,rgba(255,244,222,0.92),rgba(232,198,166,0.84))]",
    label: "旅行",
  },
  {
    className:
      "right-[16%] bottom-[9%] h-32 w-44 rotate-[-4deg] border-[#b8c5de]/70 bg-[radial-gradient(circle_at_24%_30%,rgba(77,124,254,0.2)_0_16%,transparent_17%),radial-gradient(circle_at_72%_70%,rgba(155,108,255,0.18)_0_20%,transparent_21%),linear-gradient(135deg,rgba(251,252,255,0.93),rgba(221,231,255,0.82))]",
    label: "相册",
  },
]

export function HeroMemoryArt({ mode = "public" }: HeroMemoryArtProps) {
  const isDashboard = mode === "dashboard"

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0 opacity-70 bg-[radial-gradient(circle_at_76%_18%,rgba(255,255,255,0.42),transparent_26%),repeating-linear-gradient(135deg,rgba(255,255,255,0.16)_0_1px,transparent_1px_18px)] lg:hidden" />
      <div className="absolute -right-14 top-28 h-40 w-40 rotate-12 rounded-[2rem] border border-current/10 bg-[radial-gradient(circle_at_32%_30%,rgba(200,109,73,0.16)_0_24%,transparent_25%),linear-gradient(135deg,rgba(255,253,248,0.36),rgba(255,228,92,0.18))] lg:hidden" />
      <div className="absolute bottom-8 right-10 h-24 w-48 rotate-[-8deg] rounded-[1.5rem] border border-current/10 bg-[repeating-linear-gradient(90deg,rgba(90,60,31,0.12)_0_8px,transparent_8px_16px),linear-gradient(135deg,rgba(255,255,255,0.32),rgba(77,124,254,0.12))] lg:hidden" />

      <div className="absolute inset-y-0 right-0 hidden w-[54%] overflow-hidden lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_58%_40%,rgba(255,255,255,0.62),transparent_32%),radial-gradient(circle_at_88%_18%,rgba(255,228,92,0.18),transparent_24%),radial-gradient(circle_at_72%_84%,rgba(77,124,254,0.14),transparent_28%)]" />

        <div className="absolute right-[9%] top-1/2 h-[28rem] w-[28rem] -translate-y-1/2 rounded-full border border-current/10 bg-[conic-gradient(from_145deg,rgba(200,109,73,0.16),rgba(255,255,255,0.06),rgba(142,163,106,0.16),rgba(77,124,254,0.13),rgba(200,109,73,0.16))]" />
        <div className="absolute right-[15%] top-1/2 h-[20rem] w-[20rem] -translate-y-1/2 rounded-full border border-dashed border-current/15" />

        <svg className="absolute right-[13%] top-[22%] h-[58%] w-[64%] text-current/20" viewBox="0 0 480 360" fill="none">
          <path d="M32 258C108 178 160 314 232 230C292 160 326 190 410 86" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeDasharray="10 14" />
          <path d="M405 86l-12 38 38-14-26-24z" fill="currentColor" opacity="0.28" />
        </svg>

        {scrapbookPieces.map((piece) => (
          <div
            key={piece.label}
            className={`absolute rounded-[1.35rem] border p-3 shadow-[0_18px_38px_rgba(71,52,31,0.14)] backdrop-blur-sm ${piece.className}`}
          >
            <div className="h-full rounded-[1rem] border border-white/55 bg-[linear-gradient(135deg,rgba(255,255,255,0.45),transparent)]" />
            <span className="absolute left-4 top-3 text-xs font-black uppercase tracking-[0.18em] opacity-55">{piece.label}</span>
          </div>
        ))}

        <div className="absolute right-[31%] top-[39%] flex h-24 w-24 rotate-[-10deg] items-center justify-center rounded-[1.75rem] border border-current/15 bg-white/38 shadow-[0_16px_36px_rgba(71,52,31,0.12)] backdrop-blur-md">
          {isDashboard ? <Camera className="h-10 w-10 opacity-70" /> : <Sparkles className="h-10 w-10 opacity-70" />}
        </div>
        <div className="absolute right-[8%] top-[39%] flex h-20 w-20 rotate-[12deg] items-center justify-center rounded-full border border-current/15 bg-white/30 shadow-[0_16px_36px_rgba(71,52,31,0.10)] backdrop-blur-md">
          {isDashboard ? <MapPin className="h-8 w-8 opacity-70" /> : <Cake className="h-8 w-8 opacity-70" />}
        </div>
      </div>
    </div>
  )
}
