"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Leaf } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { ToastAction } from "@/components/ui/toast";

export default function CreateClassPopup({ open, onClose }: {
  open: boolean;
  onClose: () => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    capacity: "30",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Class created successfully",
        description: `${formData.name} has been added to your classes.`,
        action: <ToastAction altText="View Dashboard">View Dashboard</ToastAction>,
      });
      onClose();
    }, 1500);
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
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle className="text-xl font-jakarta font-semibold text-forest-800 flex items-center gap-2">
                  Class Details
                  <Leaf className="h-6 w-6 text-forest-500 animate-leaf-sway" />
                </CardTitle>
              </div>
              <CardDescription className="font-inter text-forest-600 mt-2">
                Fill in the information about your new class
              </CardDescription>
            </CardHeader>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate" className="font-jakarta font-medium text-forest-700">
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
                  <Label htmlFor="endDate" className="font-jakarta font-medium text-forest-700">
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

              {/* Separator */}
              <div className="my-6 border-t border-gray-200" />

              {/* File Upload Area */}
              <div className="space-y-2">
                <Label className="font-jakarta font-medium text-forest-700">Upload Class Syllabus</Label>
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-forest-200 rounded-xl bg-forest-50/40 p-6 cursor-pointer hover:bg-forest-100/70 transition-colors">
                  <span className="text-forest-600 mb-2 font-inter">Drag & drop files here or click to upload</span>
                  <Input
                    type="file"
                    className="hidden"
                    id="file-upload"
                    multiple
                    onChange={() => {}}
                  />
                  <label htmlFor="file-upload" className="px-4 py-2 bg-forest-500 hover:bg-forest-600 text-white rounded-lg cursor-pointer mt-2">Select Files</label>
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
        </Card>
      </motion.div>
    </div>
  );
}
