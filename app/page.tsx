"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { BackgroundBlobs } from "@/components/background-blobs"
import { Leaf } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-forest-50 via-leaf-50 to-white flex flex-col items-center justify-center px-4 grid-dots-bg">
      <BackgroundBlobs />

      <main className="relative z-10 flex flex-col items-center justify-center w-full max-w-4xl mx-auto py-16 space-y-12">
        <motion.div
          className="text-center space-y-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="flex items-center justify-center gap-3 mb-2">
            <motion.div
              animate={{ rotate: [0, 5, 0, -5, 0] }}
              transition={{ duration: 6, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
            >
              <Leaf className="h-10 w-10 text-forest-500" />
            </motion.div>
            <h1 className="text-5xl md:text-7xl font-marcellus text-forest-800 tracking-tight">Greedy</h1>
          </div>
          <h2 className="text-xl md:text-2xl font-nunito text-forest-600 max-w-2xl">
            Smart Curriculum Scheduler for Instructors and Students
          </h2>
        </motion.div>

        <div className="flex flex-col md:flex-row gap-6 w-full max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
            className="flex-1"
          >
            <Link href="/auth/login?userType=instructor">
              <div className="h-full bg-white/70 backdrop-blur-sm rounded-lg p-8 flex flex-col items-center justify-center text-center shadow-lg shadow-forest-100/50 hover:shadow-xl hover:shadow-forest-200/50 transition-all duration-300 hover:translate-y-[-4px] cursor-pointer border border-forest-100">
                <h3 className="text-xl font-marcellus text-forest-700 mb-2">I'm an Instructor</h3>
                <p className="text-forest-600 font-nunito">Manage your curriculum and schedule</p>
              </div>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" }}
            className="flex-1"
          >
            <Link href="/auth/login?userType=student">
              <div className="h-full bg-white/70 backdrop-blur-sm rounded-lg p-8 flex flex-col items-center justify-center text-center shadow-lg shadow-leaf-100/50 hover:shadow-xl hover:shadow-leaf-200/50 transition-all duration-300 hover:translate-y-[-4px] cursor-pointer border border-leaf-100">
                <h3 className="text-xl font-marcellus text-forest-700 mb-2">I'm a Student</h3>
                <p className="text-forest-600 font-nunito">View your schedule and progress</p>
              </div>
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="mt-auto pt-8"
        >
          <p className="text-forest-500 italic font-nunito text-center">
            "Planning made simple, progress made visible."
          </p>
        </motion.div>
      </main>
    </div>
  )
}
