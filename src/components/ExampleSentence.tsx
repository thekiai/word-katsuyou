import { Volume2 } from 'lucide-react';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';

type ExampleSentenceProps = {
  korean: string;
  japanese: string;
};

export function ExampleSentence({ korean, japanese }: ExampleSentenceProps) {
  const { speak, isSpeaking } = useSpeechSynthesis();

  const handleSpeak = () => {
    speak(korean);
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-700">例文</h3>
        <button
          type="button"
          onClick={handleSpeak}
          disabled={isSpeaking}
          className={`p-2 rounded-md transition-colors flex items-center justify-center ${
            isSpeaking
              ? 'bg-yellow-100 text-yellow-600 cursor-not-allowed'
              : 'bg-white hover:bg-gray-100 text-gray-600 cursor-pointer border border-gray-200'
          }`}
          title="例文を読み上げ"
        >
          <Volume2 className="w-4 h-4" />
        </button>
      </div>
      <p className="text-lg text-gray-900 font-medium mb-1">{korean}</p>
      <p className="text-sm text-gray-600">{japanese}</p>
    </div>
  );
}
