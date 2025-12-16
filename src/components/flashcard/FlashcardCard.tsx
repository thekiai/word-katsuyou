/**
 * フラッシュカードコンポーネント
 */

import { useState } from 'react';
import { Volume2, ExternalLink } from 'lucide-react';
import { Word } from '../../data/topikWords';
import { CardProgress, AnswerGrade } from '../../types/flashcard';
import { useSpeechSynthesis } from '../../hooks/useSpeechSynthesis';

type FlashcardCardProps = {
  word: Word;
  progress: CardProgress;
  onAnswer: (grade: AnswerGrade) => void;
  getPreview: (grade: AnswerGrade) => string;
};

export const FlashcardCard = ({
  word,
  progress,
  onAnswer,
  getPreview,
}: FlashcardCardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const { speak, isSpeaking } = useSpeechSynthesis();

  const handleFlip = () => {
    if (!isFlipped) {
      setIsFlipped(true);
      speak(word.korean);
    }
  };

  const handleAnswer = (grade: AnswerGrade) => {
    setIsFlipped(false);
    onAnswer(grade);
  };

  const playAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    speak(word.korean);
  };

  const openGoogleSearch = (e: React.MouseEvent) => {
    e.stopPropagation();
    const query = encodeURIComponent(`${word.korean} 意味`);
    window.open(`https://www.google.com/search?q=${query}`, '_blank');
  };

  const stateLabel = {
    new: '新規',
    learning: '学習中',
    review: '復習',
    relearning: '再学習',
  }[progress.state];

  const stateColor = {
    new: 'bg-blue-100 text-blue-700',
    learning: 'bg-orange-100 text-orange-700',
    review: 'bg-green-100 text-green-700',
    relearning: 'bg-red-100 text-red-700',
  }[progress.state];

  return (
    <div className="w-full max-w-md mx-auto">
      {/* カード状態 */}
      <div className="flex justify-center mb-4">
        <span className={`px-3 py-1 rounded-full text-sm ${stateColor}`}>
          {stateLabel}
        </span>
      </div>

      {/* カード */}
      <div
        onClick={handleFlip}
        className={`
          relative bg-white rounded-2xl shadow-lg p-8 min-h-[280px]
          flex flex-col items-center justify-center cursor-pointer
          transition-all duration-200 hover:shadow-xl
          ${!isFlipped ? 'hover:scale-[1.02]' : ''}
        `}
      >
        {/* Google検索ボタン */}
        <button
          onClick={openGoogleSearch}
          className="absolute top-3 right-3 p-1.5 text-gray-300 hover:text-gray-500 transition-colors"
          title="Googleで検索"
        >
          <ExternalLink className="w-4 h-4" />
        </button>

        {/* 韓国語 */}
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={playAudio}
            disabled={isSpeaking}
            className={`p-2 rounded-full transition-colors ${
              isSpeaking
                ? 'bg-yellow-100 text-yellow-600'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
            }`}
          >
            <Volume2 className="w-5 h-5" />
          </button>
          <span className="text-4xl font-bold text-gray-900">
            {word.korean}
          </span>
        </div>

        {/* 答え表示 */}
        {isFlipped ? (
          <div className="text-center animate-fade-in">
            <div className="text-2xl text-gray-700 mt-4">
              {word.japanese}
            </div>
          </div>
        ) : (
          <div className="text-gray-400 mt-4">
            タップして答えを見る
          </div>
        )}
      </div>

      {/* 回答ボタン */}
      {isFlipped && (
        <div className="mt-6 flex gap-4 justify-center animate-fade-in">
          <button
            onClick={() => handleAnswer('again')}
            className="flex-1 max-w-[140px] py-4 px-6 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-colors"
          >
            <div className="text-lg">Again</div>
            <div className="text-xs opacity-80 mt-1">
              {getPreview('again')}
            </div>
          </button>
          <button
            onClick={() => handleAnswer('good')}
            className="flex-1 max-w-[140px] py-4 px-6 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium transition-colors"
          >
            <div className="text-lg">Good</div>
            <div className="text-xs opacity-80 mt-1">
              {getPreview('good')}
            </div>
          </button>
        </div>
      )}
    </div>
  );
};
