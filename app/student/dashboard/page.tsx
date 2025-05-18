"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, BookOpen, GraduationCap, Leaf, Plus } from "lucide-react"
import { EmptyState } from "@/components/empty-state"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"

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
    slug: "intro-to-ai",
    classCode: "AI456XY",
  },
  {
    id: 2,
    title: "Web Development Fundamentals",
    instructor: "Prof. John Doe",
    progress: 42,
    nextLesson: "CSS Layouts",
    totalLessons: 10,
    completedLessons: 4,
    slug: "web-dev-fundamentals",
    classCode: "WEB789ZQ",
  },
  {
    id: 3,
    title: "Data Structures & Algorithms",
    instructor: "Dr. Alan Turing",
    progress: 78,
    nextLesson: "Graph Algorithms",
    totalLessons: 15,
    completedLessons: 11,
    slug: "data-structures",
    classCode: "DSA234LP",
  },
]

export default function StudentDashboard() {
  // State to control whether to show courses or empty state
  // Set to empty array to show empty state, or sampleCourses to show courses
  const [courses, setCourses] = useState(sampleCourses)
  const [classCode, setClassCode] = useState("")
  const [isJoining, setIsJoining] = useState(false)
  
  const handleJoinCourse = () => {
    if (!classCode.trim()) {
      toast({
        title: "Class code required",
        description: "Please enter a valid class code to join a course.",
        variant: "destructive",
      })
      return
    }
    
    // In a real app, you would make an API call to verify the code
    // and add the student to the course
    setIsJoining(true)
    
    // Simulate API call with timeout
    setTimeout(() => {
      // For demonstration, just check if it matches one of our mock codes
      const foundCourse = courses.find(c => c.classCode === classCode.toUpperCase())
      
      if (foundCourse) {
        toast({
          title: "Already joined",
          description: `You're already enrolled in "${foundCourse.title}"`,
          variant: "default",
        })
      } else if (classCode.toUpperCase() === "NEWCLASS") {
        // Add a new mock course for demonstration
        const newCourse = {
          id: courses.length + 1,
          title: "New Course Example",
          instructor: "Prof. New Teacher",
          progress: 0,
          nextLesson: "Introduction to Course",
          totalLessons: 8,
          completedLessons: 0,
          slug: "new-course-example",
          classCode: classCode.toUpperCase()
        }
        
        setCourses([...courses, newCourse])
        
        toast({
          title: "Success!",
          description: "You've successfully joined the course.",
          variant: "default",
        })
      } else {
        toast({
          title: "Invalid code",
          description: "No course found with this code. Please check and try again.",
          variant: "destructive",
        })
      }
      
      setClassCode("")
      setIsJoining(false)
    }, 1500)
  }

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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-marcellus text-forest-800">My Courses</h1>
            <p className="text-forest-600 mt-1 font-nunito">Track your progress and continue learning</p>
          </div>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-forest-500 hover:bg-forest-600 text-white">
                <Plus className="mr-2 h-4 w-4" /> Join Course
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Join a Course</DialogTitle>
                <DialogDescription>
                  Enter the class code provided by your instructor to join a course.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="class-code" className="text-forest-700">Class Code</Label>
                  <Input
                    id="class-code"
                    placeholder="Enter class code (e.g. ABC123)"
                    value={classCode}
                    onChange={(e) => setClassCode(e.target.value)}
                    className="border-forest-200"
                  />
                  <p className="text-xs text-forest-500">
                    Tip: Try "NEWCLASS" to see how joining works!
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button 
                  onClick={handleJoinCourse} 
                  className="bg-forest-500 hover:bg-forest-600 text-white"
                  disabled={isJoining}
                >
                  {isJoining ? "Joining..." : "Join Course"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
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
            <Link href={`/student/course/${course.slug}`} className="block h-full">
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
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
