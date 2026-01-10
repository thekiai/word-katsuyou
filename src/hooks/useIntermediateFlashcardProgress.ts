/**
 * 中級フラッシュカード学習進捗管理フック（韓国語→日本語）
 */

import { useState, useEffect, useCallback } from 'react';
import {
  CardProgress,
  AnswerGrade,
  TodayStats,
  DEFAULT_SETTINGS,
  FlashcardSettings,
} from '../types/flashcard';
import { topikWords2, getTotalWordCount2 } from '../data/topikWords2';
import {
  createInitialProgress,
  processAnswer,
  getStudyQueue,
  getTodayString,
  getIntervalPreview,
} from '../utils/spacedRepetition';

const STORAGE_KEY_PROGRESS = 'intermediate-flashcard-progress';
const STORAGE_KEY_TODAY = 'intermediate-flashcard-today-stats';
const STORAGE_KEY_VERB_PROGRESS = 'verbProgress';

const getLocalDateString = (date: Date = new Date()): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const addToPracticeDates = (dateString: string) => {
  try {
    const data = localStorage.getItem(STORAGE_KEY_VERB_PROGRESS);
    const progress = data ? JSON.parse(data) : { verbs: {}, practiceDates: [] };

    if (!progress.practiceDates) {
      progress.practiceDates = [];
    }

    if (!progress.practiceDates.includes(dateString)) {
      progress.practiceDates.push(dateString);
      localStorage.setItem(STORAGE_KEY_VERB_PROGRESS, JSON.stringify(progress));
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

export function useIntermediateFlashcardProgress(settings: FlashcardSettings = DEFAULT_SETTINGS) {
  const [progressMap, setProgressMap] = useState<Map<number, CardProgress>>(new Map());
  const [todayData, setTodayData] = useState<TodayData>({
    date: getTodayString(),
    newCardsStudied: 0,
    reviewsCompleted: 0,
    correctCount: 0,
    incorrectCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const savedProgress = localStorage.getItem(STORAGE_KEY_PROGRESS);
      if (savedProgress) {
        const parsed: CardProgress[] = JSON.parse(savedProgress);
        const map = new Map<number, CardProgress>();
        // 既存データのeaseFactorを新しい設定値に更新
        parsed.forEach((p) => {
          const updated = { ...p, easeFactor: settings.startingEase };
          map.set(p.wordId, updated);
        });
        setProgressMap(map);
        // 更新したデータを保存
        localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify(Array.from(map.values())));
      }

      const savedToday = localStorage.getItem(STORAGE_KEY_TODAY);
      if (savedToday) {
        const parsed: TodayData = JSON.parse(savedToday);
        if (parsed.date === getTodayString()) {
          setTodayData(parsed);
        }
      }
    } catch (e) {
      console.error('Failed to load intermediate flashcard progress:', e);
    }
    setIsLoading(false);
  }, []);

  const saveProgress = useCallback((map: Map<number, CardProgress>) => {
    const array = Array.from(map.values());
    localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify(array));
  }, []);

  const saveTodayData = useCallback((data: TodayData) => {
    localStorage.setItem(STORAGE_KEY_TODAY, JSON.stringify(data));
  }, []);

  const getQueue = useCallback(() => {
    const allProgress: CardProgress[] = [];
    progressMap.forEach((p) => allProgress.push(p));

    const existingIds = new Set(progressMap.keys());
    topikWords2.forEach((word) => {
      if (!existingIds.has(word.id)) {
        allProgress.push(createInitialProgress(word.id));
      }
    });

    return getStudyQueue(allProgress, settings);
  }, [progressMap, settings]);

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

  const getNextCard = useCallback((): CardProgress | null => {
    const queue = getQueue();
    const stats = getTodayStats();

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

  const getNextCardFromMap = useCallback(
    (map: Map<number, CardProgress>, newTodayData: TodayData): CardProgress | null => {
      const allProgress: CardProgress[] = [];
      map.forEach((p) => allProgress.push(p));

      const existingIds = new Set(map.keys());
      topikWords2.forEach((word) => {
        if (!existingIds.has(word.id)) {
          allProgress.push(createInitialProgress(word.id));
        }
      });

      const queue = getStudyQueue(allProgress, settings);
      const remainingNew = Math.max(0, settings.newCardsPerDay - newTodayData.newCardsStudied);

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

  const answerCard = useCallback(
    (wordId: number, grade: AnswerGrade): { updated: CardProgress; nextCard: CardProgress | null } => {
      const currentProgress = progressMap.get(wordId) || createInitialProgress(wordId);
      const wasNew = currentProgress.state === 'new';
      const wasReview = currentProgress.state === 'review';

      const updatedProgress = processAnswer(currentProgress, grade, settings);

      const newMap = new Map(progressMap);
      newMap.set(wordId, updatedProgress);
      setProgressMap(newMap);
      saveProgress(newMap);

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
      addToPracticeDates(getLocalDateString());

      const nextCard = getNextCardFromMap(newMap, newTodayData);

      return { updated: updatedProgress, nextCard };
    },
    [progressMap, todayData, settings, saveProgress, saveTodayData, getNextCardFromMap]
  );

  const getButtonPreview = useCallback(
    (wordId: number, grade: AnswerGrade): string => {
      const progress = progressMap.get(wordId) || createInitialProgress(wordId);
      return getIntervalPreview(progress, grade, settings);
    },
    [progressMap, settings]
  );

  const getOverallStats = useCallback(() => {
    let newCount = 0;
    let learningCount = 0;
    let relearningCount = 0;
    let reviewCount = 0;
    let matureCount = 0;

    const existingIds = new Set(progressMap.keys());
    const totalWords = getTotalWordCount2();

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

    newCount += totalWords - existingIds.size;

    return {
      total: totalWords,
      new: newCount,
      learning: learningCount,
      relearning: relearningCount,
      young: reviewCount,
      mature: matureCount,
    };
  }, [progressMap]);

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
