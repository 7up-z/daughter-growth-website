"use client"

import * as Dropdown from "@radix-ui/react-dropdown-menu"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { Check, LogOut, Menu, Palette, UserRound, UsersRound, Heart } from "lucide-react"
import { themes, useTheme, type Theme } from "@/components/providers/theme-provider"
import { themeOrder } from "@/lib/app-theme"
import { memoryModules } from "@/lib/memory-modules"

export function FamilyMasthead({ publicView = false }: { publicView?: boolean }) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const { theme, setTheme } = useTheme()
  const member = publicView ? null : session?.user

  const moduleLinks = memoryModules.map((module) => ({
    ...module,
    href: publicView ? "/login" : module.href,
    active: !publicView && (pathname === module.href || pathname.startsWith(`${module.href}/`)),
  }))

  return (
    <header className="family-masthead">
      <Link href={publicView ? "/" : "/dashboard"} className="family-wordmark" aria-label={publicView ? "小咩首页" : "小咩工作台"}>
        <Heart size={19} strokeWidth={1.8} aria-hidden="true" />
        <span>小咩</span>
      </Link>

      <nav aria-label="家庭模块" className="family-main-nav">
        {moduleLinks.map((module) => (
          <Link key={module.title} href={module.href} prefetch={module.href === "/diary" ? false : undefined} aria-current={module.active ? "page" : undefined}>
            {module.title}
          </Link>
        ))}
      </nav>

      <div className="family-masthead-actions">
        <Dropdown.Root modal={false}>
          <Dropdown.Trigger className="family-icon-button" aria-label="切换主题">
            <Palette size={21} aria-hidden="true" />
          </Dropdown.Trigger>
          <Dropdown.Portal>
            <Dropdown.Content align="end" sideOffset={8} className="family-menu">
              <Dropdown.Label className="family-menu-label">主题</Dropdown.Label>
              <Dropdown.RadioGroup value={theme} onValueChange={(value) => void setTheme(value as Theme)}>
                {themeOrder.map((option) => (
                  <Dropdown.RadioItem key={option} value={option} className="family-menu-item">
                    <span className="family-theme-swatch" style={{ backgroundColor: themes[option].colors.primary }} />
                    <span>{themes[option].name}</span>
                    <Dropdown.ItemIndicator className="ml-auto"><Check size={16} /></Dropdown.ItemIndicator>
                  </Dropdown.RadioItem>
                ))}
              </Dropdown.RadioGroup>
            </Dropdown.Content>
          </Dropdown.Portal>
        </Dropdown.Root>

        <Dropdown.Root modal={false}>
          <Dropdown.Trigger className="family-icon-button family-mobile-nav" aria-label="打开家庭导航">
            <Menu size={21} aria-hidden="true" />
          </Dropdown.Trigger>
          <Dropdown.Portal>
            <Dropdown.Content align="end" sideOffset={8} className="family-menu">
              {moduleLinks.map((module) => (
                <Dropdown.Item key={module.title} asChild className="family-menu-item">
                  <Link href={module.href} prefetch={module.href === "/diary" ? false : undefined} aria-current={module.active ? "page" : undefined}>{module.title}</Link>
                </Dropdown.Item>
              ))}
            </Dropdown.Content>
          </Dropdown.Portal>
        </Dropdown.Root>

        {member ? (
          <Dropdown.Root modal={false}>
            <Dropdown.Trigger className="family-icon-button" aria-label="家庭账户">
              <UserRound size={21} aria-hidden="true" />
            </Dropdown.Trigger>
            <Dropdown.Portal>
              <Dropdown.Content align="end" sideOffset={8} className="family-menu">
                <Dropdown.Label className="family-menu-label break-all">{member.nickname || member.username}</Dropdown.Label>
                <Dropdown.Item asChild className="family-menu-item">
                  <Link href="/profile"><UserRound size={16} aria-hidden="true" /> 个人中心</Link>
                </Dropdown.Item>
                {member.role === "admin" && (
                  <Dropdown.Item asChild className="family-menu-item">
                    <Link href="/settings/family"><UsersRound size={16} aria-hidden="true" /> 家庭成员</Link>
                  </Dropdown.Item>
                )}
                <Dropdown.Separator className="family-menu-separator" />
                <Dropdown.Item className="family-menu-item" onSelect={() => void signOut({ callbackUrl: "/login" })}>
                  <LogOut size={16} aria-hidden="true" /> 退出登录
                </Dropdown.Item>
              </Dropdown.Content>
            </Dropdown.Portal>
          </Dropdown.Root>
        ) : (
          publicView && pathname !== "/login" && <Link href="/login" className="family-button family-button-warm">家人登录</Link>
        )}
      </div>
    </header>
  )
}
