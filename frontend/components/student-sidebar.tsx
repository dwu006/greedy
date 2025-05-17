"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { LayoutDashboard, Calendar, BarChart } from "lucide-react"

const sidebarItems = [
  {
    name: "Dashboard",
    href: "/student/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "My Timeline",
    href: "/student/timeline",
    icon: Calendar,
  },
  {
    name: "Progress",
    href: "/student/progress",
    icon: BarChart,
  },
]

export function StudentSidebar() {
  const pathname = usePathname()

  return (
    <motion.div
      className="hidden md:flex h-screen w-64 flex-col border-r bg-white/80 backdrop-blur-sm"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex flex-col gap-2 p-4">
        {sidebarItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-slate-500 transition-all hover:text-slate-900",
              pathname === item.href ? "bg-mint-100 text-slate-900" : "",
            )}
          >
            <item.icon className="h-5 w-5" />
            <span>{item.name}</span>
          </Link>
        ))}
      </div>
    </motion.div>
  )
}
