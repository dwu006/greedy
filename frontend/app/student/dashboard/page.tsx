"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, BookOpen, GraduationCap, Leaf } from "lucide-react"
import { EmptyState } from "@/components/empty-state"

// Sample courses data
const sampleCourses = [
  {
    id: 1,
    title: "Introduction to Artificial Intelligence",
    instructor: "Dr. Jane Smith",
    progress: 65,
    nextLesson: "Neural Networks Basics",
    totalLessons: 12,
    completedLessons: 7,
  },
  {
    id: 2,
    title: "Web Development Fundamentals",
    instructor: "Prof. John Doe",
    progress: 42,
    nextLesson: "CSS Layouts",
    totalLessons: 10,
    completedLessons: 4,
  },
  {
    id: 3,
    title: "Data Structures & Algorithms",
    instructor: "Dr. Alan Turing",
    progress: 78,
    nextLesson: "Graph Algorithms",
    totalLessons: 15,
    completedLessons: 11,
  },
]

export default function StudentDashboard() {
  // State to control whether to show courses or empty state
  // Set to empty array to show empty state, or sampleCourses to show courses
  const [courses, setCourses] = useState(sampleCourses)

  // If no courses are available, show empty state
  if (courses.length === 0) {
    return <EmptyState />
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl grid-dots-bg min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-marcellus text-forest-800">My Courses</h1>
        <p className="text-forest-600 mt-1 font-nunito">Track your progress and continue learning</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course, index) => (
          <motion.div
            key={course.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
          >
            <Card className="h-full overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow duration-300 bg-white/90">
              <CardHeader className="bg-gradient-to-r from-leaf-50 to-forest-50 pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl font-marcellus text-forest-800">{course.title}</CardTitle>
                  <Leaf className="h-5 w-5 text-leaf-500 animate-leaf-sway" />
                </div>
                <CardDescription className="flex items-center text-forest-600 font-nunito">
                  <GraduationCap className="mr-1 h-4 w-4" />
                  {course.instructor}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-forest-600 font-nunito">Progress</span>
                    <span className="font-medium">{course.progress}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-leaf-400 to-forest-400 rounded-full"
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-forest-700 font-marcellus">Next Lesson</h4>
                  <p className="text-forest-600 text-sm font-nunito">{course.nextLesson}</p>
                </div>

                <div className="flex items-center justify-between text-xs text-forest-500 font-nunito">
                  <span className="flex items-center">
                    <BookOpen className="mr-1 h-3 w-3" />
                    {course.completedLessons}/{course.totalLessons} lessons
                  </span>
                  <span className="flex items-center">
                    <Clock className="mr-1 h-3 w-3" />
                    {Math.round((course.totalLessons - course.completedLessons) * 1.5)} hours left
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
