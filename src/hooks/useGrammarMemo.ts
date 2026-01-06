/**
 * 文法ごとのメモを管理するフック
 */

import { useState, useEffect, useCallback } from 'react';

type MemoData = Record<number, string>;

export type GrammarLevel = 'beginner' | 'intermediate';

function getStorageKey(level: GrammarLevel): string {
  return level === 'beginner' ? 'grammar-memos' : 'grammar-memos-intermediate';
}

export function useGrammarMemo(level: GrammarLevel = 'beginner') {
  const [memos, setMemos] = useState<MemoData>({});
  const storageKey = getStorageKey(level);

  // localStorageから読み込み
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setMemos(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load grammar memos:', e);
    }
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
      localStorage.setItem(storageKey, JSON.stringify(updated));
      return updated;
    });
  }, [storageKey]);

  // メモがあるかチェック
  const hasMemo = useCallback((grammarId: number): boolean => {
    return Boolean(memos[grammarId]);
  }, [memos]);

  return { getMemo, setMemo, hasMemo };
}
