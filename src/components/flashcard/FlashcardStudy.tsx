/**
 * フラッシュカード学習画面
 */

import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft } from 'lucide-react';
import { getWordById } from '../../data/topikWords';
import { AnswerGrade, CardProgress, TodayStats } from '../../types/flashcard';
import { FlashcardCard } from './FlashcardCard';

type FlashcardStudyProps = {
  onBack: () => void;
  getNextCard: () => CardProgress | null;
  answerCard: (wordId: number, grade: AnswerGrade) => { updated: CardProgress; nextCard: CardProgress | null };
  getTodayStats: () => TodayStats;
  getButtonPreview: (wordId: number, grade: AnswerGrade) => string;
};

export const FlashcardStudy = ({
  onBack,
  getNextCard,
  answerCard,
  getTodayStats,
  getButtonPreview,
}: FlashcardStudyProps) => {
  const [currentCard, setCurrentCard] = useState<CardProgress | null>(null);
  const [cardKey, setCardKey] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);

  // 初回マウント時に最初のカードを取得
  useEffect(() => {
    if (!isInitialized) {
      setCurrentCard(getNextCard());
      setIsInitialized(true);
    }
  }, [isInitialized, getNextCard]);

  const handleAnswer = useCallback(
    (grade: AnswerGrade) => {
      if (!currentCard) return;

      const { nextCard } = answerCard(currentCard.wordId, grade);
      setCardKey((k) => k + 1);

      // 少し遅延して次のカードを表示（アニメーション用）
      setTimeout(() => {
        setCurrentCard(nextCard);
      }, 100);
    },
    [currentCard, answerCard]
  );

  const handlePreview = useCallback(
    (grade: AnswerGrade): string => {
      if (!currentCard) return '';
      return getButtonPreview(currentCard.wordId, grade);
    },
    [currentCard, getButtonPreview]
  );

  const stats = getTodayStats();
  const word = currentCard ? getWordById(currentCard.wordId) : null;

  // 学習完了
  if (isInitialized && (!currentCard || !word)) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <div className="text-6xl mb-6">🎉</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            今日の学習完了！
          </h2>
          <p className="text-gray-600 mb-8">
            本日 {stats.completedToday} 枚のカードを学習しました
          </p>
          <button
            onClick={onBack}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
          >
            ホームに戻る
          </button>
        </div>
      </div>
    );
  }

  // 初期化中
  if (!isInitialized || !currentCard || !word) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    );
  }

  const remaining =
    stats.learningCardsRemaining +
    stats.reviewCardsRemaining +
    stats.newCardsRemaining;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col p-4 pt-8">
      {/* ヘッダー */}
      <div className="max-w-md mx-auto w-full mb-8">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div className="text-sm text-gray-500">
            残り {remaining} 枚
          </div>
          <div className="w-10" /> {/* spacer */}
        </div>

        {/* 統計バー */}
        <div className="flex gap-2 text-sm">
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-gray-600">新規 {stats.newCardsRemaining}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-orange-500" />
            <span className="text-gray-600">学習 {stats.learningCardsRemaining}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-gray-600">復習 {stats.reviewCardsRemaining}</span>
          </div>
        </div>
      </div>

      {/* カード */}
      <div className="flex-1 flex items-start justify-center">
        <FlashcardCard
          key={cardKey}
          word={word}
          progress={currentCard}
          onAnswer={handleAnswer}
          getPreview={handlePreview}
        />
      </div>
    </div>
  );
};
