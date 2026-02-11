import { Camera, Mic, MicOff, Video, VideoOff, Loader2 } from 'lucide-react';
import React from 'react'
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
    <div className="min-h-screen dark interview-surface flex items-center justify-center px-4">
      <div className="w-full max-w-2xl">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-white tracking-tight">
            Ready to join?
          </h1>
          <p className="text-sm text-white/50 mt-1">
            Check your camera and microphone before joining
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20">
            <p className="text-sm text-destructive font-medium">
              Device access error
            </p>
            <p className="text-xs text-destructive/70 mt-1">
              {error}. Please check your browser permissions.
            </p>
          </div>
        )}

        {hasPermission && (
          <div className="space-y-6">
            {/* Video Preview */}
            <div className="relative aspect-video interview-panel rounded-3xl overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              {!isCameraOn && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Camera className="w-10 h-10 text-white/20" />
                </div>
              )}
              <div className="pointer-events-none absolute inset-0 bg-black/30" />
            </div>

            {/* Controls */}
            <div className="flex justify-center gap-3">
              <button
                onClick={toggleCamera}
                className={`h-12 w-12 rounded-full flex items-center justify-center transition-all duration-150 ${
                  isCameraOn
                    ? "interview-panel text-white hover:bg-white/10"
                    : "bg-destructive text-destructive-foreground"
                }`}
              >
                {isCameraOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </button>

              <button
                onClick={toggleMicrophone}
                className={`h-12 w-12 rounded-full flex items-center justify-center transition-all duration-150 ${
                  isMicOn
                    ? "interview-panel text-white hover:bg-white/10"
                    : "bg-destructive text-destructive-foreground"
                }`}
              >
                {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </button>
            </div>

            {/* Status indicators */}
            <div className="flex justify-center gap-6 text-xs text-white/40">
              <div className="flex items-center gap-1.5">
                <div className={`w-1.5 h-1.5 rounded-full ${isCameraOn ? "bg-emerald-400" : "bg-red-400"}`} />
                Camera {isCameraOn ? "on" : "off"}
              </div>
              <div className="flex items-center gap-1.5">
                <div className={`w-1.5 h-1.5 rounded-full ${isMicOn ? "bg-emerald-400" : "bg-red-400"}`} />
                Microphone {isMicOn ? "on" : "off"}
              </div>
            </div>

            {/* Join Button */}
            <div className="text-center pt-2">
              <Button
                size="lg"
                onClick={joinInterview}
                disabled={isLoading}
                className="h-12 px-10 text-base font-medium rounded-xl"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Joining...
                  </span>
                ) : (
                  "Join Interview"
                )}
              </Button>
            </div>
          </div>
        )}

        {!hasPermission && !error && (
          <div className="text-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-white/30 mx-auto mb-4" />
            <p className="text-sm text-white/50">
              Setting up your devices...
            </p>
            <p className="text-xs text-white/30 mt-1">
              Please allow camera and microphone access
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default JoinInterviewPreview
