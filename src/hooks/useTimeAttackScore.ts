/**
 * タイムアタックスコア管理フック
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { storage } from '../db/storage';

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
  const scoresRef = useRef<ScoreRecord>({});

  // IndexedDBから読み込み
  useEffect(() => {
    storage.getItem<ScoreRecord>(STORAGE_KEY).then((saved) => {
      if (saved) {
        setScores(saved);
        scoresRef.current = saved;
      }
    });
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
    async (
      mode: TimeAttackMode,
      level: TimeAttackLevel,
      direction: TimeAttackDirection,
      newScore: number
    ): Promise<boolean> => {
      const key = getScoreKey(mode, level, direction);

      // IndexedDBから最新データを読み込んで比較（race condition回避）
      let currentScores: ScoreRecord = scoresRef.current;
      const saved = await storage.getItem<ScoreRecord>(STORAGE_KEY);
      if (saved) {
        currentScores = saved;
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
        scoresRef.current = newScores;
        storage.setItem(STORAGE_KEY, newScores);
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
    storage.getItem<ScoreRecord>(STORAGE_KEY).then((saved) => {
      if (saved) {
        setScores(saved);
        scoresRef.current = saved;
      }
    });
  }, []);

  // 全スコアをリセット
  const resetScores = useCallback(() => {
    setScores({});
    scoresRef.current = {};
    storage.removeItem(STORAGE_KEY);
  }, []);

  return {
    getHighScore,
    saveScore,
    formatScore,
    reloadScores,
    resetScores,
  };
}
