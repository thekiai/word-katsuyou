/**
 * タイムアタックスコア管理フック
 */

import { useState, useEffect, useCallback } from 'react';

export type TimeAttackMode = '10sec' | '10words';
export type TimeAttackLevel = 'beginner' | 'intermediate';
export type TimeAttackDirection = 'kr-jp' | 'jp-kr';

export type TimeAttackScore = {
  mode: TimeAttackMode;
  level: TimeAttackLevel;
  direction: TimeAttackDirection;
  score: number; // 10sec: 正解数, 10words: タイム(ms)
  date: string;
};

type ScoreRecord = {
  [key: string]: TimeAttackScore;
};

const STORAGE_KEY = 'time-attack-scores';

// スコアのキーを生成
const getScoreKey = (
  mode: TimeAttackMode,
  level: TimeAttackLevel,
  direction: TimeAttackDirection
): string => {
  return `${mode}-${level}-${direction}`;
};

export function useTimeAttackScore() {
  const [scores, setScores] = useState<ScoreRecord>({});

  // localStorageから読み込み
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setScores(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load time attack scores:', e);
    }
  }, []);

  // ハイスコアを取得
  const getHighScore = useCallback(
    (
      mode: TimeAttackMode,
      level: TimeAttackLevel,
      direction: TimeAttackDirection
    ): TimeAttackScore | null => {
      const key = getScoreKey(mode, level, direction);
      return scores[key] || null;
    },
    [scores]
  );

  // スコアを保存（ハイスコア更新時のみ）
  const saveScore = useCallback(
    (
      mode: TimeAttackMode,
      level: TimeAttackLevel,
      direction: TimeAttackDirection,
      newScore: number
    ): boolean => {
      const key = getScoreKey(mode, level, direction);

      // 直接localStorageから読み込んで比較（race condition回避）
      let currentScores: ScoreRecord = {};
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          currentScores = JSON.parse(saved);
        }
      } catch (e) {
        console.error('Failed to load scores:', e);
      }

      const existingScore = currentScores[key];

      // ハイスコア判定
      // 10sec: スコアが高いほど良い
      // 10words: タイムが低いほど良い
      let isNewHighScore = false;
      if (!existingScore) {
        isNewHighScore = true;
      } else if (mode === '10sec') {
        isNewHighScore = newScore > existingScore.score;
      } else {
        isNewHighScore = newScore < existingScore.score;
      }

      if (isNewHighScore) {
        const newScoreRecord: TimeAttackScore = {
          mode,
          level,
          direction,
          score: newScore,
          date: new Date().toISOString(),
        };

        const newScores = { ...currentScores, [key]: newScoreRecord };
        setScores(newScores);

        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(newScores));
        } catch (e) {
          console.error('Failed to save time attack score:', e);
        }
      }

      return isNewHighScore;
    },
    []
  );

  // スコアをフォーマット
  const formatScore = useCallback(
    (mode: TimeAttackMode, score: number): string => {
      if (mode === '10sec') {
        return `${score}問`;
      } else {
        const seconds = (score / 1000).toFixed(1);
        return `${seconds}秒`;
      }
    },
    []
  );

  // スコアを再読み込み
  const reloadScores = useCallback(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setScores(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to reload time attack scores:', e);
    }
  }, []);

  // 全スコアをリセット
  const resetScores = useCallback(() => {
    setScores({});
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    getHighScore,
    saveScore,
    formatScore,
    reloadScores,
    resetScores,
  };
}
