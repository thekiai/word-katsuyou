/**
 * 文法フラッシュカード学習画面
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { GrammarItem, GrammarLevel } from '../../data/grammarData';
import { AnswerGrade } from '../../types/flashcard';
import { GrammarFlashcardCard } from './GrammarFlashcardCard';
import { CommonHeader } from '../CommonHeader';

type GrammarFlashcardStudyProps = {
  title: string;
  grammarData: GrammarItem[];
  useProgressHook: () => {
    isLoading: boolean;
    getNextCard: () => { wordId: number; state: string } | null;
    answerCard: (id: number, grade: AnswerGrade) => { nextCard: { wordId: number; state: string } | null };
    getTodayStats: () => {
      newCardsRemaining: number;
      learningCardsRemaining: number;
      reviewCardsRemaining: number;
      completedToday: number;
    };
    getButtonPreview: (id: number, grade: AnswerGrade) => string;
  };
  onBack?: () => void;
  level?: GrammarLevel;
};

export const GrammarFlashcardStudy = ({
  title,
  grammarData,
  useProgressHook,
  onBack,
  level = 'beginner',
}: GrammarFlashcardStudyProps) => {
  const navigate = useNavigate();
  const {
    isLoading,
    getNextCard,
    answerCard,
    getTodayStats,
    getButtonPreview,
  } = useProgressHook();

  const [currentCard, setCurrentCard] = useState(getNextCard());
  const [cardKey, setCardKey] = useState(0);

  // カードが変わったらキーを更新してアニメーションをリセット
  useEffect(() => {
    if (!isLoading) {
      setCurrentCard(getNextCard());
    }
  }, [isLoading, getNextCard]);

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    );
  }

  const stats = getTodayStats();
  const grammar = currentCard
    ? grammarData.find(g => g.id === currentCard.wordId)
    : null;

  // 学習完了
  if (!currentCard || !grammar) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <CommonHeader title={title} onBack={onBack} />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="text-6xl mb-6">🎉</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              今日の学習完了！
            </h2>
            <p className="text-gray-600 mb-8">
              本日 {stats.completedToday} 枚のカードを学習しました
            </p>
            <button
              onClick={onBack || (() => navigate('/'))}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
            >
              戻る
            </button>
          </div>
        </div>
      </div>
    );
  }

  const remaining =
    stats.learningCardsRemaining +
    stats.reviewCardsRemaining +
    stats.newCardsRemaining;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <CommonHeader
        title={title}
        onBack={onBack}
        rightContent={
          <span className="text-sm text-gray-500">残り {remaining} 枚</span>
        }
      />

      {/* 統計バー */}
      <div className="max-w-md mx-auto w-full px-4 py-2">
        <div className="flex gap-3 text-sm justify-center">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
            <span className="text-gray-600">{stats.newCardsRemaining}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
            <span className="text-gray-600">{stats.learningCardsRemaining}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span className="text-gray-600">{stats.reviewCardsRemaining}</span>
          </div>
        </div>
      </div>

      {/* カード */}
      <div className="flex-1 flex items-start justify-center px-4 pt-4">
        <GrammarFlashcardCard
          key={cardKey}
          grammar={grammar}
          progress={currentCard as any}
          onAnswer={handleAnswer}
          getPreview={handlePreview}
          level={level}
        />
      </div>
    </div>
  );
};
