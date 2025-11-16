import { CheckCircle, X } from 'lucide-react';
import { SpeakButton } from './SpeakButton';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { useEffect, forwardRef } from 'react';

type InputRowProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  correctAnswer: string;
  exampleJa?: string;
  exampleKo?: string;
  showResult?: boolean;
  isCorrect?: boolean;
  showAnswerOnly?: boolean; // 採点せずに答えのみ表示
  onGrade?: () => void;
  onShowAnswer?: () => void; // 答えのみを表示するハンドラー
  onCorrect?: () => void;
};

export const InputRow = forwardRef<HTMLInputElement, InputRowProps>(({
  label,
  value,
  onChange,
  correctAnswer,
  exampleJa,
  exampleKo,
  showResult = false,
  isCorrect = false,
  showAnswerOnly = false,
  onGrade,
  onShowAnswer,
  onCorrect,
}, ref) => {
  const { speak, isSpeaking, currentText } = useSpeechSynthesis();

  const handleSpeakClick = () => {
    speak(correctAnswer);
  };

  const handleExampleSpeakClick = () => {
    if (exampleKo) {
      speak(exampleKo);
    }
  };

  // 自動採点: 正解が入力されたら自動的に採点（不正解後の修正も対応）
  useEffect(() => {
    if (onGrade) {
      const normalizedUserAnswer = value.trim();
      const normalizedCorrectAnswer = correctAnswer.trim();

      // 正解が入力されたら自動採点
      if (normalizedUserAnswer === normalizedCorrectAnswer && normalizedUserAnswer !== '') {
        // まだ採点されていないか、不正解の場合のみ再採点
        if (!showResult || !isCorrect) {
          onGrade();
          // 正解になったら次の入力にフォーカス
          if (onCorrect) {
            // 少し遅延させてから次にフォーカス（状態更新を待つ）
            setTimeout(() => {
              onCorrect();
            }, 100);
          }
        }
      }
    }
  }, [value, correctAnswer, onGrade, showResult, isCorrect, onCorrect]);

  const isAnswerSpeaking = isSpeaking && currentText === correctAnswer;
  const isExampleSpeaking = isSpeaking && currentText === exampleKo;

  return (
    <div
      className={`p-3 rounded-lg border transition-colors ${
        showResult
          ? showAnswerOnly
            ? 'bg-white border-gray-200' // 答えのみ表示時は白背景
            : isCorrect
            ? 'bg-green-50 border-green-300'
            : 'bg-pink-50 border-red-200'
          : 'bg-white border-gray-200 hover:shadow-sm'
      }`}
    >
      <div className="mb-2 flex items-center justify-between">
        <label className="font-semibold text-base text-gray-700">
          {label}
        </label>
        <div className="flex items-center gap-2">
          {showResult && (showAnswerOnly || !isCorrect) && (
            <>
              <span className="text-base text-gray-600 font-semibold">
                {correctAnswer}
              </span>
              <SpeakButton onClick={handleSpeakClick} isSpeaking={isAnswerSpeaking} />
            </>
          )}
          {showResult && !showAnswerOnly && isCorrect && (
            <CheckCircle className="w-5 h-5 text-green-600" />
          )}
          {onShowAnswer && !showResult && (
            <button
              type="button"
              onClick={onShowAnswer}
              className="text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2 transition-colors whitespace-nowrap"
            >
              答え
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 mb-2">
        <div className="relative flex-1 min-w-0">
          <input
            ref={ref}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={showResult && isCorrect}
            className="w-full px-2 py-2 pr-8 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder="入力"
          />
          {value && !showResult && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {exampleJa && (
        <div className="mb-1 text-sm text-gray-500 italic">
          <span className="font-semibold not-italic">例：</span>{exampleJa}
        </div>
      )}

      {showResult && exampleKo && (
        <div className="flex items-center gap-2">
          <SpeakButton onClick={handleExampleSpeakClick} isSpeaking={isExampleSpeaking} />
          <div className="text-sm text-gray-600 italic flex-1">
            {exampleKo}
          </div>
        </div>
      )}
    </div>
  );
});

InputRow.displayName = 'InputRow';
