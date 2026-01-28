/**
 * 文法ごとのメモを管理するフック
 */

import { useState, useEffect, useCallback } from 'react';
import { storage } from '../db/storage';

type MemoData = Record<number, string>;

export type GrammarLevel = 'beginner' | 'intermediate';

function getStorageKey(level: GrammarLevel): string {
  return level === 'beginner' ? 'grammar-memos' : 'grammar-memos-intermediate';
}

export function useGrammarMemo(level: GrammarLevel = 'beginner') {
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
  const getMemo = useCallback((grammarId: number): string => {
    return memos[grammarId] || '';
  }, [memos]);

  // メモを保存
  const setMemo = useCallback((grammarId: number, memo: string) => {
    setMemos((prev) => {
      const updated = { ...prev };
      if (memo.trim()) {
        updated[grammarId] = memo;
      } else {
        delete updated[grammarId];
      }
      storage.setItem(storageKey, updated);
      return updated;
    });
  }, [storageKey]);

  // メモがあるかチェック
  const hasMemo = useCallback((grammarId: number): boolean => {
    return Boolean(memos[grammarId]);
  }, [memos]);

  return { getMemo, setMemo, hasMemo };
}
