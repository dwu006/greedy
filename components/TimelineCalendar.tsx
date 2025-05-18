"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface TimelineCalendarProps {
  isOpen: boolean
  onClose: () => void
}

export function TimelineCalendar({ isOpen, onClose }: TimelineCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  
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
  
  // Generate calendar grid
  const days = []
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  
  // Add day names
  for (let i = 0; i < dayNames.length; i++) {
    days.push(
      <div key={`header-${i}`} className="text-center font-medium text-forest-600 py-4 border-b border-forest-100">
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
        className={`h-32 relative border-b border-r border-forest-100 transition-colors ${
          isToday ? "bg-forest-50" : "hover:bg-forest-50/30"
        }`}
      >
        <div className={`absolute top-4 left-4 text-base ${isToday ? "font-bold text-forest-700 bg-forest-100 w-8 h-8 flex items-center justify-center rounded-full" : "text-forest-600"}`}>
          {day}
        </div>
        {/* Events would be rendered here */}
        <div className="pt-8 px-2 text-xs text-forest-500">
          {/* Placeholder for future events */}
        </div>
      </div>
    )
  }
  
  return (
    <div className={`w-full h-full ${!isOpen ? 'hidden' : ''}`}>
      <div className="flex justify-between items-center mb-6 px-4 pt-8">
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-10 w-10 p-0 text-forest-600 hover:text-forest-700 hover:bg-forest-50" 
          onClick={prevMonth}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        
        <h2 className="text-xl font-medium text-forest-700">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h2>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-10 w-10 p-0 text-forest-600 hover:text-forest-700 hover:bg-forest-50" 
          onClick={nextMonth}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
      
      <div className="grid grid-cols-7 border-t border-forest-100 mx-4">
        {days}
      </div>
    </div>
  )
}
