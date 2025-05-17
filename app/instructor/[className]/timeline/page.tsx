"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusCircle, ChevronLeft, ChevronRight, Calendar, Clock, Search, Filter, ArrowLeft } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

// Sample class data
const classesData = {
  "introduction-to-ai": {
    name: "Introduction to AI",
    events: [
      {
        id: 1,
        title: "Introduction to AI Concepts",
        description: "Overview of AI concepts and history",
        date: "Monday, 10:00 AM",
        week: 1,
      },
      {
        id: 2,
        title: "Machine Learning Basics",
        description: "Fundamental ML algorithms and approaches",
        date: "Wednesday, 10:00 AM",
        week: 1,
      },
      {
        id: 3,
        title: "Neural Networks",
        description: "Introduction to neural network architectures",
        date: "Monday, 10:00 AM",
        week: 2,
      },
      {
        id: 4,
        title: "Deep Learning",
        description: "Advanced neural networks and applications",
        date: "Wednesday, 10:00 AM",
        week: 2,
      },
      {
        id: 5,
        title: "Natural Language Processing",
        description: "Text analysis and language models",
        date: "Monday, 10:00 AM",
        week: 3,
      },
    ],
  },
  "web-development-fundamentals": {
    name: "Web Development Fundamentals",
    events: [
      {
        id: 1,
        title: "HTML Basics",
        description: "Introduction to HTML structure and elements",
        date: "Tuesday, 2:00 PM",
        week: 1,
      },
      {
        id: 2,
        title: "CSS Fundamentals",
        description: "Styling web pages with CSS",
        date: "Thursday, 2:00 PM",
        week: 1,
      },
      {
        id: 3,
        title: "JavaScript Introduction",
        description: "Basics of JavaScript programming",
        date: "Tuesday, 2:00 PM",
        week: 2,
      },
      {
        id: 4,
        title: "DOM Manipulation",
        description: "Working with the Document Object Model",
        date: "Thursday, 2:00 PM",
        week: 2,
      },
      {
        id: 5,
        title: "Responsive Design",
        description: "Creating websites that work on all devices",
        date: "Tuesday, 2:00 PM",
        week: 3,
      },
    ],
  },
  "data-structures-algorithms": {
    name: "Data Structures & Algorithms",
    events: [
      {
        id: 1,
        title: "Introduction to Algorithms",
        description: "Basic concepts and complexity analysis",
        date: "Monday, 1:00 PM",
        week: 1,
      },
      {
        id: 2,
        title: "Arrays and Lists",
        description: "Working with sequential data structures",
        date: "Wednesday, 1:00 PM",
        week: 1,
      },
      {
        id: 3,
        title: "Stacks and Queues",
        description: "LIFO and FIFO data structures",
        date: "Monday, 1:00 PM",
        week: 2,
      },
      {
        id: 4,
        title: "Trees and Graphs",
        description: "Hierarchical and networked data structures",
        date: "Wednesday, 1:00 PM",
        week: 2,
      },
      {
        id: 5,
        title: "Sorting Algorithms",
        description: "Methods for ordering collections",
        date: "Monday, 1:00 PM",
        week: 3,
      },
    ],
  },
}

export default function TimelinePage() {
  const params = useParams()
  const router = useRouter()
  const className = params.className as string
  const [currentWeek, setCurrentWeek] = useState(1)
  const [draggedEvent, setDraggedEvent] = useState<number | null>(null)
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    date: "",
    week: currentWeek.toString(),
  })
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Fallback for when class data is not found
  const classData = classesData[className]
  if (!classData) {
    return (
      <div className="grid-dots-bg min-h-screen">
        <div className="container mx-auto p-6 max-w-6xl">
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
      </div>
    )
  }

  const filteredEvents = classData.events.filter((event) => event.week === currentWeek)

  const handleDragStart = (eventId: number) => {
    setDraggedEvent(eventId)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (targetWeek: number) => {
    if (draggedEvent !== null) {
      // In a real app, you would update the backend here
      setDraggedEvent(null)
    }
  }

  const handleNewEventChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setNewEvent((prev) => ({ ...prev, [id]: value }))
  }

  const handleAddEvent = () => {
    // In a real app, you would add the event to the backend
    setIsDialogOpen(false)
    // Reset form
    setNewEvent({
      title: "",
      description: "",
      date: "",
      week: currentWeek.toString(),
    })
  }

  return (
    <div className="grid-dots-bg min-h-screen">
      {/* Toolbar */}
      <div className="sticky top-0 z-10 w-full bg-white/90 backdrop-blur-sm border-b border-forest-100 shadow-sm">
        <div className="container mx-auto py-3 px-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Link href={`/instructor/${className}`}>
                <Button variant="ghost" size="icon" className="mr-1">
                  <ArrowLeft className="h-4 w-4 text-forest-700" />
                </Button>
              </Link>
              <h1 className="text-xl font-marcellus text-forest-800">{classData.name}: Timeline</h1>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentWeek(Math.max(1, currentWeek - 1))}
                  disabled={currentWeek === 1}
                  className="border-forest-200 text-forest-700"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="sr-only md:not-sr-only md:ml-2">Previous</span>
                </Button>

                <Select value={currentWeek.toString()} onValueChange={(val) => setCurrentWeek(Number.parseInt(val))}>
                  <SelectTrigger className="w-[120px] border-forest-200 bg-white">
                    <SelectValue placeholder="Week" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((week) => (
                      <SelectItem key={week} value={week.toString()}>
                        Week {week}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentWeek(currentWeek + 1)}
                  className="border-forest-200 text-forest-700"
                >
                  <span className="sr-only md:not-sr-only md:mr-2">Next</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              <div className="hidden md:flex w-64 relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-forest-500" />
                <Input placeholder="Search events..." className="pl-8 border-forest-200" />
              </div>

              <Button variant="outline" size="icon" className="border-forest-200 text-forest-700">
                <Filter className="h-4 w-4" />
              </Button>

              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-forest-500 hover:bg-forest-600 text-white">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Event
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Add New Event</DialogTitle>
                    <DialogDescription>Create a new event for your curriculum timeline.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        placeholder="Event title"
                        value={newEvent.title}
                        onChange={handleNewEventChange}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="date">Date & Time</Label>
                      <Input
                        id="date"
                        placeholder="e.g., Monday, 10:00 AM"
                        value={newEvent.date}
                        onChange={handleNewEventChange}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="week">Week</Label>
                      <Input id="week" type="number" min="1" value={newEvent.week} onChange={handleNewEventChange} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Event description"
                        value={newEvent.description}
                        onChange={handleNewEventChange}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" onClick={handleAddEvent}>
                      Add Event
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      {/* Main Timeline Content */}
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-marcellus text-forest-700">Week {currentWeek}</h2>
          <div className="flex items-center text-forest-600 text-sm font-nunito">
            <Calendar className="h-4 w-4 mr-2" />
            <span>October 15 - October 21, 2023</span>
          </div>
        </div>

        <div
          className="min-h-[60vh] bg-white/90 rounded-lg p-6 shadow-sm border border-forest-100"
          onDragOver={handleDragOver}
          onDrop={() => handleDrop(currentWeek)}
        >
          <div className="space-y-4">
            {filteredEvents.length === 0 ? (
              <div className="text-center py-12 text-forest-400 font-nunito">
                No events scheduled for this week. Drag events here or add a new one.
              </div>
            ) : (
              filteredEvents.map((event, index) => (
                <motion.div
                  key={event.id}
                  draggable
                  onDragStart={() => handleDragStart(event.id)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  whileDrag={{ scale: 1.05, opacity: 0.8 }}
                >
                  <Card className="border-l-4 border-l-forest-400 bg-white">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg font-marcellus text-forest-800">{event.title}</CardTitle>
                          <CardDescription className="font-nunito flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {event.date}
                          </CardDescription>
                        </div>
                        <div className="text-xs bg-forest-100 text-forest-700 px-2 py-1 rounded-full font-nunito">
                          Week {event.week}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="font-nunito">
                      <p className="text-sm text-forest-600">{event.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
