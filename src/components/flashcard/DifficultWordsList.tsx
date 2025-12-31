/**
 * 覚えづらい単語リストコンポーネント
 */

import { useState, useMemo, useEffect } from 'react';
import { Volume2, X, RefreshCw, StickyNote } from 'lucide-react';
import { Word } from '../../types/flashcard';
import { CardProgress } from '../../types/flashcard';
import { useSpeechSynthesis } from '../../hooks/useSpeechSynthesis';
import { useWordMemo, WordLevel } from '../../hooks/useWordMemo';
import { CommonHeader } from '../CommonHeader';

type DifficultWordsListProps = {
  title: string;
  words: Word[];
  progressMap: Map<number, CardProgress>;
  storageKey: string;
  level: WordLevel;
  onBack: () => void;
};

export const DifficultWordsList = ({
  title,
  words,
  progressMap,
  storageKey,
  level,
  onBack,
}: DifficultWordsListProps) => {
  const [excludedIds, setExcludedIds] = useState<Set<number>>(new Set());
  const [showExcluded, setShowExcluded] = useState(false);
  const [editingWordId, setEditingWordId] = useState<number | null>(null);
  const [editingMemo, setEditingMemo] = useState('');
  const { speak, isSpeaking, currentText } = useSpeechSynthesis();
  const { getMemo, setMemo } = useWordMemo(level);

  const handleEditMemo = (wordId: number) => {
    setEditingWordId(wordId);
    setEditingMemo(getMemo(wordId));
  };

  const handleSaveMemo = () => {
    if (editingWordId !== null) {
      setMemo(editingWordId, editingMemo);
      setEditingWordId(null);
      setEditingMemo('');
    }
  };

  const handleCancelEdit = () => {
    setEditingWordId(null);
    setEditingMemo('');
  };

  // localStorageから除外リストを読み込み
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setExcludedIds(new Set(JSON.parse(saved)));
      }
    } catch (e) {
      console.error('Failed to load excluded words:', e);
    }
  }, [storageKey]);

  // 除外リストを保存
  const saveExcludedIds = (ids: Set<number>) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify([...ids]));
    } catch (e) {
      console.error('Failed to save excluded words:', e);
    }
  };

  // lapses数でソートした単語リスト
  const difficultWords = useMemo(() => {
    return words
      .map((word) => {
        const progress = progressMap.get(word.id);
        return {
          word,
          lapses: progress?.lapses || 0,
          isExcluded: excludedIds.has(word.id),
        };
      })
      .filter((item) => item.lapses > 0) // lapses > 0 のみ
      .filter((item) => (showExcluded ? item.isExcluded : !item.isExcluded))
      .sort((a, b) => b.lapses - a.lapses);
  }, [words, progressMap, excludedIds, showExcluded]);

  const excludedCount = useMemo(() => {
    return words.filter((word) => {
      const progress = progressMap.get(word.id);
      return (progress?.lapses || 0) > 0 && excludedIds.has(word.id);
    }).length;
  }, [words, progressMap, excludedIds]);

  const handleExclude = (wordId: number) => {
    const newExcluded = new Set(excludedIds);
    newExcluded.add(wordId);
    setExcludedIds(newExcluded);
    saveExcludedIds(newExcluded);
  };

  const handleRestore = (wordId: number) => {
    const newExcluded = new Set(excludedIds);
    newExcluded.delete(wordId);
    setExcludedIds(newExcluded);
    saveExcludedIds(newExcluded);
  };

  const handleSpeak = (korean: string) => {
    speak(korean);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <CommonHeader
        title={title}
        onBack={onBack}
        rightContent={
          <span className="text-sm text-gray-500">
            {difficultWords.length} 語
          </span>
        }
      />

      {/* 表示切り替え */}
      <div className="sticky top-[52px] bg-white border-b border-gray-200 z-10">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex gap-2 mb-2">
            <button
              onClick={() => setShowExcluded(false)}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                !showExcluded
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              特訓リスト
            </button>
            <button
              onClick={() => setShowExcluded(true)}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                showExcluded
                  ? 'bg-gray-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              除外済み ({excludedCount})
            </button>
          </div>
          {!showExcluded && (
            <p className="text-xs text-gray-500">復習で「もう一回」を押した単語とその回数がここに表示されます</p>
          )}
        </div>
      </div>

      {/* 単語リスト */}
      <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-4">
        {difficultWords.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            {showExcluded ? (
              '除外した単語はありません'
            ) : (
              <div className="space-y-2">
                <RefreshCw className="w-12 h-12 mx-auto text-gray-300" />
                <p>特訓したい単語はまだありません</p>
                <p className="text-sm">復習で間違えた単語が自動で追加されます</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {difficultWords.map(({ word, lapses }) => {
              const isPlaying = isSpeaking && currentText === word.korean;

              return (
                <div
                  key={word.id}
                  className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 flex items-center gap-3"
                >
                  <button
                    onClick={() => handleSpeak(word.korean)}
                    disabled={isPlaying}
                    className={`p-2 rounded-full transition-colors flex-shrink-0 ${
                      isPlaying
                        ? 'bg-yellow-100 text-yellow-600'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                    }`}
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 text-lg">
                      {word.korean}
                    </div>
                    <div className="text-gray-600 text-sm truncate">
                      {word.japanese}
                    </div>
                    {getMemo(word.id) && (
                      <button
                        onClick={() => handleEditMemo(word.id)}
                        className="mt-1 text-xs text-yellow-600 bg-yellow-50 rounded px-2 py-1 hover:bg-yellow-100 text-left"
                      >
                        {getMemo(word.id)}
                      </button>
                    )}
                  </div>
                  <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600 flex-shrink-0">
                    {lapses}回
                  </span>
                  <button
                    onClick={() => handleEditMemo(word.id)}
                    className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                    title={getMemo(word.id) ? 'メモを編集' : 'メモを追加'}
                  >
                    <StickyNote className="w-4 h-4" />
                  </button>
                  {showExcluded ? (
                    <button
                      onClick={() => handleRestore(word.id)}
                      className="p-2 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 transition-colors flex-shrink-0"
                      title="リストに戻す"
                    >
                      <span className="text-xs font-medium">戻す</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleExclude(word.id)}
                      className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors flex-shrink-0"
                      title="リストから除外"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* メモ編集モーダル */}
      {editingWordId !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-gray-800 mb-4">メモを編集</h3>
            <textarea
              value={editingMemo}
              onChange={(e) => setEditingMemo(e.target.value)}
              placeholder="メモを入力..."
              className="w-full h-24 p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 resize-none"
              autoFocus
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleCancelEdit}
                className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleSaveMemo}
                className="flex-1 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
