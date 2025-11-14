import { CheckCircle, Mic } from 'lucide-react';
import { SpeakButton } from './SpeakButton';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

type InputRowProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  correctAnswer: string;
  showResult?: boolean;
  isCorrect?: boolean;
  onGrade?: () => void;
};

export function InputRow({
  label,
  value,
  onChange,
  correctAnswer,
  showResult = false,
  isCorrect = false,
  onGrade,
}: InputRowProps) {
  const { speak, isSpeaking } = useSpeechSynthesis();
  const { isListening, startListening } = useSpeechRecognition();

  const handleSpeakClick = () => {
    speak(correctAnswer);
  };

  const handleMicClick = () => {
    startListening((text) => {
      onChange(text);
    });
  };

  return (
    <div
      className={`flex items-center gap-2 p-3 rounded-lg border transition-colors ${
        showResult
          ? isCorrect
            ? 'bg-green-50 border-green-300'
            : 'bg-pink-50 border-red-200'
          : 'bg-white border-gray-200 hover:shadow-sm'
      }`}
    >
      <label className="w-24 flex-shrink-0 font-semibold text-xs text-gray-700">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 min-w-0 px-2 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        placeholder="入力"
      />
      {!showResult && (
        <button
          type="button"
          onClick={handleMicClick}
          disabled={isListening}
          className={`p-2 rounded-md transition-colors flex items-center justify-center flex-shrink-0 ${
            isListening
              ? 'bg-gray-100 text-gray-600 cursor-not-allowed animate-pulse'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-600 cursor-pointer'
          }`}
          title="音声入力"
        >
          <Mic className="w-4 h-4" />
        </button>
      )}
      {showResult && (
        <SpeakButton onClick={handleSpeakClick} isSpeaking={isSpeaking} />
      )}
      {onGrade && !showResult && (
        <button
          type="button"
          onClick={onGrade}
          className="px-2 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap bg-gray-600 hover:bg-gray-700 text-white flex-shrink-0"
        >
          採点
        </button>
      )}
      {showResult && isCorrect && (
        <div className="flex-shrink-0">
          <CheckCircle className="w-5 h-5 text-green-600" />
        </div>
      )}
      {showResult && !isCorrect && (
        <span className="text-xs text-gray-600 font-semibold flex-shrink-0 truncate">
          👉 {correctAnswer}
        </span>
      )}
    </div>
  );
}
