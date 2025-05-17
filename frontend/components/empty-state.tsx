"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Leaf } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function EmptyState() {
  return (
    <div className="container mx-auto p-6 max-w-6xl flex items-center justify-center min-h-[calc(100vh-4rem)] grid-dots-bg">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="flex flex-col items-center justify-center p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-leaf-100 flex items-center justify-center mb-6">
              <Leaf className="h-10 w-10 text-leaf-600 animate-leaf-sway" />
            </div>
            <h2 className="text-2xl font-marcellus text-forest-800 mb-2">No Courses Available</h2>
            <p className="text-forest-600 mb-6 font-nunito">
              You're not enrolled in any courses yet. Browse our catalog to find courses that interest you.
            </p>
            <Link href="/student/browse">
              <Button className="bg-forest-500 hover:bg-forest-600 text-white">Browse Courses</Button>
            </Link>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
