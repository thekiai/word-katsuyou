import { useState, useCallback, useEffect } from 'react';

export function useSpeechSynthesis() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  // Load voices
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
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
      // Priority: ko-KR voices, then other ko voices
      // Prefer voices with 'premium', 'enhanced', or female voices
      const koreanVoices = voices.filter(
        (voice) => voice.lang === 'ko-KR' || voice.lang.startsWith('ko')
      );

      // Sort voices by quality indicators
      const sortedVoices = koreanVoices.sort((a, b) => {
        // Prefer ko-KR over other ko variants
        if (a.lang === 'ko-KR' && b.lang !== 'ko-KR') return -1;
        if (a.lang !== 'ko-KR' && b.lang === 'ko-KR') return 1;

        // Prefer premium/enhanced voices
        const aPremium = a.name.toLowerCase().includes('premium') ||
                        a.name.toLowerCase().includes('enhanced') ||
                        a.name.toLowerCase().includes('siri');
        const bPremium = b.name.toLowerCase().includes('premium') ||
                        b.name.toLowerCase().includes('enhanced') ||
                        b.name.toLowerCase().includes('siri');
        if (aPremium && !bPremium) return -1;
        if (!aPremium && bPremium) return 1;

        return 0;
      });

      const koreanVoice = sortedVoices[0];

      if (koreanVoice) {
        utterance.voice = koreanVoice;
        console.log('Using voice:', koreanVoice.name, koreanVoice.lang);
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

      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
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
