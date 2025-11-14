import { useState, useEffect } from 'react';
import { InputRow } from './components/InputRow';
import { VerbEntry, ConjugationType, AnswerResult } from './types';
import { loadVerbs } from './utils/parseCSV';
import { CONJUGATION_FIELDS } from './constants';
import './App.css';

function App() {
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
    const correctAnswer = currentVerb[key].trim();
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
      const correctAnswer = currentVerb[field.key].trim();
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
        <div className="max-w-2xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-4">
            韓国語活用トレーニング
          </h1>

          {/* Question Section */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <p className="text-gray-600 text-center text-sm font-medium mb-2">
              意味
            </p>
            <p className="text-gray-900 text-center text-3xl font-bold">
              {currentVerb.meaningJa}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Input Section */}
        <div className="space-y-3 mb-6">
          {CONJUGATION_FIELDS.map((field) => {
            const result = results[field.key];
            return (
              <InputRow
                key={field.key}
                label={field.label}
                value={answers[field.key]}
                onChange={(value) => handleAnswerChange(field.key, value)}
                correctAnswer={currentVerb[field.key]}
                showResult={result !== null}
                isCorrect={result?.isCorrect ?? false}
                onGrade={() => handleGradeField(field.key)}
              />
            );
          })}
        </div>

        {/* Button Section */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={handleGradeAll}
            className="flex-1 py-3 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg font-medium transition-colors text-gray-700"
          >
            全て採点する
          </button>
          <button
            onClick={handleNext}
            className="flex-1 py-3 bg-gray-500 hover:bg-gray-600 rounded-lg font-medium transition-colors text-white"
          >
            次の問題へ
          </button>
        </div>

        {/* Score Section */}
        {Object.values(results).some((r) => r !== null) && (
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <p className="text-center text-lg font-semibold text-gray-800">
              正解数:{' '}
              <span className="text-gray-900">
                {Object.values(results).filter((r) => r?.isCorrect).length}
              </span>{' '}
              / {Object.values(results).filter((r) => r !== null).length}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
