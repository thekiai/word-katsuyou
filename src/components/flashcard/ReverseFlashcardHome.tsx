/**
 * 逆方向フラッシュカードホーム画面（日本語 → 韓国語）
 */

import { useState } from 'react';
import { BookOpen, BarChart2, Trash2, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useReverseFlashcardProgress } from '../../hooks/useReverseFlashcardProgress';
import { ReverseFlashcardStudy } from './ReverseFlashcardStudy';
import { CommonHeader } from '../CommonHeader';

export const ReverseFlashcardHome = () => {
  const [isStudying, setIsStudying] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showAlgorithmInfo, setShowAlgorithmInfo] = useState(false);
  const { isLoading, getTodayStats, getOverallStats, resetProgress } = useReverseFlashcardProgress();

  if (isStudying) {
    return <ReverseFlashcardStudy onBack={() => setIsStudying(false)} />;
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
    <div className="min-h-screen bg-gray-50">
      <CommonHeader title="単語帳（日→韓）" />

      <div className="max-w-md mx-auto p-4">

        {/* 今日の学習カード */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-cyan-100 rounded-lg">
              <BookOpen className="w-5 h-5 text-cyan-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800">今日の学習</h2>
          </div>

          {/* 統計 */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-500">
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
              <div className="text-2xl font-bold text-blue-500">
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
                ? 'bg-cyan-500 hover:bg-cyan-600 text-white'
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
              <span className="w-3 h-3 rounded-full bg-gray-300" />
              <span className="text-gray-600">
                未学習 ({overallStats.new})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-orange-400" />
              <span className="text-gray-600">
                学習中 ({overallStats.learning})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-400" />
              <span className="text-gray-600">
                復習中 ({overallStats.young})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-gray-600">
                定着 ({overallStats.mature})
              </span>
            </div>
          </div>
        </div>

        {/* アルゴリズム説明 */}
        <div className="bg-white rounded-2xl shadow-lg mb-6 overflow-hidden">
          <button
            onClick={() => setShowAlgorithmInfo(!showAlgorithmInfo)}
            className="w-full p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors"
          >
            <div className="p-2 bg-gray-100 rounded-lg">
              <HelpCircle className="w-5 h-5 text-gray-600" />
            </div>
            <span className="text-lg font-medium text-gray-800">学習の仕組み</span>
            <span className="ml-auto text-gray-400">
              {showAlgorithmInfo ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </span>
          </button>
          {showAlgorithmInfo && (
            <div className="px-4 pb-4 text-sm text-gray-600 space-y-3">
              <p>
                間隔反復（Spaced Repetition）アルゴリズムを使用しています。
                覚えた単語は徐々に復習間隔が長くなり、忘れやすい単語は短い間隔で繰り返します。
              </p>
              <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                <div className="flex items-start gap-2">
                  <span className="w-2 h-2 rounded-full bg-yellow-500 mt-1.5 flex-shrink-0" />
                  <div><strong>新規:</strong> 今日新しく学習できる単語</div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-2 h-2 rounded-full bg-orange-500 mt-1.5 flex-shrink-0" />
                  <div><strong>学習中:</strong> 10分後 → 1日後 → 3日後</div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />
                  <div><strong>復習中:</strong> 7日後から開始、正解ごとに約2.5倍に延長</div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                  <div><strong>定着:</strong> 復習間隔が21日以上になった単語</div>
                </div>
              </div>
              <div className="bg-cyan-50 rounded-lg p-3">
                <p><strong>正解:</strong> 覚えていた → 次回の復習間隔が延長</p>
                <p><strong>不正解:</strong> 忘れた → 学習中に戻る</p>
              </div>
            </div>
          )}
        </div>

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
