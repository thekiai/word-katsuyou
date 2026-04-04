/**
 * ホーム画面用の進捗情報を取得するフック
 * 各学習モードの進捗率を軽量に読み込む
 */

import { useState, useEffect } from 'react';
import { storage } from '../db/storage';
import { CardProgress } from '../types/flashcard';

export type ProgressInfo = {
  total: number;
  learning: number;    // 学習中 (orange)
  young: number;       // 復習中 (blue)
  relearning: number;  // 再学習 (red)
  mature: number;      // 定着 (green)
};

type HomeProgress = {
  isLoading: boolean;
  wordsKoJa: ProgressInfo;
  wordsJaKo: ProgressInfo;
  wordsIntKoJa: ProgressInfo;
  wordsIntJaKo: ProgressInfo;
  grammarBegKoJa: ProgressInfo;
  grammarBegJaKo: ProgressInfo;
  grammarIntKoJa: ProgressInfo;
  grammarIntJaKo: ProgressInfo;
};

const TOTALS = {
  beginnerWords: 1671,
  intermediateWords: 2662,
  beginnerGrammar: 84,
  intermediateGrammar: 148,
};

const STORAGE_KEYS = {
  wordsKoJa: 'flashcard-progress',
  wordsJaKo: 'reverse-flashcard-progress',
  wordsIntKoJa: 'intermediate-flashcard-progress',
  wordsIntJaKo: 'reverse-intermediate-flashcard-progress',
  grammarBegKoJa: 'grammar-beginner-progress',
  grammarBegJaKo: 'reverse-grammar-beginner-progress',
  grammarIntKoJa: 'grammar-intermediate-progress',
  grammarIntJaKo: 'reverse-grammar-intermediate-progress',
};

const calcStats = (progress: CardProgress[] | null, total: number): ProgressInfo => {
  if (!progress) return { total, learning: 0, young: 0, relearning: 0, mature: 0 };

  let learning = 0;
  let young = 0;
  let relearning = 0;
  let mature = 0;

  for (const p of progress) {
    switch (p.state) {
      case 'learning':
        learning++;
        break;
      case 'relearning':
        relearning++;
        break;
      case 'review':
        if (p.interval >= 21) {
          mature++;
        } else {
          young++;
        }
        break;
    }
  }

  return { total, learning, young, relearning, mature };
};

const empty: ProgressInfo = { total: 0, learning: 0, young: 0, relearning: 0, mature: 0 };

export function useHomeProgress(): HomeProgress {
  const [data, setData] = useState<HomeProgress>({
    isLoading: true,
    wordsKoJa: empty,
    wordsJaKo: empty,
    wordsIntKoJa: empty,
    wordsIntJaKo: empty,
    grammarBegKoJa: empty,
    grammarBegJaKo: empty,
    grammarIntKoJa: empty,
    grammarIntJaKo: empty,
  });

  useEffect(() => {
    const load = async () => {
      const [
        wKJ, wJK, wiKJ, wiJK,
        gbKJ, gbJK, giKJ, giJK,
      ] = await Promise.all([
        storage.getItem<CardProgress[]>(STORAGE_KEYS.wordsKoJa),
        storage.getItem<CardProgress[]>(STORAGE_KEYS.wordsJaKo),
        storage.getItem<CardProgress[]>(STORAGE_KEYS.wordsIntKoJa),
        storage.getItem<CardProgress[]>(STORAGE_KEYS.wordsIntJaKo),
        storage.getItem<CardProgress[]>(STORAGE_KEYS.grammarBegKoJa),
        storage.getItem<CardProgress[]>(STORAGE_KEYS.grammarBegJaKo),
        storage.getItem<CardProgress[]>(STORAGE_KEYS.grammarIntKoJa),
        storage.getItem<CardProgress[]>(STORAGE_KEYS.grammarIntJaKo),
      ]);

      setData({
        isLoading: false,
        wordsKoJa: calcStats(wKJ, TOTALS.beginnerWords),
        wordsJaKo: calcStats(wJK, TOTALS.beginnerWords),
        wordsIntKoJa: calcStats(wiKJ, TOTALS.intermediateWords),
        wordsIntJaKo: calcStats(wiJK, TOTALS.intermediateWords),
        grammarBegKoJa: calcStats(gbKJ, TOTALS.beginnerGrammar),
        grammarBegJaKo: calcStats(gbJK, TOTALS.beginnerGrammar),
        grammarIntKoJa: calcStats(giKJ, TOTALS.intermediateGrammar),
        grammarIntJaKo: calcStats(giJK, TOTALS.intermediateGrammar),
      });
    };
    load();
  }, []);

  return data;
}
