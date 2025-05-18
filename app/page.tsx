"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
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
          <div className="flex items-center justify-center gap-2 mb-1">
            <p className="text-sm md:text-base font-nunito text-forest-600 italic">An Technovation Project</p>
            <Image 
              src="/image.png" 
              alt="Technovation Logo" 
              width={20} 
              height={20} 
              className="object-contain"
            />
          </div>
          <h2 className="text-xl md:text-2xl font-nunito text-forest-600 max-w-2xl">
            Learning Optimized
          </h2>
          <p className="text-xl md:text-2xl font-nunito text-forest-600 max-w-2xl">
            Built for Classes, Projects, and Teams
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
          className="w-full max-w-md mx-auto mt-8"
        >
          <Link href="/auth/login">
            <div className="bg-forest-500 hover:bg-forest-600 text-white rounded-lg py-4 px-8 flex items-center justify-center text-center shadow-lg shadow-forest-300/50 hover:shadow-xl hover:shadow-forest-400/50 transition-all duration-300 hover:translate-y-[-4px] cursor-pointer">
              <span className="text-xl font-marcellus mr-2">Get Started</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </Link>
        </motion.div>

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
