"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Calendar, FileIcon } from "lucide-react"
import { processAssignmentsToEvents, formatDateToYYYYMMDD } from "@/app/api/calendar/calendar.js"
import { Badge } from "@/components/ui/badge"

interface TimelineCalendarProps {
  isOpen: boolean
  onClose: () => void
  assignments?: any[] // Assignment data from timeline
  onEventClick?: (assignment: any) => void // Callback when event is clicked
}

export function TimelineCalendar({ 
  isOpen, 
  onClose, 
  assignments = [],
  onEventClick
}: TimelineCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [calendarEvents, setCalendarEvents] = useState<Map<string, any[]>>(new Map())
  
  // Process assignments into calendar events when assignments change or month changes
  useEffect(() => {
    if (assignments && assignments.length > 0) {
      const events = processAssignmentsToEvents(assignments);
      setCalendarEvents(events);
      console.log("Calendar events processed:", events);
    }
  }, [assignments, currentMonth.getMonth(), currentMonth.getFullYear()]);
  
  if (!isOpen) return null
  
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]
  
  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate()
  
  const firstDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  ).getDay()
  
  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }
  
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }
  
  // Function to render events for a specific day
  const renderEventsForDay = (day: number) => {
    // Create a date object for this day in the current month
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const dateKey = formatDateToYYYYMMDD(date);
    
    // Get events for this day from our calendarEvents map
    const events = calendarEvents.get(dateKey) || [];
    
    return events.map((event, index) => (
      <div 
        key={`${event.id}-${index}`}
        className="px-2 py-1 mb-1 bg-forest-100 rounded text-forest-700 truncate cursor-pointer hover:bg-forest-200"
        onClick={() => onEventClick && onEventClick(event.originalAssignment)}
        title={event.title}
      >
        <div className="flex items-center">
          <span className="truncate">{event.title}</span>
          {event.files && event.files.length > 0 && (
            <Badge variant="outline" className="ml-1 px-1 py-0 text-[0.6rem] h-4 flex items-center">
              <FileIcon className="w-2 h-2 mr-1" />{event.files.length}
            </Badge>
          )}
        </div>
      </div>
    ));
  };
  
  // Generate calendar grid
  const days = []
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  
  // Add day names
  for (let i = 0; i < dayNames.length; i++) {
    days.push(
      <div key={`header-${i}`} className="text-center font-medium text-forest-600 py-2 border-b border-forest-100">
        {dayNames[i]}
      </div>
    )
  }
  
  // Add empty cells for days before the first day of month
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(<div key={`empty-${i}`} className="h-32 border-b border-r border-forest-100"></div>)
  }
  
  // Add cells for each day of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const today = new Date()
    const isToday = 
      day === today.getDate() && 
      currentMonth.getMonth() === today.getMonth() && 
      currentMonth.getFullYear() === today.getFullYear()
    
    days.push(
      <div 
        key={`day-${day}`} 
        className={`h-32 relative border-b border-r border-forest-100 transition-colors overflow-hidden ${
          isToday ? "bg-forest-50" : "hover:bg-forest-50/30"
        }`}
      >
        <div className={`absolute top-2 left-2 text-sm ${isToday ? "font-bold text-forest-700 bg-forest-100 w-6 h-6 flex items-center justify-center rounded-full" : "text-forest-600"}`}>
          {day}
        </div>
        <div className="pt-8 px-1 text-xs text-forest-800 flex flex-col space-y-1 overflow-y-auto max-h-[5.5rem]">
          {renderEventsForDay(day)}
        </div>
      </div>
    )
  }
  
  return (
    <div className={`w-full h-full ${!isOpen ? 'hidden' : ''}`}>
      <div className="flex justify-between items-center mb-4 px-2 pt-4">
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0 text-forest-600 hover:text-forest-700 hover:bg-forest-50" 
          onClick={prevMonth}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div className="flex items-center">
          <Calendar className="h-4 w-4 mr-2 text-forest-500" />
          <h2 className="text-lg font-medium text-forest-700">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h2>
        </div>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0 text-forest-600 hover:text-forest-700 hover:bg-forest-50" 
          onClick={nextMonth}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="grid grid-cols-7 border-t border-forest-100 mx-2 text-sm">
        {days}
      </div>
      
      <div className="px-2 mt-4 text-xs text-forest-500 italic text-center">
        Click on events to select the corresponding assignment box
      </div>
    </div>
  )
}
