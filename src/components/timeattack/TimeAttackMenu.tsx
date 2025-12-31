/**
 * タイムアタックメニュー画面
 * モード選択とハイスコア表示
 */

import { useState } from 'react';
import { CommonHeader } from '../CommonHeader';
import { TimeAttackGame, unlockAudio } from './TimeAttackGame';
import {
  TimeAttackMode,
  TimeAttackLevel,
  TimeAttackDirection,
  useTimeAttackScore,
} from '../../hooks/useTimeAttackScore';

type TimeAttackMenuProps = {
  level: TimeAttackLevel;
  direction: TimeAttackDirection;
  onBack: () => void;
};

export const TimeAttackMenu = ({
  level,
  direction,
  onBack,
}: TimeAttackMenuProps) => {
  const [selectedMode, setSelectedMode] = useState<TimeAttackMode | null>(null);
  const { getHighScore, formatScore, reloadScores } = useTimeAttackScore();

  const highScore10sec = getHighScore('10sec', level, direction);
  const highScore10words = getHighScore('10words', level, direction);

  if (selectedMode) {
    return (
      <TimeAttackGame
        mode={selectedMode}
        level={level}
        direction={direction}
        onFinish={() => {
          reloadScores();
          setSelectedMode(null);
        }}
      />
    );
  }

  const directionLabel = direction === 'kr-jp' ? '韓→日' : '日→韓';
  const levelLabel = level === 'beginner' ? '初級' : '中級';

  return (
    <div className="min-h-screen bg-gray-50">
      <CommonHeader title="タイムアタック" onBack={onBack} />

      <div className="max-w-md mx-auto p-4">
        {/* レベル・方向表示 */}
        <div className="text-center mb-6">
          <span className="inline-block px-3 py-1 bg-gray-200 rounded-full text-sm text-gray-600">
            {levelLabel} ({directionLabel})
          </span>
        </div>

        {/* 30秒チャレンジ */}
        <div className="bg-white rounded-2xl shadow-lg p-5 mb-4">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">⏱️</span>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">10秒チャレンジ</h2>
              <p className="text-sm text-gray-500">10秒で何問解ける？</p>
            </div>
          </div>

          {/* ベストスコア */}
          {highScore10sec && (
            <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-yellow-50 rounded-lg">
              <span>🥇</span>
              <span className="text-sm text-gray-600">ベストスコア:</span>
              <span className="font-bold text-yellow-600">
                {formatScore('10sec', highScore10sec.score)}
              </span>
            </div>
          )}

          <button
            onClick={() => {
              unlockAudio();
              setSelectedMode('10sec');
            }}
            className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-colors"
          >
            スタート
          </button>
        </div>

        {/* 20語スプリント */}
        <div className="bg-white rounded-2xl shadow-lg p-5">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">🏃‍♀️</span>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">10語スプリント</h2>
              <p className="text-sm text-gray-500">最速タイムを目指せ！</p>
            </div>
          </div>

          {/* ベストタイム */}
          {highScore10words && (
            <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-yellow-50 rounded-lg">
              <span>🥇</span>
              <span className="text-sm text-gray-600">ベストタイム:</span>
              <span className="font-bold text-yellow-600">
                {formatScore('10words', highScore10words.score)}
              </span>
            </div>
          )}

          <button
            onClick={() => {
              unlockAudio();
              setSelectedMode('10words');
            }}
            className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-colors"
          >
            スタート
          </button>
        </div>
      </div>
    </div>
  );
};
