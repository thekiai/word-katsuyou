export type ConjugationData = {
  form: string;
  meaningJa: string;
  example: string;
  exampleJa: string;
};

export type VerbEntry = {
  base: string;
  meaningJa: string;
  present: ConjugationData;
  past: ConjugationData;
  future: ConjugationData;
  go: ConjugationData;
  seo: ConjugationData;
  negative_an: ConjugationData;
  negative_jian: ConjugationData;
  possible: ConjugationData;
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
