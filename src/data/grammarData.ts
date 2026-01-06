/**
 * 文法データの型定義と読み込み
 */

export type GrammarItem = {
  id: number;
  korean: string;      // 한글（文法表現）
  japanese: string;    // 日本語（意味）
  exampleKo: string;   // 예문（韓国語例文）
  exampleJa: string;   // 例文（日本語訳）
};

export type GrammarLevel = 'beginner' | 'intermediate';

// CSVを解析する関数
const parseGrammarCSV = (csv: string, startId: number): GrammarItem[] => {
  const lines = csv.trim().split('\n');
  const items: GrammarItem[] = [];

  // ヘッダー行をスキップ
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // CSVをパース（カンマ区切り）
    const parts = line.split(',');
    if (parts.length >= 4) {
      items.push({
        id: startId + i - 1,
        korean: parts[0].trim(),
        japanese: parts[1].trim(),
        exampleKo: parts[2].trim(),
        exampleJa: parts.slice(3).join(',').trim(), // 例文に,が含まれる場合に対応
      });
    }
  }

  return items;
};

// 初級文法データ（grammer1.csv）
import grammar1CSV from './grammer1.csv?raw';
export const beginnerGrammar: GrammarItem[] = parseGrammarCSV(grammar1CSV, 1);

// 中級文法データ（grammer2.csv）
import grammar2CSV from './grammer2.csv?raw';
export const intermediateGrammar: GrammarItem[] = parseGrammarCSV(grammar2CSV, 1000);

// 全文法データ
export const allGrammar: GrammarItem[] = [...beginnerGrammar, ...intermediateGrammar];

// ヘルパー関数
export const getGrammarById = (id: number): GrammarItem | undefined => {
  return allGrammar.find(g => g.id === id);
};

export const getBeginnerGrammarById = (id: number): GrammarItem | undefined => {
  return beginnerGrammar.find(g => g.id === id);
};

export const getIntermediateGrammarById = (id: number): GrammarItem | undefined => {
  return intermediateGrammar.find(g => g.id === id);
};

export const getBeginnerGrammarCount = (): number => beginnerGrammar.length;
export const getIntermediateGrammarCount = (): number => intermediateGrammar.length;
export const getTotalGrammarCount = (): number => allGrammar.length;
