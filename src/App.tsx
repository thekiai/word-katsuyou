import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { InputRow } from './components/InputRow';
import { TypingPractice } from './components/TypingPractice';
import { ActivityGraph } from './components/ActivityGraph';
import { CommonHeader } from './components/CommonHeader';
import { FlashcardHome, ReverseFlashcardHome } from './components/flashcard';
import { VerbEntry, ConjugationType, AnswerResult } from './types';
import { loadVerbs } from './utils/parseCSV';
import { CONJUGATION_FIELDS } from './constants';
import './App.css';

// 動詞の進捗を管理する関数
const PROGRESS_KEY = 'verbProgress';

type VerbProgress = {
  count: number; // 完了回数
  lastCompleted?: string; // 最後に完了した日時
};

type ProgressData = {
  verbs: Record<string, VerbProgress>;
  practiceDates?: string[]; // 全ての練習日（重複なし）
};

const getProgress = (): ProgressData => {
  try {
    const data = localStorage.getItem(PROGRESS_KEY);
    if (!data) return { verbs: {}, practiceDates: [] };
    const parsed = JSON.parse(data);
    // 古いデータ形式の場合はpracticeDatesを初期化
    if (!parsed.practiceDates) {
      parsed.practiceDates = [];
    }
    return parsed;
  } catch {
    return { verbs: {}, practiceDates: [] };
  }
};

const getVerbCount = (verbBase: string): number => {
  const progress = getProgress();
  return progress.verbs[verbBase]?.count || 0;
};

// ローカルタイムゾーンで日付文字列を取得
const getLocalDateString = (date: Date = new Date()): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const incrementVerbCount = (verbBase: string) => {
  const progress = getProgress();
  const currentCount = progress.verbs[verbBase]?.count || 0;
  const today = getLocalDateString();

  progress.verbs[verbBase] = {
    count: currentCount + 1,
    lastCompleted: today,
  };

  // 練習日を追加（重複しないように）
  if (!progress.practiceDates) {
    progress.practiceDates = [];
  }
  if (!progress.practiceDates.includes(today)) {
    progress.practiceDates.push(today);
  }

  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
};

const getPracticeDates = (): Set<string> => {
  const progress = getProgress();
  const dates = new Set<string>();

  // 新しい形式: practiceDates配列から取得
  if (progress.practiceDates && progress.practiceDates.length > 0) {
    progress.practiceDates.forEach(dateString => {
      // 古い形式（ISO文字列）の場合は変換
      if (dateString.includes('T')) {
        const date = new Date(dateString);
        dateString = getLocalDateString(date);
      }
      dates.add(dateString);
    });
  }

  // 後方互換性: 古いデータからも取得（マイグレーション）
  Object.values(progress.verbs).forEach(verb => {
    if (verb.lastCompleted) {
      let dateString = verb.lastCompleted;
      if (dateString.includes('T')) {
        const date = new Date(dateString);
        dateString = getLocalDateString(date);
      }
      dates.add(dateString);
    }
  });

  return dates;
};

const getStreakDays = (): number => {
  const dates = getPracticeDates();
  let streak = 0;
  const currentDate = new Date();
  const today = getLocalDateString(currentDate);

  // 今日練習している場合は今日から、していない場合は昨日から計算
  if (!dates.has(today)) {
    currentDate.setDate(currentDate.getDate() - 1);
  }

  while (true) {
    const dateString = getLocalDateString(currentDate);
    if (dates.has(dateString)) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
};

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedVerbMode, setSelectedVerbMode] = useState<'single' | 'random'>('single');

  const inputRefs = useRef<Record<ConjugationType, HTMLInputElement | null>>({
    base: null,
    present: null,
    past: null,
    future: null,
    go: null,
    seo: null,
    negative_an: null,
    negative_jian: null,
    possible: null,
  });

  const [verbs, setVerbs] = useState<VerbEntry[]>([]);
  const [currentVerb, setCurrentVerb] = useState<VerbEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<ConjugationType, string>>({
    base: '',
    present: '',
    past: '',
    future: '',
    go: '',
    seo: '',
    negative_an: '',
    negative_jian: '',
    possible: '',
  });
  const [results, setResults] = useState<Record<ConjugationType, AnswerResult | null>>({
    base: null,
    present: null,
    past: null,
    future: null,
    go: null,
    seo: null,
    negative_an: null,
    negative_jian: null,
    possible: null,
  });

  // Load verbs on mount
  useEffect(() => {
    loadVerbs().then((loadedVerbs) => {
      setVerbs(loadedVerbs);
      if (loadedVerbs.length > 0) {
        selectRandomVerb(loadedVerbs);
      }
      setLoading(false);
    });
  }, []);

  // Check for all correct answers
  useEffect(() => {
    if (!currentVerb) return;

    // Check if all fields have been answered and are correct
    const allFieldsAnswered = CONJUGATION_FIELDS.every((field) => {
      const result = results[field.key];
      return result !== null;
    });

    if (!allFieldsAnswered) return;

    const allCorrect = CONJUGATION_FIELDS.every((field) => {
      const result = results[field.key];
      return result?.isCorrect === true;
    });

    if (allCorrect) {
      // Celebrate with confetti!
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      // Increment completion count
      incrementVerbCount(currentVerb.base);
    }
  }, [results, currentVerb]);

  // 動詞を選択してstateをリセット
  const selectVerb = (verb: VerbEntry) => {
    setCurrentVerb(verb);
    setAnswers({
      base: '',
      present: '',
      past: '',
      future: '',
      go: '',
      seo: '',
      negative_an: '',
      negative_jian: '',
      possible: '',
    });
    setResults({
      base: null,
      present: null,
      past: null,
      future: null,
      go: null,
      seo: null,
      negative_an: null,
      negative_jian: null,
      possible: null,
    });
  };

  const selectRandomVerb = (verbList: VerbEntry[]) => {
    const randomIndex = Math.floor(Math.random() * verbList.length);
    selectVerb(verbList[randomIndex]);
  };

  const handleAnswerChange = (key: ConjugationType, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleGradeField = (key: ConjugationType) => {
    if (!currentVerb) return;

    const userAnswer = answers[key].trim();
    const correctAnswer = key === 'base'
      ? currentVerb.base.trim()
      : currentVerb[key].form.trim();

    const result: AnswerResult = {
      key,
      userAnswer,
      correctAnswer,
      isCorrect: userAnswer === correctAnswer,
    };

    setResults((prev) => ({
      ...prev,
      [key]: result,
    }));
  };

  const handleShowAnswer = (key: ConjugationType) => {
    if (!currentVerb) return;

    const correctAnswer = key === 'base'
      ? currentVerb.base.trim()
      : currentVerb[key].form.trim();

    const result: AnswerResult = {
      key,
      userAnswer: '',
      correctAnswer,
      isCorrect: false,
      showAnswerOnly: true, // 採点せずに答えのみ表示
    };

    setResults((prev) => ({
      ...prev,
      [key]: result,
    }));
  };


  const handleNext = () => {
    if (verbs.length > 0 && currentVerb) {
      // 練習していない順にソート
      const sortedVerbs = [...verbs].sort((a, b) => {
        const countA = getVerbCount(a.base);
        const countB = getVerbCount(b.base);
        return countA - countB;
      });

      // 現在の動詞のインデックスを見つける
      const currentIndex = sortedVerbs.findIndex(v => v.base === currentVerb.base);

      // 次の動詞を選択（最後の場合は最初に戻る）
      const nextIndex = (currentIndex + 1) % sortedVerbs.length;
      selectVerb(sortedVerbs[nextIndex]);

      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const focusNextField = (currentKey: ConjugationType) => {
    const currentIndex = CONJUGATION_FIELDS.findIndex((f) => f.key === currentKey);
    if (currentIndex < CONJUGATION_FIELDS.length - 1) {
      const nextKey = CONJUGATION_FIELDS[currentIndex + 1].key;
      const nextInput = inputRefs.current[nextKey];
      if (nextInput) {
        nextInput.focus();
        // 次の入力フォームが見えるようにスクロール
        nextInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-900">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-4">
            韓国語活用トレーニング
          </h1>
          <p className="text-center text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!currentVerb) {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-900">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-4">
            韓国語活用トレーニング
          </h1>
          <p className="text-center text-gray-600">動詞データが見つかりません</p>
        </div>
      </div>
    );
  }

  // ホームページ
  if (location.pathname === '/') {
    const streakDays = getStreakDays();
    const practiceDates = getPracticeDates();

    return (
      <div className="min-h-screen bg-gray-50 text-gray-900">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-md mx-auto px-4 py-4">
            <h1 className="text-xl font-bold text-gray-800 text-center">
              韓国語トレーニング
            </h1>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-md mx-auto px-4 py-6">
          {/* 連続日数 */}
          {streakDays > 0 && (
            <div className="text-center mb-4">
              <span className="text-2xl font-bold text-orange-500">
                {streakDays}日連続
              </span>
            </div>
          )}

          {/* カレンダー */}
          <div className="mb-6">
            <ActivityGraph practiceDates={practiceDates} />
          </div>

          {/* 4つの機能ボタン */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => navigate('/conjugation')}
              className="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <span className="text-3xl mb-2">📝</span>
              <span className="font-medium text-gray-800">活用</span>
            </button>
            <button
              onClick={() => navigate('/typing')}
              className="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <span className="text-3xl mb-2">⌨️</span>
              <span className="font-medium text-gray-800">タイピング</span>
            </button>
            <button
              onClick={() => navigate('/words')}
              className="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <span className="text-3xl mb-2">🇰🇷</span>
              <span className="font-medium text-gray-800">韓→日</span>
            </button>
            <button
              onClick={() => navigate('/words-reverse')}
              className="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <span className="text-3xl mb-2">🇯🇵</span>
              <span className="font-medium text-gray-800">日→韓</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 単語帳モード（韓国語→日本語）
  if (location.pathname === '/words') {
    return <FlashcardHome />;
  }

  // 単語帳モード（日本語→韓国語）
  if (location.pathname === '/words-reverse') {
    return <ReverseFlashcardHome />;
  }

  // タイピング練習モード
  if (location.pathname === '/typing') {
    return (
      <div className="min-h-screen bg-gray-50">
        <CommonHeader title="タイピング練習" />

        {/* 動詞選択 */}
        <div className="max-w-md mx-auto px-4 py-3">
          <select
            value={selectedVerbMode === 'random' ? 'random' : currentVerb.base}
            onChange={(e) => {
              if (e.target.value === 'random') {
                setSelectedVerbMode('random');
              } else {
                setSelectedVerbMode('single');
                const selectedVerb = verbs.find(v => v.base === e.target.value);
                if (selectedVerb) {
                  selectVerb(selectedVerb);
                }
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm bg-white"
          >
            <option value="random">ランダム（全動詞）</option>
            {verbs.map((verb) => {
              return (
                <option key={verb.base} value={verb.base}>
                  {verb.meaningJa}
                </option>
              );
            })}
          </select>
        </div>

        <TypingPractice
          key={selectedVerbMode === 'random' ? 'random' : currentVerb.base}
          verb={selectedVerbMode === 'single' ? currentVerb : undefined}
          verbs={selectedVerbMode === 'random' ? verbs : undefined}
          onComplete={() => {
            handleNext();
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <CommonHeader title="活用トレーニング" />

      {/* 動詞選択 & 問題表示 */}
      <div className="max-w-md mx-auto px-4 py-3">
        <select
          value={currentVerb.base}
          onChange={(e) => {
            const selectedVerb = verbs.find(v => v.base === e.target.value);
            if (selectedVerb) {
              selectVerb(selectedVerb);
            }
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm bg-white mb-3"
        >
          {verbs.map((verb) => {
            return (
              <option key={verb.base} value={verb.base}>
                {verb.meaningJa}
              </option>
            );
          })}
        </select>

        {/* Question Section */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <p className="text-gray-900 text-center text-xl sm:text-2xl font-bold">
            {currentVerb.meaningJa}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-4 py-4 sm:py-6 mt-2">
        {/* Input Section */}
        <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
          {CONJUGATION_FIELDS.map((field) => {
            const result = results[field.key];
            const correctAnswer = field.key === 'base'
              ? currentVerb.base
              : currentVerb[field.key].form;
            const exampleJa = field.key === 'base' ? undefined : currentVerb[field.key].exampleJa;
            const exampleKo = field.key === 'base' ? undefined : currentVerb[field.key].example;
            const meaningJa = field.key === 'base'
              ? currentVerb.meaningJa
              : currentVerb[field.key].meaningJa;
            const label = `${meaningJa}（${field.label}）`;
            return (
              <InputRow
                key={field.key}
                ref={(el) => (inputRefs.current[field.key] = el)}
                label={label}
                value={answers[field.key]}
                onChange={(value) => handleAnswerChange(field.key, value)}
                correctAnswer={correctAnswer}
                exampleJa={exampleJa}
                exampleKo={exampleKo}
                showResult={result !== null}
                isCorrect={result?.isCorrect ?? false}
                showAnswerOnly={result?.showAnswerOnly ?? false}
                onGrade={() => handleGradeField(field.key)}
                onShowAnswer={() => handleShowAnswer(field.key)}
                onCorrect={() => focusNextField(field.key)}
              />
            );
          })}
        </div>

        {/* Next Problem Link */}
        <div className="mb-4 sm:mb-6 text-center">
          <button
            onClick={handleNext}
            className="text-gray-600 hover:text-gray-800 underline cursor-pointer font-medium transition-colors"
          >
            &gt;&gt;次の問題へ
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
