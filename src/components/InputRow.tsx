import { CheckCircle } from 'lucide-react';
import { SpeakButton } from './SpeakButton';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';

type InputRowProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  correctAnswer: string;
  exampleJa?: string;
  exampleKo?: string;
  showResult?: boolean;
  isCorrect?: boolean;
  onGrade?: () => void;
};

export function InputRow({
  label,
  value,
  onChange,
  correctAnswer,
  exampleJa,
  exampleKo,
  showResult = false,
  isCorrect = false,
  onGrade,
}: InputRowProps) {
  const { speak, isSpeaking } = useSpeechSynthesis();

  const handleSpeakClick = () => {
    speak(correctAnswer);
  };

  const handleExampleSpeakClick = () => {
    if (exampleKo) {
      speak(exampleKo);
    }
  };

  return (
    <div
      className={`p-3 rounded-lg border transition-colors ${
        showResult
          ? isCorrect
            ? 'bg-green-50 border-green-300'
            : 'bg-pink-50 border-red-200'
          : 'bg-white border-gray-200 hover:shadow-sm'
      }`}
    >
      <div className="mb-2 flex items-center justify-between">
        <label className="font-semibold text-base text-gray-700">
          {label}
        </label>
        {showResult && !isCorrect && (
          <span className="text-base text-gray-600 font-semibold">
            {correctAnswer}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 mb-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 min-w-0 px-2 py-2 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="入力"
        />
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
      </div>

      {exampleJa && (
        <div className="mb-1 text-sm text-gray-500 italic">
          <span className="font-semibold not-italic">例：</span>{exampleJa}
        </div>
      )}

      {showResult && exampleKo && (
        <div className="flex items-center gap-2">
          <SpeakButton onClick={handleExampleSpeakClick} isSpeaking={isSpeaking} />
          <div className="text-sm text-gray-600 italic flex-1">
            {exampleKo}
          </div>
        </div>
      )}
    </div>
  );
}
