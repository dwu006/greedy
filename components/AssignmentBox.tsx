"use client";

import { useState, useEffect } from "react";
import { motion, PanInfo, useMotionValue } from "framer-motion";
import { CalendarIcon, FileIcon } from "lucide-react";
import type { AssignmentData } from "./AssignmentForm";

interface AssignmentBoxProps {
  initialPosition: { x: number; y: number };
  onDragEnd: (position: { x: number; y: number }) => void;
  assignmentData: AssignmentData;
  selected?: boolean;
  onSelect?: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
  onProgressUpdate?: (id: string, progress: number) => void;
  id: string;
  handMode?: boolean;
  deleteMode?: boolean;
  gridSize?: number;
}

export function AssignmentBox({
  initialPosition,
  onDragEnd,
  assignmentData,
  selected = false,
  onSelect,
  onDelete,
  onEdit,
  onProgressUpdate,
  id,
  handMode = false,
  deleteMode = false,
  gridSize = 20, // default grid size
}: AssignmentBoxProps) {
  const x = useMotionValue(initialPosition.x);
  const y = useMotionValue(initialPosition.y);
  const [isProgressHovered, setIsProgressHovered] = useState(false);
  const [tempProgress, setTempProgress] = useState(assignmentData.progress || 0);
  const [isUpdatingProgress, setIsUpdatingProgress] = useState(false);

  // Update tempProgress when assignmentData changes
  useEffect(() => {
    setTempProgress(assignmentData.progress || 0);
  }, [assignmentData.progress]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    const newX = Math.round(x.get() / gridSize) * gridSize;
    const newY = Math.round(y.get() / gridSize) * gridSize;

    x.set(newX);
    y.set(newY);
    onDragEnd({ x: newX, y: newY });
  };
  
  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!handMode && !deleteMode && onEdit) {
      onEdit();
    }
  };

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
    <motion.div
      drag={handMode}
      dragMomentum={false}
      dragElastic={0}
      style={{ x, y, zIndex: selected ? 1010 : 1000 }}
      onDragEnd={handMode ? handleDragEnd : undefined}
      onClick={(e) => {
        e.stopPropagation();
        if (onSelect) onSelect();
        if (deleteMode && onDelete) onDelete();
      }}
      onDoubleClick={handleDoubleClick}
      whileDrag={{
        scale: 1.03,
        boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.15)",
      }}
      transition={{
        type: "spring",
        stiffness: 700,
        damping: 30,
      }}
      className={`absolute p-3 bg-white rounded-lg shadow-md select-none transition-all w-72
        ${selected ? 'border-2 border-blue-500 ring-2 ring-blue-200' : 'border border-gray-200'}
        ${handMode ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'}
        ${!handMode && !deleteMode ? 'hover:ring-1 hover:ring-blue-200' : ''}
      `}
      title={!handMode && !deleteMode ? "Double-click to edit assignment" : ""}
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-gray-900 truncate max-w-[80%]">
            {assignmentData.name}
          </h3>
          {selected && deleteMode && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onDelete) onDelete();
              }}
              className="p-1 rounded-full bg-rose-100 text-rose-600 hover:bg-rose-200"
              title="Delete"
            >
              ×
            </button>
          )}
        </div>
        
        <div className="flex items-center text-xs text-gray-500 space-x-4">
          <div className="flex items-center">
            <CalendarIcon className="h-3 w-3 mr-1" />
            <span>
              {formatDate(assignmentData.startDate)} - {formatDate(assignmentData.endDate)}
            </span>
          </div>
          <div className="flex items-center">
            <FileIcon className="h-3 w-3 mr-1" />
            <span>{assignmentData.files.length} files</span>
          </div>
        </div>
        
        {/* Priority Tag */}
        {assignmentData.priority && (
          <div className="mt-1 flex items-center">
            <div 
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${assignmentData.priority === 'high' 
                ? 'bg-red-100 text-red-700' 
                : assignmentData.priority === 'medium' 
                  ? 'bg-amber-100 text-amber-700' 
                  : 'bg-green-100 text-green-700'
              }`}
            >
              Priority: <span className="capitalize">{assignmentData.priority}</span>
            </div>
          </div>
        )}
        
        {/* Progress Bar */}
        <div 
          className="mt-2 relative"
          onMouseEnter={() => setIsProgressHovered(true)}
          onMouseLeave={() => {
            setIsProgressHovered(false);
            setIsUpdatingProgress(false);
          }}
          onClick={(e) => {
            if (!handMode && !deleteMode && onProgressUpdate) {
              e.stopPropagation();
              setIsUpdatingProgress(true);
            }
          }}
        >
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-forest-600 font-medium">Progress</span>
            <span className="text-forest-600 font-medium">{assignmentData.progress || 0}%</span>
          </div>
          
          {isUpdatingProgress ? (
            <div className="w-full space-y-1">
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={tempProgress}
                onChange={(e) => setTempProgress(parseInt(e.target.value, 10))}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-forest-500"
                onClick={(e) => e.stopPropagation()}
              />
              <div className="flex justify-between">
                <button
                  className="text-xs px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsUpdatingProgress(false);
                  }}
                >
                  Cancel
                </button>
                <button
                  className="text-xs px-2 py-1 bg-forest-500 text-white rounded hover:bg-forest-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onProgressUpdate) {
                      onProgressUpdate(id, tempProgress);
                    }
                    setIsUpdatingProgress(false);
                  }}
                >
                  Save
                </button>
              </div>
            </div>
          ) : null}
        </div>
        
        {assignmentData.description && (
          <p className="text-xs text-gray-600 line-clamp-2 mt-1">
            {assignmentData.description}
          </p>
        )}

        {/* Edit hint that only shows on hover, when not in hand or delete mode */}
        {!handMode && !deleteMode && (
          <div className="absolute inset-0 bg-blue-50/0 rounded-lg flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
            <span className="bg-blue-500/70 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
              Double-click to edit
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
