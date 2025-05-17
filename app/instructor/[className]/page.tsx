"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, CalendarDays, BookOpen, Clock, ClipboardList, ArrowLeft } from "lucide-react"

// Sample class data
const classesData = {
  "introduction-to-ai": {
    name: "Introduction to AI",
    description:
      "A comprehensive introduction to artificial intelligence covering basic concepts, history, and modern applications.",
    students: 24,
    progress: 65,
    startDate: "September 1, 2023",
    endDate: "December 15, 2023",
    topics: [
      "History of AI",
      "Machine Learning Basics",
      "Neural Networks",
      "Deep Learning",
      "Natural Language Processing",
      "Computer Vision",
      "AI Ethics",
    ],
    upcomingLessons: [
      {
        title: "Deep Learning Architecture",
        date: "October 15, 2023",
        time: "10:00 AM - 12:00 PM",
      },
      {
        title: "Convolutional Neural Networks",
        date: "October 22, 2023",
        time: "10:00 AM - 12:00 PM",
      },
    ],
  },
  "web-development-fundamentals": {
    name: "Web Development Fundamentals",
    description: "An introduction to web development covering HTML, CSS, JavaScript, and modern frameworks.",
    students: 18,
    progress: 42,
    startDate: "August 15, 2023",
    endDate: "November 30, 2023",
    topics: [
      "HTML Basics",
      "CSS Styling",
      "JavaScript Programming",
      "Responsive Design",
      "Frontend Frameworks",
      "Backend Basics",
      "Deployment",
    ],
    upcomingLessons: [
      {
        title: "CSS Layouts and Flexbox",
        date: "October 10, 2023",
        time: "2:00 PM - 4:00 PM",
      },
      {
        title: "JavaScript DOM Manipulation",
        date: "October 17, 2023",
        time: "2:00 PM - 4:00 PM",
      },
    ],
  },
  "data-structures-algorithms": {
    name: "Data Structures & Algorithms",
    description: "A detailed exploration of fundamental data structures and algorithms used in computer science.",
    students: 32,
    progress: 78,
    startDate: "September 5, 2023",
    endDate: "December 20, 2023",
    topics: [
      "Arrays and Linked Lists",
      "Stacks and Queues",
      "Trees and Graphs",
      "Sorting Algorithms",
      "Searching Algorithms",
      "Dynamic Programming",
      "Algorithm Analysis",
    ],
    upcomingLessons: [
      {
        title: "Graph Traversal Algorithms",
        date: "October 12, 2023",
        time: "1:00 PM - 3:00 PM",
      },
      {
        title: "Dynamic Programming Techniques",
        date: "October 19, 2023",
        time: "1:00 PM - 3:00 PM",
      },
    ],
  },
}

export default function ClassPage({ params }: { params: { className: string } }) {
  const [activeTab, setActiveTab] = useState("overview")
  const classData = classesData[params.className]

  // Fallback for when class data is not found
  if (!classData) {
    return (
      <div className="container mx-auto p-6 max-w-6xl grid-dots-bg min-h-screen">
        <div className="bg-white/90 rounded-lg p-8 shadow-md text-center">
          <h1 className="text-2xl font-marcellus text-forest-800 mb-4">Class Not Found</h1>
          <p className="text-forest-600 font-nunito mb-6">
            The class you're looking for doesn't exist or may have been removed.
          </p>
          <Link href="/instructor/dashboard">
            <Button className="bg-forest-500 hover:bg-forest-600 text-white">Return to Dashboard</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl grid-dots-bg min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-6"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-2">
            <Link href="/instructor/dashboard">
              <Button variant="ghost" size="icon" className="mr-1">
                <ArrowLeft className="h-4 w-4 text-forest-700" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-marcellus text-forest-800">{classData.name}</h1>
              <p className="text-forest-600 mt-1 font-nunito">{classData.description}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Link href={`/instructor/${params.className}/timeline`}>
              <Button className="bg-forest-500 hover:bg-forest-600 text-white">
                <CalendarDays className="mr-2 h-4 w-4" />
                View Timeline
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>

      <Tabs defaultValue="overview" className="mb-6" onValueChange={setActiveTab}>
        <TabsList className="bg-white/80 backdrop-blur-sm border border-forest-100">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Stats Cards */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <Card className="bg-white/90">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-marcellus text-forest-700 flex items-center">
                    <Users className="mr-2 h-5 w-5 text-forest-500" />
                    Students
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-semibold text-forest-800">{classData.students}</div>
                  <p className="text-sm text-forest-600 font-nunito">Currently enrolled</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Card className="bg-white/90">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-marcellus text-forest-700 flex items-center">
                    <Clock className="mr-2 h-5 w-5 text-forest-500" />
                    Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-semibold text-forest-800">{classData.progress}%</div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden mt-2">
                    <div
                      className="h-full bg-gradient-to-r from-forest-400 to-leaf-400 rounded-full"
                      style={{ width: `${classData.progress}%` }}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Card className="bg-white/90">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-marcellus text-forest-700 flex items-center">
                    <CalendarDays className="mr-2 h-5 w-5 text-forest-500" />
                    Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-forest-600 font-nunito">
                    <p>
                      <span className="font-semibold">Start:</span> {classData.startDate}
                    </p>
                    <p>
                      <span className="font-semibold">End:</span> {classData.endDate}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {/* Topics Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <Card className="bg-white/90">
                <CardHeader>
                  <CardTitle className="font-marcellus text-forest-700 flex items-center">
                    <BookOpen className="mr-2 h-5 w-5 text-forest-500" />
                    Topics Covered
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 font-nunito">
                    {classData.topics.map((topic, index) => (
                      <li key={index} className="flex items-center text-forest-600">
                        <div className="w-1.5 h-1.5 rounded-full bg-forest-400 mr-2"></div>
                        {topic}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            {/* Upcoming Lessons Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              <Card className="bg-white/90">
                <CardHeader>
                  <CardTitle className="font-marcellus text-forest-700 flex items-center">
                    <ClipboardList className="mr-2 h-5 w-5 text-forest-500" />
                    Upcoming Lessons
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 font-nunito">
                    {classData.upcomingLessons.map((lesson, index) => (
                      <div key={index} className="border-l-2 border-forest-300 pl-3 py-1">
                        <h4 className="font-medium text-forest-700">{lesson.title}</h4>
                        <p className="text-sm text-forest-600">
                          {lesson.date} • {lesson.time}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Link href={`/instructor/${params.className}/timeline`} className="w-full">
                    <Button variant="outline" className="w-full border-forest-200 text-forest-700">
                      View Full Timeline
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </motion.div>
          </div>
        </TabsContent>

        <TabsContent value="students">
          <Card className="bg-white/90">
            <CardHeader>
              <CardTitle className="font-marcellus text-forest-700">Student Roster</CardTitle>
              <CardDescription className="font-nunito text-forest-600">
                {classData.students} students enrolled in this class
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="font-nunito text-forest-600">Student list would appear here</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content">
          <Card className="bg-white/90">
            <CardHeader>
              <CardTitle className="font-marcellus text-forest-700">Course Content</CardTitle>
              <CardDescription className="font-nunito text-forest-600">
                Manage lessons, materials, and resources
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="font-nunito text-forest-600">Course content management would appear here</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
