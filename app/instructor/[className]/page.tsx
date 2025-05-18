"use client"

import { useState, useEffect } from "react"
import React, { use } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/navigation" 
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronLeft, CalendarDays, FileText, Users, BookOpen, Clock, ArrowLeft, Pencil, ClipboardCheck, FileIcon } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

// Fallback data in case API fails
const fallbackTopics = [
  "Course Introduction",
  "Core Concepts",
  "Practical Applications",
  "Advanced Techniques",
  "Project Work",
  "Final Assessment",
];

const fallbackLessons = [
  {
    title: "Introduction to Course Material",
    date: new Date().toLocaleDateString(),
    time: "10:00 AM - 12:00 PM",
  },
  {
    title: "Fundamentals Overview",
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    time: "10:00 AM - 12:00 PM",
  },
];

// Sample student data
const studentData = [
  {
    id: "student-1",
    name: "Emma Johnson",
    email: "emma.johnson@example.com",
    avatar: "https://ui-avatars.com/api/?name=Emma+Johnson&background=5f9ea0&color=fff",
    grade: "A",
    attendance: 95,
    lastActive: "2 hours ago"
  },
  {
    id: "student-2",
    name: "Liam Smith",
    email: "liam.smith@example.com",
    avatar: "https://ui-avatars.com/api/?name=Liam+Smith&background=6b8e23&color=fff",
    grade: "B+",
    attendance: 88,
    lastActive: "Yesterday"
  },
  {
    id: "student-3",
    name: "Olivia Davis",
    email: "olivia.davis@example.com",
    avatar: "https://ui-avatars.com/api/?name=Olivia+Davis&background=9370db&color=fff",
    grade: "A-",
    attendance: 92,
    lastActive: "3 days ago"
  },
  {
    id: "student-4",
    name: "Noah Wilson",
    email: "noah.wilson@example.com",
    avatar: "https://ui-avatars.com/api/?name=Noah+Wilson&background=20b2aa&color=fff",
    grade: "B",
    attendance: 85,
    lastActive: "Just now"
  },
  {
    id: "student-5",
    name: "Ava Martinez",
    email: "ava.martinez@example.com",
    avatar: "https://ui-avatars.com/api/?name=Ava+Martinez&background=d2691e&color=fff",
    grade: "A+",
    attendance: 98,
    lastActive: "1 hour ago"
  },
  {
    id: "student-6",
    name: "William Anderson",
    email: "william.anderson@example.com",
    avatar: "https://ui-avatars.com/api/?name=William+Anderson&background=4682b4&color=fff",
    grade: "C+",
    attendance: 75,
    lastActive: "1 week ago"
  },
  {
    id: "student-7",
    name: "Sofia Thomas",
    email: "sofia.thomas@example.com", 
    avatar: "https://ui-avatars.com/api/?name=Sofia+Thomas&background=8fbc8f&color=fff",
    grade: "B-",
    attendance: 80,
    lastActive: "5 hours ago"
  },
  {
    id: "student-8",
    name: "Mason Clark",
    email: "mason.clark@example.com",
    avatar: "https://ui-avatars.com/api/?name=Mason+Clark&background=7b68ee&color=fff",
    grade: "A",
    attendance: 93,
    lastActive: "Yesterday"
  },
  {
    id: "student-9",
    name: "Isabella Wright",
    email: "isabella.wright@example.com",
    avatar: "https://ui-avatars.com/api/?name=Isabella+Wright&background=cd5c5c&color=fff",
    grade: "B+",
    attendance: 87,
    lastActive: "2 days ago"
  },
  {
    id: "student-10",
    name: "James Lewis",
    email: "james.lewis@example.com",
    avatar: "https://ui-avatars.com/api/?name=James+Lewis&background=3cb371&color=fff",
    grade: "A-",
    attendance: 91,
    lastActive: "Just now"
  },
  {
    id: "student-11",
    name: "Charlotte King",
    email: "charlotte.king@example.com",
    avatar: "https://ui-avatars.com/api/?name=Charlotte+King&background=4169e1&color=fff",
    grade: "B",
    attendance: 84,
    lastActive: "4 hours ago"
  },
  {
    id: "student-12",
    name: "Benjamin Scott",
    email: "benjamin.scott@example.com",
    avatar: "https://ui-avatars.com/api/?name=Benjamin+Scott&background=ff6347&color=fff",
    grade: "C",
    attendance: 72,
    lastActive: "3 days ago"
  },
];

// Define types for class data
interface ClassData {
  id: string;
  name: string;
  slug: string;
  description: string;
  schedule?: string | {
    lectures?: string;
    labSections?: string;
  };
  color?: string;
  createdAt?: string;
  students?: number;
  progress?: number;
  startDate?: string;
  endDate?: string;
  topics?: string[];
  classCode?: string;
  upcomingLessons?: {
    title: string;
    date: string;
    time: string;
  }[];
}

// Define assignment data interface
interface AssignmentData {
  name: string;
  startDate: string;
  endDate: string;
  description: string;
  files: File[];
  progress?: number; // Completion percentage
}

// Define timeline event interface
interface TimelineEvent {
  id: string;
  text: string;
  position: { x: number; y: number };
  assignmentData?: AssignmentData;
}

// Type for params that React.use() can work with
type ClassParams = {
  className: string;
};

export default function ClassPage({ params }: { params: ClassParams }) {
  const router = useRouter();
  // Using React.use() as recommended by Next.js
  // For Next.js 14+, this is required to handle route params correctly
  const unwrappedParams = use(params as any) as ClassParams;
  const classSlug = unwrappedParams.className;
  const [classData, setClassData] = useState<ClassData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [assignments, setAssignments] = useState<TimelineEvent[]>([]);

  // Fetch assignments from localStorage
  useEffect(() => {
    console.log('Looking for timeline events with slug:', classSlug);
    // Get timeline data from localStorage
    const timelineEventsJSON = localStorage.getItem(`timeline-events-${classSlug}`);
    if (timelineEventsJSON) {
      try {
        const events = JSON.parse(timelineEventsJSON);
        console.log('Found timeline events:', events);
        // Filter only events that have assignment data
        const assignmentEvents = events.filter((event: TimelineEvent) => event.assignmentData);
        setAssignments(assignmentEvents);
      } catch (error) {
        console.error('Error parsing timeline data from localStorage:', error);
        setAssignments([]);
      }
    } else {
      console.log('No timeline events found for this activity yet');
    }
  }, [classSlug]);

  useEffect(() => {
    async function fetchClassData() {
      try {
        console.log('Looking for activity with slug:', classSlug);
        
        // CRITICAL: First check if we have the activity in localStorage
        const storedClasses = localStorage.getItem('greedy_classes');
        console.log('Stored classes found:', storedClasses ? 'yes' : 'no');
        
        let foundClass = null;
        
        // Helper function to normalize slugs for comparison
        const normalizeSlug = (slug: string) => {
          // Handle special characters and URL encoding
          return decodeURIComponent(slug)
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
        };
        
        // Helper function to check if two slugs match after normalization
        const slugsMatch = (slug1: string | undefined, slug2: string) => {
          if (!slug1) return false;
          return normalizeSlug(slug1) === normalizeSlug(slug2);
        };
        
        // The URL slug might be URL encoded, so decode it for comparison
        const decodedClassSlug = decodeURIComponent(classSlug);
        console.log('Decoded class slug from URL:', decodedClassSlug);
        
        if (storedClasses) {
          try {
            const classes = JSON.parse(storedClasses);
            console.log('Parsed classes from localStorage:', classes.length);
            
            // Log all available classes for debugging
            classes.forEach((cls: ClassData, index: number) => {
              console.log(`Class ${index}: name=${cls.name}, slug=${cls.slug}`);
            });
            
            // Try multiple matching strategies
            // 1. Direct exact match
            foundClass = classes.find((cls: ClassData) => cls.slug === classSlug);
            
            // 2. Case-insensitive match
            if (!foundClass) {
              foundClass = classes.find((cls: ClassData) => 
                cls.slug && cls.slug.toLowerCase() === classSlug.toLowerCase()
              );
            }
            
            // 3. URL-decoded match
            if (!foundClass) {
              foundClass = classes.find((cls: ClassData) => 
                cls.slug && cls.slug === decodedClassSlug
              );
            }
            
            // 4. Normalized slug match (most comprehensive)
            if (!foundClass) {
              foundClass = classes.find((cls: ClassData) => slugsMatch(cls.slug, classSlug));
            }
            
            // 5. Match by name that would generate this slug
            if (!foundClass) {
              foundClass = classes.find((cls: ClassData) => 
                cls.name && normalizeSlug(cls.name) === normalizeSlug(classSlug)
              );
            }
            
            console.log('Found class in localStorage:', foundClass ? 'yes' : 'no');
            if (foundClass) {
              console.log('Found class details:', foundClass.name);
            }
          } catch (error) {
            console.error('Error parsing classes from localStorage:', error);
          }
        }
        
        // If not found in localStorage, try the API
        if (!foundClass) {
          console.log('Class not found in localStorage, trying API...');
          // Try to fetch the class data from our API
          const response = await fetch(`/api/class`);
          const data = await response.json();
          
          if (data.success) {
            // Use the same matching logic for API results
            const normalizedSlug = normalizeSlug(classSlug);
            foundClass = data.classes.find((cls: ClassData) => normalizeSlug(cls.slug || '') === normalizedSlug) ||
                         data.classes.find((cls: ClassData) => cls.name && normalizeSlug(cls.name) === normalizedSlug);
          }
        }
        
        if (foundClass) {
          console.log('Successfully found activity, processing it:', foundClass.name);
          
          // Generate a class code if needed
          const classCode = foundClass.classCode || generateUniqueClassCode();
          
          // Save the class code to localStorage
          localStorage.setItem(`class-code-${classSlug}`, classCode);
          
          // Save this as the most recent activity for backup and reference
          try {
            localStorage.setItem('most_recent_class', JSON.stringify(foundClass));
          } catch (storageError) {
            console.error('Error saving to most_recent_class:', storageError);
          }
          
          // Also save this class back to localStorage to ensure consistency
          if (!foundClass.slug) {
            foundClass.slug = foundClass.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          }
          
          // Enhance the class data with additional properties for UI
          const enhancedClassData = {
            ...foundClass,
            classCode, // Include the class code
            students: foundClass.students || Math.floor(Math.random() * 35) + 15,
            progress: foundClass.progress || Math.floor(Math.random() * 80) + 20,
            startDate: foundClass.startDate || new Date().toLocaleDateString(),
            endDate: foundClass.endDate || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toLocaleDateString(),
            topics: foundClass.topics || fallbackTopics,
            upcomingLessons: foundClass.upcomingLessons || fallbackLessons,
          };
          
          setClassData(enhancedClassData);
          console.log('Successfully loaded activity:', enhancedClassData.name);
          
          // Show success toast
          toast({
            title: "Activity loaded",
            description: `Successfully loaded ${enhancedClassData.name}`,
          });
        } else {
          console.error(`Activity with slug ${classSlug} not found in main search`);
          throw new Error(`Activity ${classSlug} not found`);
        }
      } catch (error) {
        console.error('Error fetching class data:', error);
        
        // Last resort: try to use the most recent activity as a fallback
        // This helps when users click View Activity on a newly created activity
        console.log('Attempting to recover using most_recent_class from localStorage');
        const mostRecentClass = localStorage.getItem('most_recent_class');
        
        if (mostRecentClass) {
          try {
            const recentClassData = JSON.parse(mostRecentClass);
            console.log('Found most_recent_class:', recentClassData.name);
            
            // Helper functions for slug comparison - defined again here because they're out of scope
            const normalizeSlugForRecovery = (slug: string) => {
              // Handle special characters and URL encoding
              return decodeURIComponent(slug)
                .toLowerCase()
                .replace(/\s+/g, '-')
                .replace(/[^a-z0-9-]/g, '-')
                .replace(/-+/g, '-')
                .replace(/^-|-$/g, '');
            };
            
            // Check if this most recent activity matches or is close to what we're looking for
            const possibleSlug = recentClassData.slug || 
                              (recentClassData.name && recentClassData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
            
            // Debug the match attempt
            console.log(`Comparing normalized slugs: ${normalizeSlugForRecovery(classSlug)} vs ${possibleSlug}`);
            
            // If it seems like a match or we're just desperate at this point
            const possibleMatch = possibleSlug && (
                normalizeSlugForRecovery(classSlug).includes(possibleSlug.substring(0, 5)) || 
                normalizeSlugForRecovery(recentClassData.name || '').includes(normalizeSlugForRecovery(classSlug).substring(0, 5))
            );
            
            console.log('Possible match based on partial name/slug comparison:', possibleMatch);
            
            // If we have a potential match or the user just clicked the most recent activity
            if (possibleMatch || normalizeSlugForRecovery(classSlug) === normalizeSlugForRecovery(possibleSlug || '')) {
              console.log('Found matching or similar recent activity, using that');
              
              // Save this class back to localStorage to ensure consistency
              if (!recentClassData.slug) {
                recentClassData.slug = recentClassData.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || '';
              }
              
              // Try to update the greedy_classes storage to include this class for future reference
              try {
                const storedClasses = localStorage.getItem('greedy_classes') || '[]';
                const classes = JSON.parse(storedClasses);
                // Remove any existing class with this slug to avoid duplicates
                const filteredClasses = classes.filter((cls: ClassData) => 
                  cls.slug !== classSlug && cls.slug !== recentClassData.slug);
                // Add the recent class with corrected slug
                filteredClasses.push(recentClassData);
                // Save back to localStorage
                localStorage.setItem('greedy_classes', JSON.stringify(filteredClasses));
                console.log('Updated greedy_classes with the recovered activity');
              } catch (e) {
                console.error('Error saving updated class to localStorage:', e);
              }
              
              // Enhance the class data with additional properties for UI
              const enhancedClassData = {
                ...recentClassData,
                classCode: recentClassData.classCode || generateUniqueClassCode(),
                students: recentClassData.students || Math.floor(Math.random() * 35) + 15,
                progress: recentClassData.progress || Math.floor(Math.random() * 80) + 20,
                startDate: recentClassData.startDate || new Date().toLocaleDateString(),
                endDate: recentClassData.endDate || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toLocaleDateString(),
                topics: recentClassData.topics || fallbackTopics,
                upcomingLessons: recentClassData.upcomingLessons || fallbackLessons,
              };
              
              // Show toast notification
              toast({
                title: "Activity Recovered",
                description: `Loaded activity: ${enhancedClassData.name}`,
              });
              
              // Update the UI
              setClassData(enhancedClassData);
              return;
            }
          } catch (e) {
            console.error('Error parsing most recent class:', e);
          }
        }
        
        // No matched class data found, reset state and notify user
        setClassData(null);
        
        // Show a toast notification with a button to return to dashboard
        toast({
          title: "Activity Not Found",
          description: `We couldn't find the activity you're looking for.`,
          variant: "destructive",
          action: (
            <Button onClick={() => router.push('/instructor/dashboard')} variant="outline" size="sm">
              Return to Dashboard
            </Button>
          )
        });
        
        return;
      } finally {
        setLoading(false);
      }
    }
    
    fetchClassData();
  }, [classSlug]);

  // Function to generate a unique class code (6 alphanumeric characters)
  const generateUniqueClassCode = () => {
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed similar looking characters
    let code = '';
    
    // Generate a 6-character code
    for (let i = 0; i < 6; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      code += characters.charAt(randomIndex);
    }
    
    return code;
  };

  // Show loading state
  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-forest-200/60 rounded-md mb-4"></div>
          <div className="h-4 w-96 bg-forest-200/40 rounded-md mb-6"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-32 bg-forest-200/30 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  // Show error state
  if (!classData) {
    return (
      <div className="container mx-auto p-6 max-w-6xl text-center">
        <h2 className="text-2xl font-semibold text-forest-700 mb-2">Class Not Found</h2>
        <p className="text-forest-600 mb-6">We couldn't find the class you're looking for.</p>
        <Link href="/instructor/dashboard">
          <Button variant="outline" className="border-forest-200 text-forest-700">
            <ArrowLeft className="mr-2 h-4 w-4" /> Return to Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  // Format dates for display - ensure exact date preservation
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    
    try {
      // First check if it's in YYYY-MM-DD format
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        const date = new Date(dateString);
        // Add 1 day to fix date offset issue (this matches what the user expects)
        const adjustedDate = new Date(date.getTime() + 86400000); // Add 24 hours (86400000 ms)
        return adjustedDate.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        });
      } else {
        // If it's already a formatted date like "May 18", just return it
        return dateString;
      }
    } catch (e) {
      console.error("Error formatting date:", e);
      return dateString; // Return original as fallback
    }
  };

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
            <Link href="/instructor/dashboard">
              <Button variant="ghost" size="icon" className="rounded-full mt-1">
                <ArrowLeft className="h-5 w-5 text-forest-600" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-jakarta font-semibold text-forest-800">{classData.name}</h1>
              {classData.classCode && (
                <div className="flex items-center mt-1 gap-2">
                  <span className="text-sm text-forest-600">Class Code:</span>
                  <span className="bg-forest-50 px-2 py-0.5 rounded border border-forest-100 font-mono text-forest-700 text-sm">{classData.classCode}</span>
                  <button
                    className="text-xs text-forest-600 hover:text-forest-800 transition-colors"
                    onClick={() => {
                      navigator.clipboard.writeText(classData.classCode || '');
                      toast({
                        title: "Code Copied",
                        description: "Class code copied to clipboard",
                        duration: 2000,
                      });
                    }}
                  >
                    Copy
                  </button>
                </div>
              )}
              <p className="text-forest-600 mt-2 font-inter">{classData.description}</p>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <Button 
                className="bg-forest-100 hover:bg-forest-200 text-forest-700 border border-forest-200"
                onClick={() => {
                  // Create share message with class details
                  const shareText = `Join my class "${classData.name}" with code: ${classData.classCode}`;
                  
                  // Try to use Web Share API if available
                  if (navigator.share) {
                    navigator.share({
                      title: `Join ${classData.name}`,
                      text: shareText,
                    }).catch(error => {
                      console.log('Error sharing', error);
                      // Fallback to clipboard
                      navigator.clipboard.writeText(shareText);
                      toast({
                        title: "Share Text Copied",
                        description: "Invitation message copied to clipboard",
                        duration: 2000,
                      });
                    });
                  } else {
                    // Fallback for browsers that don't support Web Share API
                    navigator.clipboard.writeText(shareText);
                    toast({
                      title: "Share Text Copied",
                      description: "Invitation message copied to clipboard",
                      duration: 2000,
                    });
                  }
                }}
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className="mr-2"
                >
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                  <polyline points="16 6 12 2 8 6"></polyline>
                  <line x1="12" y1="2" x2="12" y2="15"></line>
                </svg>
                Share Class
              </Button>
              <Link href={`/instructor/${classData.slug}/timeline`}>
                <Button className="bg-forest-500 hover:bg-forest-600 text-white">
                  <CalendarDays className="mr-2 h-4 w-4" /> Timeline
                </Button>
              </Link>
            </div>
            <Button className="bg-amber-500 hover:bg-amber-600 text-white w-full">
              <Pencil className="mr-2 h-4 w-4" /> Edit 
            </Button>
          </div>
        </div>
      </motion.div>

      <div className="mt-8">
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white/70 border-b border-gray-200 rounded-none p-0 h-auto">
            <TabsTrigger
              value="overview"
              className={`px-6 py-3 font-inter font-medium ${
                activeTab === "overview" ? "text-forest-700 border-b-2 border-forest-500" : "text-gray-500"
              }`}
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="students"
              className={`px-6 py-3 font-inter font-medium ${
                activeTab === "students" ? "text-forest-700 border-b-2 border-forest-500" : "text-gray-500"
              }`}
            >
              Students
            </TabsTrigger>
            <TabsTrigger
              value="assignments"
              className={`px-6 py-3 font-inter font-medium ${
                activeTab === "assignments" ? "text-forest-700 border-b-2 border-forest-500" : "text-gray-500"
              }`}
            >
              Assignments
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Class Info Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="md:col-span-1"
              >
                <Card className="bg-white/90 h-full">
                  <CardHeader>
                    <CardTitle className="font-jakarta text-forest-700 flex items-center">
                      <Users className="mr-2 h-5 w-5 text-forest-500" />
                      Class Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="font-medium text-forest-700 font-inter">Students</h3>
                      <p className="text-forest-600">{classData.students} enrolled</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-forest-700 font-inter">Schedule</h3>
                      {typeof classData.schedule === 'object' && classData.schedule !== null ? (
                        <div className="text-forest-600">
                          {classData.schedule.lectures && (
                            <p className="mb-1"><span className="font-medium">Lectures:</span> {classData.schedule.lectures}</p>
                          )}
                          {classData.schedule.labSections && typeof classData.schedule.labSections === 'string' ? (
                            <p className="mb-1"><span className="font-medium">Lab Sections:</span> {classData.schedule.labSections}</p>
                          ) : null}
                        </div>
                      ) : (
                        <p className="text-forest-600">{classData.schedule || "Not specified"}</p>
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-forest-700 font-inter">Dates</h3>
                      <p className="text-forest-600">
                        {classData.startDate} - {classData.endDate}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-medium text-forest-700 font-inter">Progress</h3>
                      <div className="mt-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-forest-600 font-inter">Course Completion</span>
                          <span className="font-medium">{classData.progress}%</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden mt-1">
                          <div
                            className="h-full bg-gradient-to-r from-forest-400 to-leaf-400 rounded-full"
                            style={{ width: `${classData.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Class Code */}
                    <div>
                      <h3 className="font-medium text-forest-700 font-inter">Class Code</h3>
                      <div className="mt-1 flex items-center gap-2">
                        <div className="bg-forest-50 border border-forest-100 rounded px-2 py-1 font-mono text-forest-700 flex-1 text-center">
                          {classData.classCode}
                        </div>
                        <button
                          className="text-xs px-2 py-1 bg-forest-100 hover:bg-forest-200 text-forest-700 rounded transition-colors"
                          onClick={() => {
                            navigator.clipboard.writeText(classData.classCode || '');
                            toast({
                              title: "Code Copied",
                              description: "Class code copied to clipboard",
                              duration: 2000,
                            });
                          }}
                        >
                          Copy
                        </button>
                      </div>
                      <p className="text-xs text-forest-500 mt-1">Share this code with students to join your class</p>
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
                    <CardTitle className="font-jakarta text-forest-700 flex items-center">
                      <BookOpen className="mr-2 h-5 w-5 text-forest-500" />
                      Topics Covered
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 font-inter">
                      {classData.topics && classData.topics.map((topic, index) => (
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
                    <CardTitle className="font-jakarta text-forest-700 flex items-center">
                      <ClipboardCheck className="mr-2 h-5 w-5 text-forest-500" />
                      Upcoming Lessons
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 font-inter">
                      {classData.upcomingLessons && classData.upcomingLessons.map((lesson, index) => (
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

          <TabsContent value="students" className="pt-6">
            <Card className="bg-white/90">
              <CardHeader>
                <CardTitle className="font-jakarta text-forest-700">Student Roster</CardTitle>
                <CardDescription>
                  {classData.students} students enrolled in {classData.name}
                </CardDescription>
                
                {/* Class code in students tab */}
                <div className="mt-3 flex items-center justify-between border border-forest-100 bg-forest-50/60 p-3 rounded-lg">
                  <div>
                    <h4 className="text-sm font-medium text-forest-700">Class Invitation Code</h4>
                    <p className="text-xs text-forest-600 mt-0.5">Share this code with students to join your class</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="bg-white px-3 py-1.5 rounded font-mono text-forest-700 border border-forest-200 text-base">
                      {classData.classCode}
                    </code>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-forest-200 text-forest-700 hover:bg-forest-100"
                      onClick={() => {
                        navigator.clipboard.writeText(classData.classCode || '');
                        toast({
                          title: "Code Copied",
                          description: "Class code copied to clipboard",
                          duration: 2000,
                        });
                      }}
                    >
                      Copy Code
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="text-left border-b border-forest-100">
                        <th className="pb-3 font-semibold text-forest-700 font-jakarta">Student</th>
                        <th className="pb-3 font-semibold text-forest-700 font-jakarta">Email</th>
                        <th className="pb-3 font-semibold text-forest-700 font-jakarta">Grade</th>
                        <th className="pb-3 font-semibold text-forest-700 font-jakarta">Attendance</th>
                        <th className="pb-3 font-semibold text-forest-700 font-jakarta">Last Active</th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentData.map((student) => (
                        <tr key={student.id} className="border-b border-forest-50 hover:bg-forest-50/30 transition-colors">
                          <td className="py-3">
                            <div className="flex items-center gap-3">
                              <img 
                                src={student.avatar} 
                                alt={student.name} 
                                className="w-8 h-8 rounded-full object-cover" 
                              />
                              <span className="font-medium text-forest-800 font-inter">{student.name}</span>
                            </div>
                          </td>
                          <td className="py-3 text-forest-600 font-inter">{student.email}</td>
                          <td className="py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              student.grade.startsWith('A') ? 'bg-green-100 text-green-800' :
                              student.grade.startsWith('B') ? 'bg-blue-100 text-blue-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {student.grade}
                            </span>
                          </td>
                          <td className="py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full ${
                                    student.attendance >= 90 ? 'bg-green-500' :
                                    student.attendance >= 80 ? 'bg-blue-500' :
                                    student.attendance >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${student.attendance}%` }}
                                />
                              </div>
                              <span className="text-sm text-forest-600">{student.attendance}%</span>
                            </div>
                          </td>
                          <td className="py-3 text-forest-600 font-inter">{student.lastActive}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t border-gray-100 pt-4">
                <p className="text-sm text-forest-500 font-inter">Showing {studentData.length} students</p>
                <div className="flex gap-2">
                  <Button variant="outline" className="border-forest-200 text-forest-700" size="sm">
                    Export List
                  </Button>
                  <Button className="bg-forest-500 hover:bg-forest-600 text-white" size="sm">
                    Manage Students
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="assignments" className="pt-6">
            <Card className="bg-white/90">
              <CardHeader>
                <CardTitle className="font-jakarta text-forest-700">Assignments</CardTitle>
                <CardDescription>
                  {assignments.length > 0 
                    ? `Showing ${assignments.length} assignment${assignments.length !== 1 ? 's' : ''} from your timeline` 
                    : "Manage course assignments, homework, and projects here"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {assignments.length > 0 ? (
                  <div className="space-y-4">
                    {assignments.map((assignment) => (
                      <div key={assignment.id} className="border border-forest-100 rounded-lg p-4 hover:bg-forest-50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-medium text-forest-700">{assignment.assignmentData?.name}</h3>
                            <div className="flex items-center text-sm text-forest-600 mt-1 space-x-4">
                              <div className="flex items-center">
                                <CalendarDays className="h-4 w-4 mr-1 text-forest-500" />
                                <span>
                                  {formatDate(assignment.assignmentData?.startDate || '')} - {formatDate(assignment.assignmentData?.endDate || '')}
                                </span>
                              </div>
                              <div className="flex items-center">
                                <FileText className="h-4 w-4 mr-1 text-forest-500" />
                                <span>{assignment.assignmentData?.files?.length || 0} files</span>
                              </div>
                            </div>
                            {assignment.assignmentData?.description && (
                              <p className="text-sm text-forest-600 mt-2">
                                {assignment.assignmentData.description}
                              </p>
                            )}
                          </div>
                          <Link href={`/instructor/${classSlug}/timeline`}>
                            <Button variant="outline" size="sm" className="text-forest-600 border-forest-200">
                              View in Timeline
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div>
                    <p className="text-forest-600 font-inter">
                      You can manage all assignments in the Timeline view. Click the Timeline button above to access the assignment management interface.
                    </p>
                    <div className="mt-6">
                      <Link href={`/instructor/${classSlug}/timeline`}>
                        <Button className="bg-forest-500 hover:bg-forest-600 text-white">
                          <CalendarDays className="mr-2 h-4 w-4" /> Go to Timeline
                        </Button>
                      </Link>
                    </div>
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
