'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { T } from '@/lib/i18n/context';
import { CresceloOrb, type OrbState } from '@/components/brand/CresceloOrb';
import { PhoneOff, Sparkles, Volume2, VolumeX, Bot, User } from 'lucide-react';

interface VoiceTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  assistantName: string;
  greeting?: string;
  currentTier?: 'standard' | 'premium';
}

interface TurnMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  time: string;
}

export const VoiceTestModal: React.FC<VoiceTestModalProps> = ({
  isOpen,
  onClose,
  assistantName,
  greeting = 'Hello, thanks for calling. How can I help you today?',
  currentTier = 'standard',
}) => {
  const [tier, setTier] = useState<'standard' | 'premium'>(currentTier);
  const [orbState, setOrbState] = useState<OrbState>('idle');
  const [isMuted, setIsMuted] = useState(false);
  const [transcript, setTranscript] = useState<TurnMessage[]>([]);
  const [inputUtterance, setInputUtterance] = useState('');
  const [callActive, setCallActive] = useState(true);

  const isInitializedRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

  const addTimeout = (fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms);
    timeoutsRef.current.push(id);
    return id;
  };

  const clearAllTimeouts = () => {
    timeoutsRef.current.forEach((id) => clearTimeout(id));
    timeoutsRef.current = [];
  };

  const speakText = useCallback((text: string, currentSelectedTier: 'standard' | 'premium') => {
    if (isMuted) return;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.pitch = currentSelectedTier === 'premium' ? 1.05 : 1.0;
      utter.rate = currentSelectedTier === 'premium' ? 0.98 : 1.05;
      utter.onend = () => setOrbState('listening');
      utter.onerror = () => setOrbState('listening');
      window.speechSynthesis.speak(utter);
    } else {
      addTimeout(() => setOrbState('listening'), 2500);
    }
  }, [isMuted]);

  // Handle call setup on open
  useEffect(() => {
    if (isOpen) {
      if (!isInitializedRef.current) {
        isInitializedRef.current = true;
        setCallActive(true);
        setOrbState('speaking');

        const initialGreeting: TurnMessage = {
          id: '1',
          role: 'assistant',
          text: greeting,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        };
        setTranscript([initialGreeting]);
        speakText(greeting, tier);
      }
    } else {
      isInitializedRef.current = false;
      clearAllTimeouts();
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    }

    return () => {
      clearAllTimeouts();
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isOpen, greeting, speakText, tier]);

  // Handle Escape key to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleEndCall();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Auto scroll transcript
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [transcript]);

  if (!isOpen) return null;

  const handleSimulateUtterance = (spokenText: string) => {
    if (!spokenText.trim() || !callActive) return;

    const userMsg: TurnMessage = {
      id: String(Date.now()),
      role: 'user',
      text: spokenText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };

    setTranscript((prev) => [...prev, userMsg]);
    setInputUtterance('');
    setOrbState('thinking');

    // Simulate conversational turn
    addTimeout(() => {
      let reply = `Certainly! I'd be glad to help you with that. Can you let me know what day and time works best for you?`;
      const lower = spokenText.toLowerCase();
      if (lower.includes('hour') || lower.includes('open')) {
        reply = `We are open Monday to Friday from 9 AM to 6 PM. Would you like to schedule an appointment?`;
      } else if (lower.includes('price') || lower.includes('cost') || lower.includes('rate')) {
        reply = `Our standard plans start with full access to the AI receptionist and live calendar bookings.`;
      }

      const aiMsg: TurnMessage = {
        id: String(Date.now() + 1),
        role: 'assistant',
        text: reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      };

      setTranscript((prev) => [...prev, aiMsg]);
      setOrbState('speaking');
      speakText(reply, tier);
    }, 900);
  };

  const handleEndCall = () => {
    setCallActive(false);
    setOrbState('idle');
    clearAllTimeouts();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Voice Call Simulator"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    >
      <div className="relative w-full max-w-xl rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header with Tier Selector */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/40">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <T>In-Browser Voice Call Tester</T>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                LIVE
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              <T>Test calling {assistantName} without phone carrier charges</T>
            </p>
          </div>

          {/* Option A / Option B Toggle */}
          <div className="flex items-center gap-1 bg-slate-200 dark:bg-slate-800 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setTier('standard')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                tier === 'standard'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <T>Option A (Standard)</T>
            </button>
            <button
              type="button"
              onClick={() => setTier('premium')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all flex items-center gap-1 ${
                tier === 'premium'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              <T>Option B (Studio)</T>
            </button>
          </div>
        </div>

        {/* Center Orb & Avatar */}
        <div className="py-7 flex flex-col items-center justify-center bg-radial from-emerald-500/10 via-transparent to-transparent">
          <div className="relative flex items-center justify-center">
            {(orbState === 'listening' || orbState === 'speaking') && (
              <div className="absolute w-32 h-32 rounded-full border-2 border-emerald-500/40 animate-ping opacity-30" />
            )}
            <CresceloOrb size={88} state={orbState} label={assistantName} />
          </div>
          <div className="mt-3 text-center">
            <p className="text-sm font-semibold text-slate-900 dark:text-white capitalize">
              {orbState === 'listening' ? (
                <span className="text-emerald-500 animate-pulse">● Listening to you...</span>
              ) : orbState === 'speaking' ? (
                <span className="text-sky-500">Speaking...</span>
              ) : orbState === 'thinking' ? (
                <span className="text-amber-500">Thinking...</span>
              ) : (
                'Call In Progress'
              )}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              {tier === 'standard' ? 'Engine: Whisper + Piper (Local CPU)' : 'Engine: Deepgram + Cartesia Sonic (Neural Cloud)'}
            </p>
          </div>
        </div>

        {/* Live Conversation Transcript */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-5 py-3 space-y-3 min-h-[160px] max-h-[220px] bg-slate-50/50 dark:bg-slate-950/40 border-y border-slate-200 dark:border-slate-800/80"
        >
          {transcript.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 text-xs ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-200 dark:border-emerald-800">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}
              <div
                className={`max-w-[78%] rounded-2xl px-3.5 py-2 ${
                  msg.role === 'user'
                    ? 'bg-emerald-600 text-white rounded-tr-none'
                    : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700/60 rounded-tl-none shadow-xs'
                }`}
              >
                <p>{msg.text}</p>
                <span className="block text-[9px] opacity-60 text-right mt-1">{msg.time}</span>
              </div>
              {msg.role === 'user' && (
                <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Test Speech Input & Controls */}
        <div className="p-4 bg-white dark:bg-slate-900 space-y-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSimulateUtterance(inputUtterance);
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Say or type something to the assistant..."
              value={inputUtterance}
              onChange={(e) => setInputUtterance(e.target.value)}
              className="flex-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              disabled={!inputUtterance.trim()}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-semibold transition-all cursor-pointer"
            >
              <T>Speak</T>
            </button>
          </form>

          {/* Quick suggestions */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 text-[11px] text-slate-500">
            <span>Try:</span>
            {['Are you open today?', 'I want to book an appointment', 'What are your rates?'].map((sample) => (
              <button
                key={sample}
                type="button"
                onClick={() => handleSimulateUtterance(sample)}
                className="whitespace-nowrap px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                &ldquo;{sample}&rdquo;
              </button>
            ))}
          </div>

          {/* Bottom Call Bar */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/60">
            <button
              type="button"
              onClick={() => setIsMuted(!isMuted)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                isMuted
                  ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 text-rose-600'
                  : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              <span>{isMuted ? 'Audio Muted' : 'Audio On'}</span>
            </button>

            <button
              type="button"
              onClick={handleEndCall}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
            >
              <PhoneOff className="w-4 h-4" />
              <T>End Call</T>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
