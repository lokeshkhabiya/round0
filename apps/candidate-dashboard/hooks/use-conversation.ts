import { useState, useRef, useEffect, useCallback } from "react";
import { useConversation as useElevenLabsConversation } from "@elevenlabs/react";
import {
  endInterviewRound,
  getAgentUrl,
  saveMessageToDatabase,
  saveToolResultToDatabase,
} from "@/api/operations/interview-api";

export interface ConversationMessage {
  id: string;
  role: "ai_interviewer" | "candidate" | "system";
  content: any;
  type: "text" | "audio" | "tool_call" | "tool_result" | "system" | "feedback";
  timestamp: Date;
  audio_url?: string;
}

export interface ToolCall {
  id: string;
  tool: string;
  arguments: any;
}

export interface signedUrlResponse {
  success: boolean;
  message: string;
  signed_url: string;
}

// Add conversationId to your ConversationState interface
export interface ConversationState {
  messages: ConversationMessage[];
  isConnected: boolean;
  isRecording: boolean;
  currentTool?: ToolCall;
  language: "en" | "hi";
  status: "disconnected" | "connecting" | "connected" | "error";
  isCollectingFeedback: boolean;
  interviewCompleted: boolean;
}

export function useConversation(
  roundId: string,
  token: string,
  interview_token_payload: any
) {
  const [state, setState] = useState<ConversationState>({
    messages: [],
    isConnected: false,
    isRecording: false,
    language: "en",
    status: "disconnected",
    isCollectingFeedback: false,
    interviewCompleted: false,
  });

  // Add micMuted state for controlling microphone
  const [micMuted, setMicMuted] = useState(false);

  // Add a queue for offline persistence
  const [messageQueue, setMessageQueue] = useState<ConversationMessage[]>([]);
  const [isOnline, setIsOnline] = useState(true);

  const [conversationId, setConversationId] = useState<string | undefined>(
    undefined
  );

  // Use ref to always get current conversationId value
  const conversationIdRef = useRef<string | undefined>(undefined);

  // Use ref to always get current feedback mode value
  const isCollectingFeedbackRef = useRef<boolean>(false);

  // Update refs whenever values change
  useEffect(() => {
    conversationIdRef.current = conversationId;
  }, [conversationId]);

  useEffect(() => {
    isCollectingFeedbackRef.current = state.isCollectingFeedback;
    console.log("🎯 Feedback mode changed:", state.isCollectingFeedback);
  }, [state.isCollectingFeedback]);

  // Get agent URL for ElevenLabs
  const fetchAgentUrl = useCallback(async () => {
    try {
      // Import the API function dynamically to avoid circular dependency
      const response: signedUrlResponse = await getAgentUrl(roundId, token);

      if (response?.success) {
        return response.signed_url;
      }
      throw new Error("Failed to get agent URL from backend");
    } catch (error) {
      console.error("Error getting agent URL:", error);
      // Fallback to agent ID if available
      return process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID;
    }
  }, [roundId, token]);

  // ElevenLabs conversation hook with micMuted option
  const conversation = useElevenLabsConversation({
    micMuted: micMuted, // Control microphone muting
    onStatusChange: (status: any) => {
      console.log("ElevenLabs status changed:", status);
      setState((prev) => ({
        ...prev,
        isConnected: status === "connected",
        status:
          status === "connected"
            ? "connected"
            : status === "connecting"
              ? "connecting"
              : status === "error"
                ? "error"
                : "disconnected",
      }));
    },
    onMessage: (message) => {
      console.log("ElevenLabs message received:", message);
      handleIncomingMessage(message);
    },
    onError: (error) => {
      console.error("ElevenLabs conversation error:", error);
      setState((prev) => ({ ...prev, status: "error" }));
    },
    // Client tools - ADD DEBUG LOGGING
    clientTools: {
      code_editor: (parameters: { language?: string; template?: string }) => {
        console.log("🎯 code_editor tool called with parameters:", parameters);
        const toolCall: ToolCall = {
          id: Date.now().toString(),
          tool: "code_editor",
          arguments: parameters,
        };
        setState((prev) => ({ ...prev, currentTool: toolCall }));
        console.log("✅ Code editor tool call completed");
        return "Code editor opened successfully";
      },
      system_design_evaluator: (parameters: { task?: string }) => {
        console.log(
          "🎯 system_design_evaluator tool called with parameters:",
          parameters
        );
        const toolCall: ToolCall = {
          id: Date.now().toString(),
          tool: "system_design_evaluator",
          arguments: parameters,
        };
        setState((prev) => ({ ...prev, currentTool: toolCall }));
        console.log("✅ System design evaluator tool call completed");
        return "System design whiteboard opened successfully";
      },
      complete_interview: (parameters: {
        reason?: string;
        summary?: string;
      }) => {
        console.log("🎯 complete_interview tool called by agent:", parameters);

        const currentTime = new Date();
        const startTime = new Date(currentTime.getTime() - performance.now()); // Approximate
        const durationMinutes =
          (currentTime.getTime() - startTime.getTime()) / (1000 * 60);

        // Prevent early completion
        if (durationMinutes < 18) {
          console.log("⏰ Interview too short, extending duration");
          conversation.sendContextualUpdate(
            `System: Interview duration is only ${Math.round(durationMinutes)} minutes. Please continue with more in-depth questions and assessment. Target duration is 20-25 minutes.`
          );
          return "Let me continue with a few more questions to ensure a comprehensive assessment of your skills.";
        }
        // Add a message to indicate interview completion
        const completionMessage: ConversationMessage = {
          id: Date.now().toString(),
          role: "system",
          content: {
            text: `Interview completed by AI agent. Reason: ${parameters.reason || "Assessment complete"}`,
            agent_summary: parameters.summary,
          },
          type: "system",
          timestamp: new Date(),
        };

        setState((prev) => {
          console.log("🔄 Setting feedback mode to TRUE");
          return {
            ...prev,
            messages: [...prev.messages, completionMessage],
            interviewCompleted: true,
            isCollectingFeedback: true, // Start feedback collection mode
            isRecording: true, // Keep recording for feedback conversation
          };
        });

        // Persist the completion message
        persistMessage(completionMessage);

        console.log(
          "✅ Interview completion initiated by agent - entering feedback mode"
        );
        console.log(
          "🎤 All subsequent messages will be stored as feedback type"
        );
        return "Thank you for completing the interview assessment! Now I'd love to hear your feedback about your interview experience. How did you find the interview process? Please share your thoughts and any suggestions for improvement.";
      },
    },
  });

  // Add audio URL extraction logic
  const extractAudioUrl = (message: any): string | undefined => {
    // Check various possible audio URL fields from ElevenLabs
    return (
      message.audio_url ||
      message.audioUrl ||
      message.audio ||
      message.audio_data?.url ||
      message.media?.audio?.url
    );
  };

  // Enhanced persistence function to handle feedback message type
  const persistMessage = useCallback(
    async (message: ConversationMessage) => {
      try {
        // Map our message role to database enum
        const messenger_role =
          message.role === "ai_interviewer"
            ? "ai_interviewer"
            : message.role === "candidate"
              ? "candidate"
              : "system";

        // Map message type to database enum - ensure feedback is properly mapped
        const message_type =
          message.type === "feedback"
            ? "feedback"
            : message.type === "tool_call"
              ? "tool_call"
              : message.type === "tool_result"
                ? "tool_result"
                : message.type === "audio"
                  ? "audio"
                  : "text"; // default to text

        const currentConversationId = conversationIdRef.current;
        console.log(
          "💾 Persisting message with conversationId:",
          currentConversationId,
          "type:",
          message_type
        );
        console.log("📄 Message content:", message.content);

        await saveMessageToDatabase(roundId, token, {
          messenger_role,
          content: message.content,
          message_type: message_type as any, // Type assertion for feedback support
          audio_url: message.audio_url,
          conversation_id: currentConversationId,
        });

        console.log(
          "✅ Message persisted to database:",
          message.id,
          "with type:",
          message_type
        );
      } catch (error) {
        console.error("❌ Failed to persist message:", error);
        // Add to queue for retry when back online
        setMessageQueue((prev) => [...prev, message]);
      }
    },
    [roundId, token]
  );

  // Enhanced message handler with better audio extraction
  const handleIncomingMessage = useCallback(
    async (message: any) => {
      console.log("🎵 Processing message with potential audio:", message);

      const audioUrl = extractAudioUrl(message);
      if (audioUrl) {
        console.log("🎵 Audio URL found:", audioUrl);
      }

      let newMessage: ConversationMessage;

      // Convert ElevenLabs message format to our internal format
      let isInFeedbackMode = isCollectingFeedbackRef.current;

      // Auto-detect feedback mode from AI messages if not already in feedback mode
      if (
        !isInFeedbackMode &&
        (message.source === "ai" || message.source === "agent")
      ) {
        const messageText = (
          message.message ||
          message.transcript ||
          message.text ||
          ""
        ).toLowerCase();
        const feedbackKeywords = [
          "feedback",
          "how was your experience",
          "how did you find",
          "what did you think",
          "any suggestions",
          "how would you rate",
          "your thoughts on",
          "interview experience",
          "overall experience",
          "thoughts about the interview",
          "how was the interview",
          "thank you for your time", // Common interview ending phrase
          "pleasure speaking with you",
          "best of luck with your future endeavors",
          "that concludes our interview",
          "before we wrap up",
          "before we end",
          "any final thoughts",
          "anything else you would like to share",
        ];

        const containsFeedbackKeywords = feedbackKeywords.some((keyword) =>
          messageText.includes(keyword)
        );

        if (containsFeedbackKeywords) {
          console.log(
            "🎯 Auto-detected feedback mode from AI message:",
            messageText
          );

          // Automatically enter feedback mode
          setState((prev) => {
            console.log(
              "🔄 Auto-entering feedback mode based on AI message content"
            );
            return {
              ...prev,
              interviewCompleted: true,
              isCollectingFeedback: true,
              isRecording: true,
            };
          });

          // Send contextual update to agent to let it know we're in feedback mode
          try {
            conversation.sendContextualUpdate(
              "System: Interview has concluded and feedback collection mode is now active. All subsequent messages will be categorized as feedback data."
            );
            console.log(
              "✅ Sent contextual update about feedback mode to agent"
            );
          } catch (error) {
            console.error(
              "❌ Failed to send contextual update to agent:",
              error
            );
          }

          isInFeedbackMode = true; // Update local variable for this message
        }
      }

      console.log("🔍 Processing message - Feedback mode:", isInFeedbackMode);

      if (message.source === "ai" || message.source === "agent") {
        newMessage = {
          id: Date.now().toString(),
          role: "ai_interviewer",
          content: {
            text: message.message || message.transcript || message.text,
          },
          type: isInFeedbackMode ? "feedback" : "text", // Use feedback type when in feedback mode
          timestamp: new Date(),
          audio_url: audioUrl,
        };
      } else if (message.source === "user" || message.source === "human") {
        newMessage = {
          id: Date.now().toString(),
          role: "candidate",
          content: {
            text: message.message || message.transcript || message.text,
          },
          type: isInFeedbackMode ? "feedback" : "text", // Use feedback type when in feedback mode
          timestamp: new Date(),
          audio_url: audioUrl,
        };
      } else if (message.type === "user_transcript") {
        newMessage = {
          id: Date.now().toString(),
          role: "candidate",
          content: { text: message.transcript || message.message },
          type: isInFeedbackMode ? "feedback" : "text", // Use feedback type when in feedback mode
          timestamp: new Date(),
          audio_url: audioUrl,
        };
      } else if (message.type === "agent_response") {
        newMessage = {
          id: Date.now().toString(),
          role: "ai_interviewer",
          content: { text: message.agent_response || message.response },
          type: isInFeedbackMode ? "feedback" : "text", // Use feedback type when in feedback mode
          timestamp: new Date(),
          audio_url: audioUrl,
        };
      } else {
        // Handle other message types (system, debug, etc.)
        newMessage = {
          id: Date.now().toString(),
          role: "system",
          content: { text: JSON.stringify(message) },
          type: "system",
          timestamp: new Date(),
          audio_url: audioUrl,
        };
      }

      // Update local state immediately
      setState((prev) => ({
        ...prev,
        messages: [...prev.messages, newMessage],
      }));

      // Persist to database
      await persistMessage(newMessage);
    },
    [roundId, token, persistMessage]
  );

  const connect = useCallback(async () => {
    if (!token || !roundId) {
      console.error("Missing token or roundId:", { token: !!token, roundId });
      setState((prev) => ({ ...prev, status: "error" }));
      return;
    }

    try {
      setState((prev) => ({ ...prev, status: "connecting" }));

      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // Get agent URL or use agent ID
      const agentUrl = await fetchAgentUrl();
      console.log("🔗 Agent URL fetched:", agentUrl);

      if (
        agentUrl &&
        typeof agentUrl === "string" &&
        agentUrl.startsWith("wss://")
      ) {
        console.log("🚀 Starting session with signed URL and client tools...");
        // Start session with signed URL - pass as signedUrl parameter
        const conversationId = await conversation.startSession({
          signedUrl: agentUrl,
          dynamicVariables: {
            round_type: interview_token_payload?.round_type,
            title: interview_token_payload?.title,
            candidate_name: interview_token_payload?.candidate_name,
            round_number: interview_token_payload?.round_number,
            recruiter_name: interview_token_payload?.recruiter_name,
            description: interview_token_payload?.description,
            jd_skills: interview_token_payload?.jd_skills.join(", "),
            jd_experience: interview_token_payload?.jd_experience,
            jd_location: interview_token_payload?.jd_location,
            round_specific_instructions:
              interview_token_payload?.round_specific_instructions,
            job_specific_instructions:
              interview_token_payload?.job_specific_instructions,
          },
          clientTools: {
            code_editor: (parameters: {
              language?: string;
              template?: string;
            }) => {
              console.log(
                "🎯 [startSession] code_editor tool called with parameters:",
                parameters
              );
              const toolCall: ToolCall = {
                id: Date.now().toString(),
                tool: "code_editor",
                arguments: parameters,
              };
              setState((prev) => ({ ...prev, currentTool: toolCall }));
              console.log("✅ [startSession] Code editor tool call completed");
              return "Code editor opened successfully";
            },
            system_design_evaluator: (parameters: { task?: string }) => {
              console.log(
                "🎯 [startSession] system_design_evaluator tool called with parameters:",
                parameters
              );
              const toolCall: ToolCall = {
                id: Date.now().toString(),
                tool: "system_design_evaluator",
                arguments: parameters,
              };
              setState((prev) => ({ ...prev, currentTool: toolCall }));
              console.log(
                "✅ [startSession] System design evaluator tool call completed"
              );
              return "System design whiteboard opened successfully";
            },
            complete_interview: (parameters: {
              reason?: string;
              summary?: string;
            }) => {
              console.log(
                "🎯 [startSession] complete_interview tool called by agent:",
                parameters
              );

              const currentTime = new Date();
              const startTime = new Date(
                currentTime.getTime() - performance.now()
              ); // Approximate
              const durationMinutes =
                (currentTime.getTime() - startTime.getTime()) / (1000 * 60);

              // Prevent early completion
              if (durationMinutes < 18) {
                console.log("⏰ Interview too short, extending duration");
                conversation.sendContextualUpdate(
                  `System: Interview duration is only ${Math.round(durationMinutes)} minutes. Please continue with more in-depth questions and assessment. Target duration is 20-25 minutes.`
                );
                return "Let me continue with a few more questions to ensure a comprehensive assessment of your skills.";
              }
              // Add a message to indicate interview completion and feedback mode start
              const completionMessage: ConversationMessage = {
                id: Date.now().toString(),
                role: "system",
                content: {
                  text: `Interview assessment completed. Entering feedback collection mode.`,
                  agent_summary: parameters.summary,
                  reason: parameters.reason,
                },
                type: "system",
                timestamp: new Date(),
              };

              setState((prev) => {
                console.log("🔄 [startSession] Setting feedback mode to TRUE");
                return {
                  ...prev,
                  messages: [...prev.messages, completionMessage],
                  interviewCompleted: true,
                  isCollectingFeedback: true, // Start feedback collection mode
                  isRecording: true, // Keep recording for feedback conversation
                };
              });

              // Persist the completion message
              persistMessage(completionMessage);

              console.log(
                "✅ [startSession] Interview completion initiated by agent - entering feedback mode"
              );
              console.log(
                "🎤 [startSession] All subsequent messages will be stored as feedback type"
              );
              return "Thank you for completing the interview assessment! Now I'd love to hear your feedback about your interview experience. How did you find the interview process? Please share your thoughts and any suggestions for improvement.";
            },
          },
        });
        console.log("conversationId", conversationId);
        setConversationId(conversationId);
        conversationIdRef.current = conversationId; // Also update ref immediately
        console.log("✅ Session started successfully with signed URL");
      } else if (process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID) {
        console.log("🚀 Starting session with agent ID...");
        // Start session with agent ID - CAPTURE THE CONVERSATION ID
        const conversationId = await conversation.startSession({
          agentId: process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID,
        });
        setConversationId(conversationId);
        conversationIdRef.current = conversationId; // Also update ref immediately
        console.log(
          "✅ Session started successfully with conversation ID:",
          conversationId
        );
      } else {
        throw new Error("No agent URL or agent ID available");
      }
    } catch (error) {
      console.error("❌ Failed to initialize ElevenLabs conversation:", error);
      setState((prev) => ({ ...prev, status: "error" }));
    }
  }, [token, roundId, conversation, fetchAgentUrl]);

  const disconnect = useCallback(async () => {
    try {
      await conversation.endSession();
    } catch (error) {
      console.error("Error ending ElevenLabs session:", error);
    }
    setState((prev) => ({
      ...prev,
      isConnected: false,
      status: "disconnected",
      isRecording: false,
    }));
  }, [conversation]);

  const startRecording = useCallback(() => {
    // Unmute the microphone
    setMicMuted(false);
    setState((prev) => ({ ...prev, isRecording: true }));
  }, []);

  const stopRecording = useCallback(() => {
    // Mute the microphone
    setMicMuted(true);
    setState((prev) => ({ ...prev, isRecording: false }));
  }, []);

  // Add new methods to properly control microphone access
  const pauseSession = useCallback(async () => {
    if (conversation.status === "connected") {
      // ElevenLabs doesn't have a pause method, so we end the session
      await conversation.endSession();
      setState((prev) => ({ ...prev, isRecording: false }));
    }
  }, [conversation]);

  const resumeSession = useCallback(async () => {
    if (conversation.status === "disconnected") {
      // Reconnect the session
      await connect();
      setState((prev) => ({ ...prev, isRecording: true }));
    }
  }, [conversation, connect]);

  // Special feedback submission method for structured feedback (with rating, etc.)
  const submitStructuredFeedback = useCallback(
    async (feedbackData: any) => {
      if (!state.isCollectingFeedback) {
        console.warn("Not in feedback collection mode");
        return;
      }

      // Create structured feedback message
      const feedbackMessage: ConversationMessage = {
        id: Date.now().toString(),
        role: "candidate",
        content: {
          ...feedbackData,
          feedback_type: "structured_interview_feedback",
        },
        type: "feedback",
        timestamp: new Date(),
      };

      // Update local state
      setState((prev) => ({
        ...prev,
        messages: [...prev.messages, feedbackMessage],
      }));

      // Persist feedback message with correct type
      await persistMessage(feedbackMessage);

      // Send contextual update to agent about structured feedback received
      conversation.sendContextualUpdate(
        `User provided structured feedback: Rating ${feedbackData.rating}/5, Comments: "${feedbackData.text}"`
      );

      console.log(
        "✅ Structured feedback submitted and persisted with type: feedback"
      );
    },
    [state.isCollectingFeedback, conversation, persistMessage]
  );

  // Modify sendText to handle feedback during feedback collection
  const sendText = useCallback(
    (text: string) => {
      // Check current feedback mode
      const isInFeedbackMode = isCollectingFeedbackRef.current;
      console.log("📝 Sending text message - Feedback mode:", isInFeedbackMode);

      // Send message through ElevenLabs with error handling
      try {
        conversation.sendUserMessage(text);
        console.log("✅ Message sent to ElevenLabs conversation");
      } catch (error) {
        console.error("❌ Failed to send message to ElevenLabs:", error);
        // Continue processing even if ElevenLabs fails
      }

      // Add to our message history with appropriate type
      const message: ConversationMessage = {
        id: Date.now().toString(),
        role: "candidate",
        content: { text },
        type: isInFeedbackMode ? "feedback" : "text", // Use feedback type when in feedback mode
        timestamp: new Date(),
      };

      setState((prev) => ({
        ...prev,
        messages: [...prev.messages, message],
      }));

      // Persist the message
      persistMessage(message);
    },
    [conversation, persistMessage]
  );

  // Enhanced tool result submission with persistence
  const submitToolResult = useCallback(
    async (toolName: string, result: any) => {
      // Clear current tool
      setState((prev) => ({ ...prev, currentTool: undefined }));

      // Send contextual update about tool completion
      conversation.sendContextualUpdate(
        `Tool "${toolName}" completed with result: ${JSON.stringify(result)}`
      );

      // Add tool result to message history
      const message: ConversationMessage = {
        id: Date.now().toString(),
        role: "system",
        content: {
          tool_result: toolName,
          result: result,
          passed: result.success || false,
        },
        type: "tool_result",
        timestamp: new Date(),
      };

      setState((prev) => ({
        ...prev,
        messages: [...prev.messages, message],
      }));

      // Persist tool result to database
      try {
        await saveToolResultToDatabase(token, {
          tool_name: toolName as any, // Use lowercase tool name to match TOOL_TYPE enum
          input_data: { tool_name: toolName },
          output_data: result,
          passed: result.success || false,
          metadata: { timestamp: new Date().toISOString() },
        });

        console.log("✅ Tool result persisted to database");
      } catch (error) {
        console.error("❌ Failed to persist tool result:", error);
      }

      // Also persist as a message
      await persistMessage(message);
    },
    [conversation, roundId, token, persistMessage]
  );

  const changeLanguage = useCallback(
    (language: "en" | "hi") => {
      setState((prev) => ({ ...prev, language }));

      // Send contextual update about language change
      const languageName = language === "en" ? "English" : "Hindi";
      conversation.sendContextualUpdate(
        `User changed language preference to ${languageName}. Please respond in ${languageName}.`
      );
    },
    [conversation]
  );

  // Manual feedback mode activation
  const activateFeedbackMode = useCallback(() => {
    console.log("🎯 Manually activating feedback mode");
    setState((prev) => ({
      ...prev,
      interviewCompleted: true,
      isCollectingFeedback: true,
      isRecording: true,
    }));

    conversation.sendContextualUpdate(
      "System: Feedback collection mode has been manually activated. Please ask for interview feedback."
    );
  }, [conversation]);

  const endInterview = useCallback(async () => {
    try {
      // Send end interview request to backend
      const response = await endInterviewRound(roundId, token);

      console.log("🔚 End interview response:", response?.data);

      if (response.ok) {
        await disconnect();
      }
    } catch (error) {
      console.error("Error ending interview:", error);
    }
  }, [roundId, token, disconnect]);

  // Add method to finish feedback collection and end interview
  const finishFeedbackAndEndInterview = useCallback(async () => {
    try {
      // Add final system message
      const finalMessage: ConversationMessage = {
        id: Date.now().toString(),
        role: "system",
        content: {
          text: "Feedback collection completed. Ending interview session.",
        },
        type: "system",
        timestamp: new Date(),
      };

      setState((prev) => ({
        ...prev,
        messages: [...prev.messages, finalMessage],
        isCollectingFeedback: false,
      }));

      await persistMessage(finalMessage);

      // End the interview
      console.log("🔚 Finishing feedback collection and ending interview...");
      await endInterview();
    } catch (error) {
      console.error("Error finishing feedback and ending interview:", error);
    }
  }, [endInterview, persistMessage]);

  // Update recording state based on ElevenLabs conversation status
  useEffect(() => {
    if (conversation.status === "connected" && !state.isRecording) {
      setState((prev) => ({ ...prev, isRecording: true }));
    } else if (conversation.status !== "connected" && state.isRecording) {
      setState((prev) => ({ ...prev, isRecording: false }));
    }
  }, [conversation.status, state.isRecording]);

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Sync queued messages when back online
      syncQueuedMessages();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Sync queued messages when back online
  const syncQueuedMessages = useCallback(async () => {
    if (messageQueue.length === 0) return;

    console.log(`🔄 Syncing ${messageQueue.length} queued messages...`);

    for (const message of messageQueue) {
      try {
        await persistMessage(message);
      } catch (error) {
        console.error("Failed to sync message:", error);
        return; // Stop syncing if one fails
      }
    }

    // Clear queue after successful sync
    setMessageQueue([]);
    console.log("✅ All queued messages synced");
  }, [messageQueue, persistMessage]);

  return {
    ...state,
    // ElevenLabs specific states
    isSpeaking: conversation.isSpeaking,
    connect,
    disconnect,
    startRecording,
    stopRecording,
    pauseSession,
    resumeSession,
    sendText,
    submitToolResult,
    changeLanguage,
    endInterview,
    // New feedback methods
    submitStructuredFeedback,
    finishFeedbackAndEndInterview,
    activateFeedbackMode,
  };
}
