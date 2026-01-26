import React, { useState, useEffect, useRef } from "react";
import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "./ui/resizable";
import { Card, CardContent } from "./ui/card";
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
} from "lucide-react";
import { LiveTranscript } from "./live-transcript";
import { useConversationContext } from "../context/conversation-context";
import dynamic from "next/dynamic";
import { ExcalidrawRef } from "./excalidraw-wrapper";
import { evaluateCanvas } from "@/api/operations/interview-api";
import { toast } from "sonner";
import CodeIDE from "./code-ide";

// Dynamic import for Excalidraw to handle SSR
const ExcalidrawWrapper = dynamic(() => import("./excalidraw-wrapper"), {
	ssr: false,
	loading: () => (
		<div className="h-full w-full flex items-center justify-center bg-gray-50">
			<div className="text-center">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
				<p className="text-gray-600">Loading Excalidraw...</p>
			</div>
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

	const [showTranscript, setShowTranscript] = useState(true);
	const [microphoneMode, setMicrophoneMode] = useState<
		"push-to-talk" | "continuous"
	>("continuous");
	const [showExcalidraw, setShowExcalidraw] = useState(false);
	const excalidrawRef = useRef<ExcalidrawRef>(null);
	const [canvasData, setCanvasData] = useState<any>(null);
	const [showCodeEditor, setShowCodeEditor] = useState(false);
	const [feedbackText, setFeedbackText] = useState("");
	const [rating, setRating] = useState(0);

	useEffect(() => {
		// Auto-connect when component mounts
		if (status === "disconnected") {
			connect();
		}
	}, [connect, status]);

	useEffect(() => {
		console.log("status", status);
	}, [status]);

	// Update the useEffect to handle the new tool names WITH DEBUG LOGGING
	useEffect(() => {
		console.log('🔄 currentTool changed:', currentTool);
		if (currentTool) {
			switch (currentTool.tool) {
				case "code_editor":
					console.log('🔧 Opening code editor...');
					setShowCodeEditor(true);
					setShowExcalidraw(false); // Close excalidraw when opening code editor
					break;
				case "whiteboard":
				case "system_design_evaluator":
					console.log('🎨 Opening system design whiteboard...');
					setShowExcalidraw(true);
					setShowCodeEditor(false); // Close code editor when opening whiteboard
					break;
				default:
					console.log('❓ Unknown tool:', currentTool.tool);
					break;
			}
		}
	}, [currentTool]);

	// Add a new useEffect to handle automatic interview completion
	useEffect(() => {
		// Listen for messages that indicate interview completion
		const lastMessage = messages[messages.length - 1];
		if (lastMessage?.type === 'tool_result' && lastMessage.content?.tool_result === 'complete_interview') {
			// Handle UI changes for interview completion
			toast.success("Interview completed by AI agent");
			// You might want to show a completion overlay or disable controls
		}
	}, [messages]);

	// Add this useEffect to handle agent-initiated completion
	useEffect(() => {
		// Check for system messages indicating interview completion
		const lastMessage = messages[messages.length - 1];
		if (lastMessage?.role === 'system' && 
			lastMessage.content?.text?.includes('Interview completed by AI agent')) {
			// Show completion notification
			toast.success("Interview completed by AI interviewer");
			
			// Optionally disable controls or show completion UI
			// You could set a state here to show different UI
		}
	}, [messages]);

	const handleMicrophoneToggle = () => {
		if (microphoneMode === "continuous") {
			if (isMicOn) {
				// When muting, stop recording which will mute the ElevenLabs microphone
				stopRecording();
			} else {
				// When unmuting, start recording which will unmute the ElevenLabs microphone
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
		// Close code editor when opening excalidraw
		if (!showExcalidraw) {
			setShowCodeEditor(false);
		}
	};

	const token = localStorage.getItem("interview_token");

	const handleSubmitForEvaluation = async () => {
		try {
			if (!excalidrawRef.current) {
				console.error("Excalidraw reference not available");
				return;
			}

			// console.log("Exporting canvas as image...");
			const imageBlob = await excalidrawRef.current.exportAsImage();

			if (imageBlob) {
				// console.log("Canvas exported successfully:", imageBlob);

				const formData = new FormData();
				formData.append("canvasImage", imageBlob, "excalidraw-canvas.png");

				formData.append("timestamp", new Date().toISOString());
				formData.append("interviewId", roundId);
				formData.append(
					"question",
					"Design a System Design for user authentication"
				);

				// console.log(canvasData);

				const reader = new FileReader();

				reader.onloadend = async () => {
					const base64Image = reader.result as string;
					// console.log("Base64 image:", base64Image);
					const response = await evaluateCanvas(
						roundId,
						"Design a System Design for user authentication", //TODO give actual question that is asked
						base64Image,
						token as string,
						canvasData
					);
					toast.success(response?.message);
				};
				reader.readAsDataURL(imageBlob);
			} else {
				console.error("Failed to export canvas as image");
			}
		} catch (error) {
			console.error("Error submitting for evaluation:", error);
		}
	};

	const handleCodeEditorToggle = () => {
		setShowCodeEditor(!showCodeEditor);
		// Close excalidraw when opening code editor
		if (!showCodeEditor) {
			setShowExcalidraw(false);
		}
	};

	const handleSubmitFeedback = async () => {
		if (!feedbackText.trim()) {
			toast.error("Please provide some feedback before submitting");
			return;
		}

		try {
			const feedbackContent = {
				text: feedbackText,
				rating: rating,
				feedback_type: 'interview_experience'
			};

			await submitStructuredFeedback(feedbackContent);
			toast.success("Thank you for your feedback!");
			
			// Clear feedback form
			setFeedbackText("");
			setRating(0);
			
			// Delay finishing to allow the user to see the thank you message
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

	const renderTool = () => {
		if (!currentTool) return null;

		switch (currentTool.tool) {
			case "code_editor":
				return <CodeIDE tool={currentTool} />;
			case "whiteboard":
			case "system_design_evaluator":
				return <ExcalidrawWrapper tool={currentTool} />;
			default:
				return (
					<Card className="h-full">
						<CardContent className="p-6">
							<p>Unknown tool: {currentTool.tool}</p>
						</CardContent>
					</Card>
				);
		}
	};

	const renderMainContent = () => {
		return (
			<Card className="h-full">
				<CardContent className="h-full flex flex-col">
					{/* Video section */}
					<div className="flex-[4] min-h-0">
						<div className="relative bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg overflow-hidden border h-full">
							{/* Main content area - AI Avatar OR Excalidraw OR CodeIDE */}
							{showCodeEditor ? (
								/* CodeIDE replaces the AI avatar area */
								<div className="w-full h-full">
									<CodeIDE tool={currentTool}/>
								</div>
							) : showExcalidraw ? (
								/* Excalidraw replaces only the AI avatar area */
								<div className="w-full h-full">
									<ExcalidrawWrapper
										ref={excalidrawRef}
										onClose={() => setShowExcalidraw(false)}
										setCanvasData={setCanvasData}
										tool={currentTool}
									/>
								</div>
							) : (
								/* AI Interviewer placeholder */
								<div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
									<div className="text-center">
										<div className="w-32 h-32 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
											<div className="text-4xl">🤖</div>
										</div>
										<h3 className="text-lg font-semibold text-primary">
											ZeroCV AI Interviewer
										</h3>
										{/* <p className="text-sm text-muted-foreground mt-2">
											{status === "connected"
												? "Connected"
												: status === "connecting"
													? "Connecting..."
													: status === "error"
														? "Connection Error"
														: "Disconnected"}
										</p> */}
									</div>
								</div>
							)}

							{/* Candidate video overlay - ALWAYS VISIBLE */}
							<div className="absolute bottom-4 left-4 w-64 h-48 rounded-lg overflow-hidden border-2 border-white shadow-lg bg-muted z-10">
								{isCameraOn ? (
									<video
										ref={videoRef}
										autoPlay
										playsInline
										muted
										className="w-full h-full object-cover"
									/>
								) : (
									<div className="w-full h-full bg-muted flex items-center justify-center">
										<div className="text-center">
											<div className="w-16 h-16 bg-muted-foreground/20 rounded-full flex items-center justify-center mx-auto mb-2">
												<Camera className="w-8 h-8 text-muted-foreground" />
											</div>
											<p className="text-sm text-muted-foreground">
												Camera Off
											</p>
										</div>
									</div>
								)}

								{/* Candidate label */}
								<div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white px-3 py-1">
									<div className="flex items-center justify-between">
										<span className="text-sm font-medium">You</span>
										<div className="flex items-center gap-1">
											{isMicOn ? (
												<Mic
													className={`w-3 h-3 ${isRecording ? "text-red-400 animate-pulse" : "text-green-400"}`}
												/>
											) : (
												<MicOff className="w-3 h-3 text-red-400" />
											)}
										</div>
									</div>
								</div>
							</div>

							{/* Recording indicator - ALWAYS VISIBLE */}
							{/* <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium z-10">
								<div className="w-2 h-2 bg-white rounded-full animate-pulse" />
								Live Interview
							</div> */}

							{/* Connection status - ALWAYS VISIBLE */}
							{/* <div className="absolute top-4 left-4 z-10">
								<div
									className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
										isConnected
											? "bg-green-500 text-white"
											: "bg-yellow-500 text-white"
									}`}
								>
									<div
										className={`w-2 h-2 rounded-full ${
											isConnected ? "bg-white" : "bg-white animate-pulse"
										}`}
									/>
									{isConnected ? "AI Connected" : "Connecting..."}
								</div>
							</div> */}

							{/* Enhanced Excalidraw indicator and submit button */}
							{showExcalidraw && (
								<div className="absolute bottom-20 right-6 z-20 flex flex-col items-end gap-3">
									{/* Status indicator
									<div className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
										<Server className="h-4 w-4 inline mr-2" />
										Whiteboard Active
									</div> */}
									
									{/* Submit button */}
									<Button
										onClick={handleSubmitForEvaluation}
										className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110 px-6 py-4 rounded-full border-2 border-white"
										size="lg"
									>
										<Bot className="h-6 w-6" />
										Submit for Evaluation
									</Button>
								</div>
							)}
						</div>
					</div>

					{/* Controls section - ALWAYS VISIBLE AND UNCHANGED */}
					<div className="flex-1 min-h-0 flex flex-col justify-center space-y-4 mt-4 border rounded-xl p-4">
						{/* Interview controls */}
						<div className="flex justify-center gap-3">
							<Button
								variant={isCameraOn ? "secondary" : "destructive"}
								onClick={toggleCamera}
								size="lg"
								className="rounded-full w-14 h-14 p-0"
								disabled={isUploading}
							>
								{isCameraOn ? (
									<Video className="w-6 h-6" />
								) : (
									<VideoOff className="w-6 h-6" />
								)}
							</Button>

							<Button
								variant={isMicOn ? "secondary" : "destructive"}
								onClick={handleMicrophoneToggle}
								size="lg"
								className="rounded-full w-14 h-14 p-0"
								disabled={isUploading}
							>
								{isMicOn ? (
									<Mic className="w-6 h-6" />
								) : (
									<MicOff className="w-6 h-6" />
								)}
							</Button>

							<Button
								variant="outline"
								onClick={() => changeLanguage(language === "en" ? "hi" : "en")}
								size="lg"
								className="rounded-full w-14 h-14 p-0"
								disabled={isUploading}
							>
								<Globe className="w-6 h-6" />
							</Button>

							<Button
								variant={showExcalidraw ? "default" : "outline"}
								onClick={handleExcalidrawToggle}
								size="lg"
								className="rounded-full w-14 h-14 p-0"
								disabled={isUploading}
							>
								<Server className="w-6 h-6" />
							</Button>

							<Button
								variant={showCodeEditor ? "default" : "outline"}
								onClick={handleCodeEditorToggle}
								size="lg"
								className="rounded-full w-14 h-14 p-0"
								disabled={isUploading}
							>
								<CodeXml className="w-6 h-6" />
							</Button>

							<Button
								variant="outline"
								onClick={() => setShowTranscript(!showTranscript)}
								size="lg"
								className="rounded-full w-14 h-14 p-0"
								disabled={isUploading}
							>
								💬
							</Button>

							<Button
								variant="destructive"
								onClick={handleLeaveInterview}
								size="lg"
								className="rounded-full w-14 h-14 p-0"
								disabled={isUploading}
							>
								{isUploading ? (
									<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
								) : (
									<PhoneOff className="w-6 h-6" />
								)}
							</Button>
						</div>

						{/* Status bar */}
						<div className="flex justify-center gap-6 text-sm text-muted-foreground border-t pt-3">
							<div className="flex items-center gap-2">
								<div
									className={`w-2 h-2 rounded-full ${isCameraOn ? "bg-green-500" : "bg-red-500"}`}
								/>
								<span>Camera {isCameraOn ? "On" : "Off"}</span>
							</div>
							<div className="flex items-center gap-2">
								<div
									className={`w-2 h-2 rounded-full ${isMicOn ? "bg-green-500" : "bg-red-500"}`}
								/>
								<span>Microphone {isMicOn ? "On" : "Off"}</span>
							</div>
							{/* <div className="flex items-center gap-2">
								<div
									className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-yellow-500"} ${!isConnected ? "animate-pulse" : ""}`}
								/>
								<span>AI {isConnected ? "Connected" : "Connecting"}</span>
							</div> */}
							<div className="flex items-center gap-2">
								<Globe className="w-3 h-3" />
								<span>{language === "en" ? "English" : "हिंदी"}</span>
							</div>
							{showExcalidraw && (
								<div className="flex items-center gap-2">
									<Server className="w-3 h-3" />
									<span>Whiteboard Active</span>
								</div>
							)}
							{showCodeEditor && (
								<div className="flex items-center gap-2">
									<CodeXml className="w-3 h-3" />
									<span>Code Editor Active</span>
								</div>
							)}
							{isCollectingFeedback && (
								<div className="flex items-center gap-2 text-blue-500">
									<div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
									<span>Feedback Mode</span>
								</div>
							)}
							{isUploading && (
								<div className="flex items-center gap-2 text-yellow-500">
									<div className="animate-spin rounded-full h-3 w-3 border-b-2 border-yellow-500"></div>
									<span>Ending Interview...</span>
								</div>
							)}
						</div>
					</div>
				</CardContent>
			</Card>
		);
	};



	return (
		<div className="h-screen bg-background">
			<ResizablePanelGroup direction="horizontal" className="h-full">
				{/* Main video panel */}
				<ResizablePanel defaultSize={currentTool ? 50 : 80} minSize={40}>
					<div className="h-full p-4">{renderMainContent()}</div>
				</ResizablePanel>

				{/* Tool panel (conditional) */}
				{/* {currentTool && (
					<>
						<ResizableHandle withHandle />
						<ResizablePanel defaultSize={30} minSize={20} maxSize={50}>
							<div className="h-full p-4 pl-3">{renderTool()}</div>
						</ResizablePanel>
					</>
				)} */}

				{/* Transcript panel */}
				{showTranscript && (
					<>
						<ResizableHandle withHandle />
						<ResizablePanel
							defaultSize={currentTool ? 20 : 20}
							minSize={15}
							maxSize={40}
						>
							<div className="h-full p-4 pl-3 pr-3">
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
