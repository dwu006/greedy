"use client";

import { useState, useRef } from "react";
import { motion, PanInfo, useMotionValue } from "framer-motion";

interface DraggableTextBoxProps {
  initialPosition: { x: number; y: number };
  onDragEnd: (position: { x: number; y: number }) => void;
  onBlur: (text: string) => void;
  initialText?: string;
  selected?: boolean;
  onSelect?: () => void;
  onDelete?: () => void;
  handMode?: boolean;
  deleteMode?: boolean;
  gridSize?: number;
}

export function DraggableTextBox({
  initialPosition,
  onDragEnd,
  onBlur,
  initialText = "Double click to edit",
  selected = false,
  onSelect,
  onDelete,
  handMode = false,
  deleteMode = false,
  gridSize = 20, // default grid size
}: DraggableTextBoxProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(initialText);
  const inputRef = useRef<HTMLInputElement>(null);

  const x = useMotionValue(initialPosition.x);
  const y = useMotionValue(initialPosition.y);

  const handleDragEnd = (_: any, info: PanInfo) => {
    const newX = Math.round(x.get() / gridSize) * gridSize;
    const newY = Math.round(y.get() / gridSize) * gridSize;

    x.set(newX);
    y.set(newY);
    onDragEnd({ x: newX, y: newY });
  };

  const handleDoubleClick = () => {
    if (!handMode && !deleteMode) {
      setIsEditing(true);
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 0);
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
    onBlur(text);
  };

  return (
    <motion.div
      drag={handMode}
      dragMomentum={false} // No flying away!
      dragElastic={0} // Crisp
      style={{ x, y, zIndex: selected ? 1010 : 1000 }}
      onDragEnd={handMode ? handleDragEnd : undefined}
      onDoubleClick={handleDoubleClick}
      onClick={(e) => {
        e.stopPropagation();
        if (onSelect) onSelect();
        if (deleteMode && onDelete) onDelete();
      }}
      whileDrag={{
        scale: 1.03,
        boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.15)",
      }}
      transition={{
        type: "spring",
        stiffness: 700,
        damping: 30,
      }}
      className={`absolute p-2 bg-white rounded shadow select-none transition-all
        ${selected ? 'border-2 border-blue-500 ring-2 ring-blue-200' : 'border border-gray-300'}
        ${handMode ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'}
      `}
    >
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={(e) => e.key === "Enter" && handleBlur()}
          className="outline-none border-none w-full text-sm"
          autoFocus
        />
      ) : (
        <div className="min-w-[100px] min-h-[24px] text-sm">
          {text || "Double click to edit"}
        </div>
      )}
      {selected && deleteMode && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (onDelete) onDelete();
          }}
          className="absolute top-0 right-0 mt-1 mr-1 p-1 rounded-full bg-rose-100 text-rose-600 hover:bg-rose-200"
          style={{ zIndex: 1100 }}
          title="Delete"
        >
          ×
        </button>
      )}
    </motion.div>
  );
}
