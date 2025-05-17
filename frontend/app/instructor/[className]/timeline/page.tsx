"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Plus, Calendar, ArrowUp, Bot, X, Hand, Trash2 } from "lucide-react"
import { DraggableTextBox } from '@/components/DraggableTextBox';
import { TimelineCalendar } from '@/components/TimelineCalendar';
import Link from "next/link"
import { useParams } from "next/navigation"

function AIChatbot({ isOpen, onClose, width, onResize }: { 
  isOpen: boolean; 
  onClose: () => void; 
  width: number;
  onResize: (newWidth: number) => void;
}) {
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
      <div className="flex-1 overflow-y-auto px-6">
        {/* Chat messages will go here */}
      </div>
      
      {/* Input Area - Positioned at the bottom */}
      <div className="p-6 pt-0 mt-auto">
        <div className="relative">
          <div className="bg-gray-100 rounded-2xl p-4 pr-16 min-h-[60px] max-h-40 overflow-y-auto">
            <textarea
              placeholder="Message AI Assistant..."
              className="w-full bg-transparent border-none outline-none text-gray-800 placeholder-gray-500 resize-none min-h-[32px] max-h-32 overflow-y-auto"
              rows={1}
              style={{ lineHeight: '1.5', maxHeight: '120px' }}
              onInput={(e) => {
                e.currentTarget.style.height = 'auto';
                e.currentTarget.style.height = Math.min(e.currentTarget.scrollHeight, 120) + 'px';
              }}
              autoFocus
            />
          </div>
          <Button 
            size="icon" 
            className="absolute right-2 bottom-2 h-10 w-10 rounded-full bg-forest-600 hover:bg-forest-700 text-white"
          >
            <ArrowUp className="h-5 w-5" />
            <span className="sr-only">Send message</span>
          </Button>
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
  }>>([]);
  const [selectedBoxId, setSelectedBoxId] = useState<string | null>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Set initial width to 30% of viewport width, but not less than 300px
    setChatWidth(Math.max(300, Math.floor(window.innerWidth * 0.3)));
  }, [])
  const params = useParams()
  const className = Array.isArray(params.className) ? params.className[0] : params.className || ''

  const handleToolClick = (tool: string) => {
    if (tool === 'calendar') {
      // Toggle calendar
      setIsCalendarOpen(!isCalendarOpen);
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
        setTextBoxes(prev => [
          ...prev,
          {
            id: Date.now().toString(),
            text: 'Double click to edit',
            position: { x, y }
          }
        ]);
        setSelectedTool(null); // Unselect after creating one box
      }
    }
  };


  const updateTextBoxPosition = (id: string, position: { x: number; y: number }) => {
    setTextBoxes(prev =>
      prev.map(box =>
        box.id === id ? { ...box, position } : box
      )
    );
  };

  const updateTextBoxText = (id: string, text: string) => {
    setTextBoxes(prev =>
      prev.map(box =>
        box.id === id ? { ...box, text } : box
      )
    );
  };

  return (
    <div
      ref={containerRef}
      className="grid-dots-bg min-h-screen relative"
      onClick={handleContainerClick}
      style={{ cursor: selectedTool === 'add' ? 'crosshair' : selectedTool === 'hand' ? 'grab' : 'default', minHeight: '100vh' }}
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

      {/* Render text boxes */}
      {textBoxes.map(box => (
        <DraggableTextBox
          key={box.id}
          initialPosition={box.position}
          initialText={box.text}
          onDragEnd={position => updateTextBoxPosition(box.id, position)}
          onBlur={text => updateTextBoxText(box.id, text)}
          selected={selectedBoxId === box.id}
          onSelect={() => setSelectedBoxId(box.id)}
          onDelete={() => setTextBoxes(prev => prev.filter(b => b.id !== box.id))}
          handMode={selectedTool === 'hand'}
          deleteMode={selectedTool === 'delete'}
        />
      ))}

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
      />
    </div>
  )
}
