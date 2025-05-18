"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Plus, Calendar, ArrowUp, Bot, X, Hand, Trash2 } from "lucide-react"
import { DraggableTextBox } from '@/components/DraggableTextBox';
import { AssignmentBox } from '@/components/AssignmentBox';
import { AssignmentForm, AssignmentData } from '@/components/AssignmentForm';
import { TimelineCalendar } from '@/components/TimelineCalendar';
import Link from "next/link"
import { useParams } from "next/navigation"
import { toast } from "@/components/ui/use-toast"

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  functionCall?: any;
  functionResult?: any;
  pending?: boolean;
}

function AIChatbot({ isOpen, onClose, width, onResize, onCreateAssignment, selectedAssignment, onEditAssignment, onDeleteAssignment }: { 
  isOpen: boolean; 
  onClose: () => void; 
  width: number;
  onResize: (newWidth: number) => void;
  onCreateAssignment: (assignmentData: AssignmentData, files: File[]) => void;
  selectedAssignment?: AssignmentData; // Add selected assignment data
  onEditAssignment?: (id: string, assignmentData: AssignmentData) => void; // Add edit handler
  onDeleteAssignment?: (id: string) => void; // Add delete handler
}) {
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const dividerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  
  useEffect(() => {
    if (!isOpen) return;
    
    const handleMouseDown = () => {
      isDraggingRef.current = true;
      document.body.style.userSelect = 'none';
    };
    
    const handleMouseUp = () => {
      isDraggingRef.current = false;
      document.body.style.userSelect = '';
    };
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      
      // Calculate from right edge of window
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth > 300 && newWidth < window.innerWidth * 0.7) {
        onResize(newWidth);
      }
    };
    
    const divider = dividerRef.current;
    divider?.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      divider?.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isOpen, onResize]);
  
  // Scroll to bottom of chat when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);
  
  // Function to send message to Gemini API
  const sendMessageToGemini = async (messageText: string, attachedFiles: File[]) => {
    try {
      // Add user message to chat
      setMessages(prev => [...prev, {
        role: 'user',
        content: messageText,
        timestamp: new Date()
      }]);
      
      // Add a pending message for the assistant
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '...',
        timestamp: new Date(),
        pending: true
      }]);
      
      setIsLoading(true);
      
      // Create form data for API call
      const formData = new FormData();
      formData.append('message', messageText);
      
      // Append files if any
      attachedFiles.forEach(file => {
        formData.append('files', file);
      });
      
      // If there's a selected assignment, include its details in the API call
      if (selectedAssignment) {
        formData.append('selectedAssignment', JSON.stringify(selectedAssignment));
      }
      
      // Define typings for timeline events and assignments for collection
      interface TimelineEvent {
        id: string;
        position: { x: number; y: number };
        assignmentData?: AssignmentData;
        [key: string]: any;
      }
      
      interface CollectedAssignment extends AssignmentData {
        id: string;
        className: string;
        position: { x: number; y: number };
      }
      
      // Collect all assignments from localStorage for recommendations
      try {
        // Collect all assignments from all classes for recommendation functionality
        const allAssignments: CollectedAssignment[] = [];
        
        // Get all keys from localStorage
        const keys = Object.keys(localStorage);
        const timelineKeys = keys.filter(key => key.startsWith('timeline-events-'));
        
        // Extract assignments from all timeline events
        timelineKeys.forEach(key => {
          try {
            const events = JSON.parse(localStorage.getItem(key) || '[]') as TimelineEvent[];
            // Filter events that have assignment data
            const assignmentEvents = events.filter((event): event is TimelineEvent & { assignmentData: AssignmentData } => 
              !!event.assignmentData);
            
            // Add class name to each assignment for context
            const className = key.replace('timeline-events-', '');
            assignmentEvents.forEach((event: TimelineEvent) => {
              if (event.assignmentData) {
                allAssignments.push({
                  id: event.id,
                  className: className,
                  ...event.assignmentData,
                  position: event.position
                });
              }
            });
          } catch (error) {
            console.error(`Error parsing timeline events from ${key}:`, error);
          }
        });
        
        console.log(`Sending ${allAssignments.length} assignments to Gemini for recommendation`);
        formData.append('allAssignments', JSON.stringify(allAssignments));
      } catch (error) {
        console.error('Error collecting assignments from localStorage:', error);
      }
      
      // Call Gemini API
      const response = await fetch('/api/gemini', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Gemini API response:", data);
      
      // Remove the pending message
      setMessages(prev => prev.filter(msg => !msg.pending));
      
      // Process function calls if any
      if (data.functionCalls && data.functionCalls.length > 0) {
        // Add the assistant's response with function calls
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.text,
          timestamp: new Date(),
          functionCall: data.functionCalls[0]
        }]);
        
        // Check for different function calls
        const functionCall = data.functionCalls[0];
        const functionName = functionCall?.name;
        const functionArgs = functionCall?.args;
        
        // Process based on the function type
        if (functionName === 'createAssignment' && data.functionResults) {
          // Process the result of the function call
          const functionResult = data.functionResults.find(
            (result: any) => result.name === 'createAssignment'
          );
          
          if (functionResult && functionResult.result.success) {
            const assignmentDetails = functionResult.result.assignmentDetails;
            
            // Add a message showing the result
            setMessages(prev => [...prev, {
              role: 'assistant',
              content: `I've created the assignment "${assignmentDetails.name}" for you.`,
              timestamp: new Date(),
              functionResult: functionResult.result
            }]);
            
            // Preserve exact dates as specified by the user without any adjustment
            // This ensures dates like "May 18 to May 22" show up exactly as specified
            const assignmentData: AssignmentData = {
              name: assignmentDetails.name,
              startDate: assignmentDetails.startDate, // Use exact date from Gemini
              endDate: assignmentDetails.endDate, // Use exact date from Gemini
              description: assignmentDetails.description || '',
              files: attachedFiles
            };
            
            console.log("Creating assignment with exact dates:", assignmentData);
            
            // Call the parent function to create the assignment
            onCreateAssignment(assignmentData, attachedFiles);
          }
        }
        // Handle editAssignment function calls
        else if (functionName === 'editAssignment' && onEditAssignment) {
          console.log("Editing assignment:", functionArgs);
          
          // Get the ID from the function args or use the selected assignment's ID
          // This handles both cases: when Gemini returns the real ID and when it returns "selected-assignment"
          let id = functionArgs.id;
          
          // Override the ID to use the selected assignment's ID directly
          // This is the critical fix - ALWAYS use the assignment ID we passed, not the generic one
          if (selectedAssignment?.id) {
            // Logging for debugging
            console.log("Function call original ID:", id);
            console.log("Overriding with selected assignment ID:", selectedAssignment.id);
            
            // Always use the actual ID
            id = selectedAssignment.id;
          } else {
            console.warn("No selected assignment ID available for edit operation");
          }
          
          // Get the current assignment data if it exists, or create a new object
          const currentAssignment = selectedAssignment || {
            name: '',
            startDate: '',
            endDate: '',
            description: '',
            files: []
          };
          
          // Helper function to ensure dates use the correct year (2025)
          const fixDateYear = (dateString: string | undefined) => {
            if (!dateString) return dateString;
            
            // Check if the date has the wrong year (not 2025)
            if (dateString.includes('2024-') || dateString.includes('/2024')) {
              return dateString.replace(/2024/g, '2025');
            }
            
            return dateString;
          };
          
          // Create a new assignment data object with the updated fields
          const updatedAssignment: AssignmentData = {
            ...currentAssignment,
            // Update only the fields that were provided in the function args
            name: functionArgs.name || currentAssignment.name,
            startDate: fixDateYear(functionArgs.startDate) || currentAssignment.startDate,
            endDate: fixDateYear(functionArgs.endDate) || currentAssignment.endDate,
            description: functionArgs.description || currentAssignment.description
          };
          
          console.log("Updated assignment with fixed dates:", updatedAssignment);
          
          // Add a message showing the result
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: `I've updated the assignment for you.`,
            timestamp: new Date(),
            functionResult: { success: true }
          }]);
          
          // Call the parent function to update the assignment
          onEditAssignment(id, updatedAssignment);
        }
        // Handle deleteAssignment function calls
        else if (functionName === 'deleteAssignment' && onDeleteAssignment) {
          console.log("Deleting assignment:", functionArgs);
          
          // Get the ID from the function args or use the selected assignment's ID
          // This handles both cases: when Gemini returns the real ID and when it returns "selected-assignment"
          let id = functionArgs.id;
          
          // Override the ID to use the selected assignment's ID directly
          // This is the critical fix - ALWAYS use the assignment ID we passed, not the generic one
          if (selectedAssignment?.id) {
            // Logging for debugging
            console.log("Function call original ID for deletion:", id);
            console.log("Overriding with selected assignment ID for deletion:", selectedAssignment.id);
            
            // Always use the actual ID
            id = selectedAssignment.id;
          } else {
            console.warn("No selected assignment ID available for delete operation");
          }
          
          // Add a message showing the result
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: `I've deleted the assignment for you.`,
            timestamp: new Date(),
            functionResult: { success: true }
          }]);
          
          // Call the parent function to delete the assignment
          onDeleteAssignment(id);
        }
      } else {
        // Just add the text response if no function calls
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.text,
          timestamp: new Date()
        }]);
      }
    } catch (error) {
      console.error('Error sending message to Gemini:', error);
      
      // Remove the pending message
      setMessages(prev => prev.filter(msg => !msg.pending));
      
      // Add error message
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!isOpen) return null;

  return (
    <div 
      className="fixed top-16 right-0 bottom-0 bg-white border-l border-gray-200 flex flex-col"
      style={{ width: `${width}px` }}
    >
      {/* Draggable Divider */}
      <div 
        ref={dividerRef}
        className="absolute left-0 top-0 bottom-0 w-2 bg-gray-200 hover:bg-forest-300 transition-colors cursor-ew-resize z-10"
      />
      
      {/* Header */}
      <div className="p-6 pb-2">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-900">AI Assistant</h2>
          <Button variant="ghost" size="icon" className="h-9 w-9 p-1 hover:bg-gray-100 rounded-lg" onClick={onClose}>
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </Button>
        </div>
      </div>
      
      {/* Chat Content */}
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 my-8">
            <p>Ask me to create assignments for you!</p>
            <p className="text-sm mt-2">Try: "Create an assignment called Introduction to Programming from May 20 to May 25 about basic programming concepts"</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-lg p-3 ${msg.role === 'user' 
                ? 'bg-forest-100 text-forest-800' 
                : 'bg-gray-100 text-gray-800'}`}
              >
                {msg.pending ? (
                  <div className="flex space-x-1 items-center">
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                ) : (
                  <div>
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                    {msg.functionResult && (
                      <div className="mt-2 p-2 bg-green-50 border border-green-100 rounded text-xs text-green-700">
                        Assignment created successfully!
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Input Area - Positioned at the bottom */}
      <div className="p-6 pt-0 mt-auto">
        {/* Display selected files */}
        {files.length > 0 && (
          <div className="mb-2 p-2 bg-forest-50 rounded-lg border border-forest-100">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-forest-700">{files.length} file{files.length > 1 ? 's' : ''} selected</span>
              <Button 
                size="sm" 
                variant="ghost" 
                className="h-5 w-5 p-0" 
                onClick={() => setFiles([])}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-1">
              {files.map((file, index) => (
                <div key={index} className="text-xs px-2 py-1 bg-white rounded border border-forest-100 flex items-center">
                  <span className="truncate max-w-[120px]">{file.name}</span>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-4 w-4 p-0 ml-1" 
                    onClick={() => setFiles(files.filter((_, i) => i !== index))}
                  >
                    <X className="h-2.5 w-2.5" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="relative">
          {/* Hidden file input */}
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            multiple
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                setFiles(prev => [...prev, ...Array.from(e.target.files || [])]);
              }
            }}
          />
          
          {/* Message input with drag-and-drop */}
          <div 
            className={`bg-gray-100 rounded-2xl p-4 pr-24 min-h-[60px] max-h-40 relative ${isDragging ? 'border-2 border-forest-400 bg-forest-50' : ''}`}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                setFiles(prev => [...prev, ...Array.from(e.dataTransfer.files)]);
              }
            }}
          >
            <textarea
              placeholder={isDragging ? "Drop files here..." : "Message AI Assistant..."}
              className="chat-textarea w-full bg-transparent border-none outline-none text-gray-800 placeholder-gray-500 resize-none min-h-[32px] max-h-32 overflow-y-scroll scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent pr-1"
              rows={1}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              style={{ lineHeight: '1.5', maxHeight: '120px' }}
              onInput={(e) => {
                e.currentTarget.style.height = 'auto';
                e.currentTarget.style.height = Math.min(e.currentTarget.scrollHeight, 120) + 'px';
              }}
              autoFocus
            />
            {isDragging && (
              <div className="absolute inset-0 flex items-center justify-center bg-forest-50/70 rounded-2xl pointer-events-none">
                <p className="text-forest-700 font-medium">Drop files here</p>
              </div>
            )}
          </div>
          
          {/* Buttons */}
          <div className="absolute right-2 bottom-2 flex items-center gap-1.5">
            {/* Paperclip Button */}
            <Button 
              type="button"
              size="icon" 
              className="h-8 w-8 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700"
              onClick={() => fileInputRef.current?.click()}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
              </svg>
              <span className="sr-only">Attach files</span>
            </Button>
            
            {/* Send Button */}
            <Button 
              type="button"
              size="icon" 
              className="h-8 w-8 rounded-full bg-forest-600 hover:bg-forest-700 text-white"
              disabled={isLoading}
              onClick={() => {
                if (message.trim() || files.length > 0) {
                  // Send message to Gemini API
                  sendMessageToGemini(message, files);
                  setMessage("");
                  setFiles([]);
                  setIsDragging(false); // Reset dragging state
                  
                  // Reset textarea height
                  const textarea = document.querySelector('.chat-textarea') as HTMLTextAreaElement;
                  if (textarea) {
                    textarea.style.height = 'auto';
                  }
                }
              }}
            >
              <ArrowUp className="h-4 w-4" />
              <span className="sr-only">Send message</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TimelinePage() {
  const [isChatOpen, setIsChatOpen] = useState(true)
  const [chatWidth, setChatWidth] = useState(400) // Default width, will be updated in useEffect
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [textBoxes, setTextBoxes] = useState<Array<{
    id: string;
    text: string;
    position: { x: number; y: number };
    assignmentData?: AssignmentData;
  }>>([]);
  const [selectedBoxId, setSelectedBoxId] = useState<string | null>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isAssignmentFormOpen, setIsAssignmentFormOpen] = useState(false);
  const [isEditingAssignment, setIsEditingAssignment] = useState(false);
  const [editingAssignmentId, setEditingAssignmentId] = useState<string | null>(null);
  const [formPosition, setFormPosition] = useState({ x: 0, y: 0 });
  // Zoom level for the grid - 1 is default, higher values zoom in, lower values zoom out
  const [zoomLevel, setZoomLevel] = useState(1);
  // Add state for canvas panning
  const [canvasPosition, setCanvasPosition] = useState({ x: 0, y: 0 });
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [dragStartPosition, setDragStartPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const params = useParams()
  const className = Array.isArray(params.className) ? params.className[0] : params.className || ''

  useEffect(() => {
    // Set initial width to 30% of viewport width, but not less than 300px
    setChatWidth(Math.max(300, Math.floor(window.innerWidth * 0.3)));
    
    // Load saved timeline data from localStorage
    const savedData = localStorage.getItem(`timeline-events-${className}`);
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setTextBoxes(parsedData);
      } catch (error) {
        console.error('Error loading timeline data from localStorage:', error);
      }
    }
  }, [className]);
  
  // Save timeline data to localStorage whenever textBoxes change
  useEffect(() => {
    if (textBoxes.length > 0) {
      localStorage.setItem(`timeline-events-${className}`, JSON.stringify(textBoxes));
    }
  }, [textBoxes, className]);

  const handleToolClick = (tool: string) => {
    if (tool === 'calendar') {
      // Toggle calendar
      setIsCalendarOpen(!isCalendarOpen);
      setSelectedTool(null);
    } else if (tool === 'add') {
      // Show the form without enabling add mode
      setIsAssignmentFormOpen(true);
      setSelectedTool(null);
    } else {
      // If selecting a new tool, close the calendar
      if (isCalendarOpen && tool !== selectedTool) {
        setIsCalendarOpen(false);
      }
      // Toggle the selected tool
      setSelectedTool(tool === selectedTool ? null : tool);
    }
  };

  const TOOLBAR_BOTTOM = 56; // 1.5rem (top-6) + 2.5rem (h-10) + 0.5rem (toolbar margin)
  const handleContainerClick = (e: React.MouseEvent) => {
    if (selectedTool === 'add' && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      if (y > TOOLBAR_BOTTOM) { // Only allow below toolbar
        setFormPosition({ x, y });
        setIsAssignmentFormOpen(true);
        setSelectedTool(null);
      }
    }
  };
  
  // Calculate position for new assignments in a straight line
  const calculateWavePosition = (index: number) => {
    // Starting X coordinate (distance from left)
    const startX = 150;
    // Horizontal spacing between assignments
    const xSpacing = 200;
    // Vertical position (fixed height)
    const y = TOOLBAR_BOTTOM + 150;
    
    // Calculate X position based on index
    const x = startX + (index * xSpacing);
    
    return { x, y };
  };
  
  // Function to generate path data for the line connecting all points
  const generateCurvePath = (points: Array<{x: number, y: number}>) => {
    if (points.length < 2) return '';
    
    // Create a path moving through all points with straight lines
    let path = `M ${points[0].x} ${points[0].y}`;
    
    // Add line segments to each point
    for (let i = 1; i < points.length; i++) {
      path += ` L ${points[i].x} ${points[i].y}`;
    }
    
    return path;
  };

  const handleSaveAssignment = (assignmentData: AssignmentData) => {
    let updatedTextBoxes;
    
    if (isEditingAssignment && editingAssignmentId) {
      // Update existing assignment (keep its position)
      updatedTextBoxes = textBoxes.map(box => 
        box.id === editingAssignmentId 
          ? { 
              ...box, 
              text: assignmentData.name, 
              assignmentData: {
                ...assignmentData,
                id: editingAssignmentId // Make sure to preserve the ID
              }
            }
          : box
      );
      setTextBoxes(updatedTextBoxes);
      setIsEditingAssignment(false);
      setEditingAssignmentId(null);
    } else {
      // Create new assignment
      // Calculate position based on how many assignments we have
      const newIndex = textBoxes.length;
      const { x, y } = calculateWavePosition(newIndex);
      
      // Generate a unique ID for the new assignment
      const newId = Date.now().toString();
      
      const newBox = {
        id: newId,
        text: assignmentData.name,
        position: { x, y },
        assignmentData: {
          ...assignmentData,
          id: newId // Set the ID in the assignmentData too
        }
      };
      
      updatedTextBoxes = [...textBoxes, newBox];
      setTextBoxes(updatedTextBoxes);
    }
    
    // Save to localStorage
    localStorage.setItem(`timeline-events-${className}`, JSON.stringify(updatedTextBoxes));
    
    setIsAssignmentFormOpen(false);
    
    // Show toast notification
    toast({
      title: isEditingAssignment ? "Assignment Updated" : "Assignment Created",
      description: `${assignmentData.name} has been ${isEditingAssignment ? 'updated' : 'added'} to the timeline.`,
      duration: 3000,
    });
  };
  
  const handleEditAssignment = (id: string) => {
    const assignmentToEdit = textBoxes.find(box => box.id === id && box.assignmentData);
    if (assignmentToEdit && assignmentToEdit.assignmentData) {
      console.log("Editing assignment with ID:", id, assignmentToEdit.assignmentData.name);
      
      // Ensure the assignment data has the ID for the form
      const assignmentDataWithId = {
        ...assignmentToEdit.assignmentData,
        id: id // Make sure ID is explicitly included
      };
      
      // Set the editing state
      setEditingAssignmentId(id);
      setIsEditingAssignment(true);
      setIsAssignmentFormOpen(true);
      
      // Show toast notification with ID information
      toast({
        title: "Editing Assignment",
        description: `Now editing "${assignmentDataWithId.name}" (ID: ${id})`,
        duration: 3000,
      });
    } else {
      console.error("Could not find assignment with ID:", id);
      // Show error toast
      toast({
        title: "Error",
        description: "Could not find the selected assignment for editing.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const updateTextBoxPosition = (id: string, position: { x: number; y: number }) => {
    const updatedBoxes = textBoxes.map(box =>
      box.id === id ? { ...box, position } : box
    );
    setTextBoxes(updatedBoxes);
    
    // Save to localStorage after position update
    localStorage.setItem(`timeline-events-${className}`, JSON.stringify(updatedBoxes));
  };

  const updateTextBoxText = (id: string, text: string) => {
    const updatedBoxes = textBoxes.map(box =>
      box.id === id ? { ...box, text } : box
    );
    setTextBoxes(updatedBoxes);
    
    // Save to localStorage after text update
    localStorage.setItem(`timeline-events-${className}`, JSON.stringify(updatedBoxes));
  };

  const handleDeleteAssignment = (id: string) => {
    const updatedBoxes = textBoxes.filter(box => box.id !== id);
    setTextBoxes(updatedBoxes);
    
    // Save to localStorage after deletion
    localStorage.setItem(`timeline-events-${className}`, JSON.stringify(updatedBoxes));
    
    // Show toast notification
    const deletedBox = textBoxes.find(box => box.id === id);
    if (deletedBox) {
      toast({
        title: "Assignment Deleted",
        description: deletedBox.assignmentData 
          ? `${deletedBox.assignmentData.name} has been removed.` 
          : "Item has been removed.",
        duration: 3000,
      });
    }
  };

  return (
    <div
      ref={containerRef}
      className="min-h-screen relative overflow-hidden"
      onClick={handleContainerClick}
      onMouseDown={(e) => {
        // Only enable panning when no tools are selected and clicking directly on the background
        if (selectedTool === null && e.target === e.currentTarget) {
          setIsDraggingCanvas(true);
          setDragStartPosition({ x: e.clientX, y: e.clientY });
          e.currentTarget.style.cursor = "grabbing";
        }
      }}
      onMouseMove={(e) => {
        if (isDraggingCanvas) {
          const dx = e.clientX - dragStartPosition.x;
          const dy = e.clientY - dragStartPosition.y;
          setCanvasPosition(prev => ({
            x: prev.x + dx,
            y: prev.y + dy
          }));
          setDragStartPosition({ x: e.clientX, y: e.clientY });
        }
      }}
      onMouseUp={() => {
        if (isDraggingCanvas) {
          setIsDraggingCanvas(false);
          if (containerRef.current) {
            containerRef.current.style.cursor = "default";
          }
        }
      }}
      onMouseLeave={() => {
        if (isDraggingCanvas) {
          setIsDraggingCanvas(false);
          if (containerRef.current) {
            containerRef.current.style.cursor = "default";
          }
        }
      }}
      style={{
        cursor: selectedTool === 'add' ? 'crosshair' : 
               selectedTool === 'hand' ? 'grab' : 
               selectedTool === 'delete' ? 'default' :
               isDraggingCanvas ? 'grabbing' : 'move',
        minHeight: '100vh',
        backgroundImage: `radial-gradient(circle, #e5e7eb 1px, transparent 1px)`,
        backgroundSize: `${20 * zoomLevel}px ${20 * zoomLevel}px`, // Scale grid with zoom level
        backgroundPosition: `${canvasPosition.x}px ${canvasPosition.y}px` 
      }}
    >
      {/* Back Button */}
      <div className="absolute left-6 top-6 z-10">
        <Button
          asChild
          variant="outline"
          size="icon"
          className="h-10 w-10 rounded-lg bg-white/80 backdrop-blur-sm hover:bg-white shadow-sm"
        >
          <Link href={`/instructor/${className}`}>
            <ChevronLeft className="h-5 w-5" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
      </div>

      {/* Floating Toolbar - Centered, with smooth shift when sidebar is open */}
      <div
        className="absolute left-1/2 top-6 z-10 -translate-x-1/2 transition-transform duration-200"
        style={{
          transform: `translateX(-50%)${isChatOpen ? ` translateX(-${chatWidth/2}px)` : ''}`
        }}
      >
        <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm p-1.5 rounded-lg shadow-sm border border-gray-200">
          <Button 
            variant="ghost" 
            size="sm" 
            className={`h-9 w-9 p-0 rounded-lg ${selectedTool === 'add' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
            onClick={() => handleToolClick('add')}
            title="Add Text Box"
          >
            <Plus className="h-4 w-4 text-gray-700" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className={`h-9 w-9 p-0 rounded-lg ${selectedTool === 'hand' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
            onClick={() => handleToolClick('hand')}
            title="Hand"
          >
            <Hand className="h-4 w-4 text-gray-700" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className={`h-9 w-9 p-0 rounded-lg ${isCalendarOpen ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
            title="Calendar"
            onClick={() => handleToolClick('calendar')}
          >
            <Calendar className="h-4 w-4 text-gray-700" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className={`h-9 w-9 p-0 rounded-lg ${selectedTool === 'delete' ? 'bg-rose-100 text-rose-600' : 'hover:bg-rose-50 text-rose-500 hover:text-rose-600'}`}
            title="Delete"
            onClick={() => setSelectedTool(selectedTool === 'delete' ? null : 'delete')}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          
          {/* Zoom Controls */}
          <div className="h-6 mx-1 border-l border-gray-300"></div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-9 w-9 p-0 rounded-lg hover:bg-gray-100" 
            title="Zoom Out"
            onClick={() => setZoomLevel(prev => Math.max(0.5, prev - 0.1))}
            disabled={zoomLevel <= 0.5}
          >
            <span className="text-lg font-medium">−</span>
          </Button>
          <span className="text-xs font-medium text-gray-600 w-10 text-center">
            {Math.round(zoomLevel * 100)}%
          </span>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-9 w-9 p-0 rounded-lg hover:bg-gray-100" 
            title="Zoom In"
            onClick={() => setZoomLevel(prev => Math.min(2, prev + 0.1))}
            disabled={zoomLevel >= 2}
          >
            <span className="text-lg font-medium">+</span>
          </Button>
        </div>
      </div>

      {/* AI Toggle Button */}
      <div className="absolute right-6 top-6 z-10">
        <Button
          variant="ghost"
          size="sm"
          className={`h-10 w-10 p-0 bg-white/80 backdrop-blur-sm shadow-sm border border-gray-200 transition-colors ${
            isChatOpen ? 'bg-forest-50 border-forest-200' : 'hover:bg-gray-100'
          }`}
          onClick={() => setIsChatOpen(!isChatOpen)}
          aria-label="Toggle AI Assistant"
        >
          <Bot className={`h-4 w-4 ${isChatOpen ? 'text-forest-600' : 'text-gray-700'}`} />
        </Button>
      </div>

      {/* Timeline Wave Visualization - with zoom transformation */}
      <div 
        className="absolute top-0 left-0 w-full h-full pointer-events-none z-0" 
        style={{ 
          transform: `scale(${zoomLevel}) translate(${canvasPosition.x / zoomLevel}px, ${canvasPosition.y / zoomLevel}px)`, 
          transformOrigin: 'top left'
        }}
      >
        <svg className="absolute top-0 left-0 w-full h-full">
          {/* Connection line between assignments */}
          {textBoxes.filter(box => box.assignmentData).length >= 2 && (
            <path
              d={generateCurvePath(
                textBoxes
                  .filter(box => box.assignmentData)
                  .sort((a, b) => a.position.x - b.position.x)
                  .map(box => ({ x: box.position.x + 70, y: box.position.y + 40 }))
              )}
              stroke="#0ca678" // Jade green color
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
        </svg>
      </div>

      {/* Timeline Content Container - scales with zoom level */}
      <div 
        className="absolute top-0 left-0 w-full h-full" 
        style={{ 
          transform: `scale(${zoomLevel}) translate(${canvasPosition.x / zoomLevel}px, ${canvasPosition.y / zoomLevel}px)`, 
          transformOrigin: 'top left'
        }}
      >
        {/* Timeline Points and Labels */}
        {textBoxes
          .filter(box => box.assignmentData)
          .sort((a, b) => a.position.x - b.position.x)
          .map((box, index) => (
            <div 
              key={`point-${box.id}`} 
              className="absolute rounded-full bg-teal-500 border-2 border-white w-8 h-8 flex items-center justify-center text-white text-xs font-medium z-10"
              style={{
                left: box.position.x + 70 - 16, // Center the point on the path
                top: box.position.y + 40 - 16,
                boxShadow: '0 4px 8px rgba(0,0,0,0.15)'
              }}
            >
              {index + 1}
            </div>
          ))
        }

        {/* Assignment Boxes */}
        {textBoxes.map((box) => (
          box.assignmentData ? (
            <AssignmentBox
              key={box.id}
              id={box.id}
              initialPosition={box.position}
              assignmentData={box.assignmentData}
              onDragEnd={(position) => {
                // Adjust position for zoom level when dragging
                updateTextBoxPosition(box.id, position);
              }}
              selected={selectedBoxId === box.id}
              onSelect={() => setSelectedBoxId(box.id)}
              onDelete={() => handleDeleteAssignment(box.id)}
              onEdit={() => {
                // When box is double-clicked for editing, get its ID and data
                const id = box.id;
                handleEditAssignment(id);
              }}
              handMode={selectedTool === 'hand'}
              deleteMode={selectedTool === 'delete'}
              // Pass the grid size adjusted for zoom
              gridSize={20 * (1/zoomLevel)}
            />
          ) : (
            <DraggableTextBox
              key={box.id}
              initialText={box.text}
              initialPosition={box.position}
              onDragEnd={(position) => {
                // Adjust position for zoom level when dragging
                updateTextBoxPosition(box.id, position);
              }}
              onBlur={(text: string) => updateTextBoxText(box.id, text)}
              selected={selectedBoxId === box.id}
              onSelect={() => setSelectedBoxId(box.id)}
              onDelete={() => handleDeleteAssignment(box.id)}
              handMode={selectedTool === 'hand'}
              deleteMode={selectedTool === 'delete'}
              // Pass the grid size adjusted for zoom
              gridSize={20 * (1/zoomLevel)}
            />
          )
        ))}
      </div>

      {/* Main Content Area - Resizes based on chat panel */}
      <div 
        className="min-h-screen transition-all duration-300"
        style={{
          marginRight: isChatOpen ? `${chatWidth}px` : '0',
          paddingTop: isCalendarOpen ? '4rem' : '6rem'
        }}
      >
        {isCalendarOpen ? (
          <TimelineCalendar 
            isOpen={isCalendarOpen} 
            onClose={() => setIsCalendarOpen(false)} 
          />
        ) : (
          <div className="p-8">
            {/* Other content goes here when calendar is not shown */}
          </div>
        )}
      </div>

      {/* AI Chatbot */}
      <AIChatbot 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
        width={chatWidth}
        onResize={setChatWidth}
        selectedAssignment={selectedBoxId ? (() => {
          // Find the selected box
          const selectedBox = textBoxes.find(box => box.id === selectedBoxId);
          
          // If no assignment data exists, create a minimal valid object
          if (!selectedBox?.assignmentData) {
            return {
              id: selectedBoxId,
              name: 'Untitled Assignment',
              startDate: '',
              endDate: '',
              description: '',
              files: []
            };
          }
          
          // Otherwise, ensure the ID is explicitly included
          return {
            ...selectedBox.assignmentData,
            id: selectedBoxId // Always use the selected box ID directly
          };
        })() : undefined}
        onEditAssignment={(id, updatedData) => {
          // Update the assignment with the provided data
          const updatedBoxes = textBoxes.map(box => 
            box.id === id ? { 
              ...box, 
              text: updatedData.name, 
              assignmentData: {
                ...updatedData,
                id // Make sure to preserve the ID
              }
            } : box
          );
          setTextBoxes(updatedBoxes);
          localStorage.setItem(`timeline-events-${className}`, JSON.stringify(updatedBoxes));
          
          // Show a toast notification
          toast({
            title: "Assignment Updated",
            description: `${updatedData.name} has been updated.`,
            duration: 3000,
          });
        }}
        onDeleteAssignment={(id) => {
          // Get the assignment name before deletion for the toast message
          const assignmentToDelete = textBoxes.find(box => box.id === id);
          const assignmentName = assignmentToDelete?.assignmentData?.name || "Assignment";
          
          // Remove the assignment
          const updatedBoxes = textBoxes.filter(box => box.id !== id);
          setTextBoxes(updatedBoxes);
          localStorage.setItem(`timeline-events-${className}`, JSON.stringify(updatedBoxes));
          
          // Clear the selected box ID if it was the deleted assignment
          if (selectedBoxId === id) {
            setSelectedBoxId(null);
          }
          
          // Show a toast notification
          toast({
            title: "Assignment Deleted",
            description: `${assignmentName} has been removed from the timeline.`,
            duration: 3000,
          });
        }}
        onCreateAssignment={(assignmentData, uploadedFiles) => {
          // Calculate position based on how many assignments we have
          // Use the same wave position calculation as manual assignment creation
          const newIndex = textBoxes.length;
          const { x, y } = calculateWavePosition(newIndex);
          
          // Generate a unique ID for the new assignment
          const newId = Date.now().toString();
          
          const newBox = {
            id: newId,
            text: assignmentData.name,
            position: { x, y },
            assignmentData: {
              ...assignmentData,
              id: newId // Ensure ID is included in assignmentData
            }
          };
          
          const updatedBoxes = [...textBoxes, newBox];
          setTextBoxes(updatedBoxes);
          
          // Save to localStorage
          localStorage.setItem(`timeline-events-${className}`, JSON.stringify(updatedBoxes));
          
          // Show toast notification
          toast({
            title: "Assignment Created",
            description: `${assignmentData.name} has been added to the timeline.`,
            duration: 3000,
          });
        }}
      />

      {/* Assignment Form Popup */}
      <AssignmentForm
        isOpen={isAssignmentFormOpen}
        onClose={() => {
          setIsAssignmentFormOpen(false);
          setIsEditingAssignment(false);
          setEditingAssignmentId(null);
        }}
        onSave={handleSaveAssignment}
        initialData={isEditingAssignment && editingAssignmentId
          ? (() => {
              // Get the existing assignment data
              const existingData = textBoxes.find(box => box.id === editingAssignmentId)?.assignmentData;
              
              // Only create the object if we found the assignment data
              if (existingData) {
                return {
                  ...existingData,
                  id: editingAssignmentId // Explicitly include the ID
                };
              }
              return undefined;
            })()
          : undefined
        }
        isEditing={isEditingAssignment}
      />
    </div>
  )
}
