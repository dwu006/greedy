"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Leaf, FileText, Upload, PenTool } from "lucide-react";
import { toast } from "./ui/use-toast";
import { ToastAction } from "./ui/toast";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from "./ui/card";

import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

export default function CreateClassPopup({ open, onClose }: {
  open: boolean;
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState("manual");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Form data for manual creation
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    schedule: "",
    startDate: "",
    endDate: "",
    color: "forest"
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };
  
  // Handle file selection for syllabus upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Validate file type
      if (file.type !== 'application/pdf') {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF file",
          variant: "destructive"
        });
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload a file smaller than 5MB",
          variant: "destructive"
        });
        return;
      }
      
      setUploadedFile(file);
      toast({
        title: "File selected",
        description: `${file.name} ready for upload`
      });
    }
  };
  
  // Clear the selected file
  const clearFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle manual class creation
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Format the schedule string
      const scheduleString = formData.schedule ? formData.schedule : 
        `${formData.startDate} to ${formData.endDate}`;
      
      // Prepare the data for API
      const classData = {
        name: formData.name,
        description: formData.description,
        schedule: scheduleString,
        color: formData.color
      };
      
      // Call the API to create the class
      const response = await fetch('/api/class', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(classData),
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Show success message
        toast({
          title: "Class created successfully",
          description: `${formData.name} has been added to your classes.`,
          action: <ToastAction altText="View Dashboard">View Dashboard</ToastAction>,
        });
        
        // Refresh the page to show the new class card
        window.location.reload();
      } else {
        throw new Error(result.error || 'Failed to create class');
      }
    } catch (error) {
      console.error('Error creating class:', error);
      toast({
        title: "Error creating class",
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
      onClose();
    }
  };
  
  // Handle syllabus upload and processing
  const handleSyllabusUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!uploadedFile) {
      toast({
        title: "No file selected",
        description: "Please select a syllabus PDF to upload",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    setUploadProgress(10); // Start progress
    
    try {
      // Create form data for file upload
      const formData = new FormData();
      formData.append('file', uploadedFile);
      
      setUploadProgress(30); // Update progress during upload prep
      
      // Call the syllabus API
      const response = await fetch('/api/syllabus', {
        method: 'POST',
        body: formData
      });
      
      setUploadProgress(70); // Update progress after upload
      
      const result = await response.json();
      
      setUploadProgress(100); // Complete progress
      
      if (result.success) {
        // Show success message
        toast({
          title: "Class created from syllabus",
          description: `${result.class.name} has been added to your classes with ${result.assignments?.length || 0} assignments.`,
          action: <ToastAction altText="View Dashboard">View Dashboard</ToastAction>,
        });
        
        // Refresh the page to show the new class card
        window.location.reload();
      } else {
        throw new Error(result.error || 'Failed to process syllabus');
      }
    } catch (error) {
      console.error('Error processing syllabus:', error);
      toast({
        title: "Error processing syllabus",
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: "destructive"
      });
      setUploadProgress(0); // Reset progress on error
    } finally {
      setIsSubmitting(false);
      onClose();
    }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-xl"
      >
        <Card className="bg-white/95 shadow-2xl relative">
          <button
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-xl font-bold"
            onClick={onClose}
            aria-label="Close"
            type="button"
          >
            ×
          </button>
          
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle className="text-xl font-jakarta font-semibold text-forest-800 flex items-center gap-2">
                Create New Class
                <Leaf className="h-6 w-6 text-forest-500 animate-leaf-sway" />
              </CardTitle>
            </div>
            <CardDescription className="font-inter text-forest-600 mt-2">
              Create a class by filling in details or uploading a syllabus
            </CardDescription>
          </CardHeader>
          
          {/* Clear options interface with tabs and separator */}
          <div className="px-6 py-2">
            <div className="flex items-center justify-center mb-2">
              <button 
                onClick={() => setActiveTab("manual")} 
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${activeTab === "manual" ? "bg-forest-100 text-forest-700" : "bg-gray-50 text-gray-500"}`}
              >
                <PenTool className="h-4 w-4" /> Manual Entry
              </button>
              
              <div className="mx-4 flex items-center">
                <div className="h-px w-8 bg-gray-300"></div>
                <span className="mx-3 text-gray-500 font-medium">OR</span>
                <div className="h-px w-8 bg-gray-300"></div>
              </div>
              
              <button 
                onClick={() => setActiveTab("syllabus")} 
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${activeTab === "syllabus" ? "bg-blue-100 text-blue-700" : "bg-gray-50 text-gray-500"}`}
              >
                <FileText className="h-4 w-4" /> Upload Syllabus
              </button>
            </div>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            
            {/* Manual Class Creation Tab */}
            <TabsContent value="manual">
              <form onSubmit={handleManualSubmit}>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="font-jakarta font-medium text-forest-700">
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
                    <Label htmlFor="description" className="font-jakarta font-medium text-forest-700">
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

                  <div className="space-y-2">
                    <Label htmlFor="schedule" className="font-jakarta font-medium text-forest-700">
                      Class Schedule <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="schedule"
                      placeholder="e.g., MWF 10:00-11:30AM or TR 1:00-2:30PM"
                      className="border-forest-200"
                      value={formData.schedule}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startDate" className="font-jakarta font-medium text-forest-700">
                        Start Date
                      </Label>
                      <Input
                        id="startDate"
                        type="date"
                        className="border-forest-200"
                        value={formData.startDate}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endDate" className="font-jakarta font-medium text-forest-700">
                        End Date
                      </Label>
                      <Input
                        id="endDate"
                        type="date"
                        className="border-forest-200"
                        value={formData.endDate}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  {/* Color Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="color" className="font-jakarta font-medium text-forest-700">
                      Card Color
                    </Label>
                    <div className="flex flex-wrap gap-3">
                      {['forest', 'blue', 'purple', 'amber', 'green', 'teal', 'pink'].map((color) => (
                        <button
                          key={color}
                          type="button"
                          className={`w-8 h-8 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                            formData.color === color ? 'ring-2 ring-offset-2' : ''
                          } bg-${color}-500`}
                          onClick={() => setFormData(prev => ({ ...prev, color }))}
                          aria-label={`${color} color`}
                        />
                      ))}
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="flex justify-between">
                  <Button type="button" variant="outline" className="border-forest-200 text-forest-700" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-forest-500 hover:bg-forest-600 text-white" disabled={isSubmitting}>
                    {isSubmitting ? "Creating..." : "Create Class"}
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>
            
            {/* Syllabus Upload Tab */}
            <TabsContent value="syllabus">
              <form onSubmit={handleSyllabusUpload}>
                <CardContent className="space-y-6">
                  <div className="text-center px-4 py-3 mb-4 bg-blue-50 text-blue-700 rounded-lg">
                    <h4 className="text-sm font-bold mb-1">How Syllabus Upload Works:</h4>
                    <ol className="text-sm font-inter text-left list-decimal pl-5 space-y-1">
                      <li>Upload your class syllabus PDF (5MB max)</li>
                      <li>Our AI extracts class name, schedule & details</li>
                      <li>We automatically create assignments from due dates</li>
                      <li>Your class is created with all extracted information</li>
                    </ol>
                  </div>
                  
                  {/* Enhanced Syllabus Upload Area with better drag and drop */}
                  <div className="space-y-4">
                    <Label className="font-jakarta font-medium text-forest-700">
                      Upload Syllabus PDF <span className="text-red-500">*</span>
                    </Label>
                    <div 
                      className={`relative flex flex-col items-center justify-center border-2 border-dashed ${
                        uploadedFile ? 'border-forest-400 bg-forest-50/60' : 'border-forest-200 bg-forest-50/40'
                      } rounded-xl p-8 transition-colors`}
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        e.currentTarget.classList.add('border-forest-400', 'bg-forest-50/70');
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (!uploadedFile) {
                          e.currentTarget.classList.remove('border-forest-400', 'bg-forest-50/70');
                        }
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        const files = e.dataTransfer.files;
                        if (files && files.length > 0) {
                          const file = files[0];
                          
                          // Use the same validation logic as handleFileChange
                          if (file.type !== 'application/pdf') {
                            toast({
                              title: "Invalid file type",
                              description: "Please upload a PDF file",
                              variant: "destructive"
                            });
                            return;
                          }
                          
                          if (file.size > 5 * 1024 * 1024) {
                            toast({
                              title: "File too large",
                              description: "Please upload a file smaller than 5MB",
                              variant: "destructive"
                            });
                            return;
                          }
                          
                          setUploadedFile(file);
                          toast({
                            title: "File selected",
                            description: `${file.name} ready for upload`
                          });
                        }
                      }}
                    >
                      {!uploadedFile ? (
                        <>
                          <Upload className="h-12 w-12 text-forest-400 mb-4" />
                          <span className="text-forest-600 font-medium font-inter mb-2">
                            Drag & drop syllabus here or click to browse
                          </span>
                          <span className="text-forest-500 text-sm font-inter">
                            PDF file only, max 5MB
                          </span>
                        </>
                      ) : (
                        <>
                          <FileText className="h-12 w-12 text-forest-500 mb-4" />
                          <span className="text-forest-700 font-medium font-inter mb-2">
                            {uploadedFile.name}
                          </span>
                          <span className="text-forest-500 text-sm font-inter">
                            {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                          </span>
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm"
                            className="mt-4 border-forest-200 text-forest-700"
                            onClick={(e) => {
                              e.stopPropagation();
                              clearFile();
                            }}
                          >
                            Remove File
                          </Button>
                        </>
                      )}
                      <Input
                        type="file"
                        className="hidden"
                        accept="application/pdf"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                      />
                    </div>
                    
                    {/* Prominent instruction for upload */}
                    <div className="mt-2 text-center bg-blue-50 text-blue-700 p-2 rounded-md">
                      <p className="text-sm">⬆️ Upload a syllabus PDF to create your class automatically</p>
                    </div>
                  </div>
                  
                  {/* Progress bar for upload and processing */}
                  {uploadProgress > 0 && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm text-forest-600 font-inter mb-1">
                        <span>Processing syllabus</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <Progress value={uploadProgress} className="h-2" />
                      <p className="text-sm text-forest-500 font-inter mt-1">
                        {uploadProgress < 30 ? "Uploading syllabus..." :
                         uploadProgress < 70 ? "Analyzing syllabus content..." :
                         uploadProgress < 100 ? "Generating class details..." :
                         "Completed!"}
                      </p>
                    </div>
                  )}
                  
                </CardContent>
                
                <CardFooter className="flex justify-between">
                  <Button type="button" variant="outline" className="border-forest-200 text-forest-700" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-forest-500 hover:bg-forest-600 text-white" 
                    disabled={isSubmitting || !uploadedFile}
                  >
                    {isSubmitting ? "Processing..." : "Create from Syllabus"}
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>
          </Tabs>
        </Card>
      </motion.div>
    </div>
  );
}
