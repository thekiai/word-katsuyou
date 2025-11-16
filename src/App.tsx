import { useState, useEffect, useRef } from 'react';
import { InputRow } from './components/InputRow';
import { VerbEntry, ConjugationType, AnswerResult } from './types';
import { loadVerbs } from './utils/parseCSV';
import { CONJUGATION_FIELDS } from './constants';
import './App.css';

function App() {
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

  const handleGradeAll = () => {
    if (!currentVerb) return;

    const newResults: Record<ConjugationType, AnswerResult | null> = {
      base: null,
      present: null,
      past: null,
      future: null,
      go: null,
      seo: null,
      negative_an: null,
      negative_jian: null,
      possible: null,
    };

    CONJUGATION_FIELDS.forEach((field) => {
      const userAnswer = answers[field.key].trim();
      const correctAnswer = field.key === 'base'
        ? currentVerb.base.trim()
        : currentVerb[field.key].form.trim();

      newResults[field.key] = {
        key: field.key,
        userAnswer,
        correctAnswer,
        isCorrect: userAnswer === correctAnswer,
      };
    });

    setResults(newResults);
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
        nextInput.focus();
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

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-md mx-auto px-4 py-4 sm:py-6">
          <h1 className="text-xl sm:text-2xl font-bold text-center text-gray-800 mb-3 sm:mb-4">
            韓国語活用トレーニング
          </h1>

          {/* Question Section */}
          <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-200">
            <p className="text-gray-900 text-center text-2xl sm:text-3xl font-bold">
              {currentVerb.meaningJa}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-4 py-4 sm:py-6">
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

        {/* Button Section */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-4 sm:mb-6">
          <button
            onClick={handleGradeAll}
            className="flex-1 py-3 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg font-medium transition-colors text-gray-700"
          >
            全ての答えを確認する
          </button>
          <button
            onClick={handleNext}
            className="flex-1 py-3 bg-gray-500 hover:bg-gray-600 rounded-lg font-medium transition-colors text-white"
          >
            次の問題へ
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
