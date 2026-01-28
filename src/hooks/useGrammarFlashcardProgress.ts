/**
 * 文法フラッシュカード学習進捗管理フック
 */

import { useState, useEffect, useCallback } from 'react';
import {
  CardProgress,
  AnswerGrade,
  TodayStats,
  DEFAULT_SETTINGS,
  FlashcardSettings,
} from '../types/flashcard';
import { GrammarItem, beginnerGrammar, intermediateGrammar } from '../data/grammarData';
import {
  createInitialProgress,
  processAnswer,
  getStudyQueue,
  getTodayString,
  getIntervalPreview,
} from '../utils/spacedRepetition';
import { storage } from '../db/storage';

const STORAGE_KEY_VERB_PROGRESS = 'verbProgress'; // 共通の練習日記録用

// ローカルタイムゾーンで日付文字列を取得
const getLocalDateString = (date: Date = new Date()): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

type ProgressData = {
  verbs: Record<string, { count: number; lastCompleted?: string }>;
  practiceDates?: string[];
};

// 共通の練習日ストレージに今日を追加
const addToPracticeDates = async (dateString: string) => {
  try {
    const data = await storage.getItem<ProgressData>(STORAGE_KEY_VERB_PROGRESS);
    const progress = data || { verbs: {}, practiceDates: [] };

    if (!progress.practiceDates) {
      progress.practiceDates = [];
    }

    if (!progress.practiceDates.includes(dateString)) {
      progress.practiceDates.push(dateString);
      storage.setItem(STORAGE_KEY_VERB_PROGRESS, progress);
    }
  } catch (e) {
    console.error('Failed to save practice date:', e);
  }
};

type TodayData = {
  date: string;
  newCardsStudied: number;
  reviewsCompleted: number;
  correctCount: number;
  incorrectCount: number;
};

type UseGrammarFlashcardProgressOptions = {
  storageKeyProgress: string;
  storageKeyToday: string;
  grammarData: GrammarItem[];
  settings?: FlashcardSettings;
};

export function useGrammarFlashcardProgress({
  storageKeyProgress,
  storageKeyToday,
  grammarData,
  settings = DEFAULT_SETTINGS,
}: UseGrammarFlashcardProgressOptions) {
  const [progressMap, setProgressMap] = useState<Map<number, CardProgress>>(new Map());
  const [todayData, setTodayData] = useState<TodayData>({
    date: getTodayString(),
    newCardsStudied: 0,
    reviewsCompleted: 0,
    correctCount: 0,
    incorrectCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // IndexedDBから読み込み
  useEffect(() => {
    const loadData = async () => {
      try {
        // 進捗データの読み込み
        const savedProgress = await storage.getItem<CardProgress[]>(storageKeyProgress);
        if (savedProgress) {
          const map = new Map<number, CardProgress>();
          savedProgress.forEach((p) => {
            const updated = { ...p, easeFactor: settings.startingEase };
            map.set(p.wordId, updated);
          });
          setProgressMap(map);
          storage.setItem(storageKeyProgress, Array.from(map.values()));
        }

        // 今日の統計の読み込み
        const savedToday = await storage.getItem<TodayData>(storageKeyToday);
        if (savedToday) {
          if (savedToday.date === getTodayString()) {
            setTodayData(savedToday);
          }
        }
      } catch (e) {
        console.error('Failed to load grammar flashcard progress:', e);
      }
      setIsLoading(false);
    };
    loadData();
  }, [storageKeyProgress, storageKeyToday, settings.startingEase]);

  // 進捗データの保存
  const saveProgress = useCallback((map: Map<number, CardProgress>) => {
    const array = Array.from(map.values());
    storage.setItem(storageKeyProgress, array);
  }, [storageKeyProgress]);

  // 今日の統計の保存
  const saveTodayData = useCallback((data: TodayData) => {
    storage.setItem(storageKeyToday, data);
  }, [storageKeyToday]);

  // 学習キューを取得
  const getQueue = useCallback(() => {
    const allProgress: CardProgress[] = [];

    // 既存の進捗を追加
    progressMap.forEach((p) => allProgress.push(p));

    // まだ進捗がない文法は新規カードとして追加
    const existingIds = new Set(progressMap.keys());
    grammarData.forEach((grammar) => {
      if (!existingIds.has(grammar.id)) {
        allProgress.push(createInitialProgress(grammar.id));
      }
    });

    return getStudyQueue(allProgress, settings);
  }, [progressMap, grammarData, settings]);

  // 今日の統計を取得
  const getTodayStats = useCallback((): TodayStats => {
    const queue = getQueue();
    const remainingNew = Math.max(0, settings.newCardsPerDay - todayData.newCardsStudied);

    return {
      newCardsRemaining: Math.min(remainingNew, queue.newCards.length),
      reviewCardsRemaining: queue.dueCards.length,
      learningCardsRemaining: queue.learningCards.length,
      completedToday: todayData.newCardsStudied + todayData.reviewsCompleted,
    };
  }, [getQueue, todayData, settings]);

  // 次のカードを取得
  const getNextCard = useCallback((): CardProgress | null => {
    const queue = getQueue();
    const stats = getTodayStats();

    // 優先度: Learning/Relearning → Review → New
    if (queue.learningCards.length > 0) {
      return queue.learningCards[0];
    }

    if (queue.dueCards.length > 0) {
      return queue.dueCards[0];
    }

    if (stats.newCardsRemaining > 0 && queue.newCards.length > 0) {
      return queue.newCards[0];
    }

    return null;
  }, [getQueue, getTodayStats]);

  // 更新後のマップを使って次のカードを取得するヘルパー
  const getNextCardFromMap = useCallback(
    (map: Map<number, CardProgress>, newTodayData: TodayData): CardProgress | null => {
      const allProgress: CardProgress[] = [];

      // 既存の進捗を追加
      map.forEach((p) => allProgress.push(p));

      // まだ進捗がない文法は新規カードとして追加
      const existingIds = new Set(map.keys());
      grammarData.forEach((grammar) => {
        if (!existingIds.has(grammar.id)) {
          allProgress.push(createInitialProgress(grammar.id));
        }
      });

      const queue = getStudyQueue(allProgress, settings);
      const remainingNew = Math.max(0, settings.newCardsPerDay - newTodayData.newCardsStudied);

      // 優先度: Learning/Relearning → Review → New
      if (queue.learningCards.length > 0) {
        return queue.learningCards[0];
      }

      if (queue.dueCards.length > 0) {
        return queue.dueCards[0];
      }

      if (remainingNew > 0 && queue.newCards.length > 0) {
        return queue.newCards[0];
      }

      return null;
    },
    [grammarData, settings]
  );

  // 回答を処理（次のカードも返す）
  const answerCard = useCallback(
    (grammarId: number, grade: AnswerGrade): { updated: CardProgress; nextCard: CardProgress | null } => {
      const currentProgress = progressMap.get(grammarId) || createInitialProgress(grammarId);
      const wasNew = currentProgress.state === 'new';
      const wasReview = currentProgress.state === 'review';

      // 進捗を更新
      const updatedProgress = processAnswer(currentProgress, grade, settings);

      // マップを更新
      const newMap = new Map(progressMap);
      newMap.set(grammarId, updatedProgress);
      setProgressMap(newMap);
      saveProgress(newMap);

      // 今日の統計を更新
      const newTodayData = { ...todayData };

      if (wasNew) {
        newTodayData.newCardsStudied++;
      } else if (wasReview) {
        newTodayData.reviewsCompleted++;
      }

      if (grade === 'good') {
        newTodayData.correctCount++;
      } else {
        newTodayData.incorrectCount++;
      }

      setTodayData(newTodayData);
      saveTodayData(newTodayData);

      // 共通の練習日記録に追加（カレンダーにはなまる表示用）
      addToPracticeDates(getLocalDateString());

      // 更新後のマップから次のカードを取得
      const nextCard = getNextCardFromMap(newMap, newTodayData);

      return { updated: updatedProgress, nextCard };
    },
    [progressMap, todayData, settings, saveProgress, saveTodayData, getNextCardFromMap]
  );

  // ボタン押下時の間隔プレビュー
  const getButtonPreview = useCallback(
    (grammarId: number, grade: AnswerGrade): string => {
      const progress = progressMap.get(grammarId) || createInitialProgress(grammarId);
      return getIntervalPreview(progress, grade, settings);
    },
    [progressMap, settings]
  );

  // 全体の統計
  const getOverallStats = useCallback(() => {
    let newCount = 0;
    let learningCount = 0;
    let relearningCount = 0;
    let reviewCount = 0;
    let matureCount = 0; // interval >= 21日

    const existingIds = new Set(progressMap.keys());
    const totalGrammar = grammarData.length;

    progressMap.forEach((p) => {
      switch (p.state) {
        case 'new':
          newCount++;
          break;
        case 'learning':
          learningCount++;
          break;
        case 'relearning':
          relearningCount++;
          break;
        case 'review':
          if (p.interval >= 21) {
            matureCount++;
          } else {
            reviewCount++;
          }
          break;
      }
    });

    // まだ進捗がない文法は新規
    newCount += totalGrammar - existingIds.size;

    return {
      total: totalGrammar,
      new: newCount,
      learning: learningCount,
      relearning: relearningCount,
      young: reviewCount,
      mature: matureCount,
    };
  }, [progressMap, grammarData]);

  // データのリセット
  const resetProgress = useCallback(() => {
    setProgressMap(new Map());
    setTodayData({
      date: getTodayString(),
      newCardsStudied: 0,
      reviewsCompleted: 0,
      correctCount: 0,
      incorrectCount: 0,
    });
    storage.removeItem(storageKeyProgress);
    storage.removeItem(storageKeyToday);
  }, [storageKeyProgress, storageKeyToday]);

  return {
    isLoading,
    getNextCard,
    answerCard,
    getTodayStats,
    getOverallStats,
    getButtonPreview,
    resetProgress,
    progressMap,
  };
}

// 初級文法用フック
export function useBeginnerGrammarProgress() {
  return useGrammarFlashcardProgress({
    storageKeyProgress: 'grammar-beginner-progress',
    storageKeyToday: 'grammar-beginner-today',
    grammarData: beginnerGrammar,
  });
}

// 中級文法用フック
export function useIntermediateGrammarProgress() {
  return useGrammarFlashcardProgress({
    storageKeyProgress: 'grammar-intermediate-progress',
    storageKeyToday: 'grammar-intermediate-today',
    grammarData: intermediateGrammar,
  });
}
