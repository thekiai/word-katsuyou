import { useState, useEffect, useRef } from 'react';
import Hangul from 'hangul-js';
import { VerbEntry } from '../types';

type TypingPracticeProps = {
  verb: VerbEntry;
  onComplete: () => void;
};

export const TypingPractice = ({ verb, onComplete }: TypingPracticeProps) => {
  // 全ての例文を取得（baseを除く）
  const examples = [
    { text: verb.present.example, label: '現在形', meaning: verb.present.exampleJa },
    { text: verb.past.example, label: '過去形', meaning: verb.past.exampleJa },
    { text: verb.future.example, label: '未来形', meaning: verb.future.exampleJa },
    { text: verb.go.example, label: '連用（고）', meaning: verb.go.exampleJa },
    { text: verb.seo.example, label: '連用（서）', meaning: verb.seo.exampleJa },
    { text: verb.negative_an.example, label: '否定（안）', meaning: verb.negative_an.exampleJa },
    { text: verb.negative_jian.example, label: '否定（지 않아요）', meaning: verb.negative_jian.exampleJa },
    { text: verb.possible.example, label: '可能', meaning: verb.possible.exampleJa },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState(''); // ユーザー入力（QWERTY or ハングル）
  const inputRef = useRef<HTMLInputElement>(null);

  const currentExample = examples[currentIndex];
  const targetText = currentExample.text;

  // ターゲットテキストを字母に分解（スペースも含める）
  const targetJamo: string[] = [];
  for (const char of targetText) {
    if (char === ' ') {
      targetJamo.push(' ');
    } else {
      targetJamo.push(...Hangul.disassemble(char));
    }
  }

  // 問題が変わったらinputにフォーカス
  useEffect(() => {
    inputRef.current?.focus();
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
        setTimeout(() => {
          if (currentIndex < examples.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setUserInput('');
          } else {
            onComplete();
          }
        }, 500);
      }
    }
  };

  const renderText = () => {
    const chars = targetText.split('');
    const inputJamo = inputToJamo(userInput);

    let jamoIndex = 0; // 現在どこまで字母が入力されたか

    return (
      <div className="text-6xl font-bold mb-8 tracking-wide flex justify-center items-center flex-wrap">
        {chars.map((char, charIndex) => {
          // この文字が空白の場合
          if (char === ' ') {
            // スペースの入力状態をチェック
            let spaceClassName = 'inline-block w-4 h-1 mx-1 rounded ';

            if (jamoIndex < inputJamo.length) {
              if (inputJamo[jamoIndex] === ' ') {
                // 正しくスペースが入力された
                spaceClassName += 'bg-green-500';
              } else {
                // スペースが入力されるべきだが別の文字が入力された
                spaceClassName += 'bg-red-500';
              }
            } else {
              // まだ入力されていない
              spaceClassName += 'bg-gray-300';
            }

            jamoIndex++; // スペース分のインデックスを進める
            return <span key={charIndex} className={spaceClassName}></span>;
          }

          // この文字の字母を取得
          const charJamo = Hangul.disassemble(char);
          const charJamoCount = charJamo.length;

          // この文字の字母がどこまで入力されているかチェック
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

          // この文字の字母インデックスを進める
          jamoIndex += charJamoCount;

          // 色を決定
          let className = 'inline-block';
          if (hasError) {
            // 間違いがある → 赤
            className += ' text-red-500';
          } else if (matchedJamoCount === charJamoCount) {
            // 全ての字母が入力済み → 緑
            className += ' text-green-500';
          } else if (matchedJamoCount > 0) {
            // 一部の字母が入力済み → 青（入力中）
            className += ' text-blue-400';
          } else {
            // まだ入力されていない → グレー
            className += ' text-gray-400';
          }

          return (
            <span key={charIndex} className={className}>
              {char}
            </span>
          );
        })}
      </div>
    );
  };

  const progress = ((currentIndex + 1) / examples.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8">
      <div className="max-w-4xl w-full">
        {/* プログレスバー */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">
              {currentIndex + 1} / {examples.length}
            </span>
            <span className="text-sm text-gray-600">{currentExample.label}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* 日本語の意味 */}
        <div className="text-center mb-8">
          <p className="text-2xl text-gray-700">{currentExample.meaning}</p>
        </div>

        {/* タイピングテキスト */}
        {renderText()}

        {/* 入力フィールド */}
        <div className="mt-8">
          <input
            ref={inputRef}
            type="text"
            value={userInput}
            onChange={handleInputChange}
            className="w-full max-w-2xl px-4 py-3 text-2xl text-center border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            placeholder="ここに入力..."
            autoComplete="off"
            autoFocus
          />
        </div>

        {/* 進捗表示 */}
        <div className="mt-4 text-center text-gray-500">
          <p className="text-sm">
            {inputToJamo(userInput).length} / {targetJamo.length} 字母
          </p>
        </div>
      </div>
    </div>
  );
};
