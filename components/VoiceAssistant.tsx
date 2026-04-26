"use client";

import { useState, useRef } from "react";
import { Mic, MicOff, Loader2, Play } from "lucide-react";

export default function VoiceAssistant() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  
  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const initRecognition = () => {
    if (typeof window === "undefined") return null;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return null;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);
      processVoiceCommand(text);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsRecording(false);
      setIsProcessing(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    return recognition;
  };

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      if (!recognitionRef.current) {
        recognitionRef.current = initRecognition();
      }
      if (recognitionRef.current) {
        setTranscript("");
        setAudioUrl(null);
        recognitionRef.current.start();
        setIsRecording(true);
      } else {
        alert("Speech recognition is not supported in this browser.");
      }
    }
  };

  const processVoiceCommand = async (text: string) => {
    setIsProcessing(true);
    try {
      // 1. In a real app, send text to Anthropic here to understand intent.
      // For this implementation, we will assume it's just requesting the text to be spoken.
      
      const res = await fetch("/api/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) throw new Error("Voice API failed");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);

      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.play();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {(transcript || isProcessing) && (
        <div className="max-w-[250px] rounded-2xl border border-white/10 bg-slate-900/90 p-4 shadow-xl backdrop-blur-sm animate-in slide-in-from-bottom-4">
          <p className="text-xs text-gray-400 mb-1">Transcript:</p>
          <p className="text-sm text-white font-medium">{transcript || "..."}</p>
          {isProcessing && (
            <div className="mt-3 flex items-center gap-2 text-xs text-violet-400">
              <Loader2 size={12} className="animate-spin" /> Processing AI response...
            </div>
          )}
          {audioUrl && !isProcessing && (
            <div className="mt-3">
               <audio ref={audioRef} controls className="h-8 w-full" />
            </div>
          )}
        </div>
      )}

      <button
        onClick={toggleRecording}
        disabled={isProcessing}
        className={`flex h-14 w-14 items-center justify-center rounded-full shadow-2xl transition-all ${
          isRecording 
            ? "bg-red-500 animate-pulse shadow-red-500/50 scale-110" 
            : isProcessing 
              ? "bg-gray-700 opacity-50 cursor-not-allowed"
              : "bg-gradient-to-tr from-violet-600 to-indigo-600 hover:scale-105 shadow-violet-500/30"
        }`}
      >
        {isProcessing ? (
          <Loader2 className="text-white animate-spin" size={24} />
        ) : isRecording ? (
          <MicOff className="text-white" size={24} />
        ) : (
          <Mic className="text-white" size={24} />
        )}
      </button>
    </div>
  );
}
