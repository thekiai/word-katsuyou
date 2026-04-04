/**
 * 文法フラッシュカード学習画面
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { GrammarItem, GrammarLevel } from '../../data/grammarData';
import { AnswerGrade, CardProgress } from '../../types/flashcard';
import { GrammarFlashcardCard, GrammarDirection } from './GrammarFlashcardCard';
import { ReverseGrammarFlashcardCard } from './ReverseGrammarFlashcardCard';
import { CommonHeader } from '../CommonHeader';

type GrammarFlashcardStudyProps = {
  title: string;
  grammarData: GrammarItem[];
  useProgressHook: () => {
    isLoading: boolean;
    getNextCard: () => CardProgress | null;
    answerCard: (id: number, grade: AnswerGrade) => { nextCard: CardProgress | null };
    getTodayStats: () => {
      newCardsRemaining: number;
      learningCardsRemaining: number;
      reviewCardsRemaining: number;
      relearningCardsRemaining: number;
      completedToday: number;
    };
    getButtonPreview: (id: number, grade: AnswerGrade) => string;
  };
  onBack?: () => void;
  level?: GrammarLevel;
  direction?: GrammarDirection;
};

export const GrammarFlashcardStudy = ({
  title,
  grammarData,
  useProgressHook,
  onBack,
  level = 'beginner',
  direction = 'ko-ja',
}: GrammarFlashcardStudyProps) => {
  const navigate = useNavigate();
  const {
    isLoading,
    getNextCard,
    answerCard,
    getTodayStats,
    getButtonPreview,
  } = useProgressHook();

  const [currentCard, setCurrentCard] = useState<CardProgress | null>(null);
  const [cardKey, setCardKey] = useState(0);
  const [initialized, setInitialized] = useState(false);

  // 常に最新の関数を参照するためのref
  const getNextCardRef = useRef(getNextCard);
  getNextCardRef.current = getNextCard;
  const currentCardRef = useRef(currentCard);
  currentCardRef.current = currentCard;

  // 初回のみ次のカードを取得
  useEffect(() => {
    if (!isLoading && !initialized) {
      setCurrentCard(getNextCard());
      setInitialized(true);
    }
  }, [isLoading, initialized, getNextCard]);

  // 再学習/学習カードがdueになったら表示する（常時ポーリング）
  useEffect(() => {
    if (!initialized) return;
    const timer = setInterval(() => {
      if (!currentCardRef.current) {
        const next = getNextCardRef.current();
        if (next) {
          setCurrentCard(next);
          setCardKey((k) => k + 1);
        }
      }
    }, 10000);
    return () => clearInterval(timer);
  }, [initialized]);

  const handleAnswer = useCallback(
    (grade: AnswerGrade) => {
      if (!currentCard) return;

      const { nextCard } = answerCard(currentCard.wordId, grade);
      setCardKey((k) => k + 1);
      setCurrentCard(nextCard);
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
    stats.relearningCardsRemaining +
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
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span className="text-gray-600">{stats.relearningCardsRemaining}</span>
          </div>
        </div>
      </div>

      {/* カード */}
      <div className="flex-1 flex items-start justify-center px-4 pt-4">
        {direction === 'ja-ko' ? (
          <ReverseGrammarFlashcardCard
            key={cardKey}
            grammar={grammar}
            progress={currentCard!}
            onAnswer={handleAnswer}
            level={level}
          />
        ) : (
          <GrammarFlashcardCard
            key={cardKey}
            grammar={grammar}
            progress={currentCard!}
            onAnswer={handleAnswer}
            getPreview={handlePreview}
            level={level}
            direction={direction}
          />
        )}
      </div>
    </div>
  );
};
