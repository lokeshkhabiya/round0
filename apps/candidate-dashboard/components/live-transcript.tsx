import React, { useEffect, useRef } from 'react';
import { MessageSquare, Globe, Bot, User } from 'lucide-react';
import { Button } from './ui/button';
import { useConversationContext } from '../context/conversation-context';

export function LiveTranscript() {
  const {
    messages,
    language,
    changeLanguage,
    isConnected,
    isCollectingFeedback,
    status
  } = useConversationContext();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ai_interviewer':
        return 'Interviewer';
      case 'candidate':
        return 'You';
      case 'system':
        return 'System';
      default:
        return role;
    }
  };

  return (
    <div className="h-full flex flex-col interview-panel border-l border-white/10">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/10 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Transcript</span>
            <span className="text-xs text-muted-foreground">{messages.length}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => changeLanguage(language === 'en' ? 'hi' : 'en')}
            className="h-7 px-2 text-xs"
          >
            <Globe className="w-3 h-3 mr-1" />
            {language === 'en' ? 'EN' : 'HI'}
          </Button>
        </div>
        {isCollectingFeedback && (
          <div className="flex items-center gap-1.5 mt-2 text-xs text-primary">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Feedback mode
          </div>
        )}
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-3 space-y-3"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <MessageSquare className="w-8 h-8 text-muted-foreground/30 mb-3" />
            <p className="text-xs text-muted-foreground">
              Waiting for conversation...
            </p>
          </div>
        ) : (
          messages.map((message, index) => {
            const isInterviewer = message.role === 'ai_interviewer';
            const isSystem = message.role === 'system';

            return (
              <div
                key={`${message.id}-${index}`}
                className={`${isSystem ? 'text-center' : ''}`}
              >
                {isSystem ? (
                  <p className="text-[11px] text-muted-foreground italic py-1">
                    {message.content?.text || ''}
                  </p>
                ) : (
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      {isInterviewer ? (
                        <Bot className="w-3 h-3 text-primary" />
                      ) : (
                        <User className="w-3 h-3 text-muted-foreground" />
                      )}
                      <span className={`text-[11px] font-medium ${isInterviewer ? 'text-primary' : 'text-muted-foreground'}`}>
                        {getRoleLabel(message.role)}
                      </span>
                    </div>

                    <div className="text-sm leading-relaxed text-foreground/90 pl-4.5">
                      {(message.type === 'text' || message.type === 'feedback') && (
                        <div>
                          <p>{message.content?.text}</p>
                          {message.type === 'feedback' && (
                            <span className="inline-block mt-1 px-1.5 py-0.5 bg-primary/10 text-primary text-[10px] rounded">
                              Feedback
                            </span>
                          )}
                        </div>
                      )}

                      {message.type === 'tool_call' && (
                        <div className="p-2 rounded-lg bg-muted/50 border border-border/50 text-xs">
                          <span className="font-medium">Tool: </span>
                          {message.content?.tool_call}
                        </div>
                      )}

                      {message.type === 'tool_result' && (
                        <div className="p-2 rounded-lg bg-muted/50 border border-border/50 text-xs">
                          <span className="font-medium">Result: </span>
                          {message.content?.tool_result}
                          <span className={`ml-2 ${message.content?.passed ? 'text-chart-1' : 'text-destructive'}`}>
                            {message.content?.passed ? 'Passed' : 'Failed'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
