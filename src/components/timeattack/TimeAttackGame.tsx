/**
 * タイムアタック ゲーム画面
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Volume2 } from 'lucide-react';
import { CommonHeader } from '../CommonHeader';
import { TimeAttackResult } from './TimeAttackResult';
import { topikWords } from '../../data/topikWords';
import { topikWords2 } from '../../data/topikWords2';
import { Word } from '../../types/flashcard';
import { useSpeechSynthesis } from '../../hooks/useSpeechSynthesis';
import {
  TimeAttackMode,
  TimeAttackLevel,
  TimeAttackDirection,
} from '../../hooks/useTimeAttackScore';

// 効果音を再生
const playSound = (type: 'correct' | 'incorrect') => {
  const audioContext = new (window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  const gainNode = audioContext.createGain();
  gainNode.connect(audioContext.destination);

  if (type === 'correct') {
    // 3音の上昇メロディ（ド→ミ→ソ♪）
    const osc1 = audioContext.createOscillator();
    const osc2 = audioContext.createOscillator();
    const osc3 = audioContext.createOscillator();
    osc1.connect(gainNode);
    osc2.connect(gainNode);
    osc3.connect(gainNode);
    osc1.type = 'sine';
    osc2.type = 'sine';
    osc3.type = 'sine';
    osc1.frequency.value = 523; // C5
    osc2.frequency.value = 659; // E5
    osc3.frequency.value = 784; // G5
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
    osc1.start(audioContext.currentTime);
    osc1.stop(audioContext.currentTime + 0.1);
    osc2.start(audioContext.currentTime + 0.1);
    osc2.stop(audioContext.currentTime + 0.2);
    osc3.start(audioContext.currentTime + 0.2);
    osc3.stop(audioContext.currentTime + 0.35);
  } else {
    // 優しい下降音（ミ→ド）
    const osc1 = audioContext.createOscillator();
    const osc2 = audioContext.createOscillator();
    osc1.connect(gainNode);
    osc2.connect(gainNode);
    osc1.type = 'sine';
    osc2.type = 'sine';
    osc1.frequency.value = 330; // E4
    osc2.frequency.value = 262; // C4
    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    osc1.start(audioContext.currentTime);
    osc1.stop(audioContext.currentTime + 0.12);
    osc2.start(audioContext.currentTime + 0.12);
    osc2.stop(audioContext.currentTime + 0.25);
  }
};

type TimeAttackGameProps = {
  mode: TimeAttackMode;
  level: TimeAttackLevel;
  direction: TimeAttackDirection;
  onFinish: () => void;
};

type GameState = 'playing' | 'finished';

// 配列をシャッフル
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const TimeAttackGame = ({
  mode,
  level,
  direction,
  onFinish,
}: TimeAttackGameProps) => {
  // 単語リスト
  const words = useMemo(() => {
    return level === 'beginner' ? topikWords : topikWords2;
  }, [level]);

  // 音声合成
  const { speak } = useSpeechSynthesis();

  // 前回の単語IDを追跡（音声の重複再生防止）
  const lastSpokenWordId = useRef<number | null>(null);

  // ゲーム状態
  const [gameState, setGameState] = useState<GameState>('playing');
  const [questionIndex, setQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);

  // タイマー
  const [timeLeft, setTimeLeft] = useState(mode === '10sec' ? 10000 : 0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());

  // 問題リスト（シャッフル済み）
  const [questionList, setQuestionList] = useState(() => {
    const shuffled = shuffleArray(words);
    return mode === '10words' ? shuffled.slice(0, 10) : shuffled;
  });

  // 現在の問題
  const currentWord = questionList[questionIndex % questionList.length];

  // 選択肢（正解1つ + 不正解3つ）
  const [choices, setChoices] = useState<string[]>([]);

  // フィードバック表示
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  // 選択肢を生成
  const generateChoices = useCallback(
    (correctWord: Word) => {
      const correctAnswer =
        direction === 'kr-jp' ? correctWord.japanese : correctWord.korean;

      // 不正解選択肢を生成（重複しないように）
      const otherWords = words.filter((w) => w.id !== correctWord.id);
      const shuffledOthers = shuffleArray(otherWords);
      const wrongAnswers = shuffledOthers.slice(0, 3).map((w) =>
        direction === 'kr-jp' ? w.japanese : w.korean
      );

      // 全選択肢をシャッフル
      const allChoices = shuffleArray([correctAnswer, ...wrongAnswers]);
      setChoices(allChoices);
    },
    [words, direction]
  );

  // 初期化時に選択肢を生成し、音声を再生（韓→日のみ）
  useEffect(() => {
    if (currentWord) {
      generateChoices(currentWord);
      // 韓→日の場合のみ自動再生（日→韓だと答えがバレる）
      // 同じ単語で重複再生しないようにチェック
      if (direction === 'kr-jp' && lastSpokenWordId.current !== currentWord.id) {
        lastSpokenWordId.current = currentWord.id;
        speak(currentWord.korean);
      }
    }
  }, [currentWord, generateChoices, speak, direction]);

  // タイマー処理
  useEffect(() => {
    if (gameState !== 'playing') return;

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = now - startTime;
      setElapsedTime(elapsed);

      if (mode === '10sec') {
        const remaining = Math.max(0, 10000 - elapsed);
        setTimeLeft(remaining);

        if (remaining === 0) {
          setGameState('finished');
        }
      }
    }, 100);

    return () => clearInterval(interval);
  }, [gameState, startTime, mode]);

  // 回答処理
  const handleAnswer = useCallback(
    (answer: string) => {
      if (feedback !== null) return; // フィードバック表示中は無視

      const correctAnswer =
        direction === 'kr-jp' ? currentWord.japanese : currentWord.korean;
      const isCorrect = answer === correctAnswer;

      setSelectedAnswer(answer);
      setFeedback(isCorrect ? 'correct' : 'incorrect');
      playSound(isCorrect ? 'correct' : 'incorrect');

      if (isCorrect) {
        setScore((prev) => prev + 1);
        setCorrectCount((prev) => prev + 1);

        // 日→韓の場合は正解時に音声を再生
        if (direction === 'jp-kr') {
          speak(currentWord.korean);
        }

        // 次の問題へ
        setTimeout(() => {
          if (mode === '10words' && questionIndex + 1 >= 10) {
            setGameState('finished');
          } else {
            setQuestionIndex((prev) => prev + 1);
            setFeedback(null);
            setSelectedAnswer(null);
          }
        }, 300);
      } else {
        setIncorrectCount((prev) => prev + 1);

        // 正解するまで同じ問題（そのまま）
        setTimeout(() => {
          setFeedback(null);
          setSelectedAnswer(null);
        }, 300);
      }
    },
    [currentWord, direction, feedback, mode, questionIndex, generateChoices, speak]
  );

  // 結果画面
  if (gameState === 'finished') {
    return (
      <TimeAttackResult
        mode={mode}
        level={level}
        direction={direction}
        score={mode === '10sec' ? score : elapsedTime}
        correctCount={correctCount}
        incorrectCount={incorrectCount}
        onRetry={() => {
          // 新しい問題リストを生成
          const shuffled = shuffleArray(words);
          setQuestionList(mode === '10words' ? shuffled.slice(0, 10) : shuffled);
          // 状態をリセット
          setGameState('playing');
          setQuestionIndex(0);
          setScore(0);
          setCorrectCount(0);
          setIncorrectCount(0);
          setTimeLeft(mode === '10sec' ? 10000 : 0);
          setElapsedTime(0);
          setStartTime(Date.now());
          setFeedback(null);
          setSelectedAnswer(null);
          lastSpokenWordId.current = null;
        }}
        onBack={onFinish}
      />
    );
  }

  // 問題文
  const questionText =
    direction === 'kr-jp' ? currentWord.korean : currentWord.japanese;

  // タイマー表示
  const timerDisplay =
    mode === '10sec'
      ? `${(timeLeft / 1000).toFixed(1)}秒`
      : `${(elapsedTime / 1000).toFixed(1)}秒`;

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      <CommonHeader
        title="タイムアタック"
        onBack={onFinish}
        rightContent={
          <span
            className={`font-mono text-lg font-bold ${
              mode === '10sec' && timeLeft < 10000
                ? 'text-red-500'
                : 'text-gray-700'
            }`}
          >
            {timerDisplay}
          </span>
        }
      />

      <div className="flex-1 flex flex-col max-w-md mx-auto w-full px-3 py-2 min-h-0">
        {/* スコア表示 */}
        <div className="flex justify-between items-center mb-2 flex-shrink-0">
          <div className="text-center">
            <div className="text-xs text-gray-500">スコア</div>
            <div className="text-xl font-bold text-gray-800">{score}</div>
          </div>
          {mode === '10words' && (
            <div className="text-center">
              <div className="text-xs text-gray-500">進捗</div>
              <div className="text-base font-bold text-gray-800">
                {correctCount}/10
              </div>
            </div>
          )}
        </div>

        {/* 問題表示 */}
        <div
          className={`bg-white rounded-xl shadow-lg p-4 mb-2 text-center transition-colors flex-shrink-0 ${
            feedback === 'correct'
              ? 'bg-green-50'
              : feedback === 'incorrect'
              ? 'bg-red-50'
              : ''
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <div className="text-3xl font-bold text-gray-900">{questionText}</div>
            {direction === 'kr-jp' && (
              <button
                onClick={() => speak(currentWord.korean)}
                className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="音声を再生"
              >
                <Volume2 className="w-5 h-5 text-gray-500" />
              </button>
            )}
          </div>
        </div>

        {/* 4択ボタン */}
        <div className="grid grid-cols-2 gap-2 flex-1 min-h-0">
          {choices.map((choice, index) => {
            const isSelected = selectedAnswer === choice;
            const correctAnswer =
              direction === 'kr-jp' ? currentWord.japanese : currentWord.korean;
            const isCorrectChoice = choice === correctAnswer;

            let buttonStyle = 'bg-white border-gray-200 hover:border-gray-400';
            if (feedback !== null) {
              if (feedback === 'correct' && isCorrectChoice) {
                // 正解時のみ正解を緑で表示
                buttonStyle = 'bg-green-500 border-green-500 text-white';
              } else if (isSelected && feedback === 'incorrect') {
                // 不正解時は選択した答えのみ赤で表示（正解は見せない）
                buttonStyle = 'bg-red-500 border-red-500 text-white';
              }
            }

            return (
              <button
                key={index}
                onClick={() => handleAnswer(choice)}
                disabled={feedback !== null}
                className={`rounded-xl border-2 font-medium transition-all flex items-center justify-center ${buttonStyle} ${
                  feedback === null ? 'active:scale-95' : ''
                } ${direction === 'jp-kr' ? 'text-xl' : 'text-base'}`}
              >
                {choice}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
