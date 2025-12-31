/**
 * フラッシュカードホーム画面の共通コンポーネント
 */

import { useState, useEffect } from 'react';
import { BookOpen, BarChart2, Trash2, List, HelpCircle, ChevronDown, ChevronUp, RefreshCw, Timer } from 'lucide-react';
import { CommonHeader } from '../CommonHeader';
import { DifficultWordsList } from './DifficultWordsList';
import { TimeAttackMenu } from '../timeattack/TimeAttackMenu';
import { Word, CardProgress } from '../../types/flashcard';
import { WordLevel } from '../../hooks/useWordMemo';
import { TimeAttackLevel, TimeAttackDirection } from '../../hooks/useTimeAttackScore';

type FlashcardHomeBaseProps = {
  title: string;
  colorScheme: 'blue' | 'cyan';
  words: Word[];
  difficultWordsStorageKey: string;
  level: WordLevel;
  direction: TimeAttackDirection;
  progressHook: () => {
    isLoading: boolean;
    progressMap: Map<number, CardProgress>;
    getTodayStats: () => {
      newCardsRemaining: number;
      learningCardsRemaining: number;
      reviewCardsRemaining: number;
    };
    getOverallStats: () => {
      total: number;
      new: number;
      learning: number;
      relearning: number;
      young: number;
      mature: number;
    };
    resetProgress: () => void;
  };
  StudyComponent: React.ComponentType<{ onBack: () => void }>;
  WordListComponent?: React.ComponentType<{ onBack: () => void }>;
};

export const FlashcardHomeBase = ({
  title,
  colorScheme,
  words,
  difficultWordsStorageKey,
  level,
  direction,
  progressHook,
  StudyComponent,
  WordListComponent,
}: FlashcardHomeBaseProps) => {
  const [isStudying, setIsStudying] = useState(false);
  const [showWordList, setShowWordList] = useState(false);
  const [showDifficultWords, setShowDifficultWords] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showAlgorithmInfo, setShowAlgorithmInfo] = useState(false);
  const [showTimeAttack, setShowTimeAttack] = useState(false);
  const { isLoading, progressMap, getTodayStats, getOverallStats, resetProgress } = progressHook();

  // タイムアタック用のレベル変換
  const timeAttackLevel: TimeAttackLevel = level === 'beginner' ? 'beginner' : 'intermediate';

  // 画面切り替え時にスクロール位置をリセット
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [isStudying, showWordList, showDifficultWords, showTimeAttack]);

  // カラースキーム設定
  const colors = {
    blue: {
      button: 'bg-blue-500 hover:bg-blue-600',
      infoBg: 'bg-blue-50',
    },
    cyan: {
      button: 'bg-cyan-500 hover:bg-cyan-600',
      infoBg: 'bg-cyan-50',
    },
  }[colorScheme];

  if (isStudying) {
    return <StudyComponent onBack={() => setIsStudying(false)} />;
  }

  if (showWordList && WordListComponent) {
    return <WordListComponent onBack={() => setShowWordList(false)} />;
  }

  if (showDifficultWords) {
    return (
      <DifficultWordsList
        title="特訓単語"
        words={words}
        progressMap={progressMap}
        storageKey={difficultWordsStorageKey}
        level={level}
        onBack={() => setShowDifficultWords(false)}
      />
    );
  }

  if (showTimeAttack) {
    return (
      <TimeAttackMenu
        level={timeAttackLevel}
        direction={direction}
        onBack={() => setShowTimeAttack(false)}
      />
    );
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
      <CommonHeader title={title} />

      <div className="max-w-md mx-auto p-4">

        {/* 今日の学習カード */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gray-100 rounded-lg">
              <BookOpen className="w-5 h-5 text-gray-600" />
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
                ? `${colors.button} text-white`
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {totalDue > 0 ? `学習を始める (${totalDue}枚)` : '今日の学習完了'}
          </button>
        </div>

        {/* 全体の進捗 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gray-100 rounded-lg">
              <BarChart2 className="w-5 h-5 text-gray-600" />
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
                  className="bg-orange-400"
                  style={{
                    width: `${(overallStats.learning / overallStats.total) * 100}%`,
                  }}
                />
                <div
                  className="bg-blue-400"
                  style={{
                    width: `${(overallStats.young / overallStats.total) * 100}%`,
                  }}
                />
                <div
                  className="bg-red-400"
                  style={{
                    width: `${(overallStats.relearning / overallStats.total) * 100}%`,
                  }}
                />
                <div
                  className="bg-green-500"
                  style={{
                    width: `${(overallStats.mature / overallStats.total) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* 凡例 */}
          <div className="grid grid-cols-2 gap-2 text-sm">
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
              <span className="w-3 h-3 rounded-full bg-red-400" />
              <span className="text-gray-600">
                再学習 ({overallStats.relearning})
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
                  <span className="w-2 h-2 rounded-full bg-orange-400 mt-1.5 flex-shrink-0" />
                  <div><strong>学習中:</strong> 10分後 → 1日後 → 3日後</div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />
                  <div><strong>復習中:</strong> 7日後から開始、正解ごとに約2.5倍に延長</div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />
                  <div><strong>再学習:</strong> 復習で間違えた単語（10分後→1日後→元の半分の間隔で復習）</div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                  <div><strong>定着:</strong> 復習間隔が21日以上になった単語</div>
                </div>
              </div>
              <div className={`${colors.infoBg} rounded-lg p-3`}>
                <p><strong>OK:</strong> 覚えていた → 次回の復習間隔が延長</p>
                <p><strong>もう一回:</strong> 忘れた → 10分後に再表示</p>
              </div>
            </div>
          )}
        </div>

        {/* タイムアタック */}
        <button
          onClick={() => setShowTimeAttack(true)}
          className="w-full bg-white rounded-2xl shadow-lg p-4 mb-6 flex items-center gap-3 hover:bg-gray-50 transition-colors"
        >
          <div className="p-2 bg-gray-100 rounded-lg">
            <Timer className="w-5 h-5 text-gray-600" />
          </div>
          <span className="text-lg font-medium text-gray-800">タイムアタック</span>
        </button>

        {/* 単語一覧ボタン */}
        {WordListComponent && (
          <button
            onClick={() => setShowWordList(true)}
            className="w-full bg-white rounded-2xl shadow-lg p-4 mb-6 flex items-center gap-3 hover:bg-gray-50 transition-colors"
          >
            <div className="p-2 bg-gray-100 rounded-lg">
              <List className="w-5 h-5 text-gray-600" />
            </div>
            <span className="text-lg font-medium text-gray-800">単語一覧</span>
            <span className="ml-auto text-gray-400 text-sm">
              {overallStats.total.toLocaleString()} 語
            </span>
          </button>
        )}

        {/* 要復習ボタン */}
        <button
          onClick={() => setShowDifficultWords(true)}
          className="w-full bg-white rounded-2xl shadow-lg p-4 mb-6 flex items-center gap-3 hover:bg-gray-50 transition-colors"
        >
          <div className="p-2 bg-gray-100 rounded-lg">
            <RefreshCw className="w-5 h-5 text-gray-600" />
          </div>
          <span className="text-lg font-medium text-gray-800">特訓単語</span>
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
