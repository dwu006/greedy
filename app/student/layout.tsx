import type React from "react"
import { TopNav } from "@/components/top-nav"

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <TopNav userType="student" />
      <main className="flex-1 bg-slate-50">{children}</main>
    </div>
  )
}
