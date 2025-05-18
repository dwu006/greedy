"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Users, Clock, Plus, Leaf, CalendarDays } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import CreateClassPopup from "@/components/CreateClassPopup"
import { toast } from "@/components/ui/use-toast"

// Define the class type
interface ClassData {
  id: string;
  name: string;
  slug: string;
  description: string;
  schedule: string;
  color: string;
  createdAt: string;
  students?: number;
  progress?: number;
}

export default function InstructorDashboard() {
  const [showCreate, setShowCreate] = useState(false);
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Fetch classes from the API
  // Function to load classes from localStorage
  const loadClassesFromLocalStorage = () => {
    try {
      const storedClasses = localStorage.getItem('greedy_classes');
      if (storedClasses) {
        // Parse stored classes and add random stats for display
        const parsedClasses = JSON.parse(storedClasses);
        const classesWithStats = parsedClasses.map((cls: ClassData) => ({
          ...cls,
          students: Math.floor(Math.random() * 35) + 15, // 15-50 students
          progress: Math.floor(Math.random() * 80) + 20, // 20-100% progress
        }));
        
        console.log('Loaded classes from localStorage:', classesWithStats);
        return classesWithStats;
      }
      return null;
    } catch (error) {
      console.error('Error loading classes from localStorage:', error);
      return null;
    }
  };

  // Function to fetch classes from API
  const fetchClassesFromAPI = async () => {
    try {
      const response = await fetch('/api/class');
      const data = await response.json();
      
      if (data.success) {
        // Add random students and progress for UI purposes
        const classesWithStats = data.classes.map((cls: ClassData) => ({
          ...cls,
          students: Math.floor(Math.random() * 35) + 15, // 15-50 students
          progress: Math.floor(Math.random() * 80) + 20, // 20-100% progress
        }));
        
        console.log('Loaded classes from API:', classesWithStats);
        return classesWithStats;
      } else {
        throw new Error(data.error || 'Failed to fetch classes');
      }
    } catch (error) {
      console.error('Error fetching classes from API:', error);
      toast({
        title: "Error loading classes",
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: "destructive"
      });
      return null;
    }
  };

  // Function to refresh classes (can be called after adding a new class)
  const refreshClasses = async () => {
    setLoading(true);
    
    // First try localStorage
    const localClasses = loadClassesFromLocalStorage();
    if (localClasses && localClasses.length > 0) {
      setClasses(localClasses);
      setLoading(false);
      return;
    }
    
    // Fall back to API if no localStorage data
    const apiClasses = await fetchClassesFromAPI();
    if (apiClasses) {
      setClasses(apiClasses);
    } else {
      setClasses([]);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    refreshClasses();
    
    // Set up event listener for storage changes (when another tab updates localStorage)
    const handleStorageChange = () => {
      refreshClasses();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  return (
    <div className="container mx-auto p-6 max-w-6xl grid-dots-bg min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8 flex justify-between items-start"
      >
        <div>
          <h1 className="text-3xl font-jakarta font-semibold text-forest-800">My Activities</h1>
          <p className="text-forest-600 mt-1 font-inter">Manage and view your activities</p>
        </div>
        
        <Button 
          onClick={() => {
            // Show dialog to enter activity code
            const code = prompt('Enter activity code to join:');
            if (code) {
              toast({
                title: "Joining activity",
                description: "Searching for activity with code: " + code,
              });
              // This would normally connect to an API to join the activity
              // For now just show a success message
              setTimeout(() => {
                toast({
                  title: "Success!",
                  description: "You've joined the activity. Refresh to see it in your list."
                });
              }, 1500);
            }
          }}
          className="bg-forest-500 hover:bg-forest-600 text-white flex items-center gap-2"
        >
          <Users className="h-4 w-4" />
          Join Activity
        </Button>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Loading State */}
        {loading && Array.from({ length: 3 }).map((_, index) => (
          <motion.div
            key={`loading-${index}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <Card className="h-full overflow-hidden border-none shadow-md bg-white/90">
              <CardHeader className="bg-gradient-to-r from-forest-100/40 to-leaf-50/40 pb-2 animate-pulse">
                <div className="flex justify-between items-start">
                  <div className="h-6 w-48 bg-forest-200/60 rounded-md"></div>
                  <div className="h-5 w-5 bg-forest-200/60 rounded-full"></div>
                </div>
                <div className="h-4 w-24 bg-forest-200/60 rounded-md mt-2"></div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="h-4 w-full bg-forest-200/40 rounded-md mb-2"></div>
                <div className="h-4 w-3/4 bg-forest-200/40 rounded-md mb-4"></div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="h-4 w-20 bg-forest-200/40 rounded-md"></div>
                    <div className="h-4 w-8 bg-forest-200/40 rounded-md"></div>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-forest-400/30 to-leaf-400/30 rounded-full animate-pulse" style={{ width: '60%' }} />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex gap-2 pt-2">
                <div className="flex-1 h-10 bg-forest-200/40 rounded-md"></div>
                <div className="w-32 h-10 bg-forest-200/40 rounded-md"></div>
              </CardFooter>
            </Card>
          </motion.div>
        ))}

        {/* Class Cards */}
        {!loading && classes.map((cls, index) => (
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
                  <CardTitle className="text-xl font-jakarta font-semibold text-forest-800">{cls.name}</CardTitle>
                  <Leaf className="h-5 w-5 text-forest-500 animate-leaf-sway" />
                </div>
                <CardDescription className="flex items-center text-forest-600 font-inter">
                  <Users className="mr-1 h-4 w-4" />
                  {cls.students} students
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-forest-600 font-inter text-sm mb-4 line-clamp-2">{cls.description}</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-forest-600 flex items-center font-inter">
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
                    View Activity
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
          <div
            role="button"
            tabIndex={0}
            onClick={() => setShowCreate(true)}
            onKeyPress={e => { if (e.key === 'Enter') setShowCreate(true) }}
            className="h-full border-dashed border-2 border-forest-200 bg-white/90 hover:bg-forest-50/90 transition-colors duration-300 cursor-pointer rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-400"
          >
            <CardContent className="flex flex-col items-center justify-center h-full py-12">
              <div className="w-16 h-16 rounded-full bg-forest-100 flex items-center justify-center mb-4">
                <Plus className="h-8 w-8 text-forest-600" />
              </div>
              <h3 className="text-xl font-jakarta font-semibold text-forest-700">Add New Activity</h3>
              <p className="text-forest-500 text-center mt-2 font-inter">
                Create a new activity
              </p>
            </CardContent>
          </div>
        </motion.div>

        {/* Create Class Popup */}
        <CreateClassPopup
          open={showCreate}
          onClose={() => setShowCreate(false)}
        />
      </div>
    </div>
  )
}
