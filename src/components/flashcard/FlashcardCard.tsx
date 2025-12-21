/**
 * フラッシュカードコンポーネント
 */

import { useState } from 'react';
import { Volume2, ExternalLink, StickyNote } from 'lucide-react';
import { Word } from '../../data/topikWords';
import { CardProgress, AnswerGrade } from '../../types/flashcard';
import { useSpeechSynthesis } from '../../hooks/useSpeechSynthesis';
import { useWordMemo } from '../../hooks/useWordMemo';

// 最後に貼り付けたテキストを記憶（セッション中）
let lastPastedText = '';

type FlashcardCardProps = {
  word: Word;
  progress: CardProgress;
  onAnswer: (grade: AnswerGrade) => void;
  getPreview: (grade: AnswerGrade) => string;
};

export const FlashcardCard = ({
  word,
  progress,
  onAnswer,
  getPreview,
}: FlashcardCardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showMemo, setShowMemo] = useState(false);
  const [memoText, setMemoText] = useState('');
  const [clipboardText, setClipboardText] = useState('');
  const { speak, isSpeaking } = useSpeechSynthesis();
  const { getMemo, setMemo, hasMemo } = useWordMemo();

  // 韓国語が含まれているかチェック
  const hasKorean = (text: string) => /[\uAC00-\uD7AF]/.test(text);

  // 画像URLかどうかチェック
  const isImageUrl = (text: string) => {
    const trimmed = text.trim();
    return /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?.*)?$/i.test(trimmed) ||
           /^https?:\/\/(i\.)?imgur\.com\//i.test(trimmed) ||
           /^https?:\/\/.*\/(image|img|photo)\//i.test(trimmed);
  };

  // メモをレンダリング（画像URLは画像として表示）
  const renderMemo = (memo: string) => {
    const lines = memo.split('\n');
    return lines.map((line, index) => {
      const trimmed = line.trim();
      if (isImageUrl(trimmed)) {
        return (
          <img
            key={index}
            src={trimmed}
            alt="メモ画像"
            className="max-w-full max-h-32 rounded mt-1"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        );
      }
      return trimmed ? <div key={index}>{trimmed}</div> : null;
    });
  };

  const handleMemoClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!showMemo) {
      // クリップボードをチェック
      try {
        const text = await navigator.clipboard.readText();
        if ((hasKorean(text) || isImageUrl(text)) && text !== lastPastedText) {
          // クリップボードに韓国語または画像URLがあり、まだ貼り付けていなければ即座に保存
          const currentMemo = getMemo(word.id);
          const newMemo = currentMemo ? currentMemo + '\n' + text : text;
          setMemo(word.id, newMemo);
          lastPastedText = text; // 貼り付けたテキストを記憶
          return; // メモ編集画面を開かない
        }
      } catch {
        // クリップボード読み取り失敗時は通常のメモ編集画面を開く
      }
      setMemoText(getMemo(word.id));
      setClipboardText('');
    }
    setShowMemo(!showMemo);
  };

  const handlePasteFromClipboard = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (clipboardText) {
      setMemoText((prev) => (prev ? prev + '\n' + clipboardText : clipboardText));
      setClipboardText('');
    }
  };

  const handleMemoSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMemo(word.id, memoText);
    setShowMemo(false);
  };

  const handleFlip = () => {
    if (!isFlipped) {
      setIsFlipped(true);
      speak(word.korean);
    }
  };

  const handleAnswer = (grade: AnswerGrade) => {
    setIsFlipped(false);
    onAnswer(grade);
  };

  const playAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    speak(word.korean);
  };

  const openGoogleSearch = (e: React.MouseEvent) => {
    e.stopPropagation();
    const query = encodeURIComponent(`${word.korean} 意味`);
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
          relative bg-white rounded-2xl shadow-lg p-8 min-h-[280px]
          flex flex-col items-center justify-center cursor-pointer
          transition-all duration-200 hover:shadow-xl
          ${!isFlipped ? 'hover:scale-[1.02]' : ''}
        `}
      >
        {/* Google検索ボタン（答え表示時のみ） */}
        {isFlipped && (
          <button
            onClick={openGoogleSearch}
            className="absolute bottom-3 right-3 p-1.5 text-gray-300 hover:text-gray-500 transition-colors"
            title="Googleで検索"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
        )}

        {/* メモボタン（答え表示時のみ） */}
        {isFlipped && (
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
        {isFlipped && showMemo && (
          <div
            className="absolute inset-0 bg-white rounded-2xl p-4 flex flex-col z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-sm text-gray-500 mb-2">メモ: {word.korean}</div>
            {/* クリップボード貼り付けボタン */}
            {clipboardText && (
              <button
                onClick={handlePasteFromClipboard}
                className="mb-2 py-2 px-3 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 text-sm text-left truncate"
              >
                📋 貼り付け: {clipboardText.slice(0, 30)}{clipboardText.length > 30 ? '...' : ''}
              </button>
            )}
            <textarea
              value={memoText}
              onChange={(e) => setMemoText(e.target.value)}
              placeholder="メモを入力..."
              className="flex-1 w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:border-blue-500"
              autoFocus
            />
            <div className="flex gap-2 mt-3">
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

        {/* 韓国語 */}
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
          <span className="text-4xl font-bold text-gray-900">
            {word.korean}
          </span>
        </div>

        {/* 答え表示 */}
        {isFlipped ? (
          <div className="text-center animate-fade-in">
            <div className="text-2xl text-gray-700 mt-4">
              {word.japanese}
            </div>
            {/* メモ表示 */}
            {hasMemo(word.id) && !showMemo && (
              <div className="mt-3 text-sm text-yellow-600 bg-yellow-50 rounded-lg px-3 py-2">
                {renderMemo(getMemo(word.id))}
              </div>
            )}
          </div>
        ) : (
          <div className="text-gray-400 mt-4">
            タップして答えを見る
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
