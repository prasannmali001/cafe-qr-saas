"use client";

import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Globe } from "lucide-react";

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionResult {
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface ISpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: ((this: ISpeechRecognition, ev: Event) => void) | null;
  onresult: ((this: ISpeechRecognition, ev: SpeechRecognitionEvent) => void) | null;
  onerror: ((this: ISpeechRecognition, ev: SpeechRecognitionErrorEvent) => void) | null;
  onend: ((this: ISpeechRecognition, ev: Event) => void) | null;
}

type SpeechRecognitionConstructor = new () => ISpeechRecognition;

function getSpeechRecognitionConstructor(): SpeechRecognitionConstructor | null {
  if (typeof window === "undefined") return null;
  const win = window as unknown as {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };
  return win.SpeechRecognition || win.webkitSpeechRecognition || null;
}

interface VoiceMicButtonProps {
  onTranscript: (spokenText: string) => void;
  disabled?: boolean;
}

export function VoiceMicButton({
  onTranscript,
  disabled = false,
}: VoiceMicButtonProps) {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const [selectedLang, setSelectedLang] = useState<"en-IN" | "hi-IN">("en-IN");
  const recognitionRef = useRef<ISpeechRecognition | null>(null);

  useEffect(() => {
    const Recognition = getSpeechRecognitionConstructor();
    if (!Recognition) {
      setIsSupported(false);
    }
  }, []);

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Recognition already stopped
      }
      recognitionRef.current = null;
    }
    setIsListening(false);
  };

  const startListening = () => {
    const Recognition = getSpeechRecognitionConstructor();
    if (!Recognition) {
      setIsSupported(false);
      return;
    }

    try {
      const recognition = new Recognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = selectedLang;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalTrans = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results.item(i);
          if (item && item.isFinal) {
            finalTrans += item.item(0).transcript;
          }
        }
        if (finalTrans.trim()) {
          onTranscript(finalTrans.trim());
        }
      };

      recognition.onerror = (err: SpeechRecognitionErrorEvent) => {
        console.warn("Speech recognition error:", err.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e: unknown) {
      console.warn("Could not start speech recognition:", e);
      setIsListening(false);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const toggleLang = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = selectedLang === "en-IN" ? "hi-IN" : "en-IN";
    setSelectedLang(next);
    if (isListening) {
      stopListening();
    }
  };

  if (!isSupported) {
    return null; // Graceful non-crashing fallback on unsupported browsers
  }

  return (
    <div className="inline-flex items-center gap-1.5">
      <button
        type="button"
        onClick={toggleListening}
        disabled={disabled}
        aria-label={isListening ? "Stop voice recording" : "Start voice note in Hindi or English"}
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 touch-manipulation border ${
          isListening
            ? "bg-red-500 text-white border-red-600 animate-pulse shadow-md shadow-red-200"
            : "bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-700"
        } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      >
        {isListening ? (
          <>
            <MicOff className="w-3.5 h-3.5" />
            <span>Listening... ({selectedLang === "en-IN" ? "EN/Hinglish" : "Hindi"})</span>
          </>
        ) : (
          <>
            <Mic className="w-3.5 h-3.5 text-red-500" />
            <span>Speak Note</span>
          </>
        )}
      </button>

      {/* Language Toggle Pill */}
      <button
        type="button"
        onClick={toggleLang}
        title="Toggle Voice Language (English/Hinglish or Hindi)"
        className="px-2 py-1 rounded-full text-[11px] font-medium bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-100"
      >
        <span className="flex items-center gap-1">
          <Globe className="w-3 h-3" />
          {selectedLang === "en-IN" ? "EN" : "हिन्दी"}
        </span>
      </button>
    </div>
  );
}
