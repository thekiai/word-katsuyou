import { useState, useCallback } from 'react';

// Extend Window interface for webkit support
declare global {
  interface Window {
    webkitSpeechRecognition: typeof SpeechRecognition;
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

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        onResult(transcript);
      };

      recognition.onerror = (event) => {
        setError(`音声認識エラー: ${event.error}`);
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
