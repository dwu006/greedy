"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Users, Clock, Plus, Leaf, CalendarDays } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

// Sample class data - updated to include URL-safe slugs
const classes = [
  {
    id: 1,
    name: "Introduction to AI",
    slug: "introduction-to-ai",
    students: 24,
    progress: 65,
    description: "A comprehensive introduction to artificial intelligence concepts and applications.",
  },
  {
    id: 2,
    name: "Web Development Fundamentals",
    slug: "web-development-fundamentals",
    students: 18,
    progress: 42,
    description: "Learn the basics of HTML, CSS, and JavaScript for web development.",
  },
  {
    id: 3,
    name: "Data Structures & Algorithms",
    slug: "data-structures-algorithms",
    students: 32,
    progress: 78,
    description: "Master fundamental data structures and algorithms used in computer science.",
  },
]

export default function InstructorDashboard() {
  return (
    <div className="container mx-auto p-6 max-w-6xl grid-dots-bg min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-marcellus text-forest-800">My Classes</h1>
        <p className="text-forest-600 mt-1 font-nunito">Manage your curriculum and students</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Class Cards */}
        {classes.map((cls, index) => (
          <motion.div
            key={cls.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
          >
            <Card className="h-full overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow duration-300 bg-white/90">
              <CardHeader className="bg-gradient-to-r from-forest-100 to-leaf-50 pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl font-marcellus text-forest-800">{cls.name}</CardTitle>
                  <Leaf className="h-5 w-5 text-forest-500 animate-leaf-sway" />
                </div>
                <CardDescription className="flex items-center text-forest-600 font-nunito">
                  <Users className="mr-1 h-4 w-4" />
                  {cls.students} students
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-forest-600 font-nunito text-sm mb-4 line-clamp-2">{cls.description}</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-forest-600 flex items-center font-nunito">
                      <Clock className="mr-1 h-4 w-4" />
                      Progress
                    </span>
                    <span className="font-medium">{cls.progress}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-forest-400 to-leaf-400 rounded-full"
                      style={{ width: `${cls.progress}%` }}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex gap-2 pt-2">
                <Link href={`/instructor/${cls.slug}`} className="flex-1">
                  <Button variant="outline" className="w-full border-forest-200 text-forest-700">
                    View Class
                  </Button>
                </Link>
                <Link href={`/instructor/${cls.slug}/timeline`}>
                  <Button className="bg-forest-500 hover:bg-forest-600 text-white">
                    <CalendarDays className="h-4 w-4 mr-1" />
                    Timeline
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </motion.div>
        ))}

        {/* Add Class Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: classes.length * 0.1 }}
          whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
        >
          <Link href="/instructor/create-class">
            <Card className="h-full border-dashed border-2 border-forest-200 bg-white/90 hover:bg-forest-50/90 transition-colors duration-300 cursor-pointer">
              <CardContent className="flex flex-col items-center justify-center h-full py-12">
                <div className="w-16 h-16 rounded-full bg-forest-100 flex items-center justify-center mb-4">
                  <Plus className="h-8 w-8 text-forest-600" />
                </div>
                <h3 className="text-xl font-marcellus text-forest-700">Add New Class</h3>
                <p className="text-forest-500 text-center mt-2 font-nunito">
                  Create a new curriculum for your students
                </p>
              </CardContent>
            </Card>
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
