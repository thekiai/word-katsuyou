/**
 * フラッシュカードホーム画面
 */

import { useState } from 'react';
import { BookOpen, BarChart2, Trash2, ArrowLeft, List } from 'lucide-react';
import { useFlashcardProgress } from '../../hooks/useFlashcardProgress';
import { FlashcardStudy } from './FlashcardStudy';
import { WordList } from './WordList';

type FlashcardHomeProps = {
  onBack?: () => void;
};

export const FlashcardHome = ({ onBack }: FlashcardHomeProps) => {
  const [isStudying, setIsStudying] = useState(false);
  const [showWordList, setShowWordList] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const {
    isLoading,
    getNextCard,
    answerCard,
    getTodayStats,
    getOverallStats,
    getButtonPreview,
    resetProgress,
  } = useFlashcardProgress();

  if (isStudying) {
    return (
      <FlashcardStudy
        onBack={() => setIsStudying(false)}
        getNextCard={getNextCard}
        answerCard={answerCard}
        getTodayStats={getTodayStats}
        getButtonPreview={getButtonPreview}
      />
    );
  }

  if (showWordList) {
    return <WordList onBack={() => setShowWordList(false)} />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    );
  }

  const todayStats = getTodayStats();
  const overallStats = getOverallStats();
  const totalDue =
    todayStats.newCardsRemaining +
    todayStats.reviewCardsRemaining +
    todayStats.learningCardsRemaining;

  const handleReset = () => {
    resetProgress();
    setShowResetConfirm(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 pt-8">
      <div className="max-w-md mx-auto">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-6">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
          )}
          <div className={`text-center ${onBack ? '' : 'w-full'}`}>
            <h1 className="text-2xl font-bold text-gray-800">
              TOPIK 単語帳
            </h1>
            <p className="text-gray-500 text-sm">
              {overallStats.total.toLocaleString()} 語収録
            </p>
          </div>
          {onBack && <div className="w-10" />}
        </div>

        {/* 今日の学習カード */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BookOpen className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800">今日の学習</h2>
          </div>

          {/* 統計 */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {todayStats.newCardsRemaining}
              </div>
              <div className="text-xs text-gray-500">新規</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-500">
                {todayStats.learningCardsRemaining}
              </div>
              <div className="text-xs text-gray-500">学習中</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {todayStats.reviewCardsRemaining}
              </div>
              <div className="text-xs text-gray-500">復習</div>
            </div>
          </div>

          {/* 学習ボタン */}
          <button
            onClick={() => setIsStudying(true)}
            disabled={totalDue === 0}
            className={`w-full py-4 rounded-xl font-medium text-lg transition-colors ${
              totalDue > 0
                ? 'bg-blue-500 hover:bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {totalDue > 0 ? `学習を始める (${totalDue}枚)` : '今日の学習完了'}
          </button>
        </div>

        {/* 全体の進捗 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <BarChart2 className="w-5 h-5 text-green-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800">学習進捗</h2>
          </div>

          {/* プログレスバー */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>進捗</span>
              <span>
                {(overallStats.total - overallStats.new).toLocaleString()} /{' '}
                {overallStats.total.toLocaleString()} 語
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div className="h-full flex">
                <div
                  className="bg-green-500"
                  style={{
                    width: `${(overallStats.mature / overallStats.total) * 100}%`,
                  }}
                />
                <div
                  className="bg-blue-400"
                  style={{
                    width: `${(overallStats.young / overallStats.total) * 100}%`,
                  }}
                />
                <div
                  className="bg-orange-400"
                  style={{
                    width: `${(overallStats.learning / overallStats.total) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* 凡例 */}
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-gray-600">
                定着 ({overallStats.mature})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-400" />
              <span className="text-gray-600">
                復習中 ({overallStats.young})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-orange-400" />
              <span className="text-gray-600">
                学習中 ({overallStats.learning})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-gray-300" />
              <span className="text-gray-600">
                未学習 ({overallStats.new})
              </span>
            </div>
          </div>
        </div>

        {/* 単語一覧ボタン */}
        <button
          onClick={() => setShowWordList(true)}
          className="w-full bg-white rounded-2xl shadow-lg p-4 mb-6 flex items-center gap-3 hover:bg-gray-50 transition-colors"
        >
          <div className="p-2 bg-purple-100 rounded-lg">
            <List className="w-5 h-5 text-purple-600" />
          </div>
          <span className="text-lg font-medium text-gray-800">単語一覧</span>
          <span className="ml-auto text-gray-400 text-sm">
            {overallStats.total.toLocaleString()} 語
          </span>
        </button>

        {/* リセットボタン */}
        <div className="text-center">
          <button
            onClick={() => setShowResetConfirm(true)}
            className="text-sm text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1 mx-auto"
          >
            <Trash2 className="w-4 h-4" />
            進捗をリセット
          </button>
        </div>

        {/* リセット確認モーダル */}
        {showResetConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                進捗をリセット
              </h3>
              <p className="text-gray-600 mb-6">
                すべての学習データが削除されます。この操作は取り消せません。
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleReset}
                  className="flex-1 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
                >
                  リセット
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
