import React, { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { MessageSquare, Globe, Volume2, VolumeX } from 'lucide-react';
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

  const formatTime = (timestamp: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(timestamp);
  };

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

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ai_interviewer':
        return 'text-blue-600 bg-blue-50';
      case 'candidate':
        return 'text-green-600 bg-green-50';
      case 'system':
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <CardHeader className="pb-3 border-b flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Live Transcript
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => changeLanguage(language === 'en' ? 'hi' : 'en')}
              className="flex items-center gap-1"
            >
              <Globe className="w-4 h-4" />
              {language === 'en' ? 'EN' : 'हि'}
            </Button>
          </div>
        </div>
        
        {/* Debug Status Bar */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2 pt-2 border-t">
          {/* <div className="flex items-center gap-1">
            <div 
              className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-green-500' : 'bg-red-500'
              }`}
            />
            <span>{status || 'Unknown'}</span>
          </div> */}
          
          {isCollectingFeedback && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span>Feedback Mode</span>
            </div>
          )}
          
          <div className="flex items-center gap-1">
            <MessageSquare className="w-3 h-3" />
            <span>{messages.length} messages</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 p-0 overflow-hidden">
        <div 
          ref={scrollRef}
          className="h-full overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
        >
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
              <p>Waiting for conversation to start...</p>
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={`${message.id}-${index}`}
                className={`p-3 rounded-lg ${getRoleColor(message.role)} border`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">
                    {getRoleLabel(message.role)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatTime(message.timestamp)}
                  </span>
                </div>
                
                <div className="text-sm leading-relaxed">
                  {(message.type === 'text' || message.type === 'feedback') && (
                    <div>
                      <p>{message.content.text}</p>
                      {message.type === 'feedback' && (
                        <span className="inline-block mt-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          💬 Feedback
                        </span>
                      )}
                    </div>
                  )}
                  
                  {message.type === 'tool_call' && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded p-2">
                      <p className="font-medium text-yellow-800">
                        Tool Request: {message.content.tool_call}
                      </p>
                      <p className="text-yellow-700 text-xs mt-1">
                        {JSON.stringify(message.content.arguments, null, 2)}
                      </p>
                    </div>
                  )}
                  
                  {message.type === 'tool_result' && (
                    <div className="bg-purple-50 border border-purple-200 rounded p-2">
                      <p className="font-medium text-purple-800">
                        Tool Result: {message.content.tool_result}
                      </p>
                      <p className={`text-xs mt-1 ${
                        message.content.passed ? 'text-green-700' : 'text-red-700'
                      }`}>
                        Status: {message.content.passed ? 'Success' : 'Failed'}
                      </p>
                    </div>
                  )}
                  
                  {message.type === 'system' && (
                    <p className="italic text-gray-600">{message.content.text}</p>
                  )}
                </div>
                
                {message.audio_url && (
                  <div className="mt-2">
                    <audio controls className="w-full h-8">
                      <source src={message.audio_url} type="audio/mpeg" />
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}