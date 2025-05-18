"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { motion } from "framer-motion";

export interface AssignmentData {
  name: string;
  startDate: string;
  endDate: string;
  description: string;
  files: File[];
  progress?: number; // Completion percentage (0-100)
}

interface AssignmentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: AssignmentData) => void;
  initialData?: AssignmentData;
  isEditing?: boolean;
}

export function AssignmentForm({ isOpen, onClose, onSave, initialData, isEditing = false }: AssignmentFormProps) {
  const [formData, setFormData] = useState<AssignmentData>(initialData || {
    name: "",
    startDate: "",
    endDate: "",
    description: "",
    files: [],
    progress: 0, // Default to 0% progress
  });
  
  const [fileNames, setFileNames] = useState<string[]>([]);
  
  // Update form data when initialData changes (when editing)
  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        progress: initialData.progress !== undefined ? initialData.progress : 0
      });
      
      // Set file names for display
      if (initialData.files && initialData.files.length > 0) {
        const names = Array.from(initialData.files).map(file => file.name);
        setFileNames(names);
      }
    } else {
      // Reset form when not editing
      setFormData({
        name: "",
        startDate: "",
        endDate: "",
        description: "",
        files: [],
        progress: 0,
      });
      setFileNames([]);
    }
  }, [initialData, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      setFormData((prev) => ({
        ...prev,
        files: selectedFiles,
      }));
      
      // Store file names for display
      const names = selectedFiles.map(file => file.name);
      setFileNames(names);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    // Reset form
    setFormData({
      name: "",
      startDate: "",
      endDate: "",
      description: "",
      files: [],
      progress: 0,
    });
    setFileNames([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[2000]">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-xl"
      >
        <div className="bg-white/95 shadow-2xl rounded-lg relative p-6">
          <button
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-xl font-bold"
            onClick={onClose}
            aria-label="Close"
            type="button"
          >
            ×
          </button>
          
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-forest-800">
              {isEditing ? "Edit Assignment" : "New Assignment"}
            </h2>
            <p className="text-forest-600 text-sm mt-1">
              {isEditing ? "Update the assignment details" : "Add assignment details to your timeline"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="font-medium text-forest-700">
                Assignment Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter assignment name"
                className="border-forest-200"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate" className="font-medium text-forest-700">
                  Start Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="border-forest-200"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate" className="font-medium text-forest-700">
                  End Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="endDate"
                  name="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={handleChange}
                  className="border-forest-200"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="font-medium text-forest-700">
                Description
              </Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter assignment description"
                className="border-forest-200 min-h-[100px] resize-y"
              />
            </div>

            {/* Progress Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="progress" className="font-medium text-forest-700">
                  Completion Progress
                </Label>
                <span className="text-forest-700 font-medium text-sm">
                  {formData.progress}%
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="progress"
                  name="progress"
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={formData.progress}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    progress: parseInt(e.target.value, 10) 
                  }))}
                  className="w-full h-2 bg-forest-100 rounded-lg appearance-none cursor-pointer accent-forest-500"
                />
              </div>
              <div className="flex justify-between text-xs text-forest-600">
                <span>Not Started</span>
                <span>In Progress</span>
                <span>Complete</span>
              </div>
            </div>
            
            {/* Separator */}
            <div className="border-t border-gray-200 my-1" />

            {/* File Upload Area - Clean Design */}
            <div className="space-y-2">
              <Label className="font-medium text-forest-700">Assignment Materials</Label>
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-forest-200 rounded-xl bg-forest-50/40 p-6 cursor-pointer hover:bg-forest-100/70 transition-colors">
                <span className="text-forest-600 mb-2">Drag & drop files here or click to upload</span>
                <Input
                  type="file"
                  className="hidden"
                  id="file-upload"
                  name="files"
                  onChange={handleFileChange}
                  multiple
                />
                <label htmlFor="file-upload" className="px-4 py-2 bg-forest-500 hover:bg-forest-600 text-white rounded-lg cursor-pointer mt-2">
                  Select Files
                </label>
                
                {/* Show selected files */}
                {fileNames.length > 0 && (
                  <div className="mt-4 w-full">
                    <p className="text-sm font-medium text-forest-700 mb-2">
                      {fileNames.length} file{fileNames.length !== 1 ? 's' : ''} selected
                    </p>
                    <ul className="text-xs text-forest-600 space-y-1 max-h-[60px] overflow-y-auto bg-white/80 rounded p-2 border border-forest-100">
                      {fileNames.map((name, index) => (
                        <li key={index} className="truncate flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-forest-400" />
                          {name}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" className="border-forest-200 text-forest-700" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" className="bg-forest-600 hover:bg-forest-700 text-white">
                {isEditing ? "Update Assignment" : "Save Assignment"}
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
