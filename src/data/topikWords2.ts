import { Word } from '../types/flashcard';
import rawData from './topikWords2.csv?raw';

// CSVをパースして配列に変換（中級単語）
export const topikWords2: Word[] = rawData
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
export const getTotalWordCount2 = () => topikWords2.length;

// IDで単語を取得
export const getWordById2 = (id: number): Word | undefined => {
  return topikWords2.find(word => word.id === id);
};
