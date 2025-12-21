/**
 * 単語ごとのメモを管理するフック
 */

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'word-memos';

type MemoData = Record<number, string>;

export function useWordMemo() {
  const [memos, setMemos] = useState<MemoData>({});

  // localStorageから読み込み
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setMemos(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load word memos:', e);
    }
  }, []);

  // メモを取得
  const getMemo = useCallback((wordId: number): string => {
    return memos[wordId] || '';
  }, [memos]);

  // メモを保存
  const setMemo = useCallback((wordId: number, memo: string) => {
    setMemos((prev) => {
      const updated = { ...prev };
      if (memo.trim()) {
        updated[wordId] = memo;
      } else {
        delete updated[wordId];
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // メモがあるかチェック
  const hasMemo = useCallback((wordId: number): boolean => {
    return Boolean(memos[wordId]);
  }, [memos]);

  return { getMemo, setMemo, hasMemo };
}
