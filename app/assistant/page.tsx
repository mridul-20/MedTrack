"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { SendIcon, Loader2Icon, BotIcon, UserIcon } from "lucide-react"
import { aiService } from "@/lib/ai-service"
import { PageShell } from "@/components/page-shell"

type Message = {
  id: string
  role: "user" | "assistant"
  content: string
}

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome-message",
      role: "assistant",
      content:
        "Hello! I'm your health assistant. How can I help you today? You can ask me about symptoms, medicines, or home remedies.",
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      // Use our Gemini-based AI service
      const response = await aiService.generateChatResponse(input)

      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: response,
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("Error generating response:", error)

      const errorMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content:
          "I'm sorry, I encountered an error processing your request. I'm currently operating in offline mode with limited capabilities. Please try asking about common health topics like headaches, colds, or allergies.",
      }

      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <PageShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.4em] text-emerald-200">Conversational care</p>
            <div>
              <h1 className="text-4xl font-semibold text-white">Health Assistant</h1>
              <p className="text-white/70">
                Ask symptoms, medicine interactions, or self-care routines. Responses stay contextual to your cabinet.
              </p>
            </div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-4 text-sm text-white/70 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-200">Now online</p>
            <p className="text-lg font-semibold text-white">Average reply · 2.3s</p>
          </div>
        </div>

        <Card className="min-h-[520px]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <BotIcon className="h-5 w-5 text-emerald-300" />
              MediTrack Assistant
            </CardTitle>
            <CardDescription>Ask about symptoms, medicines, or home remedies</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto">
            <div className="space-y-4 pb-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className="flex max-w-[80%] items-start gap-3">
                    {message.role === "assistant" && (
                      <Avatar>
                        <AvatarFallback>AI</AvatarFallback>
                        <AvatarImage src="/placeholder.svg?height=40&width=40" />
                      </Avatar>
                    )}
                    <div
                      className={`rounded-2xl px-4 py-2 text-sm shadow-lg ${
                        message.role === "user"
                          ? "bg-white text-slate-900"
                          : "bg-white/10 text-white backdrop-blur"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>
                    {message.role === "user" && (
                      <Avatar>
                        <AvatarFallback>
                          <UserIcon className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex max-w-[80%] items-start gap-3">
                    <Avatar>
                      <AvatarFallback>AI</AvatarFallback>
                      <AvatarImage src="/placeholder.svg?height=40&width=40" />
                    </Avatar>
                    <div className="rounded-2xl bg-white/10 px-4 py-2 text-white">
                      <Loader2Icon className="h-5 w-5 animate-spin" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </CardContent>
          <CardFooter className="border-t border-white/5 pt-4">
            <form onSubmit={handleSendMessage} className="flex w-full gap-2">
              <Input
                placeholder="Type your health question..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
                className="flex-1"
              />
              <Button type="submit" disabled={isLoading || !input.trim()}>
                {isLoading ? <Loader2Icon className="h-4 w-4 animate-spin" /> : <SendIcon className="h-4 w-4" />}
              </Button>
            </form>
          </CardFooter>
        </Card>
      </div>
    </PageShell>
  )
}

