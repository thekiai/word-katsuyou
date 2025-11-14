import { CheckCircle } from 'lucide-react';
import { MicButton } from './MicButton';
import { SpeakButton } from './SpeakButton';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';

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
  const { isListening, startListening } = useSpeechRecognition();
  const { speak, isSpeaking } = useSpeechSynthesis();

  const handleMicClick = () => {
    startListening((text) => {
      onChange(text);
    });
  };

  const handleSpeakClick = () => {
    speak(correctAnswer);
  };

  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center gap-2 p-2 sm:p-3 rounded-lg border transition-colors ${
        showResult
          ? isCorrect
            ? 'bg-green-50 border-green-300'
            : 'bg-pink-50 border-red-200'
          : 'bg-white border-gray-200 hover:shadow-sm'
      }`}
    >
      <label className="font-semibold text-sm text-gray-700 sm:w-32 sm:flex-shrink-0">
        {label}
      </label>
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 min-w-0 w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="入力"
        />
        {!showResult && (
          <MicButton onClick={handleMicClick} isListening={isListening} />
        )}
        {showResult && (
          <SpeakButton onClick={handleSpeakClick} isSpeaking={isSpeaking} />
        )}
        {onGrade && !showResult && (
          <button
            type="button"
            onClick={onGrade}
            className="px-3 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap bg-gray-600 hover:bg-gray-700 text-white flex-shrink-0"
          >
            採点
          </button>
        )}
        {showResult && isCorrect && (
          <div className="flex-shrink-0">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
        )}
        {showResult && !isCorrect && (
          <span className="text-sm sm:text-base text-gray-600 font-semibold flex-shrink-0 truncate">
            👉 {correctAnswer}
          </span>
        )}
      </div>
    </div>
  );
}
