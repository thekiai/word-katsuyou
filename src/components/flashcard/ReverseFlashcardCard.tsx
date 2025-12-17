/**
 * 逆方向フラッシュカードコンポーネント（日本語 → 韓国語入力）
 */

import { useState, useRef, useEffect, useMemo } from 'react';
import { Volume2, ExternalLink } from 'lucide-react';
import { Word, topikWords } from '../../data/topikWords';
import { CardProgress, AnswerGrade } from '../../types/flashcard';
import { useSpeechSynthesis } from '../../hooks/useSpeechSynthesis';

type ReverseFlashcardCardProps = {
  word: Word;
  progress: CardProgress;
  onAnswer: (grade: AnswerGrade) => void;
  getPreview: (grade: AnswerGrade) => string;
};

export const ReverseFlashcardCard = ({
  word,
  progress,
  onAnswer,
}: ReverseFlashcardCardProps) => {
  const [userInput, setUserInput] = useState('');
  const [isChecked, setIsChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { speak, isSpeaking } = useSpeechSynthesis();

  // 同じ日本語の意味を持つ単語が他にあるかチェック
  const hasDuplicateMeaning = useMemo(() => {
    return topikWords.filter(w => w.japanese === word.japanese).length > 1;
  }, [word.japanese]);

  // カードが変わったらリセット＆フォーカス
  useEffect(() => {
    setUserInput('');
    setIsChecked(false);
    setIsCorrect(false);
    inputRef.current?.focus();
  }, [word.id]);

  const handleCheck = () => {
    const correct = userInput.trim() === word.korean;
    setIsCorrect(correct);
    setIsChecked(true);
    speak(word.korean);
  };

  const handleNext = () => {
    const grade: AnswerGrade = isCorrect ? 'good' : 'again';
    setUserInput('');
    setIsChecked(false);
    setIsCorrect(false);
    onAnswer(grade);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (!isChecked && userInput.trim()) {
        handleCheck();
      } else if (isChecked) {
        handleNext();
      }
    }
  };

  const playAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    speak(word.korean);
  };

  const openGoogleSearch = (e: React.MouseEvent) => {
    e.stopPropagation();
    const query = encodeURIComponent(`${word.japanese} 韓国語`);
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
      <div className="relative bg-white rounded-2xl shadow-lg p-8 min-h-[320px] flex flex-col items-center justify-center">
        {/* Google検索ボタン */}
        <button
          onClick={openGoogleSearch}
          className="absolute top-3 right-3 p-1.5 text-gray-300 hover:text-gray-500 transition-colors"
          title="Googleで検索"
        >
          <ExternalLink className="w-4 h-4" />
        </button>

        {/* 日本語（問題） */}
        <div className="text-4xl font-bold text-gray-900 mb-2">
          {word.japanese}
        </div>

        {/* ヒント（同じ意味の単語が複数ある場合） */}
        {hasDuplicateMeaning && (
          <div className="text-gray-400 text-sm mb-4">
            ヒント: {word.korean.charAt(0)}...
          </div>
        )}
        {!hasDuplicateMeaning && <div className="mb-4" />}

        {/* 入力フィールド */}
        {!isChecked ? (
          <div className="w-full">
            <input
              ref={inputRef}
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="韓国語を入力..."
              className="w-full px-4 py-3 text-xl text-center border-2 border-gray-300 rounded-xl focus:outline-none focus:border-cyan-500"
              autoComplete="off"
            />
            <button
              onClick={handleCheck}
              disabled={!userInput.trim()}
              className={`w-full mt-4 py-3 rounded-xl font-medium text-lg transition-colors ${
                userInput.trim()
                  ? 'bg-cyan-500 hover:bg-cyan-600 text-white'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              答え合わせ
            </button>
          </div>
        ) : (
          <div className="w-full text-center animate-fade-in">
            {/* 結果表示 */}
            <div className={`text-lg font-medium mb-2 ${isCorrect ? 'text-green-600' : 'text-red-500'}`}>
              {isCorrect ? '正解！' : '不正解...'}
            </div>

            {/* ユーザーの回答 */}
            {!isCorrect && userInput.trim() && (
              <div className="text-gray-500 mb-2">
                あなたの回答: <span className="line-through">{userInput}</span>
              </div>
            )}

            {/* 正解 */}
            <div className="flex items-center gap-3 justify-center mt-4">
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
              <span className="text-2xl font-bold text-gray-800">
                {word.korean}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 次へボタン */}
      {isChecked && (
        <div className="mt-6 flex justify-center animate-fade-in">
          <button
            onClick={handleNext}
            className={`w-full max-w-[280px] py-4 px-6 rounded-xl font-medium text-lg transition-colors ${
              isCorrect
                ? 'bg-green-500 hover:bg-green-600 text-white'
                : 'bg-orange-500 hover:bg-orange-600 text-white'
            }`}
          >
            次へ
          </button>
        </div>
      )}
    </div>
  );
};
