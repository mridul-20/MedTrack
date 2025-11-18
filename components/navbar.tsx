"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { PillIcon, MenuIcon, XIcon } from "lucide-react"
import { usePathname } from "next/navigation"
import { ThemeToggle } from "@/components/theme-toggle"

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  const publicRoutes = [
    { name: "Home", path: "/" },
    { name: "Scan", path: "/scan" },
    { name: "Inventory", path: "/inventory" },
    { name: "Expiry", path: "/expiry" },
    { name: "Recommendations", path: "/recommendations" },
    { name: "Assistant", path: "/assistant" },
    { name: "Nearby", path: "/nearby" },
  ]

  if (!mounted) {
    return null
  }

  return (
    <nav className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/80 backdrop-blur-2xl">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-3 text-white transition hover:text-emerald-200">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/5">
            <PillIcon className="h-5 w-5 text-emerald-300" />
          </div>
          <div className="leading-tight">
            <p className="text-[0.6rem] uppercase tracking-[0.55em] text-white/60">MediTrack</p>
            <p className="text-lg font-semibold">Care Command</p>
          </div>
        </Link>

        <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-xs font-semibold text-white/70 shadow-xl shadow-slate-950/30 md:flex">
          {publicRoutes.map((route) => (
            <Link key={route.path} href={route.path}>
              <Button
                variant={pathname === route.path ? "default" : "ghost"}
                className={`rounded-full px-4 ${
                  pathname === route.path
                    ? "bg-white text-slate-900 hover:bg-white/90"
                    : "text-white/70 hover:text-white"
                }`}
              >
                {route.name}
              </Button>
            </Link>
          ))}
          <ThemeToggle />
        </div>

        <div className="md:hidden">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <XIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="border-t border-white/10 bg-slate-950/95 px-6 pb-6 pt-4 md:hidden">
          <div className="flex flex-col gap-2">
            {publicRoutes.map((route) => (
              <Link key={route.path} href={route.path}>
                <Button
                  variant={pathname === route.path ? "default" : "ghost"}
                  className="w-full justify-between rounded-2xl"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {route.name}
                  {pathname === route.path && <span className="text-xs text-white/70">Active</span>}
                </Button>
              </Link>
            ))}
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white/80">
              <span>Theme</span>
              <ThemeToggle />
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}