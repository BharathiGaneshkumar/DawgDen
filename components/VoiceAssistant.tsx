"use client";

import { useConversation, ConversationProvider } from "@elevenlabs/react";
import { Mic, MicOff, X, Volume2 } from "lucide-react";
import { useCallback, useState } from "react";

interface FilterParams {
  maxRent?: number;
  minRent?: number;
  bedrooms?: number;
  keyword?: string;
}

interface VoiceAssistantProps {
  onFilter: (params: FilterParams) => void;
  onClear: () => void;
}

// Inner component that uses the hook — must be inside ConversationProvider
function VoiceAssistantInner({ onFilter, onClear }: VoiceAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [lastAction, setLastAction] = useState<string | null>(null);

  const conversation = useConversation({
    onConnect: () => setLastAction("Connected! Ask me to find listings."),
    onDisconnect: () => setLastAction(null),
    onError: (err) => setLastAction(`Error: ${err}`),
  });

  const agentId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID ?? "";

  const handleToggle = useCallback(async () => {
    if (conversation.status === "connected") {
      await conversation.endSession();
      setIsOpen(false);
    } else {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      await conversation.startSession({
        agentId,
        clientTools: {
          filterListings: async (params: FilterParams) => {
            onFilter(params);

            const parts: string[] = [];
            if (params.maxRent) parts.push(`under $${params.maxRent.toLocaleString()}`);
            if (params.minRent) parts.push(`over $${params.minRent.toLocaleString()}`);
            if (params.bedrooms) parts.push(`${params.bedrooms} bedroom`);
            if (params.keyword) parts.push(`matching "${params.keyword}"`);

            const desc = parts.length ? parts.join(", ") : "your criteria";
            setLastAction(`Showing listings ${desc}`);
            return `Filtered listings ${desc} successfully.`;
          },
          clearFilters: async () => {
            onClear();
            setLastAction("Cleared all filters");
            return "Filters cleared.";
          },
        },
      });
      setIsOpen(true);
    }
  }, [conversation, agentId, onFilter, onClear]);

  const isConnected = conversation.status === "connected";
  const isSpeaking = conversation.isSpeaking;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Info bubble */}
      {isOpen && (
        <div className="mb-1 max-w-xs animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="rounded-2xl border border-primary/10 bg-white/90 backdrop-blur-md px-4 py-3 shadow-xl shadow-primary/10">
            <div className="flex items-center justify-between gap-3 mb-2">
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">Voice Assistant</span>
              <button
                onClick={() => { conversation.endSession(); setIsOpen(false); }}
                className="rounded-full p-1 text-primary/40 hover:text-primary hover:bg-primary/10 transition"
              >
                <X size={12} />
              </button>
            </div>

            {/* Status indicator */}
            <div className="flex items-center gap-2 mb-2">
              <span className={`h-2 w-2 rounded-full ${isConnected ? (isSpeaking ? "bg-blue-400 animate-pulse" : "bg-emerald-400 animate-pulse") : "bg-primary/30"}`} />
              <span className="text-xs text-primary/70">
                {!isConnected ? "Connecting..." : isSpeaking ? "Speaking..." : "Listening..."}
              </span>
              {isSpeaking && <Volume2 size={12} className="text-blue-400 animate-pulse" />}
            </div>

            {lastAction && (
              <p className="text-xs text-primary/60 bg-primary/5 rounded-lg px-2 py-1.5 border border-primary/10">
                ✨ {lastAction}
              </p>
            )}

            <p className="mt-2 text-[11px] text-primary/50 leading-relaxed">
              Try: <em>"Show apartments under $1500"</em> or <em>"Find 2-bedroom listings"</em>
            </p>
          </div>
        </div>
      )}

      {/* Main mic button */}
      <button
        onClick={handleToggle}
        title={isConnected ? "Stop voice assistant" : "Start voice assistant"}
        className={`relative flex h-14 w-14 items-center justify-center rounded-full shadow-2xl transition-all duration-300 hover:scale-110 focus:outline-none
          ${isConnected
            ? "bg-gradient-to-br from-pink-500 to-purple-600 shadow-pink-500/40"
            : "bg-gradient-to-br from-primary to-pink-500 shadow-primary/30"
          }`}
      >
        {/* Ripple rings when connected */}
        {isConnected && (
          <>
            <span className="absolute inset-0 rounded-full bg-pink-400/30 animate-ping" />
            <span className="absolute -inset-2 rounded-full border border-pink-400/20 animate-ping [animation-delay:150ms]" />
          </>
        )}
        {isConnected ? (
          <MicOff size={22} className="relative text-white" />
        ) : (
          <Mic size={22} className="relative text-white" />
        )}
      </button>
    </div>
  );
}

// Outer wrapper — provides the required context for useConversation
export default function VoiceAssistant(props: VoiceAssistantProps) {
  return (
    <ConversationProvider>
      <VoiceAssistantInner {...props} />
    </ConversationProvider>
  );
}
