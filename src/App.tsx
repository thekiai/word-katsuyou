import { useState, useEffect } from 'react';
import { InputRow } from './components/InputRow';
import { VerbEntry, ConjugationType, AnswerResult } from './types';
import { loadVerbs } from './utils/parseCSV';
import { CONJUGATION_FIELDS } from './constants';
import { useSpeechSynthesis } from './hooks/useSpeechSynthesis';
import './App.css';

function App() {
  const { voices, currentVoice } = useSpeechSynthesis();
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

    // スペースを除去して比較
    const normalizedUserAnswer = userAnswer.replace(/\s/g, '');
    const normalizedCorrectAnswer = correctAnswer.replace(/\s/g, '');

    const result: AnswerResult = {
      key,
      userAnswer,
      correctAnswer,
      isCorrect: normalizedUserAnswer === normalizedCorrectAnswer,
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

      // スペースを除去して比較
      const normalizedUserAnswer = userAnswer.replace(/\s/g, '');
      const normalizedCorrectAnswer = correctAnswer.replace(/\s/g, '');

      newResults[field.key] = {
        key: field.key,
        userAnswer,
        correctAnswer,
        isCorrect: normalizedUserAnswer === normalizedCorrectAnswer,
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
                label={label}
                value={answers[field.key]}
                onChange={(value) => handleAnswerChange(field.key, value)}
                correctAnswer={correctAnswer}
                exampleJa={exampleJa}
                exampleKo={exampleKo}
                showResult={result !== null}
                isCorrect={result?.isCorrect ?? false}
                onGrade={() => handleGradeField(field.key)}
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

        {/* Voice Debug Section */}
        <div className="mt-4 bg-yellow-50 rounded-lg p-4 border border-yellow-200">
          <h3 className="text-sm font-bold text-gray-800 mb-2">🔧 音声デバッグ情報</h3>

          <div className="mb-3">
            <p className="text-xs font-semibold text-gray-700 mb-1">現在使用中の音声:</p>
            <p className="text-sm text-gray-900 bg-white px-2 py-1 rounded border border-gray-200">
              {currentVoice || '未選択'}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-700 mb-1">利用可能な韓国語音声:</p>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {voices
                .filter((voice) => voice.lang === 'ko-KR' || voice.lang.startsWith('ko'))
                .map((voice, index) => {
                  const nameLower = voice.name.toLowerCase();
                  const isYunaPremium = nameLower.includes('yuna') && nameLower.includes('premium');
                  const isYuna = nameLower.includes('yuna');
                  const isSiri = nameLower.includes('siri');

                  return (
                    <div
                      key={index}
                      className={`text-xs px-2 py-1 rounded border ${
                        isYunaPremium
                          ? 'bg-green-100 border-green-300 font-bold'
                          : isYuna
                          ? 'bg-blue-100 border-blue-300'
                          : isSiri
                          ? 'bg-purple-100 border-purple-300'
                          : 'bg-white border-gray-200'
                      }`}
                    >
                      {voice.name} ({voice.lang})
                      {isYunaPremium && ' ⭐ Yuna Premium'}
                      {!isYunaPremium && isYuna && ' ✨ Yuna'}
                      {isSiri && ' 🎤 Siri'}
                    </div>
                  );
                })}
              {voices.filter((voice) => voice.lang === 'ko-KR' || voice.lang.startsWith('ko')).length === 0 && (
                <p className="text-xs text-gray-500 italic">韓国語音声が見つかりません</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
