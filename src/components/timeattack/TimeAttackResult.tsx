/**
 * タイムアタック 結果画面
 */

import { useEffect, useState } from 'react';
import { Trophy, RotateCcw, Home } from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  useTimeAttackScore,
  TimeAttackMode,
  TimeAttackLevel,
  TimeAttackDirection,
} from '../../hooks/useTimeAttackScore';

// 練習日を記録（トップページのはなまる用）
const PROGRESS_KEY = 'verbProgress';

const recordPracticeDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const dateString = `${year}-${month}-${day}`;

  try {
    const data = localStorage.getItem(PROGRESS_KEY);
    let progress: { verbs: Record<string, unknown>; practiceDates: string[] };

    if (data) {
      const parsed = JSON.parse(data);
      progress = {
        verbs: parsed.verbs || {},
        practiceDates: Array.isArray(parsed.practiceDates) ? parsed.practiceDates : [],
      };
    } else {
      progress = { verbs: {}, practiceDates: [] };
    }

    if (!progress.practiceDates.includes(dateString)) {
      progress.practiceDates.push(dateString);
    }

    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  } catch (e) {
    console.error('Failed to record practice date:', e);
  }
};

type TimeAttackResultProps = {
  mode: TimeAttackMode;
  level: TimeAttackLevel;
  direction: TimeAttackDirection;
  score: number;
  correctCount: number;
  incorrectCount: number;
  onRetry: () => void;
  onBack: () => void;
};

export const TimeAttackResult = ({
  mode,
  level,
  direction,
  score,
  correctCount,
  incorrectCount,
  onRetry,
  onBack,
}: TimeAttackResultProps) => {
  const { saveScore, formatScore, getHighScore } = useTimeAttackScore();
  const [isNewRecord, setIsNewRecord] = useState(false);

  // 練習日を記録（はなまる用）- マウント時に1回だけ実行
  useEffect(() => {
    recordPracticeDate();
  }, []);

  // スコアを保存してハイスコア判定
  useEffect(() => {
    const newRecord = saveScore(mode, level, direction, score);
    setIsNewRecord(newRecord);

    // ハイスコア更新時は紙吹雪
    if (newRecord) {
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
      });
    }
  }, [mode, level, direction, score, saveScore]);

  const previousHighScore = getHighScore(mode, level, direction);
  const totalAttempts = correctCount + incorrectCount;
  const accuracy = totalAttempts > 0 ? Math.round((correctCount / totalAttempts) * 100) : 0;

  const modeLabel = mode === '10sec' ? '10秒チャレンジ' : '10語スプリント';
  const levelLabel = level === 'beginner' ? '初級' : '中級';
  const directionLabel = direction === 'kr-jp' ? '韓→日' : '日→韓';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full text-center">
        {/* ハイスコア表示 */}
        {isNewRecord && (
          <div className="mb-4 animate-bounce">
            <div className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full font-bold">
              <Trophy className="w-5 h-5" />
              NEW RECORD!
            </div>
          </div>
        )}

        {/* 結果タイトル */}
        <h2 className="text-xl font-bold text-gray-800 mb-2">結果</h2>
        <div className="text-sm text-gray-500 mb-6">
          {modeLabel} / {levelLabel} / {directionLabel}
        </div>

        {/* メインスコア */}
        <div className="mb-6">
          <div
            className={`text-5xl font-bold ${
              isNewRecord ? 'text-yellow-500' : 'text-gray-800'
            }`}
          >
            {formatScore(mode, score)}
          </div>
          {mode === '10sec' && (
            <div className="text-gray-500 mt-1">{correctCount}問正解</div>
          )}
        </div>

        {/* 統計 */}
        <div className="grid grid-cols-2 gap-4 mb-6 py-4 border-y border-gray-100">
          <div>
            <div className="text-2xl font-bold text-gray-800">{accuracy}%</div>
            <div className="text-xs text-gray-500">正答率</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-800">{totalAttempts}</div>
            <div className="text-xs text-gray-500">回答数</div>
          </div>
        </div>

        {/* 過去の記録 */}
        {previousHighScore && !isNewRecord && (
          <div className="mb-6 text-sm text-gray-500">
            {mode === '10sec' ? '自己ベスト' : '最速記録'}: {formatScore(mode, previousHighScore.score)}
          </div>
        )}

        {/* ボタン */}
        <div className="space-y-3">
          <button
            onClick={onRetry}
            className="w-full py-3 rounded-xl font-medium text-white bg-blue-500 hover:bg-blue-600 flex items-center justify-center gap-2 transition-colors"
          >
            <RotateCcw className="w-5 h-5" />
            もう一度
          </button>
          <button
            onClick={onBack}
            className="w-full py-3 rounded-xl font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 flex items-center justify-center gap-2 transition-colors"
          >
            <Home className="w-5 h-5" />
            モード選択に戻る
          </button>
        </div>
      </div>
    </div>
  );
};
