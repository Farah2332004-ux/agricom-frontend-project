// src/app/[lng]/layout.tsx
import type { Metadata } from "next"
import "../globals.css"
import { SidebarDesktop, SidebarMobile } from "./components/organisms/Sidebar"
import Navbar from "./components/organisms/Navbar"
import { Poppins } from "next/font/google"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500"], // regular + medium
  variable: "--font-poppins",
})

export const metadata: Metadata = {
  title: "Agricom",
  description: "Production & Sales planning",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={poppins.variable}>
      <body className="min-h-dvh bg-background text-foreground antialiased font-sans">
        {/* Full-width navbar */}
        <Navbar />

        {/* Optional mobile drawer */}
        <SidebarMobile />

        {/* Shell: fixed sidebar + content on the right */}
        <div className="flex w-full">
          <SidebarDesktop />
          <main className="flex-1 md:pl-60">
            <div className="mx-auto w-full max-w-[1400px] p-3 md:p-6">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  )
}
