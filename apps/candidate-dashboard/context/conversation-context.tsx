'use client';

import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { useConversation, ConversationMessage, ToolCall, ConversationState } from '@/hooks/use-conversation';
import { useInterviewTokenPayloadStore } from '@/stores/interview-token-payload-store';

interface ConversationContextType extends ConversationState {
  // ElevenLabs specific properties
  isSpeaking?: boolean;
  // Methods
  connect: () => Promise<void>;
  disconnect: () => void;
  startRecording: () => void;
  stopRecording: () => void;
  pauseSession: () => Promise<void>;
  resumeSession: () => Promise<void>;
  sendText: (text: string) => void;
  submitToolResult: (toolName: string, result: any) => void;
  changeLanguage: (language: 'en' | 'hi') => void;
  endInterview: () => Promise<void>;
  // Feedback methods
  submitStructuredFeedback: (feedbackData: any) => Promise<void>;
  finishFeedbackAndEndInterview: () => Promise<void>;
  activateFeedbackMode: () => void;
}

const ConversationContext = createContext<ConversationContextType | null>(null);

interface ConversationProviderProps {
  children: ReactNode;
  roundId: string;
}

export function ConversationProvider({ children, roundId }: ConversationProviderProps) {
  // Get token from localStorage in useEffect to avoid SSR issues
  const [isTokenLoaded, setIsTokenLoaded] = React.useState(false);
  const { token, interview_token_payload } = useInterviewTokenPayloadStore();

  useEffect(() => {

    if (token && interview_token_payload) {
      setIsTokenLoaded(true);
    }
  }, [token, interview_token_payload]);

  // Only pass token to useConversation when it's loaded
  const conversation = useConversation(roundId, isTokenLoaded ? token : '', interview_token_payload);

  // If token isn't loaded yet, provide a loading state
  const contextValue = React.useMemo(() => {
    if (!isTokenLoaded) {
      return {
        messages: [],
        isConnected: false,
        isRecording: false,
        language: 'en' as const,
        status: 'disconnected' as const,
        isCollectingFeedback: false,
        interviewCompleted: false,
        isSpeaking: false,
        connect: async () => {},
        disconnect: () => {},
        startRecording: () => {},
        stopRecording: () => {},
        pauseSession: async () => {},
        resumeSession: async () => {},
        sendText: (text: string) => {},
        submitToolResult: (toolName: string, result: any) => {},
        changeLanguage: (language: 'en' | 'hi') => {},
        endInterview: async () => {},
        submitStructuredFeedback: async (feedbackData: any) => {},
        finishFeedbackAndEndInterview: async () => {},
        activateFeedbackMode: () => {},
      };
    }
    return conversation;
  }, [isTokenLoaded, conversation]);

  return (
    <ConversationContext.Provider value={contextValue}>
      {children}
    </ConversationContext.Provider>
  );
}

export function useConversationContext() {
  const context = useContext(ConversationContext);
  if (!context) {
    throw new Error('useConversationContext must be used within a ConversationProvider');
  }
  return context;
}