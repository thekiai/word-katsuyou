import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { InputRow } from './components/InputRow';
import { TypingPractice } from './components/TypingPractice';
import { ActivityGraph } from './components/ActivityGraph';
import { CommonHeader } from './components/CommonHeader';
import { FlashcardHome, ReverseFlashcardHome, IntermediateFlashcardHome, ReverseIntermediateFlashcardHome } from './components/flashcard';
import { BeginnerGrammarHome, IntermediateGrammarHome, ReverseBeginnerGrammarHome, ReverseIntermediateGrammarHome } from './components/grammar';
import { VerbEntry, ConjugationType, AnswerResult } from './types';
import { loadVerbs } from './utils/parseCSV';
import { CONJUGATION_FIELDS } from './constants';
import { useVerbProgress } from './hooks/useVerbProgress';
import { useHomeProgress, ProgressInfo } from './hooks/useHomeProgress';
import './App.css';

// 進捗バー付きのナビカードコンポーネント
const NavCard = ({
  onClick,
  emoji,
  label,
  total,
  learning,
  young,
  relearning,
  mature,
}: {
  onClick: () => void;
  emoji: string;
  label: string;
} & ProgressInfo) => {
  const learned = learning + young + relearning + mature;
  const pct = (n: number) => total > 0 ? (n / total) * 100 : 0;
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center p-4 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
    >
      <span className="text-2xl mb-1">{emoji}</span>
      <span className="font-medium text-gray-800 text-sm">{label}</span>
      <div className="w-full mt-2">
        <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
          <div className="h-full flex">
            <div className="bg-orange-400" style={{ width: `${pct(learning)}%` }} />
            <div className="bg-blue-400" style={{ width: `${pct(young)}%` }} />
            <div className="bg-red-400" style={{ width: `${pct(relearning)}%` }} />
            <div className="bg-green-500" style={{ width: `${pct(mature)}%` }} />
          </div>
        </div>
        <div className="text-[10px] text-gray-400 mt-0.5 text-center">
          {learned}/{total}
        </div>
      </div>
    </button>
  );
};

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoading: verbProgressLoading, getVerbCount, incrementVerbCount, getPracticeDates, getStreakDays } = useVerbProgress();
  const homeProgress = useHomeProgress();

  // 画面遷移時にスクロール位置をリセット
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
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

  if (loading || verbProgressLoading) {
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
        <CommonHeader title="韓国語トレーニング" />

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

          {/* 活用・タイピング */}
          <div className="grid grid-cols-2 gap-3 mb-4">
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
          </div>

          {/* 初級単語 */}
          <div className="mb-3">
            <p className="text-xs text-gray-500 mb-2 px-1">初級単語（1,671語）</p>
            <div className="grid grid-cols-2 gap-3">
              <NavCard onClick={() => navigate('/words')} emoji="🇰🇷" label="韓→日" {...homeProgress.wordsKoJa} />
              <NavCard onClick={() => navigate('/words-reverse')} emoji="🇯🇵" label="日→韓" {...homeProgress.wordsJaKo} />
            </div>
          </div>

          {/* 中級単語 */}
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-2 px-1">中級単語（2,662語）</p>
            <div className="grid grid-cols-2 gap-3">
              <NavCard onClick={() => navigate('/words-intermediate')} emoji="🇰🇷" label="韓→日" {...homeProgress.wordsIntKoJa} />
              <NavCard onClick={() => navigate('/words-intermediate-reverse')} emoji="🇯🇵" label="日→韓" {...homeProgress.wordsIntJaKo} />
            </div>
          </div>

          {/* 初級文法 */}
          <div className="mb-3">
            <p className="text-xs text-gray-500 mb-2 px-1">初級文法（84項目）</p>
            <div className="grid grid-cols-2 gap-3">
              <NavCard onClick={() => navigate('/grammar-beginner')} emoji="🇰🇷" label="韓→日" {...homeProgress.grammarBegKoJa} />
              <NavCard onClick={() => navigate('/grammar-beginner-reverse')} emoji="🇯🇵" label="日→韓" {...homeProgress.grammarBegJaKo} />
            </div>
          </div>

          {/* 中級文法 */}
          <div>
            <p className="text-xs text-gray-500 mb-2 px-1">中級文法（148項目）</p>
            <div className="grid grid-cols-2 gap-3">
              <NavCard onClick={() => navigate('/grammar-intermediate')} emoji="🇰🇷" label="韓→日" {...homeProgress.grammarIntKoJa} />
              <NavCard onClick={() => navigate('/grammar-intermediate-reverse')} emoji="🇯🇵" label="日→韓" {...homeProgress.grammarIntJaKo} />
            </div>
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

  // 中級単語帳モード（韓国語→日本語）
  if (location.pathname === '/words-intermediate') {
    return <IntermediateFlashcardHome />;
  }

  // 中級単語帳モード（日本語→韓国語）
  if (location.pathname === '/words-intermediate-reverse') {
    return <ReverseIntermediateFlashcardHome />;
  }

  // 初級文法モード
  if (location.pathname === '/grammar-beginner') {
    return <BeginnerGrammarHome />;
  }

  // 初級文法（日→韓）モード
  if (location.pathname === '/grammar-beginner-reverse') {
    return <ReverseBeginnerGrammarHome />;
  }

  // 中級文法モード
  if (location.pathname === '/grammar-intermediate') {
    return <IntermediateGrammarHome />;
  }

  // 中級文法（日→韓）モード
  if (location.pathname === '/grammar-intermediate-reverse') {
    return <ReverseIntermediateGrammarHome />;
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

  // 正解数を計算
  const correctCount = CONJUGATION_FIELDS.filter(
    (field) => results[field.key]?.isCorrect
  ).length;
  const totalFields = CONJUGATION_FIELDS.length;
  const allCorrect = correctCount === totalFields;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <CommonHeader
        title="活用トレーニング"
        rightContent={
          <span className="text-sm text-gray-500">
            {correctCount}/{totalFields}
          </span>
        }
      />

      {/* 問題カード */}
      <div className="max-w-md mx-auto px-4 py-4">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-4">
          {/* 動詞選択 */}
          <select
            value={currentVerb.base}
            onChange={(e) => {
              const selectedVerb = verbs.find(v => v.base === e.target.value);
              if (selectedVerb) {
                selectVerb(selectedVerb);
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm bg-gray-50 mb-4"
          >
            {verbs.map((verb) => {
              const count = getVerbCount(verb.base);
              return (
                <option key={verb.base} value={verb.base}>
                  {verb.meaningJa} {count > 0 ? `(${count}回)` : ''}
                </option>
              );
            })}
          </select>

          {/* 問題表示 */}
          <p className="text-gray-900 text-center text-2xl font-bold">
            {currentVerb.meaningJa}
          </p>
        </div>

        {/* 入力フィールド */}
        <div className="space-y-3 mb-6">
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

        {/* 次へボタン */}
        <button
          onClick={handleNext}
          className={`w-full py-4 rounded-xl font-medium text-lg transition-colors ${
            allCorrect
              ? 'bg-green-500 hover:bg-green-600 text-white'
              : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
          }`}
        >
          次の問題へ
        </button>
      </div>
    </div>
  );
}

export default App;
