"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Leaf } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { ToastAction } from "@/components/ui/toast"

export default function CreateClassPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    capacity: "30",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      toast({
        title: "Class created successfully",
        description: `${formData.name} has been added to your classes.`,
        action: <ToastAction altText="View Dashboard">View Dashboard</ToastAction>,
      })
      router.push("/instructor/dashboard")
    }, 1500)
  }

  return (
    <div className="container mx-auto p-6 max-w-3xl grid-dots-bg min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-marcellus text-forest-800">Create New Class</h1>
        <p className="text-forest-600 mt-1 font-nunito">Set up a new curriculum for your students</p>
      </motion.div>

      <Card className="bg-white/90 shadow-md">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl font-marcellus text-forest-800">Class Details</CardTitle>
                <CardDescription className="font-nunito text-forest-600">
                  Fill in the information about your new class
                </CardDescription>
              </div>
              <Leaf className="h-6 w-6 text-forest-500 animate-leaf-sway" />
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="font-marcellus text-forest-700">
                Class Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="e.g., Introduction to Programming"
                className="border-forest-200"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="font-marcellus text-forest-700">
                Description <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Provide a brief description of the class..."
                className="border-forest-200 min-h-[100px]"
                value={formData.description}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate" className="font-marcellus text-forest-700">
                  Start Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  className="border-forest-200"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate" className="font-marcellus text-forest-700">
                  End Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  className="border-forest-200"
                  value={formData.endDate}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="capacity" className="font-marcellus text-forest-700">
                Maximum Students
              </Label>
              <Input
                id="capacity"
                type="number"
                min="1"
                className="border-forest-200"
                value={formData.capacity}
                onChange={handleChange}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Link href="/instructor/dashboard">
              <Button type="button" variant="outline" className="border-forest-200 text-forest-700">
                Cancel
              </Button>
            </Link>
            <Button type="submit" className="bg-forest-500 hover:bg-forest-600 text-white" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Class"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
