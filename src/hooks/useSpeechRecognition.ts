import { useState, useCallback } from 'react';

// Type definitions for Web Speech API
interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SpeechRecognitionConstructor = any;

// Extend Window interface for webkit support
declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionConstructor;
    webkitSpeechRecognition: SpeechRecognitionConstructor;
  }
}

export function useSpeechRecognition() {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startListening = useCallback((onResult: (text: string) => void) => {
    try {
      const SpeechRecognitionAPI =
        window.SpeechRecognition || window.webkitSpeechRecognition;

      if (!SpeechRecognitionAPI) {
        setError('音声認識がこのブラウザでサポートされていません');
        return;
      }

      const recognition = new SpeechRecognitionAPI();
      recognition.lang = 'ko-KR';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
      };

      recognition.onresult = (event: Event) => {
        const speechEvent = event as SpeechRecognitionEvent;
        const transcript = speechEvent.results[0][0].transcript;
        onResult(transcript);
      };

      recognition.onerror = (event: Event) => {
        const errorEvent = event as SpeechRecognitionErrorEvent;
        setError(`音声認識エラー: ${errorEvent.error}`);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      setError('音声認識の開始に失敗しました');
      setIsListening(false);
    }
  }, []);

  return {
    isListening,
    error,
    startListening,
  };
}
