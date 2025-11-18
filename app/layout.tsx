import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Navbar } from "@/components/navbar"
import { ThemeProvider } from "@/components/theme-provider"
import { UserProvider } from "@/contexts/user-context"
import { AuthProvider } from "@/contexts/auth-context"
import { ToastProvider } from "@/hooks/use-toast"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "MediTrack - Medicine Management System",
  description: "Track, manage, and get recommendations for your medicines",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-icon.png",
  },
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-slate-950 text-white`}>
        <div className="relative min-h-screen overflow-hidden bg-slate-950">
          <div className="pointer-events-none absolute inset-0 opacity-60">
            <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-emerald-500/20 blur-[180px]" />
            <div className="absolute right-0 top-40 h-[28rem] w-[28rem] rounded-full bg-cyan-500/20 blur-[200px]" />
            <div className="absolute bottom-0 left-1/2 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-fuchsia-500/10 blur-[220px]" />
          </div>

          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
            <AuthProvider>
              <UserProvider>
                <ToastProvider>
                  <div className="relative z-10 flex min-h-screen flex-col space-y-6">
                    <Navbar />
                    <main id="main-content" className="flex-1">
                      {children}
                    </main>
                  </div>
                </ToastProvider>
              </UserProvider>
            </AuthProvider>
          </ThemeProvider>
        </div>
      </body>
    </html>
  )
}