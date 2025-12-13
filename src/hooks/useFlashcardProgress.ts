/**
 * フラッシュカード学習進捗管理フック
 */

import { useState, useEffect, useCallback } from 'react';
import {
  CardProgress,
  AnswerGrade,
  TodayStats,
  DEFAULT_SETTINGS,
  FlashcardSettings,
} from '../types/flashcard';
import { topikWords, getTotalWordCount } from '../data/topikWords';
import {
  createInitialProgress,
  processAnswer,
  getStudyQueue,
  getTodayString,
  getIntervalPreview,
} from '../utils/spacedRepetition';

const STORAGE_KEY_PROGRESS = 'flashcard-progress';
const STORAGE_KEY_SESSIONS = 'flashcard-sessions';
const STORAGE_KEY_TODAY = 'flashcard-today-stats';

type TodayData = {
  date: string;
  newCardsStudied: number;
  reviewsCompleted: number;
  correctCount: number;
  incorrectCount: number;
};

export function useFlashcardProgress(settings: FlashcardSettings = DEFAULT_SETTINGS) {
  const [progressMap, setProgressMap] = useState<Map<number, CardProgress>>(new Map());
  const [todayData, setTodayData] = useState<TodayData>({
    date: getTodayString(),
    newCardsStudied: 0,
    reviewsCompleted: 0,
    correctCount: 0,
    incorrectCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // localStorageから読み込み
  useEffect(() => {
    try {
      // 進捗データの読み込み
      const savedProgress = localStorage.getItem(STORAGE_KEY_PROGRESS);
      if (savedProgress) {
        const parsed: CardProgress[] = JSON.parse(savedProgress);
        const map = new Map<number, CardProgress>();
        parsed.forEach((p) => map.set(p.wordId, p));
        setProgressMap(map);
      }

      // 今日の統計の読み込み
      const savedToday = localStorage.getItem(STORAGE_KEY_TODAY);
      if (savedToday) {
        const parsed: TodayData = JSON.parse(savedToday);
        // 日付が変わっていたらリセット
        if (parsed.date === getTodayString()) {
          setTodayData(parsed);
        }
      }
    } catch (e) {
      console.error('Failed to load flashcard progress:', e);
    }
    setIsLoading(false);
  }, []);

  // 進捗データの保存
  const saveProgress = useCallback((map: Map<number, CardProgress>) => {
    const array = Array.from(map.values());
    localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify(array));
  }, []);

  // 今日の統計の保存
  const saveTodayData = useCallback((data: TodayData) => {
    localStorage.setItem(STORAGE_KEY_TODAY, JSON.stringify(data));
  }, []);

  // 学習キューを取得
  const getQueue = useCallback(() => {
    const allProgress: CardProgress[] = [];

    // 既存の進捗を追加
    progressMap.forEach((p) => allProgress.push(p));

    // まだ進捗がない単語は新規カードとして追加
    const existingIds = new Set(progressMap.keys());
    topikWords.forEach((word) => {
      if (!existingIds.has(word.id)) {
        allProgress.push(createInitialProgress(word.id));
      }
    });

    return getStudyQueue(allProgress, settings);
  }, [progressMap, settings]);

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

      // まだ進捗がない単語は新規カードとして追加
      const existingIds = new Set(map.keys());
      topikWords.forEach((word) => {
        if (!existingIds.has(word.id)) {
          allProgress.push(createInitialProgress(word.id));
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
    [settings]
  );

  // 回答を処理（次のカードも返す）
  const answerCard = useCallback(
    (wordId: number, grade: AnswerGrade): { updated: CardProgress; nextCard: CardProgress | null } => {
      const currentProgress = progressMap.get(wordId) || createInitialProgress(wordId);
      const wasNew = currentProgress.state === 'new';
      const wasReview = currentProgress.state === 'review';

      // 進捗を更新
      const updatedProgress = processAnswer(currentProgress, grade, settings);

      // マップを更新
      const newMap = new Map(progressMap);
      newMap.set(wordId, updatedProgress);
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

      // 更新後のマップから次のカードを取得
      const nextCard = getNextCardFromMap(newMap, newTodayData);

      return { updated: updatedProgress, nextCard };
    },
    [progressMap, todayData, settings, saveProgress, saveTodayData, getNextCardFromMap]
  );

  // ボタン押下時の間隔プレビュー
  const getButtonPreview = useCallback(
    (wordId: number, grade: AnswerGrade): string => {
      const progress = progressMap.get(wordId) || createInitialProgress(wordId);
      return getIntervalPreview(progress, grade, settings);
    },
    [progressMap, settings]
  );

  // 全体の統計
  const getOverallStats = useCallback(() => {
    let newCount = 0;
    let learningCount = 0;
    let reviewCount = 0;
    let matureCount = 0; // interval >= 21日

    const existingIds = new Set(progressMap.keys());
    const totalWords = getTotalWordCount();

    progressMap.forEach((p) => {
      switch (p.state) {
        case 'new':
          newCount++;
          break;
        case 'learning':
        case 'relearning':
          learningCount++;
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

    // まだ進捗がない単語は新規
    newCount += totalWords - existingIds.size;

    return {
      total: totalWords,
      new: newCount,
      learning: learningCount,
      young: reviewCount,
      mature: matureCount,
    };
  }, [progressMap]);

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
    localStorage.removeItem(STORAGE_KEY_PROGRESS);
    localStorage.removeItem(STORAGE_KEY_TODAY);
    localStorage.removeItem(STORAGE_KEY_SESSIONS);
  }, []);

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
