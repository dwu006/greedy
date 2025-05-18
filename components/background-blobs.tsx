"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"

interface Blob {
  id: number
  x: number
  y: number
  size: number
  color: string
  duration: number
  delay: number
}

export function BackgroundBlobs() {
  const [blobs, setBlobs] = useState<Blob[]>([])

  useEffect(() => {
    // Generate random blobs with tree-themed colors
    const colors = [
      "rgba(148, 205, 168, 0.2)", // light green
      "rgba(94, 175, 123, 0.15)", // medium green
      "rgba(224, 241, 229, 0.25)", // very light green
      "rgba(134, 239, 172, 0.1)", // leaf green
      "rgba(255, 255, 255, 0.3)", // white
    ]

    const newBlobs = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 20 + 10,
      color: colors[Math.floor(Math.random() * colors.length)],
      duration: Math.random() * 20 + 15,
      delay: Math.random() * 5,
    }))

    setBlobs(newBlobs)
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden">
      {blobs.map((blob) => (
        <motion.div
          key={blob.id}
          className="absolute rounded-full blur-3xl"
          style={{
            left: `${blob.x}%`,
            top: `${blob.y}%`,
            backgroundColor: blob.color,
            width: `${blob.size}vw`,
            height: `${blob.size}vw`,
          }}
          animate={{
            x: [0, 30, -20, 10, 0],
            y: [0, -20, 30, -10, 0],
            opacity: [0.7, 0.5, 0.8, 0.6, 0.7],
          }}
          transition={{
            duration: blob.duration,
            ease: "easeInOut",
            repeat: Number.POSITIVE_INFINITY,
            delay: blob.delay,
          }}
        />
      ))}
    </div>
  )
}
