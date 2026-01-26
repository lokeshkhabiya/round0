import { Camera, Mic, MicOff, Settings, Video, VideoOff } from 'lucide-react';
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';

interface joinInterviewProps {
  error: string;
  hasPermission: boolean;
  isCameraOn: boolean;
  isMicOn: boolean;
  isLoading: boolean;
  videoRef: React.RefObject<HTMLVideoElement>;
  toggleCamera: () => void;
  toggleMicrophone: () => void;
  joinInterview: () => void;    
}

const JoinInterviewPreview = ({ error, hasPermission, isCameraOn, isMicOn, isLoading, videoRef, toggleCamera, toggleMicrophone, joinInterview }: joinInterviewProps) => {
  return (
    <div className="min-h-screen bg-background">
				{/* Header */}
				<div className="border-b bg-white">
					<div className="container mx-auto px-4 py-6">
						<div className="flex items-center gap-3 mb-4">
							<Video className="h-8 w-8 text-primary" />
							<h1 className="text-3xl font-bold">ZeroCV Interview</h1>
						</div>
						<p className="text-muted-foreground">
							Prepare for your interview by testing your camera and microphone
						</p>
					</div>
				</div>

				<div className="container mx-auto px-4 py-8 max-w-5xl">
					<Card className="w-full">
						<CardHeader>
							<CardTitle className="text-center text-2xl font-bold">
								Ready to join your interview?
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-6">
							{error && (
								<div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
									<div className="flex items-center gap-2 mb-2">
										<Settings className="h-5 w-5 text-destructive" />
										<p className="text-destructive font-medium">
											Camera and Microphone Error
										</p>
									</div>
									<p className="text-sm text-muted-foreground">
										{error}. Please check your browser permissions and try
										again.
									</p>
								</div>
							)}

							{hasPermission && (
								<div className="space-y-6">
									{/* Video Preview */}
									<div className="relative bg-muted rounded-lg overflow-hidden border">
										<video
											ref={videoRef}
											autoPlay
											playsInline
											muted
											className="w-full h-80 object-cover"
										/>
										{!isCameraOn && (
											<div className="absolute inset-0 bg-muted flex items-center justify-center">
												<div className="text-center">
													<div className="w-20 h-20 bg-muted-foreground/20 rounded-full flex items-center justify-center mx-auto mb-4">
														<Camera className="w-10 h-10 text-muted-foreground" />
													</div>
													<p className="text-muted-foreground">
														Camera is turned off
													</p>
												</div>
											</div>
										)}
									</div>

									{/* Controls */}
									<div className="flex justify-center gap-4">
										<Button
											variant={isCameraOn ? "default" : "destructive"}
											onClick={toggleCamera}
											className="flex items-center gap-2 px-6"
										>
											{isCameraOn ? (
												<Video className="w-4 h-4" />
											) : (
												<VideoOff className="w-4 h-4" />
											)}
											{isCameraOn ? "Camera On" : "Camera Off"}
										</Button>

										<Button
											variant={isMicOn ? "default" : "destructive"}
											onClick={toggleMicrophone}
											className="flex items-center gap-2 px-6"
										>
											{isMicOn ? (
												<Mic className="w-4 h-4" />
											) : (
												<MicOff className="w-4 h-4" />
											)}
											{isMicOn ? "Mic On" : "Mic Off"}
										</Button>
									</div>

									{/* Device Status */}
									<div className="flex justify-center gap-8 text-sm">
										<div className="flex items-center gap-2">
											<div
												className={`w-2 h-2 rounded-full ${isCameraOn ? "bg-green-500" : "bg-red-500"}`}
											/>
											<span className="text-muted-foreground">Camera: </span>
											<span
												className={
													isCameraOn ? "text-green-600" : "text-red-600"
												}
											>
												{isCameraOn ? "Ready" : "Off"}
											</span>
										</div>
										<div className="flex items-center gap-2">
											<div
												className={`w-2 h-2 rounded-full ${isMicOn ? "bg-green-500" : "bg-red-500"}`}
											/>
											<span className="text-muted-foreground">
												Microphone:{" "}
											</span>
											<span
												className={isMicOn ? "text-green-600" : "text-red-600"}
											>
												{isMicOn ? "Ready" : "Off"}
											</span>
										</div>
									</div>

									{/* Join Button */}
									<div className="text-center pt-4">
										<Button
											size="lg"
											onClick={joinInterview}
											disabled={isLoading}
											className="px-12 py-3 text-lg font-semibold"
										>
											{isLoading ? (
												<div className="flex items-center gap-2">
													<div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
													<span>Joining Interview...</span>
												</div>
											) : (
												<div className="flex items-center gap-2">
													<Video className="w-5 h-5" />
													<span>Join Interview</span>
												</div>
											)}
										</Button>
									</div>
								</div>
							)}

							{!hasPermission && !error && (
								<div className="text-center py-12">
									<div className="animate-pulse">
										<div className="w-16 h-16 bg-muted rounded-full mx-auto mb-4 flex items-center justify-center">
											<Settings className="w-8 h-8 text-muted-foreground" />
										</div>
										<h3 className="text-lg font-semibold mb-2">
											Setting up your devices...
										</h3>
										<p className="text-muted-foreground">
											Please allow access to your camera and microphone
										</p>
									</div>
								</div>
							)}
						</CardContent>
					</Card>
				</div>
			</div>
  )
}

export default JoinInterviewPreview
