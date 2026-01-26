'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { createMentorSession, sendMentorMessage, getMentorSessionMessages, MentorMessage } from '@/api/operations/mentor-api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ThinkingAnimation } from '@/components/ui/thinking-animation';
import { Loader2, Send, MessageCircle, Bot, User, ArrowUp, StopCircle } from 'lucide-react';
import { toast } from 'sonner';
import { RenderMarkdown } from '@/components/markdown';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

function MentorPageContent() {
  const { token } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load existing session messages
  const loadSessionMessages = async (sessionId: string) => {
    if (!token) return;
    
    setIsLoading(true);
    try {
      const response = await getMentorSessionMessages(sessionId, token);
      if (response.success) {
        // Convert MentorMessage to Message format
        const convertedMessages: Message[] = response.data.map((msg: MentorMessage) => ({
          id: msg.id,
          role: msg.messenger_role === 'candidate' ? 'user' : 'assistant',
          content: msg.content.text,
          timestamp: new Date(msg.created_at),
        }));
        setMessages(convertedMessages);
      }
    } catch (error) {
      console.error('Error loading session messages:', error);
      toast.error('Failed to load session messages');
    } finally {
      setIsLoading(false);
    }
  };

  // Get session ID from URL on mount and load messages
  useEffect(() => {
    const urlSessionId = searchParams.get('session');
    if (urlSessionId) {
      setSessionId(urlSessionId);
      // Clear existing messages and load new ones
      setMessages([]);
      loadSessionMessages(urlSessionId);
    } else {
      // If no session ID, clear messages and session
      setSessionId(null);
      setMessages([]);
    }
  }, [searchParams, token]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const createSession = async (): Promise<string | null> => {
    if (!token) {
      toast.error('Please login to continue');
      return null;
    }

    setIsCreatingSession(true);
    try {
      const response = await createMentorSession(token);
      if (response.success) {
        const newSessionId = response.data.id;
        setSessionId(newSessionId);
        
        // Update URL with session ID
        const url = new URL(window.location.href);
        url.searchParams.set('session', newSessionId);
        router.replace(url.pathname + url.search);
        
        return newSessionId;
      } else {
        throw new Error(response.message || 'Failed to create session');
      }
    } catch (error) {
      console.error('Error creating session:', error);
      toast.error('Failed to create mentor session');
      return null;
    } finally {
      setIsCreatingSession(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || isStreaming) return;

    const messageContent = input.trim();
    setInput('');

    let currentSessionId: string | null = sessionId ?? null;

    // Create session on first message if it doesn't exist
    if (!currentSessionId) {
      currentSessionId = await createSession();
      if (!currentSessionId) return;
    }

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageContent,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setIsStreaming(true);

    try {
      const response = await sendMentorMessage(currentSessionId!, messageContent, token as string);
      
      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response stream available');
      }

      // Create assistant message placeholder with thinking indicator
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Thinking...',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Read streaming response
      let fullContent = '';
      let hasReceivedContent = false;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              continue;
            }

            try {
              const parsed = JSON.parse(data);
              if (parsed.type === 'text-delta' && parsed.textDelta) {
                fullContent += parsed.textDelta;
                hasReceivedContent = true;
                
                // Update the assistant message content (replace "Thinking..." with actual content)
                setMessages(prev => 
                  prev.map(msg => 
                    msg.id === assistantMessage.id 
                      ? { ...msg, content: fullContent }
                      : msg
                  )
                );
              }
            } catch (parseError) {
              // Ignore JSON parse errors for non-JSON lines
            }
          }
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      
      // Remove the assistant message placeholder on error
      setMessages(prev => prev.filter(msg => msg.id !== (Date.now() + 1).toString()));
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  const handleSamplePrompt = (prompt: string) => {
    setInput(prompt);
    textareaRef.current?.focus();
  };

  const samplePrompts = [
    "How can I improve my interview performance?",
    "What skills should I focus on for my career growth?",
    "Help me prepare for technical interviews",
    "How do I negotiate a better salary?"
  ];

  if (!token) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Card className="w-full max-w-md mx-4 shadow-lg border">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-6 bg-black dark:bg-white rounded-xl flex items-center justify-center">
              <MessageCircle className="h-8 w-8 text-white dark:text-black" />
            </div>
            <h2 className="text-2xl font-semibold mb-3">Welcome Back</h2>
            <p className="text-muted-foreground mb-6">Please sign in to access your AI mentor and get personalized career guidance.</p>
            <Button className="w-full bg-black hover:bg-gray-800 text-white dark:bg-white dark:text-black dark:hover:bg-gray-200">
              Sign In to Continue
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-slate-900">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          // Welcome Screen
          <div className="flex items-center justify-center min-h-full px-4">
            <div className="text-center max-w-2xl mx-auto py-12">
              {/* Logo/Icon */}
              <div className="relative mb-8">
                <div className="w-20 h-20 mx-auto bg-black dark:bg-white rounded-2xl flex items-center justify-center shadow-lg">
                  <Bot className="h-10 w-10 text-white dark:text-black" />
                </div>
                {/* <div className="absolute -top-1 -right-1 w-6 h-6 bg-black dark:bg-white rounded-full border-4 border-background"></div> */}
              </div>

              {/* Title */}
              <h1 className="text-4xl font-bold text-foreground mb-4">
                AI Career Mentor
              </h1>
              
              {/* Subtitle */}
              <p className="text-lg text-muted-foreground mb-12 leading-relaxed">
                Get personalized career guidance, interview preparation tips, and professional development advice from your AI mentor.
              </p>

              {/* Sample Prompts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                {samplePrompts.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => handleSamplePrompt(prompt)}
                    className="p-4 text-left bg-card hover:bg-muted rounded-lg border transition-colors duration-200 text-sm text-card-foreground"
                  >
                    <div className="flex items-start gap-3">
                      <MessageCircle className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                      <span>{prompt}</span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Features */}
              <div className="flex items-center justify-center gap-8 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-black dark:bg-white rounded-full"></div>
                  <span>Instant responses</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-gray-600 rounded-full"></div>
                  <span>Personalized advice</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                  <span>Career focused</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Chat Messages
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start gap-4 ${
                    message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  {/* Avatar */}
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border ${
                    message.role === 'user' 
                      ? 'bg-black dark:bg-white border-black dark:border-white' 
                      : 'bg-white dark:bg-black border-gray-300 dark:border-gray-600'
                  }`}>
                    {message.role === 'user' ? (
                      <User className="h-4 w-4 text-white dark:text-black" />
                    ) : (
                      <Bot className="h-4 w-4 text-black dark:text-white" />
                    )}
                  </div>
                  
                  {/* Message Content */}
                  <div className={`flex-1 max-w-3xl ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                    <div className={`inline-block px-6 py-4 rounded-lg border ${
                      message.role === 'user'
                        ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white'
                        : 'bg-card text-card-foreground border-border'
                    }`}>
                      <div className={`text-left overflow-hidden ${message.role === 'user' ? 'whitespace-pre-wrap break-words' : ''}`}>
                        {message.content === 'Thinking...' ? (
                          <ThinkingAnimation />
                        ) : message.role === 'user' ? (
                          <div className="whitespace-pre-wrap break-words">{message.content}</div>
                        ) : (
                          <RenderMarkdown markdown={message.content} />
                        )}
                      </div>
                    </div>
                    
                    {/* Timestamp */}
                    <div className={`text-xs text-muted-foreground mt-2 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                      {message.timestamp.toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>
                </div>
              ))}
              
              <div ref={messagesEndRef} />
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-border bg-background/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <form onSubmit={handleSubmit} className="relative">
            <div className="relative flex items-end gap-3 bg-card rounded-lg border border-border focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 transition-all duration-200">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  messages.length === 0 
                    ? "Ask me anything about your career, interviews, or professional development..."
                    : "Type your message..."
                }
                className="flex-1 resize-none bg-transparent px-6 py-4 text-foreground placeholder:text-muted-foreground focus:outline-none min-h-[56px] max-h-[200px]"
                disabled={isLoading || isCreatingSession}
                rows={1}
              />
              
              <Button
                type="submit"
                size="icon"
                disabled={!input.trim() || isLoading || isCreatingSession || isStreaming}
                className="m-2 h-10 w-10 p-0 bg-black hover:bg-gray-800 text-white dark:bg-white dark:text-black dark:hover:bg-gray-200 rounded-lg shrink-0 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading || isCreatingSession ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isStreaming ? (
                  <StopCircle className="h-4 w-4" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
              <span>Press Enter to send, Shift + Enter for new line</span>
              {sessionId && (
                <span className="bg-muted px-2 py-1 rounded-md">
                  Session: {sessionId.slice(-8)}
                </span>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function MentorPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-background">
          <div className="text-center">
            <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading mentor...</p>
          </div>
        </div>
      }
    >
      <MentorPageContent />
    </Suspense>
  );
}