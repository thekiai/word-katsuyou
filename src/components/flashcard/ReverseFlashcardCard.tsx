/**
 * 逆方向フラッシュカードコンポーネント（日本語 → 韓国語入力）
 */

import { useState, useRef, useEffect, useMemo } from 'react';
import { Volume2, StickyNote, ClipboardPaste } from 'lucide-react';
import { Word, topikWords } from '../../data/topikWords';
import { topikWords2 } from '../../data/topikWords2';
import { CardProgress, AnswerGrade } from '../../types/flashcard';
import { useSpeechSynthesis } from '../../hooks/useSpeechSynthesis';
import { useWordMemo, WordLevel } from '../../hooks/useWordMemo';

type ReverseFlashcardCardProps = {
  word: Word;
  progress: CardProgress;
  onAnswer: (grade: AnswerGrade) => void;
  getPreview: (grade: AnswerGrade) => string;
  level?: WordLevel;
};

export const ReverseFlashcardCard = ({
  word,
  progress,
  onAnswer,
  level = 'beginner',
}: ReverseFlashcardCardProps) => {
  const [userInput, setUserInput] = useState('');
  const [isChecked, setIsChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showMemo, setShowMemo] = useState(false);
  const [memoText, setMemoText] = useState('');
  const [hasPasted, setHasPasted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { speak, isSpeaking } = useSpeechSynthesis();
  const { getMemo, setMemo, hasMemo } = useWordMemo(level);

  // 同じ日本語の意味を持つ単語が他にあるかチェック
  const hasDuplicateMeaning = useMemo(() => {
    const wordList = level === 'beginner' ? topikWords : topikWords2;
    return wordList.filter(w => w.japanese === word.japanese).length > 1;
  }, [word.japanese, level]);

  const handleMemoClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!showMemo) {
      setMemoText(getMemo(word.id));
      setHasPasted(false);
    }
    setShowMemo(!showMemo);
  };

  const handleMemoSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMemo(word.id, memoText);
    setShowMemo(false);
  };

  const handlePasteFromClipboard = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const text = await navigator.clipboard.readText();
      setMemoText((prev) => prev + text);
      setHasPasted(true);
    } catch (err) {
      console.error('クリップボードの読み取りに失敗しました:', err);
    }
  };

  // カードが変わったらリセット＆フォーカス
  useEffect(() => {
    setUserInput('');
    setIsChecked(false);
    setIsCorrect(false);
    inputRef.current?.focus();
  }, [word.id]);

  const handleCheck = () => {
    const correct = userInput.trim() === word.korean;
    setIsCorrect(correct);
    setIsChecked(true);
    speak(word.korean);
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
    speak(word.korean);
  };

  const openGoogleSearch = (e: React.MouseEvent) => {
    e.stopPropagation();
    const query = encodeURIComponent(`${word.korean} ${word.japanese} 例文`);
    window.open(`https://www.google.com/search?q=${query}`, '_blank');
  };

  const openImageSearch = (e: React.MouseEvent) => {
    e.stopPropagation();
    const query = encodeURIComponent(`${word.korean} ${word.japanese}`);
    window.open(`https://www.google.com/search?tbm=isch&q=${query}`, '_blank');
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
              onClick={openImageSearch}
              className="text-xs text-gray-400 hover:text-blue-500 underline transition-colors"
            >
              画像 ↗
            </button>
            <button
              onClick={openGoogleSearch}
              className="text-xs text-gray-400 hover:text-blue-500 underline transition-colors"
            >
              例文 ↗
            </button>
          </div>
        )}

        {/* メモボタン（答え表示時のみ） */}
        {isChecked && (
          <button
            onClick={handleMemoClick}
            className={`absolute bottom-3 left-3 p-1.5 transition-colors ${
              hasMemo(word.id)
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
            <div className="text-sm text-gray-500 mb-2">メモ: {word.korean}</div>
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

        {/* 日本語（問題） */}
        <div className="text-4xl font-bold text-gray-900 mb-2">
          {word.japanese}
        </div>

        {/* ヒント（同じ意味の単語が複数ある場合） */}
        {hasDuplicateMeaning && (
          <div className="text-gray-400 text-sm mb-4">
            ヒント: {word.korean.charAt(0)}...
          </div>
        )}
        {!hasDuplicateMeaning && <div className="mb-4" />}

        {/* 入力フィールド */}
        {!isChecked ? (
          <div className="w-full">
            <input
              ref={inputRef}
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="韓国語を入力..."
              className="w-full px-4 py-3 text-xl text-center border-2 border-gray-300 rounded-xl focus:outline-none focus:border-cyan-500"
              autoComplete="off"
            />
            <button
              onClick={handleCheck}
              disabled={!userInput.trim()}
              className={`w-full mt-4 py-3 rounded-xl font-medium text-lg transition-colors ${
                userInput.trim()
                  ? 'bg-cyan-500 hover:bg-cyan-600 text-white'
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

            {/* ユーザーの回答 */}
            {!isCorrect && userInput.trim() && (
              <div className="text-gray-500 mb-2">
                あなたの回答: <span className="line-through">{userInput}</span>
              </div>
            )}

            {/* 正解 */}
            <div className="flex items-center gap-3 justify-center mt-4">
              <button
                onClick={playAudio}
                disabled={isSpeaking}
                className={`p-2 rounded-full transition-colors ${
                  isSpeaking
                    ? 'bg-yellow-100 text-yellow-600'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                }`}
              >
                <Volume2 className="w-5 h-5" />
              </button>
              <span className="text-2xl font-bold text-gray-800">
                {word.korean}
              </span>
            </div>
            {/* メモ表示 */}
            {hasMemo(word.id) && !showMemo && (
              <button
                onClick={handleMemoClick}
                className="mt-3 text-sm text-yellow-600 bg-yellow-50 hover:bg-yellow-100 rounded-lg px-3 py-2 transition-colors"
              >
                {getMemo(word.id)}
              </button>
            )}
          </div>
        )}
      </div>

      {/* 次へボタン */}
      {isChecked && (
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
