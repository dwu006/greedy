"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle, ChevronLeft, ChevronRight } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

// Sample timeline data
const initialEvents = [
  {
    id: 1,
    title: "Introduction to AI",
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
]

export default function InstructorTimeline() {
  const [events, setEvents] = useState(initialEvents)
  const [currentWeek, setCurrentWeek] = useState(1)
  const [draggedEvent, setDraggedEvent] = useState<number | null>(null)

  const filteredEvents = events.filter((event) => event.week === currentWeek)

  const handleDragStart = (eventId: number) => {
    setDraggedEvent(eventId)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (targetWeek: number) => {
    if (draggedEvent !== null) {
      setEvents(events.map((event) => (event.id === draggedEvent ? { ...event, week: targetWeek } : event)))
      setDraggedEvent(null)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-light text-slate-800">Timeline</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-lavender-500 hover:bg-lavender-600">
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
                <Input id="title" placeholder="Event title" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="date">Date & Time</Label>
                <Input id="date" placeholder="e.g., Monday, 10:00 AM" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="week">Week</Label>
                <Input id="week" type="number" min="1" defaultValue="1" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" placeholder="Event description" />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Add Event</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center justify-between mb-4">
        <Button
          variant="outline"
          onClick={() => setCurrentWeek(Math.max(1, currentWeek - 1))}
          disabled={currentWeek === 1}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous Week
        </Button>
        <h2 className="text-xl font-medium text-slate-700">Week {currentWeek}</h2>
        <Button variant="outline" onClick={() => setCurrentWeek(currentWeek + 1)}>
          Next Week
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>

      <div
        className="min-h-[300px] bg-white rounded-xl p-6 shadow-sm border border-slate-100"
        onDragOver={handleDragOver}
        onDrop={() => handleDrop(currentWeek)}
      >
        <div className="space-y-4">
          {filteredEvents.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
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
                <Card className="border-l-4 border-l-lavender-400">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg font-medium">{event.title}</CardTitle>
                        <CardDescription>{event.date}</CardDescription>
                      </div>
                      <div className="text-xs bg-lavender-100 text-lavender-700 px-2 py-1 rounded-full">
                        Week {event.week}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-600">{event.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
