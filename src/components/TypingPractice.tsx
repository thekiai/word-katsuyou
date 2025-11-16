import { useState, useEffect, useRef } from 'react';
import Hangul from 'hangul-js';
import { Volume2, Check } from 'lucide-react';
import { VerbEntry } from '../types';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';

type TypingPracticeProps = {
  verb?: VerbEntry;
  verbs?: VerbEntry[];
  onComplete: () => void;
};

export const TypingPractice = ({ verb, verbs, onComplete }: TypingPracticeProps) => {
  // 全ての例文を取得
  const examples = verbs
    ? // ランダムモード: 全動詞の全例文をシャッフル
      verbs.flatMap((v) => [
        { text: v.present.example, label: `現在形（${v.meaningJa}）`, meaning: v.present.exampleJa, verb: v.base },
        { text: v.past.example, label: `過去形（${v.meaningJa}）`, meaning: v.past.exampleJa, verb: v.base },
        { text: v.future.example, label: `未来形（${v.meaningJa}）`, meaning: v.future.exampleJa, verb: v.base },
        { text: v.go.example, label: `連用（고）（${v.meaningJa}）`, meaning: v.go.exampleJa, verb: v.base },
        { text: v.seo.example, label: `連用（서）（${v.meaningJa}）`, meaning: v.seo.exampleJa, verb: v.base },
        { text: v.negative_an.example, label: `否定（안）（${v.meaningJa}）`, meaning: v.negative_an.exampleJa, verb: v.base },
        { text: v.negative_jian.example, label: `否定（지 않아요）（${v.meaningJa}）`, meaning: v.negative_jian.exampleJa, verb: v.base },
        { text: v.possible.example, label: `可能（${v.meaningJa}）`, meaning: v.possible.exampleJa, verb: v.base },
      ]).sort(() => Math.random() - 0.5)
    : // 通常モード: 1つの動詞の例文を順番に
      verb
      ? [
          { text: verb.present.example, label: '現在形', meaning: verb.present.exampleJa },
          { text: verb.past.example, label: '過去形', meaning: verb.past.exampleJa },
          { text: verb.future.example, label: '未来形', meaning: verb.future.exampleJa },
          { text: verb.go.example, label: '連用（고）', meaning: verb.go.exampleJa },
          { text: verb.seo.example, label: '連用（서）', meaning: verb.seo.exampleJa },
          { text: verb.negative_an.example, label: '否定（안）', meaning: verb.negative_an.exampleJa },
          { text: verb.negative_jian.example, label: '否定（지 않아요）', meaning: verb.negative_jian.exampleJa },
          { text: verb.possible.example, label: '可能', meaning: verb.possible.exampleJa },
        ]
      : [];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [isPlayingFullText, setIsPlayingFullText] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { speak, isSpeaking, currentText } = useSpeechSynthesis();

  const currentExample = examples[currentIndex];
  const targetText = currentExample.text;

  // 全文再生中かどうかをチェック
  useEffect(() => {
    if (isSpeaking && currentText === targetText) {
      setIsPlayingFullText(true);
    } else {
      setIsPlayingFullText(false);
    }
  }, [isSpeaking, currentText, targetText]);

  // 全文再生
  const playFullText = () => {
    speak(targetText);
  };

  // 単語をクリックして再生
  const playWord = (word: string) => {
    speak(word);
  };

  // スキップ機能
  const handleSkip = () => {
    if (currentIndex < examples.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setUserInput('');
    } else {
      onComplete();
    }
  };

  // ターゲットテキストを字母に分解（スペースも含める）
  const targetJamo: string[] = [];
  for (const char of targetText) {
    if (char === ' ') {
      targetJamo.push(' ');
    } else {
      targetJamo.push(...Hangul.disassemble(char));
    }
  }

  // 問題が変わったらinputにフォーカス & 自動音声再生
  useEffect(() => {
    setUserInput(''); // 入力をクリア
    inputRef.current?.focus();

    // 少し遅延させて、Strict Modeの2重実行を回避
    const timer = setTimeout(() => {
      speak(targetText);
    }, 100);

    return () => {
      clearTimeout(timer);
      window.speechSynthesis.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex]);

  // 入力を字母に変換（スペースも含める）
  const inputToJamo = (input: string): string[] => {
    const jamo: string[] = [];
    for (const char of input) {
      if (char === ' ') {
        jamo.push(' ');
      } else {
        jamo.push(...Hangul.disassemble(char));
      }
    }
    return jamo;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const inputJamo = inputToJamo(input);

    // 入力が短くなる場合（削除）は常に許可
    if (inputJamo.length <= inputToJamo(userInput).length) {
      setUserInput(input);
      return;
    }

    // 入力が長くなる場合
    // 現在の入力に間違いがある場合は、新しい文字を追加できない
    const currentJamo = inputToJamo(userInput);
    let hasError = false;
    for (let i = 0; i < currentJamo.length; i++) {
      if (currentJamo[i] !== targetJamo[i]) {
        hasError = true;
        break;
      }
    }

    if (!hasError) {
      // 間違いがない場合のみ、新しい文字を追加できる
      setUserInput(input);

      // 完成したら次へ
      if (inputJamo.length === targetJamo.length &&
          inputJamo.every((j, i) => j === targetJamo[i])) {
        // チェックマーク表示
        setShowSuccess(true);

        setTimeout(() => {
          setShowSuccess(false);
          if (currentIndex < examples.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setUserInput('');
          } else {
            onComplete();
          }
        }, 1000);
      }
    }
  };

  const renderText = () => {
    const words = targetText.split(' ');
    const inputJamo = inputToJamo(userInput);
    let jamoIndex = 0;

    const elements: JSX.Element[] = [];

    words.forEach((word, wordIndex) => {
      const chars = word.split('');
      const wordElements: JSX.Element[] = [];

      // 単語内の各文字を処理
      chars.forEach((char, charIndex) => {
        const charJamo = Hangul.disassemble(char);
        const charJamoCount = charJamo.length;

        let matchedJamoCount = 0;
        let hasError = false;

        for (let i = 0; i < charJamoCount; i++) {
          if (jamoIndex + i < inputJamo.length) {
            if (inputJamo[jamoIndex + i] === charJamo[i]) {
              matchedJamoCount++;
            } else {
              hasError = true;
              break;
            }
          } else {
            break;
          }
        }

        jamoIndex += charJamoCount;

        let className = 'inline-block';
        if (hasError) {
          className += ' text-pink-400';
        } else if (matchedJamoCount === charJamoCount) {
          className += ' text-green-500';
        } else if (matchedJamoCount > 0) {
          className += ' text-blue-400';
        } else {
          className += ' text-gray-400';
        }

        wordElements.push(
          <span key={charIndex} className={className}>
            {char}
          </span>
        );
      });

      // 単語を追加
      elements.push(
        <span
          key={`word-${wordIndex}`}
          className="cursor-pointer hover:opacity-70 transition-opacity"
          onClick={() => playWord(word)}
          title="クリックで再生"
        >
          {wordElements}
        </span>
      );

      // スペースの処理（最後の単語以外）
      if (wordIndex < words.length - 1) {
        let spaceClassName = 'inline-block w-4 h-1 mx-1 rounded ';

        if (jamoIndex < inputJamo.length) {
          if (inputJamo[jamoIndex] === ' ') {
            spaceClassName += 'bg-green-500';
          } else {
            spaceClassName += 'bg-pink-400';
          }
        } else {
          spaceClassName += 'bg-gray-300';
        }

        jamoIndex++;

        elements.push(
          <span key={`space-${wordIndex}`} className={spaceClassName}></span>
        );
      }
    });

    return (
      <div className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-wide flex justify-center items-center flex-wrap">
        {elements}
        {showSuccess && (
          <div className="animate-scale-in inline-flex ml-4">
            <div className="bg-green-500 rounded-full p-2">
              <Check className="w-8 h-8 md:w-10 md:h-10 text-white" strokeWidth={3} />
            </div>
          </div>
        )}
      </div>
    );
  };

  const progress = (currentIndex / examples.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-start md:justify-center p-4 md:p-6 lg:p-8 pt-8 md:pt-6 lg:pt-8">
      <div className="max-w-4xl w-full">
        {/* プログレスバー */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">
              完了: {currentIndex} / {examples.length}
            </span>
            <span className="text-sm text-gray-600">{currentExample.label}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSkip}
              className="text-sm text-gray-500 hover:text-gray-700 underline cursor-pointer"
            >
              &gt;&gt;スキップする
            </button>
          </div>
        </div>

        {/* 日本語の意味 */}
        <div className="text-center mb-8">
          <p className="text-lg md:text-xl lg:text-2xl text-gray-700">{currentExample.meaning}</p>
        </div>

        {/* タイピングテキストと再生ボタン */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {/* 全文再生ボタン */}
          <button
            type="button"
            onClick={playFullText}
            disabled={isPlayingFullText}
            className={`p-2 rounded-md transition-colors flex items-center justify-center ${
              isPlayingFullText
                ? 'bg-yellow-100 text-yellow-600 cursor-not-allowed'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-600 cursor-pointer'
            }`}
            title="全文を読み上げ"
          >
            <Volume2 className="w-4 h-4" />
          </button>

          {/* タイピングテキスト */}
          {renderText()}
        </div>

        {/* 入力フィールド */}
        <div className="mt-4 flex justify-center">
          <input
            key={currentIndex}
            ref={inputRef}
            type="text"
            value={userInput}
            onChange={handleInputChange}
            className="w-full max-w-2xl px-3 py-2 md:px-4 md:py-3 text-lg md:text-xl lg:text-2xl text-center border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            placeholder="ここに入力..."
            autoComplete="off"
            autoFocus
          />
        </div>
      </div>
    </div>
  );
};
