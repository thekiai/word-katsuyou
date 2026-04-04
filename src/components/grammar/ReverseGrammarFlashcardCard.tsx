/**
 * 文法フラッシュカード（日→韓）入力式コンポーネント
 * 表面: 日本語の意味＋日本語例文
 * ユーザーが韓国語の文法表現を入力して答え合わせ
 */

import { useState, useRef, useEffect, useMemo } from 'react';
import { Volume2, StickyNote, ClipboardPaste } from 'lucide-react';
import { GrammarItem, GrammarLevel } from '../../data/grammarData';
import { CardProgress, AnswerGrade } from '../../types/flashcard';
import { useSpeechSynthesis } from '../../hooks/useSpeechSynthesis';
import { useGrammarMemo } from '../../hooks/useGrammarMemo';

type ReverseGrammarFlashcardCardProps = {
  grammar: GrammarItem;
  progress: CardProgress;
  onAnswer: (grade: AnswerGrade) => void;
  level?: GrammarLevel;
};

export const ReverseGrammarFlashcardCard = ({
  grammar,
  progress,
  onAnswer,
  level = 'beginner',
}: ReverseGrammarFlashcardCardProps) => {
  const [userInput, setUserInput] = useState('');
  const [isChecked, setIsChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [copyInput, setCopyInput] = useState('');
  const [copyDone, setCopyDone] = useState(false);
  const [showMemo, setShowMemo] = useState(false);
  const [memoText, setMemoText] = useState('');
  const [hasPasted, setHasPasted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const copyRef = useRef<HTMLInputElement>(null);
  const { speak, isSpeaking } = useSpeechSynthesis();
  const { getMemo, setMemo, hasMemo } = useGrammarMemo(level);

  // カードが変わったらリセット＆フォーカス
  useEffect(() => {
    setUserInput('');
    setIsChecked(false);
    setIsCorrect(false);
    setCopyInput('');
    setCopyDone(false);
    inputRef.current?.focus();
  }, [grammar.id]);

  const handleCheck = () => {
    const correct = userInput.trim() === grammar.exampleKo;
    setIsCorrect(correct);
    setIsChecked(true);
    speak(grammar.exampleKo);
  };

  const handleNext = () => {
    const grade: AnswerGrade = isCorrect ? 'good' : 'again';
    setUserInput('');
    setIsChecked(false);
    setIsCorrect(false);
    onAnswer(grade);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (!isChecked && userInput.trim()) {
        handleCheck();
      } else if (isChecked) {
        handleNext();
      }
    }
  };

  const playAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    speak(grammar.exampleKo);
  };

  const handleSearch = (e: React.MouseEvent) => {
    e.stopPropagation();
    const query = encodeURIComponent(`${grammar.korean} 意味`);
    window.open(`https://www.google.com/search?q=${query}`, '_blank');
  };

  const handleMemoClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!showMemo) {
      setMemoText(getMemo(grammar.id));
      setHasPasted(false);
    }
    setShowMemo(!showMemo);
  };

  const handleMemoSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMemo(grammar.id, memoText);
    setShowMemo(false);
  };

  const handlePasteFromClipboard = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const text = await navigator.clipboard.readText();
      setMemoText((prev) => prev + text);
      setHasPasted(true);
    } catch {
      console.error('Failed to read clipboard');
    }
  };

  const stateLabel = {
    new: '新規',
    learning: '学習中',
    review: '復習',
    relearning: '再学習',
  }[progress.state];

  const stateColor = {
    new: 'bg-blue-100 text-blue-700',
    learning: 'bg-orange-100 text-orange-700',
    review: 'bg-green-100 text-green-700',
    relearning: 'bg-red-100 text-red-700',
  }[progress.state];

  return (
    <div className="w-full max-w-md mx-auto">
      {/* カード状態 */}
      <div className="flex justify-center mb-4">
        <span className={`px-3 py-1 rounded-full text-sm ${stateColor}`}>
          {stateLabel}
        </span>
      </div>

      {/* カード */}
      <div className="relative bg-white rounded-2xl shadow-lg p-8 min-h-[320px] flex flex-col items-center justify-center">
        {/* 検索リンク（答え表示時のみ） */}
        {isChecked && (
          <div className="absolute bottom-3 right-3 flex gap-3">
            <button
              onClick={handleSearch}
              className="text-xs text-gray-400 hover:text-blue-500 underline transition-colors"
            >
              検索 ↗
            </button>
          </div>
        )}

        {/* メモボタン（答え表示時のみ） */}
        {isChecked && (
          <button
            onClick={handleMemoClick}
            className={`absolute bottom-3 left-3 p-1.5 transition-colors ${
              hasMemo(grammar.id)
                ? 'text-yellow-500 hover:text-yellow-600'
                : 'text-gray-300 hover:text-gray-500'
            }`}
            title="メモ"
          >
            <StickyNote className="w-4 h-4" />
          </button>
        )}

        {/* メモ編集UI */}
        {isChecked && showMemo && (
          <div
            className="absolute inset-0 bg-white rounded-2xl p-4 flex flex-col z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-sm text-gray-500 mb-2">メモ: {grammar.korean}</div>
            <textarea
              value={memoText}
              onChange={(e) => setMemoText(e.target.value)}
              placeholder="メモを入力..."
              className="flex-1 w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:border-blue-500"
              autoFocus
            />
            <div className="flex gap-2 mt-3">
              {hasPasted ? (
                <button
                  onClick={handleMemoSave}
                  className="py-2 px-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm"
                >
                  保存
                </button>
              ) : (
                <button
                  onClick={handlePasteFromClipboard}
                  className="py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors flex items-center gap-1"
                  title="クリップボードから貼り付け"
                >
                  <ClipboardPaste className="w-4 h-4" />
                  <span className="text-sm">貼付</span>
                </button>
              )}
              <button
                onClick={handleMemoClick}
                className="flex-1 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50"
              >
                キャンセル
              </button>
              <button
                onClick={handleMemoSave}
                className="flex-1 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                保存
              </button>
            </div>
          </div>
        )}

        {/* 日本語の意味（問題） */}
        <div className="mb-4 text-center">
          <div className="text-sm text-gray-500 mb-1">意味</div>
          <div className="text-3xl font-bold text-gray-900">
            {grammar.japanese}
          </div>
        </div>

        {/* 日本語例文 */}
        <div className="border-t border-gray-200 my-3 w-full" />
        <div className="mb-6 text-center">
          <div className="text-sm text-gray-500 mb-1">例文</div>
          <div className="text-lg text-gray-800">
            {grammar.exampleJa}
          </div>
        </div>

        {/* 入力フィールド */}
        {!isChecked ? (
          <div className="w-full">
            <input
              ref={inputRef}
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="韓国語の例文を入力..."
              className="w-full px-4 py-3 text-xl text-center border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500"
              autoComplete="off"
            />
            <button
              onClick={handleCheck}
              disabled={!userInput.trim()}
              className={`w-full mt-4 py-3 rounded-xl font-medium text-lg transition-colors ${
                userInput.trim()
                  ? 'bg-blue-500 hover:bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              答え合わせ
            </button>
          </div>
        ) : (
          <div className="w-full text-center animate-fade-in">
            {/* 結果表示 */}
            <div className={`text-lg font-medium mb-2 ${isCorrect ? 'text-green-600' : 'text-red-500'}`}>
              {isCorrect ? '正解！' : '不正解...'}
            </div>

            {/* 差分表示 */}
            {!isCorrect && userInput.trim() && (
              <DiffDisplay userInput={userInput.trim()} correct={grammar.exampleKo} />
            )}

            {/* 正解の韓国語例文 */}
            <div className="flex items-center justify-center gap-2 mt-3 mb-3">
              <button
                onClick={playAudio}
                disabled={isSpeaking}
                className={`p-1.5 rounded-full transition-colors ${
                  isSpeaking
                    ? 'bg-yellow-100 text-yellow-600'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                }`}
              >
                <Volume2 className="w-4 h-4" />
              </button>
              <span className="text-xl font-bold text-gray-900">
                {grammar.exampleKo}
              </span>
            </div>

            {/* 文法表現 */}
            <div className="border-t border-gray-200 my-3" />
            <div className="mb-1">
              <div className="text-sm text-gray-500 mb-1">文法</div>
              <div className="text-2xl font-bold text-blue-600">
                {grammar.korean}
              </div>
            </div>

            {/* 模写入力（不正解時） */}
            {!isCorrect && !copyDone && (
              <div className="mt-4 w-full">
                <div className="text-sm text-gray-500 mb-2">正解を入力して覚えよう</div>
                <input
                  ref={copyRef}
                  type="text"
                  value={copyInput}
                  onChange={(e) => {
                    setCopyInput(e.target.value);
                    if (e.target.value.trim() === grammar.exampleKo) {
                      setCopyDone(true);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && copyDone) {
                      handleNext();
                    }
                  }}
                  placeholder={grammar.exampleKo}
                  className={`w-full px-4 py-3 text-lg text-center border-2 rounded-xl focus:outline-none ${
                    copyInput.trim() && copyInput.trim() !== grammar.exampleKo.slice(0, copyInput.trim().length)
                      ? 'border-red-300 focus:border-red-500'
                      : 'border-gray-300 focus:border-blue-500'
                  }`}
                  autoComplete="off"
                  autoFocus
                />
              </div>
            )}
            {!isCorrect && copyDone && (
              <div className="mt-4 text-green-600 font-medium">模写完了！</div>
            )}

            {/* メモ表示 */}
            {hasMemo(grammar.id) && !showMemo && (
              <div className="mt-3 text-sm text-yellow-600 bg-yellow-50 rounded-lg px-3 py-2 text-left whitespace-pre-wrap">
                {getMemo(grammar.id)}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 次へボタン */}
      {isChecked && (isCorrect || copyDone) && (
        <div className="mt-6 flex justify-center animate-fade-in">
          <button
            onClick={handleNext}
            className={`w-full max-w-[280px] py-4 px-6 rounded-xl font-medium text-lg transition-colors ${
              isCorrect
                ? 'bg-green-500 hover:bg-green-600 text-white'
                : 'bg-orange-500 hover:bg-orange-600 text-white'
            }`}
          >
            次へ
          </button>
        </div>
      )}
    </div>
  );
};

// 文字単位の差分表示コンポーネント
const DiffDisplay = ({ userInput, correct }: { userInput: string; correct: string }) => {
  const diff = useMemo(() => {
    const result: { char: string; type: 'match' | 'wrong' | 'missing' | 'extra' }[] = [];
    const maxLen = Math.max(userInput.length, correct.length);

    for (let i = 0; i < maxLen; i++) {
      if (i < userInput.length && i < correct.length) {
        result.push({
          char: userInput[i],
          type: userInput[i] === correct[i] ? 'match' : 'wrong',
        });
      } else if (i >= userInput.length) {
        result.push({ char: correct[i], type: 'missing' });
      } else {
        result.push({ char: userInput[i], type: 'extra' });
      }
    }
    return result;
  }, [userInput, correct]);

  const colorMap = {
    match: 'text-green-600',
    wrong: 'text-red-500 bg-red-50',
    missing: 'text-blue-500 bg-blue-50',
    extra: 'text-orange-500 bg-orange-50 line-through',
  };

  return (
    <div className="mb-3">
      <div className="text-sm text-gray-500 mb-1">あなたの回答</div>
      <div className="text-lg leading-relaxed">
        {diff.map((d, i) => (
          <span key={i} className={`${colorMap[d.type]} ${d.type !== 'match' ? 'font-bold rounded px-0.5' : ''}`}>
            {d.type === 'missing' ? d.char : d.char}
          </span>
        ))}
      </div>
      <div className="flex gap-3 justify-center mt-2 text-[10px] text-gray-400">
        <span><span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1" />一致</span>
        <span><span className="inline-block w-2 h-2 rounded-full bg-red-500 mr-1" />間違い</span>
        <span><span className="inline-block w-2 h-2 rounded-full bg-blue-500 mr-1" />不足</span>
        <span><span className="inline-block w-2 h-2 rounded-full bg-orange-500 mr-1" />余分</span>
      </div>
    </div>
  );
};
