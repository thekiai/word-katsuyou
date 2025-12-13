import { Word } from '../types/flashcard';
import rawData from './topikWords.csv?raw';

// Wordをre-export
export type { Word };

// CSVをパースして配列に変換
export const topikWords: Word[] = rawData
  .trim()
  .split('\n')
  .filter(line => line.trim())
  .map((line, index) => {
    const [korean, japanese] = line.split(',');
    return {
      id: index + 1,
      korean: korean.trim(),
      japanese: japanese.trim(),
    };
  });

// 単語数を取得
export const getTotalWordCount = () => topikWords.length;

// IDで単語を取得
export const getWordById = (id: number): Word | undefined => {
  return topikWords.find(word => word.id === id);
};
