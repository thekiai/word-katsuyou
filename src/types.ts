export type VerbEntry = {
  base: string;             // 動詞の原型
  meaningJa: string;        // 日本語の意味
  present: string;          // 現在形
  past: string;             // 過去形
  future: string;           // 未来形
  go: string;               // 連用(고)
  seo: string;              // 連用(서)
  negative_an: string;      // 否定(안)
  negative_jian: string;    // 否定(지 않아요)
  possible: string;         // 可能
};

export type ConjugationType =
  | 'base'
  | 'present'
  | 'past'
  | 'future'
  | 'go'
  | 'seo'
  | 'negative_an'
  | 'negative_jian'
  | 'possible';

export type ConjugationField = {
  key: ConjugationType;
  label: string;
};

export type AnswerResult = {
  key: ConjugationType;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
};
