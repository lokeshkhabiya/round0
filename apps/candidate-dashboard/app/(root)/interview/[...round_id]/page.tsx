"use client"; // Only needed in Next.js App Router

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import JoinInterviewPreview from "@/components/join-interview-preview";
import JoinInterview from "@/components/join-interview";
import { ConversationProvider } from "../../../../context/conversation-context";
import { toast } from "sonner";
import { uploadAudioRecording, uploadRecording } from "@/api/operations/interview-api";
import { useInterviewTokenPayloadStore } from "@/stores/interview-token-payload-store";

const InterviewRoom = () => {
	const params = useParams();
	const roundId = params.round_id?.[0] as string;
	const videoRef = useRef<HTMLVideoElement>(null);
	const router = useRouter();
	const mediaRecorderRef = useRef<MediaRecorder | null>(null);
	const [stream, setStream] = useState<MediaStream | null>(null);
	const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
	const [hasPermission, setHasPermission] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);
	const [isCameraOn, setIsCameraOn] = useState<boolean>(true);
	const [isMicOn, setIsMicOn] = useState<boolean>(true);
	const [hasJoined, setHasJoined] = useState<boolean>(false);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [isUploading, setIsUploading] = useState<boolean>(false);
	const { token } = useInterviewTokenPayloadStore();
	
	const [recordingStartTime, setRecordingStartTime] = useState<number | null>(null);
	const [isActuallyRecording, setIsActuallyRecording] = useState(false);

	const screenStreamRef = useRef<MediaStream | null>(null);

	// Helper function to force stop all screen sharing tracks
	const forceStopScreenSharing = useCallback(() => {
		console.log("Force stopping all screen sharing tracks...");
		
		// Use ref instead of state
		const currentScreenStream = screenStreamRef.current;
		currentScreenStream?.getTracks().forEach((track) => {
			if (track.readyState === 'live') {
				track.stop();
			}
		});
		
		setScreenStream(null);
	}, []); // Remove screenStream dependency

	useEffect(() => {
		const getMedia = async () => {
			try {
				const mediaStream = await navigator.mediaDevices.getUserMedia({
					video: true,
					audio: true,
				});

				setStream(mediaStream);
				if (videoRef.current) {
					videoRef.current.srcObject = mediaStream;
					// Explicitly play the video to ensure it starts
					try {
						await videoRef.current.play();
					} catch (playError) {
						console.log("Video autoplay failed:", playError);
					}
				}

				setHasPermission(true);
			} catch (err) {
				if (err instanceof Error) {
					setError(err.message);
				}
				setHasPermission(false);
			}
		};

		getMedia();

		// Cleanup function to stop the stream when component unmounts
		return () => {
			console.log("Component unmounting, performing cleanup...");
			
			if (stream) {
				stream.getTracks().forEach((track) => {
					track.stop();
					console.log("Cleanup - Camera/microphone track stopped:", track.kind);
				});
			}
			
			// Force stop screen sharing tracks
			forceStopScreenSharing();
			
			// Stop media recorder if it's recording
			if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
				mediaRecorderRef.current.stop();
			}
		};
	}, []); // Keep empty dependency array but handle stream cleanup properly

	// Separate effect to handle video stream updates
	useEffect(() => {
		if (stream && videoRef.current) {
			videoRef.current.srcObject = stream;
			// Explicitly play the video when stream changes
			videoRef.current.play().catch((err) => {
				console.log("Video play failed:", err);
			});
		}
	}, [stream]);

	// Effect to handle video stream when joining the meeting
	useEffect(() => {
		if (hasJoined && stream && videoRef.current) {
			videoRef.current.srcObject = stream;
			// Explicitly play the video when joining
			videoRef.current.play().catch((err) => {
				console.log("Video play failed after joining:", err);
			});
		}
	}, [hasJoined, stream]);

	useEffect(() => {
		screenStreamRef.current = screenStream;
	}, [screenStream]);

	const toggleCamera = async () => {
		if (!stream) return;

		if (isCameraOn) {
			// Turn off camera - stop video tracks
			const videoTracks = stream.getVideoTracks();
			videoTracks.forEach((track) => track.stop());
			setIsCameraOn(false);
		} else {
			// Turn on camera - get new video stream
			try {
				const newVideoStream = await navigator.mediaDevices.getUserMedia({
					video: true,
					audio: false,
				});

				const videoTrack = newVideoStream.getVideoTracks()[0];
				const audioTracks = stream.getAudioTracks();

				// Create new stream with existing audio and new video
				const newStream = new MediaStream([videoTrack, ...audioTracks]);

				setStream(newStream);
				setIsCameraOn(true);
			} catch (err) {
				if (err instanceof Error) {
					setError(`Failed to turn on camera: ${err.message}`);
				}
			}
		}
	};

	const toggleMicrophone = async () => {
		if (!stream) return;

		if (isMicOn) {
			// Turn off microphone - disable audio tracks
			stream.getAudioTracks().forEach((track) => (track.enabled = false));
			setIsMicOn(false);
		} else {
			// Turn on microphone - enable audio tracks
			stream.getAudioTracks().forEach((track) => (track.enabled = true));
			setIsMicOn(true);
		}
	};

	const joinInterview = async () => {
		setIsLoading(true);
		
		// Show instruction toast before screen sharing
		toast.info("Please select 'Entire screen' when the screen sharing dialog appears. Do NOT select tabs or windows.");
		
		try {
			const displayStream = await navigator.mediaDevices.getDisplayMedia({
				video: {
					displaySurface: "monitor", // Pre-select the "Entire Screen" pane
				},
				audio: true, // Request to capture system audio
				selfBrowserSurface: "exclude", // Exclude current tab to avoid hall of mirrors
				surfaceSwitching: "exclude", // Disable tab switching during session
				systemAudio: "include", // Include system audio when sharing screen
			} as any); // TypeScript doesn't have the latest screen sharing API types

			// Get tracks
			const videoTrack = displayStream.getVideoTracks()[0];
			const micAudioTrack = stream?.getAudioTracks()[0];

			// Check if user shared the entire screen (not a tab or window)
			const settings = videoTrack.getSettings();
			const displaySurface = (settings as any).displaySurface;
			
			if (displaySurface && displaySurface !== "monitor") {
				// User shared a tab or window instead of entire screen
				displayStream.getTracks().forEach(track => track.stop());
				toast.error("Please share your entire screen, not a tab or window. Try again.");
				setError("You must share your entire screen to join the interview.");
				setIsLoading(false);
				return;
			}
			
			// Add event listener to detect when screen sharing is stopped by user
			let endedTimeout: NodeJS.Timeout;
			videoTrack.addEventListener('ended', () => {
				clearTimeout(endedTimeout);
				endedTimeout = setTimeout(() => {
					console.log("Screen sharing stopped by user - after debounce");
					// Only stop if still ended after delay
					if (videoTrack.readyState === 'ended') {
						// Stop all tracks immediately
						displayStream.getTracks().forEach(track => {
							track.stop();
							console.log("Screen track stopped due to user action:", track.kind);
						});
						
						// Stop recording if it's active
						if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
							mediaRecorderRef.current.stop(); // THIS TRIGGERS SUCCESS PAGE NAVIGATION
						}
					}
				}, 2000); // 2 second debounce
			});
			
			// Create a new stream for recording
			const combinedStream = new MediaStream();
			combinedStream.addTrack(videoTrack);
			if (micAudioTrack) {
				combinedStream.addTrack(micAudioTrack);
			}

			// Add system audio if user shared it
			const displayAudioTrack = displayStream.getAudioTracks()[0];
			if (displayAudioTrack && displayAudioTrack !== micAudioTrack) {
				combinedStream.addTrack(displayAudioTrack);
			}
			
			setScreenStream(displayStream);

			const recordedChunks: Blob[] = [];
			const mediaRecorder = new MediaRecorder(combinedStream, {
				mimeType: "video/webm",
			});
			mediaRecorderRef.current = mediaRecorder;

			mediaRecorder.ondataavailable = (event) => {
				if (event.data.size > 0) {
					recordedChunks.push(event.data);
				}
			};

			mediaRecorder.onstop = async () => {
				console.log("MediaRecorder stopped, beginning cleanup...");
				setIsUploading(true);
				// toast.info("Uploading recording...");
				
				const recordingDuration = Date.now() - recordingStartTime!;
				const minimumDuration = 30000; // 30 seconds minimum
				
				if (recordingDuration < minimumDuration) {
					console.log("Recording too short, not ending interview");
					toast.error("Recording was too short. Please try rejoining the interview.");
					// Reset state instead of navigating to success
					setHasJoined(false);
					setIsUploading(false);
					return;
				}

				// Immediately stop screen sharing tracks when recording stops
				displayStream.getTracks().forEach((track) => {
					track.stop();
					console.log("Screen sharing track stopped on recording stop:", track.kind);
				});
				
				const blob = new Blob(recordedChunks, { type: "video/webm" });
				
				try {
					const response = await uploadRecording(roundId, token!, blob);
					if (response?.success) {
						// Show success message
						// toast.success("Recording uploaded successfully!");
						
						// Navigate to success page
						router.push(`/interview/success`);
					} else {
						toast.error("Failed to upload recording.");
					}
				} catch (uploadError) {
					console.log("Error uploading recording:", uploadError);
					// toast.error("Error uploading recording. Please try again.");
				} finally {
					setIsUploading(false);
					
					// Stop all remaining tracks as a safety measure
					stream?.getTracks().forEach((track) => {
						track.stop();
						console.log("Camera/microphone track stopped:", track.kind);
					});
					
					// Additional cleanup for any remaining screen tracks
					displayStream.getTracks().forEach((track) => {
						if (track.readyState === 'live') {
							track.stop();
							console.log("Final cleanup - screen track stopped:", track.kind);
						}
					});
					
					// Clear all stream references
					setStream(null);
					setScreenStream(null);
					
					// Reset state
					setHasJoined(false);
				}
			};

			mediaRecorder.start();
			setRecordingStartTime(Date.now());
			setIsActuallyRecording(true);
			setHasJoined(true);
		} catch (err) {
			if (err instanceof Error) {
				console.log("Failed to get screen share permission:", err);
				setError("Screen sharing is required to join the interview. Please refresh and try again.");
				toast.error("Screen sharing permission was denied.");
			}
		} finally {
			setIsLoading(false);
		}
	};

	const leaveInterview = () => {
		console.log("Leaving interview, stopping all tracks immediately...");
		
		// Stop media recorder if it's recording
		if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
			mediaRecorderRef.current.stop();
		}
		
		// Immediately stop all tracks when leaving interview
		stream?.getTracks().forEach((track) => {
			track.stop();
			console.log("Camera/microphone track stopped:", track.kind);
		});
		
		screenStream?.getTracks().forEach((track) => {
			track.stop();
			console.log("Screen sharing track stopped:", track.kind);
		});
		
		// Clear all stream references
		setStream(null);
		setScreenStream(null);
		
		// Reset state
		setHasJoined(false);
	};

	if (!hasJoined) {
		return (
			<JoinInterviewPreview 
				error={error!}
				hasPermission={hasPermission}
				isCameraOn={isCameraOn}
				isMicOn={isMicOn}
				isLoading={isLoading}	
				videoRef={videoRef as React.RefObject<HTMLVideoElement>}
				toggleCamera={toggleCamera}
				toggleMicrophone={toggleMicrophone}
				joinInterview={joinInterview}
			/>
		);
	}

	// Interview joined state
	return (
		<ConversationProvider roundId={roundId}>
			<JoinInterview
				roundId={roundId}
				isCameraOn={isCameraOn}
				isMicOn={isMicOn}
				videoRef={videoRef as React.RefObject<HTMLVideoElement>}
				toggleCamera={toggleCamera}
				toggleMicrophone={toggleMicrophone}
				leaveInterview={leaveInterview}
				isUploading={isUploading}
			/>
		</ConversationProvider>
	);
};

export default InterviewRoom;
