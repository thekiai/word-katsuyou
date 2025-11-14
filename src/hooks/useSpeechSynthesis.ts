import { useState, useCallback, useEffect } from 'react';

export function useSpeechSynthesis() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  // Load voices
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);

      // Debug: Show available Korean voices
      const koreanVoices = availableVoices.filter(
        (voice) => voice.lang === 'ko-KR' || voice.lang.startsWith('ko')
      );
      if (koreanVoices.length > 0) {
        const voiceList = koreanVoices.map(v => v.name).join(', ');
        console.log('Korean voices:', voiceList);
      }
    };

    loadVoices();

    // iOS requires waiting for voiceschanged event
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const speak = useCallback((text: string) => {
    if (!text) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    // Small delay for iOS compatibility
    setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ko-KR';
      utterance.rate = 0.9;
      utterance.volume = 1.0;
      utterance.pitch = 1.0;

      // Find best Korean voice
      const koreanVoices = voices.filter(
        (voice) => voice.lang === 'ko-KR' || voice.lang.startsWith('ko')
      );

      // Try to find specific high-quality voices in order of preference
      let koreanVoice =
        // First try Siri voices
        koreanVoices.find(v => v.name.includes('Siri')) ||
        // Then try Yuna (common iOS premium voice)
        koreanVoices.find(v => v.name.includes('Yuna')) ||
        // Then try enhanced/premium
        koreanVoices.find(v => v.name.toLowerCase().includes('enhanced')) ||
        koreanVoices.find(v => v.name.toLowerCase().includes('premium')) ||
        // Avoid Rocko if possible
        koreanVoices.find(v => !v.name.includes('Rocko')) ||
        // Last resort: any Korean voice
        koreanVoices[0];

      if (koreanVoice) {
        utterance.voice = koreanVoice;
        // Debug: Alert which voice is being used
        alert(`使用中の音声: ${koreanVoice.name}`);
      }

      // Estimate speech duration for fallback timeout
      const estimatedDuration = (text.length * 100) + 2000; // ~100ms per character + 2s buffer
      let timeoutId: number;

      utterance.onstart = () => {
        setIsSpeaking(true);

        // Fallback timeout in case onend doesn't fire (iOS issue)
        timeoutId = setTimeout(() => {
          setIsSpeaking(false);
        }, estimatedDuration);
      };

      utterance.onend = () => {
        clearTimeout(timeoutId);
        setIsSpeaking(false);
      };

      utterance.onerror = () => {
        clearTimeout(timeoutId);
        setIsSpeaking(false);
      };

      window.speechSynthesis.speak(utterance);
    }, 100);
  }, [voices]);

  return {
    speak,
    isSpeaking,
  };
}
