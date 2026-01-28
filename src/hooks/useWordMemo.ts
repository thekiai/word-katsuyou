/**
 * 単語ごとのメモを管理するフック
 */

import { useState, useEffect, useCallback } from 'react';
import { storage } from '../db/storage';

type MemoData = Record<number, string>;

export type WordLevel = 'beginner' | 'intermediate';

function getStorageKey(level: WordLevel): string {
  return level === 'beginner' ? 'word-memos' : 'word-memos-intermediate';
}

export function useWordMemo(level: WordLevel = 'beginner') {
  const [memos, setMemos] = useState<MemoData>({});
  const storageKey = getStorageKey(level);

  // IndexedDBから読み込み
  useEffect(() => {
    storage.getItem<MemoData>(storageKey).then((saved) => {
      if (saved) {
        setMemos(saved);
      }
    });
  }, [storageKey]);

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
      storage.setItem(storageKey, updated);
      return updated;
    });
  }, [storageKey]);

  // メモがあるかチェック
  const hasMemo = useCallback((wordId: number): boolean => {
    return Boolean(memos[wordId]);
  }, [memos]);

  return { getMemo, setMemo, hasMemo };
}
