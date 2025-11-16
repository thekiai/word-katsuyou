import { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { InputRow } from './components/InputRow';
import { TypingPractice } from './components/TypingPractice';
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
};

const getProgress = (): ProgressData => {
  try {
    const data = localStorage.getItem(PROGRESS_KEY);
    if (!data) return { verbs: {} };
    return JSON.parse(data);
  } catch {
    return { verbs: {} };
  }
};

const getVerbCount = (verbBase: string): number => {
  const progress = getProgress();
  return progress.verbs[verbBase]?.count || 0;
};

const incrementVerbCount = (verbBase: string) => {
  const progress = getProgress();
  const currentCount = progress.verbs[verbBase]?.count || 0;

  progress.verbs[verbBase] = {
    count: currentCount + 1,
    lastCompleted: new Date().toISOString(),
  };

  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
};

const getTotalCompletedCount = (): number => {
  const progress = getProgress();
  return Object.values(progress.verbs).reduce((sum, verb) => sum + verb.count, 0);
};

const getTodayCompletedCount = (): number => {
  const progress = getProgress();
  const today = new Date().toISOString().split('T')[0];

  return Object.values(progress.verbs).filter(verb => {
    if (!verb.lastCompleted) return false;
    const completedDate = verb.lastCompleted.split('T')[0];
    return completedDate === today;
  }).reduce((sum, verb) => sum + verb.count, 0);
};

type Mode = 'home' | 'conjugation' | 'typing';

function App() {
  const [mode, setMode] = useState<Mode>('home');
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

  const selectRandomVerb = (verbList: VerbEntry[]) => {
    const randomIndex = Math.floor(Math.random() * verbList.length);
    setCurrentVerb(verbList[randomIndex]);
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
    if (verbs.length > 0) {
      selectRandomVerb(verbs);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const focusNextField = (currentKey: ConjugationType) => {
    const currentIndex = CONJUGATION_FIELDS.findIndex((f) => f.key === currentKey);
    if (currentIndex < CONJUGATION_FIELDS.length - 1) {
      const nextKey = CONJUGATION_FIELDS[currentIndex + 1].key;
      const nextInput = inputRefs.current[nextKey];
      if (nextInput) {
        // モバイルでキーボードを維持するため、preventScrollなしでフォーカス
        nextInput.focus({ preventScroll: true });
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
  if (mode === 'home') {
    const totalCount = getTotalCompletedCount();
    const todayCount = getTodayCompletedCount();

    // 動詞を完了回数でソート
    const sortedVerbs = [...verbs].sort((a, b) => {
      const countA = getVerbCount(a.base);
      const countB = getVerbCount(b.base);
      return countB - countA; // 降順
    });

    return (
      <div className="min-h-screen bg-gray-50 text-gray-900">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-md mx-auto px-4 py-4 sm:py-6">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 text-center mb-4">
              韓国語活用トレーニング
            </h1>

            {/* 統計情報 */}
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-gray-600 text-xs mb-1">総練習回数</p>
                  <p className="text-xl font-bold text-gray-800">{totalCount}回</p>
                </div>
                <div>
                  <p className="text-gray-600 text-xs mb-1">今日の練習</p>
                  <p className="text-xl font-bold text-gray-800">{todayCount}回</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-md mx-auto px-4 py-4 sm:py-6">
          {/* アクションボタン */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-4 sm:mb-6">
            <button
              onClick={() => {
                selectRandomVerb(verbs);
                setMode('conjugation');
              }}
              className="flex-1 py-3 bg-gray-500 hover:bg-gray-600 rounded-lg font-medium transition-colors text-white"
            >
              ランダムに練習
            </button>
            <button
              onClick={() => setMode('typing')}
              className="flex-1 py-3 bg-gray-500 hover:bg-gray-600 rounded-lg font-medium transition-colors text-white"
            >
              タイピング練習
            </button>
          </div>

          {/* 動詞リスト */}
          <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
            {sortedVerbs.map((verb) => {
              const count = getVerbCount(verb.base);
              return (
                <button
                  key={verb.base}
                  onClick={() => {
                    setCurrentVerb(verb);
                    setMode('conjugation');
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-white hover:shadow-sm transition-colors text-left"
                >
                  <div>
                    <span className="font-semibold text-base text-gray-800">{verb.meaningJa}</span>
                    <span className="text-gray-500 text-sm ml-2">({verb.base})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {count > 0 && (
                      <span className="text-yellow-500 text-sm font-semibold">
                        {'⭐'.repeat(Math.min(count, 5))} {count}
                      </span>
                    )}
                    {count === 0 && (
                      <span className="text-gray-400 text-sm">-</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // タイピング練習モード
  if (mode === 'typing') {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* ヘッダー */}
        <div className="sticky top-0 bg-white shadow-sm border-b border-gray-200 z-20 px-4 py-3">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
            {/* 動詞選択 */}
            <div className="flex-1 max-w-xs">
              <select
                value={selectedVerbMode === 'random' ? 'random' : currentVerb.base}
                onChange={(e) => {
                  if (e.target.value === 'random') {
                    setSelectedVerbMode('random');
                  } else {
                    setSelectedVerbMode('single');
                    const selectedVerb = verbs.find(v => v.base === e.target.value);
                    if (selectedVerb) {
                      setCurrentVerb(selectedVerb);
                    }
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
              >
                <option value="random">🎲 ランダム（全動詞）</option>
                {verbs.map((verb) => {
                  const count = getVerbCount(verb.base);
                  return (
                    <option key={verb.base} value={verb.base}>
                      {count > 0 ? `⭐${count} ` : ''}{verb.meaningJa}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* モード切り替えボタン */}
            <div className="flex gap-2">
              <button
                onClick={() => setMode('home')}
                className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg font-medium transition-colors text-gray-700 text-sm whitespace-nowrap"
              >
                ホーム
              </button>
              <button
                onClick={() => setMode('conjugation')}
                className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg font-medium transition-colors text-gray-700 text-sm whitespace-nowrap"
              >
                活用トレーニング
              </button>
            </div>
          </div>
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
      {/* Header */}
      <div className="sticky top-0 bg-white shadow-sm border-b border-gray-200 z-20">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4 mb-3">
            {/* 動詞選択 */}
            <div className="flex-1">
              <select
                value={currentVerb.base}
                onChange={(e) => {
                  const selectedVerb = verbs.find(v => v.base === e.target.value);
                  if (selectedVerb) {
                    setCurrentVerb(selectedVerb);
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
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
              >
                {verbs.map((verb) => {
                  const count = getVerbCount(verb.base);
                  return (
                    <option key={verb.base} value={verb.base}>
                      {count > 0 ? `⭐${count} ` : ''}{verb.meaningJa}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* モード切り替えボタン */}
            <div className="flex gap-2">
              <button
                onClick={() => setMode('home')}
                className="px-3 py-2 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg font-medium transition-colors text-gray-700 text-sm whitespace-nowrap"
              >
                ホーム
              </button>
              <button
                onClick={() => setMode('typing')}
                className="px-3 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg font-medium transition-colors text-white text-sm whitespace-nowrap"
              >
                タイピング練習
              </button>
            </div>
          </div>

          {/* Question Section */}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <p className="text-gray-900 text-center text-xl sm:text-2xl font-bold">
              {currentVerb.meaningJa}
            </p>
          </div>
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
            &gt;&gt;次の問題へ（ランダム選択）
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
