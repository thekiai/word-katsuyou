/**
 * 文法フラッシュカードコンポーネント
 * 表面: 韓国語例文
 * 裏面: 文法表現、日本語意味、日本語例文訳
 */

import { useState } from 'react';
import { Volume2, StickyNote, ClipboardPaste } from 'lucide-react';
import { GrammarItem, GrammarLevel } from '../../data/grammarData';
import { CardProgress, AnswerGrade } from '../../types/flashcard';
import { useSpeechSynthesis } from '../../hooks/useSpeechSynthesis';
import { useGrammarMemo } from '../../hooks/useGrammarMemo';

type GrammarFlashcardCardProps = {
  grammar: GrammarItem;
  progress: CardProgress;
  onAnswer: (grade: AnswerGrade) => void;
  getPreview: (grade: AnswerGrade) => string;
  level?: GrammarLevel;
};

export const GrammarFlashcardCard = ({
  grammar,
  progress,
  onAnswer,
  getPreview,
  level = 'beginner',
}: GrammarFlashcardCardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showMemo, setShowMemo] = useState(false);
  const [memoText, setMemoText] = useState('');
  const [hasPasted, setHasPasted] = useState(false);
  const { speak, isSpeaking } = useSpeechSynthesis();
  const { getMemo, setMemo, hasMemo } = useGrammarMemo(level);

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
      if (text) {
        setMemoText(text);
        setHasPasted(true);
      }
    } catch {
      console.error('Failed to read clipboard');
    }
  };

  const handleFlip = () => {
    if (!isFlipped) {
      setIsFlipped(true);
      speak(grammar.exampleKo);
    }
  };

  const handleAnswer = (grade: AnswerGrade) => {
    setIsFlipped(false);
    onAnswer(grade);
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
      <div
        onClick={handleFlip}
        className={`
          relative bg-white rounded-2xl shadow-lg p-8 min-h-[320px]
          flex flex-col items-center justify-center cursor-pointer
          transition-all duration-200 hover:shadow-xl
          ${!isFlipped ? 'hover:scale-[1.02]' : ''}
        `}
      >
        {/* 検索リンク（答え表示時のみ） */}
        {isFlipped && (
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
        {isFlipped && (
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
        {isFlipped && showMemo && (
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

        {!isFlipped ? (
          /* 表面: 韓国語例文 */
          <>
            <div className="flex items-center gap-3 mb-4">
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
            </div>
            <p className="text-2xl font-bold text-gray-900 text-center leading-relaxed">
              {grammar.exampleKo}
            </p>
            <div className="text-gray-400 mt-6">
              タップして答えを見る
            </div>
          </>
        ) : (
          /* 裏面: 文法・日本語意味・例文訳 */
          <div className="text-center animate-fade-in w-full">
            {/* 文法表現 */}
            <div className="mb-4">
              <div className="text-sm text-gray-500 mb-1">文法</div>
              <div className="text-3xl font-bold text-blue-600">
                {grammar.korean}
              </div>
            </div>

            {/* 日本語意味 */}
            <div className="mb-4">
              <div className="text-sm text-gray-500 mb-1">意味</div>
              <div className="text-xl text-gray-800">
                {grammar.japanese}
              </div>
            </div>

            {/* 区切り線 */}
            <div className="border-t border-gray-200 my-4" />

            {/* 例文（韓国語 → 日本語） */}
            <div>
              <div className="text-sm text-gray-500 mb-2">例文</div>
              <div className="flex items-center justify-center gap-2 mb-2">
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
                <span className="text-lg text-gray-900">
                  {grammar.exampleKo}
                </span>
              </div>
              <div className="text-base text-gray-600">
                {grammar.exampleJa}
              </div>
            </div>

            {/* メモ表示 */}
            {hasMemo(grammar.id) && !showMemo && (
              <button
                onClick={handleMemoClick}
                className="mt-3 text-sm text-yellow-600 bg-yellow-50 hover:bg-yellow-100 rounded-lg px-3 py-2 transition-colors text-left whitespace-pre-wrap"
              >
                {getMemo(grammar.id)}
              </button>
            )}
          </div>
        )}
      </div>

      {/* 回答ボタン */}
      {isFlipped && (
        <div className="mt-6 flex gap-4 justify-center animate-fade-in">
          <button
            onClick={() => handleAnswer('again')}
            className="flex-1 max-w-[140px] py-4 px-6 bg-gray-400 hover:bg-gray-500 text-white rounded-xl font-medium transition-colors"
          >
            <div className="text-lg">もう一回</div>
            <div className="text-xs opacity-80 mt-1">
              {getPreview('again')}
            </div>
          </button>
          <button
            onClick={() => handleAnswer('good')}
            className="flex-1 max-w-[140px] py-4 px-6 bg-green-400 hover:bg-green-500 text-white rounded-xl font-medium transition-colors"
          >
            <div className="text-lg">OK</div>
            <div className="text-xs opacity-80 mt-1">
              {getPreview('good')}
            </div>
          </button>
        </div>
      )}
    </div>
  );
};
