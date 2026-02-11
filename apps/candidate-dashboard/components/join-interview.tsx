import React, { useState, useEffect, useRef } from "react";
import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "./ui/resizable";
import { Button } from "./ui/button";
import {
	Camera,
	Mic,
	MicOff,
	Video,
	VideoOff,
	PhoneOff,
	Globe,
	Server,
	Bot,
	CodeXml,
	MessageSquare,
	Loader2,
	Star,
} from "lucide-react";
import { LiveTranscript } from "./live-transcript";
import { useConversationContext } from "../context/conversation-context";
import dynamic from "next/dynamic";
import { ExcalidrawRef } from "./excalidraw-wrapper";
import { evaluateCanvas } from "@/api/operations/interview-api";
import { toast } from "sonner";
import CodeIDE from "./code-ide";
import { useInterviewTokenPayloadStore } from "@/stores/interview-token-payload-store";

const ExcalidrawWrapper = dynamic(() => import("./excalidraw-wrapper"), {
	ssr: false,
	loading: () => (
		<div className="h-full w-full flex items-center justify-center bg-muted">
			<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
		</div>
	),
});

interface JoinInterviewProps {
	isCameraOn: boolean;
	isMicOn: boolean;
	videoRef: React.RefObject<HTMLVideoElement>;
	toggleCamera: () => void;
	toggleMicrophone: () => void;
	leaveInterview: () => void;
	roundId: string;
	isUploading?: boolean;
}

const JoinInterview = ({
	isCameraOn,
	isMicOn,
	videoRef,
	toggleCamera,
	toggleMicrophone,
	leaveInterview,
	roundId,
	isUploading,
}: JoinInterviewProps) => {
	const {
		messages,
		isConnected,
		isRecording,
		currentTool,
		language,
		status,
		isCollectingFeedback,
		interviewCompleted,
		connect,
		startRecording,
		stopRecording,
		changeLanguage,
		endInterview,
		submitStructuredFeedback,
		finishFeedbackAndEndInterview,
	} = useConversationContext();

	const { interview_token_payload } = useInterviewTokenPayloadStore();
	const availableTools: string[] = interview_token_payload?.interview_tools || ["code_editor", "whiteboard"];
	const hasCodeEditor = availableTools.includes("code_editor");
	const hasWhiteboard = availableTools.includes("whiteboard");

	const [showTranscript, setShowTranscript] = useState(true);
	const [microphoneMode, setMicrophoneMode] = useState<"push-to-talk" | "continuous">("continuous");
	const [showExcalidraw, setShowExcalidraw] = useState(false);
	const excalidrawRef = useRef<ExcalidrawRef>(null);
	const [canvasData, setCanvasData] = useState<any>(null);
	const [showCodeEditor, setShowCodeEditor] = useState(false);
	const [feedbackText, setFeedbackText] = useState("");
	const [rating, setRating] = useState(0);

	useEffect(() => {
		if (status === "disconnected") {
			connect();
		}
	}, [connect, status]);

	useEffect(() => {
		if (currentTool) {
			switch (currentTool.tool) {
				case "code_editor":
					if (hasCodeEditor) {
						setShowCodeEditor(true);
						setShowExcalidraw(false);
					}
					break;
				case "whiteboard":
				case "system_design_evaluator":
					if (hasWhiteboard) {
						setShowExcalidraw(true);
						setShowCodeEditor(false);
					}
					break;
			}
		}
	}, [currentTool, hasCodeEditor, hasWhiteboard]);

	useEffect(() => {
		const lastMessage = messages[messages.length - 1];
		if (lastMessage?.type === 'tool_result' && lastMessage.content?.tool_result === 'complete_interview') {
			toast.success("Interview completed by AI agent");
		}
	}, [messages]);

	useEffect(() => {
		const lastMessage = messages[messages.length - 1];
		if (lastMessage?.role === 'system' &&
			lastMessage.content?.text?.includes('Interview completed by AI agent')) {
			toast.success("Interview completed by AI interviewer");
		}
	}, [messages]);

	const handleMicrophoneToggle = () => {
		if (microphoneMode === "continuous") {
			if (isMicOn) {
				stopRecording();
			} else {
				startRecording();
			}
		}
		toggleMicrophone();
	};

	const handleLeaveInterview = async () => {
		await endInterview();
		leaveInterview();
	};

	const handleExcalidrawToggle = () => {
		setShowExcalidraw(!showExcalidraw);
		if (!showExcalidraw) setShowCodeEditor(false);
	};

	const token = localStorage.getItem("interview_token");

	const handleSubmitForEvaluation = async () => {
		try {
			if (!excalidrawRef.current) return;
			const imageBlob = await excalidrawRef.current.exportAsImage();
			if (imageBlob) {
				const reader = new FileReader();
				reader.onloadend = async () => {
					const base64Image = reader.result as string;
					const response = await evaluateCanvas(
						roundId,
						"Design a System Design for user authentication",
						base64Image,
						token as string,
						canvasData
					);
					toast.success(response?.message);
				};
				reader.readAsDataURL(imageBlob);
			}
		} catch (error) {
			console.error("Error submitting for evaluation:", error);
		}
	};

	const handleCodeEditorToggle = () => {
		setShowCodeEditor(!showCodeEditor);
		if (!showCodeEditor) setShowExcalidraw(false);
	};

	const handleSubmitFeedback = async () => {
		if (!feedbackText.trim()) {
			toast.error("Please provide some feedback before submitting");
			return;
		}
		try {
			await submitStructuredFeedback({
				text: feedbackText,
				rating: rating,
				feedback_type: 'interview_experience'
			});
			toast.success("Thank you for your feedback!");
			setFeedbackText("");
			setRating(0);
			setTimeout(() => {
				finishFeedbackAndEndInterview();
			}, 2000);
		} catch (error) {
			console.error("Error submitting feedback:", error);
			toast.error("Failed to submit feedback. Please try again.");
		}
	};

	const handleSkipFeedback = () => {
		toast.info("Skipping feedback collection");
		finishFeedbackAndEndInterview();
	};

	const ControlButton = ({
		active,
		destructive,
		onClick,
		disabled,
		children,
		className = "",
	}: {
		active?: boolean;
		destructive?: boolean;
		onClick: () => void;
		disabled?: boolean;
		children: React.ReactNode;
		className?: string;
	}) => (
		<button
			onClick={onClick}
			disabled={disabled}
			className={`
				h-12 w-12 rounded-full flex items-center justify-center transition-all duration-150
				${destructive
					? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
					: active
						? "bg-foreground text-background hover:opacity-90"
						: "bg-muted/80 text-foreground hover:bg-muted"
				}
				disabled:opacity-40 disabled:cursor-not-allowed
				${className}
			`}
		>
			{children}
		</button>
	);

	return (
		<div className="h-screen dark interview-surface text-white">
			<ResizablePanelGroup direction="horizontal" className="h-full">
				{/* Main panel */}
				<ResizablePanel defaultSize={showTranscript ? 75 : 100} minSize={50}>
					<div className="h-full flex flex-col relative">
						{/* Main content area */}
						<div className="flex-1 min-h-0 relative">
							{showCodeEditor && hasCodeEditor ? (
								<div className="w-full h-full">
									<CodeIDE tool={currentTool} />
								</div>
							) : showExcalidraw && hasWhiteboard ? (
								<div className="w-full h-full relative">
									<ExcalidrawWrapper
										ref={excalidrawRef}
										onClose={() => setShowExcalidraw(false)}
										setCanvasData={setCanvasData}
										tool={currentTool}
									/>
									{/* Submit evaluation button */}
									<div className="absolute bottom-20 right-6 z-20">
										<Button
											onClick={handleSubmitForEvaluation}
											className="flex items-center gap-2 shadow-lg"
											size="lg"
										>
											<Bot className="h-4 w-4" />
											Submit for Evaluation
										</Button>
									</div>
								</div>
							) : (
								/* AI Interviewer */
								<div className="w-full h-full flex items-center justify-center">
									<div className="text-center">
										{/* Animated pulse ring */}
										<div className="relative mx-auto mb-6">
											<div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
												<div className={`w-16 h-16 rounded-full bg-primary/30 flex items-center justify-center ${isConnected ? 'animate-pulse' : ''}`}>
													<Bot className="h-8 w-8 text-primary" />
												</div>
											</div>
											{isConnected && (
												<div className="absolute inset-0 w-24 h-24 mx-auto rounded-full border-2 border-primary/20 animate-ping" />
											)}
										</div>
										<h3 className="text-lg font-medium text-white/90">
											Round0 AI
										</h3>
										<div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 text-xs text-white/60">
											<div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
											{isConnected ? "Connected" : "Connecting..."}
										</div>
									</div>
								</div>
							)}

							{/* Candidate video overlay */}
							<div className="absolute bottom-4 right-4 w-48 h-36 rounded-2xl overflow-hidden interview-panel shadow-2xl z-10">
								{isCameraOn ? (
									<video
										ref={videoRef}
										autoPlay
										playsInline
										muted
										className="w-full h-full object-cover"
									/>
								) : (
									<div className="w-full h-full flex items-center justify-center">
										<Camera className="w-6 h-6 text-white/30" />
									</div>
								)}
								<div className="absolute bottom-0 left-0 right-0 px-2.5 py-1.5 bg-black/65">
									<div className="flex items-center justify-between">
										<span className="text-[11px] text-white/80 font-medium">You</span>
										{isMicOn ? (
											<Mic className={`w-3 h-3 ${isRecording ? "text-red-400 animate-pulse" : "text-emerald-400"}`} />
										) : (
											<MicOff className="w-3 h-3 text-red-400" />
										)}
									</div>
								</div>
							</div>
						</div>

						{/* Controls bar */}
						<div className="absolute bottom-0 left-0 right-0 z-20">
							<div className="flex justify-center pb-6 pt-16 bg-slate-950/90">
								<div className="flex items-center gap-3 px-6 py-3 rounded-2xl interview-panel">
									<ControlButton
										active={isCameraOn}
										onClick={toggleCamera}
										disabled={isUploading}
									>
										{isCameraOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
									</ControlButton>

									<ControlButton
										active={isMicOn}
										onClick={handleMicrophoneToggle}
										disabled={isUploading}
									>
										{isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
									</ControlButton>

									<ControlButton
										onClick={() => changeLanguage(language === "en" ? "hi" : "en")}
										disabled={isUploading}
									>
										<Globe className="w-5 h-5" />
									</ControlButton>

									{hasWhiteboard && (
										<ControlButton
											active={showExcalidraw}
											onClick={handleExcalidrawToggle}
											disabled={isUploading}
										>
											<Server className="w-5 h-5" />
										</ControlButton>
									)}

									{hasCodeEditor && (
										<ControlButton
											active={showCodeEditor}
											onClick={handleCodeEditorToggle}
											disabled={isUploading}
										>
											<CodeXml className="w-5 h-5" />
										</ControlButton>
									)}

									<ControlButton
										active={showTranscript}
										onClick={() => setShowTranscript(!showTranscript)}
										disabled={isUploading}
									>
										<MessageSquare className="w-5 h-5" />
									</ControlButton>

									<div className="w-px h-8 bg-white/10 mx-1" />

									<ControlButton
										destructive
										onClick={handleLeaveInterview}
										disabled={isUploading}
										className="h-12 w-14"
									>
										{isUploading ? (
											<Loader2 className="w-5 h-5 animate-spin" />
										) : (
											<PhoneOff className="w-5 h-5" />
										)}
									</ControlButton>
								</div>
							</div>
						</div>

						{/* Feedback overlay */}
						{isCollectingFeedback && (
							<div className="absolute inset-0 z-30 flex items-center justify-center bg-black/70 backdrop-blur-sm">
								<div className="interview-panel rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl">
									<h3 className="text-lg font-semibold mb-2">How was your interview?</h3>
									<p className="text-sm text-white/70 mb-6">
										Your feedback helps us improve the experience.
									</p>

									{/* Star rating */}
									<div className="flex gap-1 mb-4">
										{[1, 2, 3, 4, 5].map((star) => (
											<button
												key={star}
												onClick={() => setRating(star)}
												className="p-1 transition-colors"
											>
												<Star
													className={`h-6 w-6 ${star <= rating ? "fill-primary text-primary" : "text-muted-foreground/30"}`}
												/>
											</button>
										))}
									</div>

									<textarea
										value={feedbackText}
										onChange={(e) => setFeedbackText(e.target.value)}
										placeholder="Share your thoughts about the interview experience..."
										className="w-full p-3 rounded-2xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/40 resize-none focus:outline-none focus:ring-2 focus:ring-white/15 min-h-[100px]"
									/>

									<div className="flex gap-3 mt-4">
										<Button onClick={handleSubmitFeedback} className="flex-1">
											Submit Feedback
										</Button>
										<Button variant="outline" onClick={handleSkipFeedback}>
											Skip
										</Button>
									</div>
								</div>
							</div>
						)}
					</div>
				</ResizablePanel>

				{/* Transcript panel */}
				{showTranscript && (
					<>
						<ResizableHandle withHandle />
						<ResizablePanel defaultSize={25} minSize={15} maxSize={40}>
							<div className="h-full">
								<LiveTranscript />
							</div>
						</ResizablePanel>
					</>
				)}
			</ResizablePanelGroup>
		</div>
	);
};

export default JoinInterview;
