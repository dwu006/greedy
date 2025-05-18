"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { 
  Users, 
  CalendarDays, 
  BookOpen, 
  Clock, 
  ClipboardList, 
  ArrowLeft, 
  FileIcon,
  GraduationCap
} from "lucide-react"
import { toast } from "@/components/ui/use-toast"

// Basic course data structure without assignments
interface CourseData {
  id: number;
  title: string;
  slug: string;
  description: string;
  instructor: string;
  progress: number;
  classCode: string;
  nextLesson: string;
  totalLessons: number;
  completedLessons: number;
  startDate: string;
  endDate: string;
  topics: string[];
  upcomingLessons: {
    title: string;
    date: string;
    time: string;
  }[];
}

// Simple mock data for course information
const mockCourseData: Record<string, CourseData> = {
  "intro-to-ai": {
    id: 1,
    title: "Introduction to Artificial Intelligence",
    slug: "intro-to-ai",
    description: "Learn about the fundamentals of artificial intelligence, including machine learning, neural networks, and natural language processing.",
    instructor: "Dr. Jane Smith",
    progress: 65,
    classCode: "AI456XY",
    nextLesson: "Neural Networks Basics",
    totalLessons: 12,
    completedLessons: 7,
    startDate: "Sep 15",
    endDate: "Dec 20",
    topics: [
      "Introduction to AI Concepts",
      "Machine Learning Basics",
      "Supervised Learning",
      "Unsupervised Learning",
      "Neural Networks",
      "Natural Language Processing"
    ],
    upcomingLessons: [
      {
        title: "Neural Networks Fundamentals",
        date: "Oct 25",
        time: "10:00 AM - 12:00 PM"
      },
      {
        title: "Back Propagation in Neural Networks",
        date: "Nov 1",
        time: "10:00 AM - 12:00 PM"
      }
    ]
  },
  "web-dev-fundamentals": {
    id: 2,
    title: "Web Development Fundamentals",
    slug: "web-dev-fundamentals",
    description: "Master the core technologies of web development, including HTML, CSS, JavaScript, and responsive design principles.",
    instructor: "Prof. John Doe",
    progress: 42,
    classCode: "WEB789ZQ",
    nextLesson: "CSS Layouts",
    totalLessons: 10,
    completedLessons: 4,
    startDate: "Sep 10",
    endDate: "Nov 15",
    topics: [
      "HTML Basics",
      "CSS Styling",
      "JavaScript Fundamentals",
      "Responsive Design",
      "DOM Manipulation",
      "Web Accessibility"
    ],
    upcomingLessons: [
      {
        title: "CSS Grid and Flexbox",
        date: "Oct 12",
        time: "2:00 PM - 4:00 PM"
      },
      {
        title: "JavaScript Events",
        date: "Oct 19",
        time: "2:00 PM - 4:00 PM"
      }
    ]
  },
  "data-structures": {
    id: 3,
    title: "Data Structures & Algorithms",
    slug: "data-structures",
    description: "Explore the fundamental data structures and algorithms used in computer science and software development.",
    instructor: "Dr. Alan Turing",
    progress: 78,
    classCode: "DSA234LP",
    nextLesson: "Graph Algorithms",
    totalLessons: 15,
    completedLessons: 11,
    startDate: "Aug 20",
    endDate: "Dec 5",
    topics: [
      "Arrays and Linked Lists",
      "Stacks and Queues",
      "Trees and Graphs",
      "Hashing",
      "Sorting Algorithms",
      "Search Algorithms",
      "Dynamic Programming"
    ],
    upcomingLessons: [
      {
        title: "Graph Traversal Algorithms",
        date: "Oct 10",
        time: "1:00 PM - 3:00 PM"
      },
      {
        title: "Shortest Path Algorithms",
        date: "Oct 17",
        time: "1:00 PM - 3:00 PM"
      }
    ]
  }
};

// Define a simple type for the assignments to make the code more type-safe
interface Assignment {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  description?: string;
  progress?: number;
  files: any[];
  position?: { x: number; y: number };
}

export default function StudentCoursePage() {
  const params = useParams();
  const courseSlug = Array.isArray(params.courseSlug) ? params.courseSlug[0] : params.courseSlug || '';
  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [updatingProgress, setUpdatingProgress] = useState<string | null>(null);
  const [tempProgress, setTempProgress] = useState(0);

  // Load assignments from localStorage
  const loadAssignments = () => {
    // Get timeline data from localStorage using the same key pattern as instructor
    const timelineEventsJSON = localStorage.getItem(`timeline-events-${courseSlug}`);
    if (timelineEventsJSON) {
      try {
        const events = JSON.parse(timelineEventsJSON);
        // Filter only events that have assignment data
        const assignmentEvents = events.filter((event: any) => event.assignmentData);
        
        // Map to extract assignment data with position and ID from the event
        const extractedAssignments = assignmentEvents.map((event: any) => ({
          id: event.id,
          position: event.position,
          ...event.assignmentData
        }));
        
        setAssignments(extractedAssignments);
      } catch (error) {
        console.error('Error parsing timeline data from localStorage:', error);
        setAssignments([]);
      }
    }
  };

  // Load course data and assignments on mount
  useEffect(() => {
    // Get course info from mock data
    const basicCourseData = mockCourseData[courseSlug];
    
    if (basicCourseData) {
      setCourseData(basicCourseData);
    } else {
      toast({
        title: "Course not found",
        description: "We couldn't find the course you're looking for.",
        variant: "destructive"
      });
    }
    
    // Load assignments
    loadAssignments();
    
    setLoading(false);
  }, [courseSlug]);

  // Function to format dates consistently
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      // Check if the date is valid
      if (isNaN(date.getTime())) {
        return "Invalid date";
      }
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid date";
    }
  };

  // Function to handle progress slider changes
  const handleProgressChange = (value: number) => {
    setTempProgress(value);
  };

  // Function to start updating progress for a specific assignment
  const startProgressUpdate = (assignmentId: string, currentProgress: number = 0) => {
    setUpdatingProgress(assignmentId);
    setTempProgress(currentProgress || 0);
  };

  // Function to save progress update
  const saveProgressUpdate = () => {
    if (!updatingProgress) return;
    
    updateAssignmentProgress(updatingProgress, tempProgress);
    setUpdatingProgress(null);
  };

  // Function to cancel progress update
  const cancelProgressUpdate = () => {
    setUpdatingProgress(null);
  };

  // Function to update assignment progress
  const updateAssignmentProgress = (assignmentId: string, newProgress: number) => {
    // First update local state
    setAssignments(prev => 
      prev.map(assignment => 
        assignment.id === assignmentId 
          ? { ...assignment, progress: newProgress }
          : assignment
      )
    );
    
    // Then update localStorage
    try {
      const timelineEventsJSON = localStorage.getItem(`timeline-events-${courseSlug}`);
      if (!timelineEventsJSON) return;
      
      const events = JSON.parse(timelineEventsJSON);
      const updatedEvents = events.map((event: any) => {
        if (event.id === assignmentId && event.assignmentData) {
          return {
            ...event,
            assignmentData: {
              ...event.assignmentData,
              progress: newProgress
            }
          };
        }
        return event;
      });
      
      localStorage.setItem(`timeline-events-${courseSlug}`, JSON.stringify(updatedEvents));
      
      toast({
        title: "Progress Updated",
        description: `Assignment progress updated to ${newProgress}%`,
        duration: 3000,
      });
    } catch (error) {
      console.error('Error updating assignment progress:', error);
      toast({
        title: "Error",
        description: "Failed to update assignment progress",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  // Helper function to determine assignment status
  const getAssignmentStatus = (assignment: Assignment) => {
    const now = new Date();
    const endDate = new Date(assignment.endDate);
    const progress = assignment.progress || 0;
    
    if (progress === 100) {
      return { label: "Completed", variant: "outline" as const };
    }
    
    if (endDate < now) {
      return { label: "Overdue", variant: "destructive" as const };
    }
    
    // Due in the next 3 days
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(now.getDate() + 3);
    
    if (endDate <= threeDaysFromNow) {
      return { label: "Due Soon", variant: "default" as const };
    }
    
    return { label: "In Progress", variant: "secondary" as const };
  };

  // Show loading state
  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-forest-200/60 rounded-md mb-4"></div>
          <div className="h-4 w-96 bg-forest-200/40 rounded-md mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-32 bg-forest-200/30 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  // Show error state
  if (!courseData) {
    return (
      <div className="container mx-auto p-6 max-w-6xl text-center">
        <h2 className="text-2xl font-semibold text-forest-700 mb-2">Course Not Found</h2>
        <p className="text-forest-600 mb-6">We couldn't find the course you're looking for.</p>
        <Link href="/student/dashboard">
          <Button variant="outline" className="border-forest-200 text-forest-700">
            <ArrowLeft className="mr-2 h-4 w-4" /> Return to Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl grid-dots-bg min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-6"
      >
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex items-start gap-2">
            <Link href="/student/dashboard">
              <Button variant="ghost" size="icon" className="rounded-full mt-1">
                <ArrowLeft className="h-5 w-5 text-forest-600" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-marcellus text-forest-800">{courseData.title}</h1>
              {courseData.classCode && (
                <div className="flex items-center mt-1 gap-2">
                  <span className="text-sm text-forest-600">Class Code:</span>
                  <span className="bg-forest-50 px-2 py-0.5 rounded border border-forest-100 font-mono text-forest-700 text-sm">{courseData.classCode}</span>
                </div>
              )}
              <p className="text-forest-600 mt-2 font-nunito">{courseData.description}</p>
            </div>
          </div>
          <div className="flex items-center text-forest-600 font-nunito gap-2 bg-forest-50 px-3 py-2 rounded-lg border border-forest-100">
            <GraduationCap className="h-5 w-5 text-forest-500" />
            <span>Instructor: <strong>{courseData.instructor}</strong></span>
          </div>
        </div>
      </motion.div>

      <div className="mt-8">
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white/70 border-b border-gray-200 rounded-none p-0 h-auto">
            <TabsTrigger
              value="overview"
              className={`px-6 py-3 font-nunito font-medium ${
                activeTab === "overview" ? "text-forest-700 border-b-2 border-forest-500" : "text-gray-500"
              }`}
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="assignments"
              className={`px-6 py-3 font-nunito font-medium ${
                activeTab === "assignments" ? "text-forest-700 border-b-2 border-forest-500" : "text-gray-500"
              }`}
            >
              Assignments
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Course Info Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="md:col-span-1"
              >
                <Card className="bg-white/90 h-full">
                  <CardHeader>
                    <CardTitle className="font-marcellus text-forest-700 flex items-center">
                      <BookOpen className="mr-2 h-5 w-5 text-forest-500" />
                      Course Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="font-medium text-forest-700 font-nunito">Progress</h3>
                      <div className="mt-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-forest-600 font-nunito">Course Completion</span>
                          <span className="font-medium">{courseData.progress}%</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden mt-1">
                          <div
                            className="h-full bg-gradient-to-r from-forest-400 to-leaf-400 rounded-full"
                            style={{ width: `${courseData.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium text-forest-700 font-nunito">Timeline</h3>
                      <p className="text-forest-600">
                        {courseData.startDate} - {courseData.endDate}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-medium text-forest-700 font-nunito">Lessons</h3>
                      <p className="text-forest-600">
                        {courseData.completedLessons} of {courseData.totalLessons} completed
                      </p>
                    </div>
                    <div>
                      <h3 className="font-medium text-forest-700 font-nunito">Next Lesson</h3>
                      <p className="text-forest-600">{courseData.nextLesson}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Topics Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
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
                      {courseData.topics && courseData.topics.map((topic: string, index: number) => (
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
                      {courseData.upcomingLessons && courseData.upcomingLessons.map((lesson: any, index: number) => (
                        <div key={index} className="border-l-2 border-forest-300 pl-3 py-1">
                          <h4 className="font-medium text-forest-700">{lesson.title}</h4>
                          <p className="text-sm text-forest-600">
                            {lesson.date} • {lesson.time}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>

          <TabsContent value="assignments" className="pt-6">
            <Card className="bg-white/90">
              <CardHeader>
                <CardTitle className="font-marcellus text-forest-700">Assignments</CardTitle>
                <CardDescription>
                  {assignments.length > 0 
                    ? `Showing ${assignments.length} assignment${assignments.length !== 1 ? 's' : ''}` 
                    : "No assignments yet for this course"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {assignments.length > 0 ? (
                  <div className="space-y-4">
                    {assignments.map((assignment: Assignment) => (
                      <div key={assignment.id} className="border border-forest-100 rounded-lg p-4 hover:bg-forest-50 transition-colors">
                        <div className="space-y-3">
                          <div className="flex justify-between items-start">
                            <h3 className="text-lg font-semibold text-forest-700">{assignment.name}</h3>
                            <Badge 
                              variant={getAssignmentStatus(assignment).variant} 
                              className="ml-2"
                            >
                              {getAssignmentStatus(assignment).label}
                            </Badge>
                          </div>

                          {/* Dates and progress */}
                          <div className="flex flex-col sm:flex-row sm:justify-between gap-2 text-sm text-forest-600">
                            <div>
                              <span className="font-medium">Due:</span> {formatDate(assignment.endDate)}
                              {assignment.startDate && (
                                <span className="ml-2">
                                  <span className="font-medium">Started:</span> {formatDate(assignment.startDate)}
                                </span>
                              )}
                            </div>
                            <div>
                              <span className="font-medium">Progress:</span> {assignment.progress || 0}%
                            </div>
                          </div>

                          {assignment.description && (
                            <div className="text-forest-600 mt-2">
                              <p>{assignment.description}</p>
                            </div>
                          )}

                          {/* Progress bar and controls */}
                          <div className="mt-3">
                            {updatingProgress === assignment.id ? (
                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="font-medium text-forest-600">Update progress: {tempProgress}%</span>
                                </div>
                                <input
                                  type="range"
                                  min="0"
                                  max="100"
                                  step="5"
                                  value={tempProgress}
                                  onChange={(e) => handleProgressChange(parseInt(e.target.value))}
                                  className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-forest-500"
                                />
                                <div className="flex justify-end gap-2 mt-2">
                                  <Button 
                                    size="sm" 
                                    className="text-forest-600 border-forest-200"
                                    onClick={cancelProgressUpdate}
                                  >
                                    Cancel
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    className="bg-forest-500 hover:bg-forest-600 text-white"
                                    onClick={saveProgressUpdate}
                                  >
                                    Save Progress
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div>
                                <div 
                                  className="relative h-1.5 w-full bg-gray-100 rounded-full overflow-hidden cursor-pointer group"
                                  onClick={() => startProgressUpdate(assignment.id, assignment.progress || 0)}
                                >
                                  <div 
                                    className="h-full bg-forest-500 transition-all duration-300"
                                    style={{ width: `${assignment.progress || 0}%` }}
                                  ></div>
                                  <div className="absolute inset-0 bg-forest-100 opacity-0 group-hover:opacity-20 transition-opacity"></div>
                                </div>
                                <div className="flex justify-end mt-2">
                                  <Button 
                                    size="sm" 
                                    className="text-forest-600 border-forest-200"
                                    onClick={() => startProgressUpdate(assignment.id, assignment.progress || 0)}
                                  >
                                    Update Progress
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-forest-600 font-nunito">
                      No assignments have been added to this course yet.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 