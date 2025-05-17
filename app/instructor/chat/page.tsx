"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { SendHorizontal, Bot, User } from "lucide-react"

interface Message {
  id: number
  text: string
  sender: "user" | "assistant"
  timestamp: Date
}

export default function InstructorChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hello! I'm your Greedy Assistant. I can help you manage your curriculum. Try asking me to add or move events in your timeline.",
      sender: "assistant",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")

  const handleSendMessage = () => {
    if (input.trim() === "") return

    // Add user message
    const userMessage: Message = {
      id: messages.length + 1,
      text: input,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages([...messages, userMessage])
    setInput("")

    // Simulate assistant response
    setTimeout(() => {
      let responseText = ""

      if (input.toLowerCase().includes("add") && input.toLowerCase().includes("event")) {
        responseText = "I've added the event to your timeline. You can view it in the Timeline tab."
      } else if (input.toLowerCase().includes("move") && input.toLowerCase().includes("lesson")) {
        responseText = "I've moved the lesson as requested. The timeline has been updated."
      } else {
        responseText =
          "I understand you want to manage your curriculum. Could you be more specific about what you'd like to do with your timeline?"
      }

      const assistantMessage: Message = {
        id: messages.length + 2,
        text: responseText,
        sender: "assistant",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    }, 1000)
  }

  return (
    <div className="p-6 h-[calc(100vh-4rem)] flex flex-col">
      <h1 className="text-3xl font-light text-slate-800 mb-6">Chat Assistant</h1>

      <Card className="flex-1 flex flex-col p-4 overflow-hidden border-none shadow-md">
        <div className="flex-1 overflow-y-auto mb-4 space-y-4 p-2">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`flex items-start gap-2 max-w-[80%] ${message.sender === "user" ? "flex-row-reverse" : ""}`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      message.sender === "assistant" ? "bg-lavender-100 text-lavender-700" : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {message.sender === "assistant" ? <Bot size={16} /> : <User size={16} />}
                  </div>
                  <div
                    className={`rounded-2xl px-4 py-2 ${
                      message.sender === "assistant"
                        ? "bg-white border border-slate-200 text-slate-700"
                        : "bg-blue-500 text-white"
                    }`}
                  >
                    <p>{message.text}</p>
                    <p
                      className={`text-xs mt-1 ${message.sender === "assistant" ? "text-slate-400" : "text-blue-100"}`}
                    >
                      {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="flex gap-2">
          <Input
            placeholder="Ask me to add or move events..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            className="flex-1"
          />
          <Button onClick={handleSendMessage} className="bg-lavender-500 hover:bg-lavender-600">
            <SendHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </div>
  )
}
