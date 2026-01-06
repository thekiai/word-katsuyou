/**
 * 文法一覧ページ
 */

import { useState, useMemo } from 'react';
import { Search, Volume2 } from 'lucide-react';
import { GrammarItem } from '../../data/grammarData';
import { useSpeechSynthesis } from '../../hooks/useSpeechSynthesis';
import { CardState } from '../../types/flashcard';
import { CommonHeader } from '../CommonHeader';

type GrammarListProps = {
  title: string;
  grammarData: GrammarItem[];
  progressMap: Map<number, { state: CardState }>;
  onBack?: () => void;
};

export const GrammarList = ({
  title,
  grammarData,
  progressMap,
  onBack,
}: GrammarListProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterState, setFilterState] = useState<CardState | 'all'>('all');
  const { speak, isSpeaking, currentText } = useSpeechSynthesis();

  // 文法をフィルタリング
  const filteredGrammar = useMemo(() => {
    return grammarData.filter((grammar) => {
      // 検索フィルター
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (
          !grammar.korean.includes(query) &&
          !grammar.japanese.toLowerCase().includes(query) &&
          !grammar.exampleKo.includes(query) &&
          !grammar.exampleJa.toLowerCase().includes(query)
        ) {
          return false;
        }
      }

      // 状態フィルター
      if (filterState !== 'all') {
        const progress = progressMap.get(grammar.id);
        const state = progress?.state || 'new';
        if (state !== filterState) {
          return false;
        }
      }

      return true;
    });
  }, [searchQuery, filterState, progressMap, grammarData]);

  // 状態ごとの文法数を計算
  const stateCounts = useMemo(() => {
    const counts = { new: 0, learning: 0, review: 0, relearning: 0 };
    grammarData.forEach((grammar) => {
      const progress = progressMap.get(grammar.id);
      const state = progress?.state || 'new';
      counts[state]++;
    });
    return counts;
  }, [progressMap, grammarData]);

  const getStateLabel = (grammarId: number): { label: string; color: string } => {
    const progress = progressMap.get(grammarId);
    if (!progress) {
      return { label: '新規', color: 'bg-gray-100 text-gray-600' };
    }
    switch (progress.state) {
      case 'new':
        return { label: '新規', color: 'bg-gray-100 text-gray-600' };
      case 'learning':
        return { label: '学習中', color: 'bg-orange-100 text-orange-700' };
      case 'review':
        return { label: '復習', color: 'bg-green-100 text-green-700' };
      case 'relearning':
        return { label: '再学習', color: 'bg-red-100 text-red-700' };
      default:
        return { label: '新規', color: 'bg-gray-100 text-gray-600' };
    }
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
            {filteredGrammar.length} / {grammarData.length} 項目
          </span>
        }
      />

      {/* 検索・フィルター */}
      <div className="sticky top-[52px] bg-white border-b border-gray-200 z-10">
        <div className="max-w-md mx-auto px-4 py-3">

          {/* 検索バー */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="文法または意味で検索..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* フィルターボタン */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setFilterState('all')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                filterState === 'all'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              すべて ({grammarData.length})
            </button>
            <button
              onClick={() => setFilterState('new')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                filterState === 'new'
                  ? 'bg-gray-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              新規 ({stateCounts.new})
            </button>
            <button
              onClick={() => setFilterState('learning')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                filterState === 'learning'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              学習中 ({stateCounts.learning})
            </button>
            <button
              onClick={() => setFilterState('review')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                filterState === 'review'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              復習 ({stateCounts.review})
            </button>
            <button
              onClick={() => setFilterState('relearning')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                filterState === 'relearning'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              再学習 ({stateCounts.relearning})
            </button>
          </div>
        </div>
      </div>

      {/* 文法リスト */}
      <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-4">
        {filteredGrammar.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            該当する文法がありません
          </div>
        ) : (
          <div className="space-y-2">
            {filteredGrammar.map((grammar) => {
              const { label, color } = getStateLabel(grammar.id);
              const isPlaying = isSpeaking && currentText === grammar.exampleKo;

              return (
                <div
                  key={grammar.id}
                  className="bg-white rounded-lg p-4 shadow-sm border border-gray-100"
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => handleSpeak(grammar.exampleKo)}
                      disabled={isPlaying}
                      className={`p-2 rounded-full transition-colors flex-shrink-0 mt-1 ${
                        isPlaying
                          ? 'bg-yellow-100 text-yellow-600'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                      }`}
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-blue-600 text-lg">
                          {grammar.korean}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${color}`}>
                          {label}
                        </span>
                      </div>
                      <div className="text-gray-700 text-sm mb-2">
                        {grammar.japanese}
                      </div>
                      <div className="bg-gray-50 rounded-lg p-2 text-sm">
                        <div className="text-gray-800 mb-1">{grammar.exampleKo}</div>
                        <div className="text-gray-500">{grammar.exampleJa}</div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
