"use client"

import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { useTheme } from "@/components/providers/theme-provider"
import { appThemeStyles } from "@/lib/app-theme"
import { FamilyMasthead } from "./family-masthead"

export function useCurrentThemeStyle() {
  const { theme } = useTheme()
  return appThemeStyles[theme]
}

export function ThemedLoading({ label = "加载中…" }: { label?: string }) {
  return (
    <div className="yearbook-shell grid place-items-center px-6">
      <p className="archive-status" role="status">{label}</p>
    </div>
  )
}

export function ThemedShell({
  children,
  maxWidth = "max-w-5xl",
}: {
  children: React.ReactNode
  maxWidth?: string
}) {
  return (
    <div className="yearbook-shell">
      <div className={`yearbook-container ${maxWidth}`}>
        {children}
      </div>
    </div>
  )
}

export function ThemedHeader({
  backHref,
  title = "成长记录",
  action,
}: {
  backHref?: string
  title?: string
  action?: React.ReactNode
}) {
  return (
    <>
      <FamilyMasthead />
      {(backHref || action) && (
        <div className="family-section-actions" role="group" aria-label={`${title}操作`}>
          {backHref && (
            <Link href={backHref} className="family-text-link">
              <ChevronLeft size={17} aria-hidden="true" /> 返回
            </Link>
          )}
          {action && <div>{action}</div>}
        </div>
      )}
    </>
  )
}

export function ThemedPageHero({ title, description }: { title: string; description?: string }) {
  return (
    <section className="family-subpage-title">
      <h1 className="yearbook-display">{title}</h1>
      {description && <p>{description}</p>}
    </section>
  )
}
