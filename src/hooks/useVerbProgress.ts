/**
 * 動詞進捗管理フック
 */

import { useState, useEffect, useCallback } from 'react';
import { storage } from '../db/storage';

const PROGRESS_KEY = 'verbProgress';

type VerbProgress = {
  count: number;
  lastCompleted?: string;
};

type ProgressData = {
  verbs: Record<string, VerbProgress>;
  practiceDates?: string[];
};

// ローカルタイムゾーンで日付文字列を取得
const getLocalDateString = (date: Date = new Date()): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export function useVerbProgress() {
  const [progressData, setProgressData] = useState<ProgressData>({
    verbs: {},
    practiceDates: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  // IndexedDBから読み込み
  useEffect(() => {
    storage.getItem<ProgressData>(PROGRESS_KEY).then((data) => {
      if (data) {
        if (!data.practiceDates) {
          data.practiceDates = [];
        }
        setProgressData(data);
      }
      setIsLoading(false);
    });
  }, []);

  // 動詞の完了回数を取得
  const getVerbCount = useCallback(
    (verbBase: string): number => {
      return progressData.verbs[verbBase]?.count || 0;
    },
    [progressData]
  );

  // 動詞の完了回数を増やす
  const incrementVerbCount = useCallback((verbBase: string) => {
    setProgressData((prev) => {
      const currentCount = prev.verbs[verbBase]?.count || 0;
      const today = getLocalDateString();

      const newVerbs = {
        ...prev.verbs,
        [verbBase]: {
          count: currentCount + 1,
          lastCompleted: today,
        },
      };

      const newPracticeDates = prev.practiceDates || [];
      if (!newPracticeDates.includes(today)) {
        newPracticeDates.push(today);
      }

      const newData = {
        verbs: newVerbs,
        practiceDates: newPracticeDates,
      };

      storage.setItem(PROGRESS_KEY, newData);
      return newData;
    });
  }, []);

  // 練習日を取得
  const getPracticeDates = useCallback((): Set<string> => {
    const dates = new Set<string>();

    // practiceDates配列から取得
    if (progressData.practiceDates && progressData.practiceDates.length > 0) {
      progressData.practiceDates.forEach((dateString) => {
        // 古い形式（ISO文字列）の場合は変換
        if (dateString.includes('T')) {
          const date = new Date(dateString);
          dateString = getLocalDateString(date);
        }
        dates.add(dateString);
      });
    }

    // 後方互換性: 古いデータからも取得（マイグレーション）
    Object.values(progressData.verbs).forEach((verb) => {
      if (verb.lastCompleted) {
        let dateString = verb.lastCompleted;
        if (dateString.includes('T')) {
          const date = new Date(dateString);
          dateString = getLocalDateString(date);
        }
        dates.add(dateString);
      }
    });

    return dates;
  }, [progressData]);

  // 連続日数を取得
  const getStreakDays = useCallback((): number => {
    const dates = getPracticeDates();
    let streak = 0;
    const currentDate = new Date();
    const today = getLocalDateString(currentDate);

    // 今日練習している場合は今日から、していない場合は昨日から計算
    if (!dates.has(today)) {
      currentDate.setDate(currentDate.getDate() - 1);
    }

    while (true) {
      const dateString = getLocalDateString(currentDate);
      if (dates.has(dateString)) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  }, [getPracticeDates]);

  return {
    isLoading,
    getVerbCount,
    incrementVerbCount,
    getPracticeDates,
    getStreakDays,
  };
}
