'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { createMentorSession, sendMentorMessage, getMentorSessionMessages, MentorMessage } from '@/api/operations/mentor-api';
import { Button } from '@/components/ui/button';
import { ThinkingAnimation } from '@/components/ui/thinking-animation';
import { Loader2, ArrowUp, Bot, MessageCircle } from 'lucide-react';
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

  const loadSessionMessages = async (sid: string) => {
    if (!token) return;
    setIsLoading(true);
    try {
      const response = await getMentorSessionMessages(sid, token);
      if (response.success) {
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

  useEffect(() => {
    const urlSessionId = searchParams.get('session');
    if (urlSessionId) {
      setSessionId(urlSessionId);
      setMessages([]);
      loadSessionMessages(urlSessionId);
    } else {
      setSessionId(null);
      setMessages([]);
    }
  }, [searchParams, token]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

    if (!currentSessionId) {
      currentSessionId = await createSession();
      if (!currentSessionId) return;
    }

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

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Thinking...',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);

      let fullContent = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              if (parsed.type === 'text-delta' && parsed.textDelta) {
                fullContent += parsed.textDelta;
                setMessages(prev =>
                  prev.map(msg =>
                    msg.id === assistantMessage.id
                      ? { ...msg, content: fullContent }
                      : msg
                  )
                );
              }
            } catch {
              // Ignore parse errors
            }
          }
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
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
    "What skills should I focus on for career growth?",
    "Help me prepare for technical interviews",
    "How do I negotiate a better salary?"
  ];

  if (!token) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="text-center max-w-sm mx-auto px-4">
          <div className="h-12 w-12 mx-auto mb-4 rounded-xl bg-primary/10 flex items-center justify-center">
            <MessageCircle className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-lg font-semibold mb-2">Sign in to continue</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Access your AI mentor for personalized career guidance.
          </p>
          <Button onClick={() => router.push('/auth/login')}>
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Messages */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {messages.length === 0 ? (
          /* Empty state */
          <div className="flex items-center justify-center min-h-full px-4">
            <div className="text-center max-w-xl mx-auto py-20">
              <div className="h-12 w-12 mx-auto mb-6 rounded-xl bg-primary/10 flex items-center justify-center">
                <Bot className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-2xl font-semibold tracking-tight mb-2">
                What can I help with?
              </h1>
              <p className="text-muted-foreground text-sm mb-10">
                Career guidance, interview prep, and professional development advice.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-lg mx-auto">
                {samplePrompts.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSamplePrompt(prompt)}
                    className="p-3.5 text-left rounded-xl border border-border/60 hover:border-border hover:bg-muted/50 transition-all duration-150 text-sm text-foreground"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Chat messages */
          <div className="max-w-3xl mx-auto px-4 py-8">
            <div className="space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className="animate-in fade-in-0 duration-200"
                >
                  {message.role === 'user' ? (
                    /* User message */
                    <div className="flex justify-end">
                      <div className="max-w-[85%] px-4 py-3 rounded-2xl rounded-br-md bg-muted text-sm whitespace-pre-wrap break-words">
                        {message.content}
                      </div>
                    </div>
                  ) : (
                    /* Assistant message */
                    <div className="flex gap-3">
                      <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <Bot className="h-4 w-4 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1 text-sm">
                        {message.content === 'Thinking...' ? (
                          <ThinkingAnimation />
                        ) : (
                          <div className="markdown-mentor">
                            <RenderMarkdown markdown={message.content} />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <form onSubmit={handleSubmit}>
            <div className="relative flex items-end bg-muted/50 rounded-2xl border border-border/60 focus-within:border-border focus-within:ring-1 focus-within:ring-ring/20 transition-all duration-150">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  messages.length === 0
                    ? "Ask about interviews, career growth, salary negotiation..."
                    : "Type a message..."
                }
                className="flex-1 resize-none bg-transparent px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none min-h-[48px] max-h-[200px]"
                disabled={isLoading || isCreatingSession}
                rows={1}
              />
              <Button
                type="submit"
                size="icon"
                disabled={!input.trim() || isLoading || isCreatingSession || isStreaming}
                className="m-1.5 h-9 w-9 rounded-xl shrink-0 transition-all duration-150 disabled:opacity-30"
              >
                {isLoading || isCreatingSession ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ArrowUp className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground/60 text-center mt-2">
              Enter to send &middot; Shift+Enter for new line
            </p>
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
        <div className="flex items-center justify-center min-h-screen app-surface">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <MentorPageContent />
    </Suspense>
  );
}
