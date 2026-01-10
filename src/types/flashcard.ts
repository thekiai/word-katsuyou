// 単語データ
export type Word = {
  id: number;
  korean: string;
  japanese: string;
};

// カードの状態
export type CardState = 'new' | 'learning' | 'review' | 'relearning';

// 回答ボタン
export type AnswerGrade = 'again' | 'good';

// カード進捗データ
export type CardProgress = {
  wordId: number;
  state: CardState;
  easeFactor: number;        // 難易度係数 (1.3-2.5)
  interval: number;          // 次の復習までの日数
  dueDate: string;           // 次の復習日 (ISO string)
  learningStep: number;      // Learning中のステップインデックス
  repetitions: number;       // 連続正解回数
  lapses: number;            // 失敗回数（Againを押した回数）
  lastReview: string | null; // 最終復習日
};

// 学習セッションの統計
export type StudySession = {
  date: string;
  newCardsStudied: number;
  reviewsCompleted: number;
  correctCount: number;
  incorrectCount: number;
};

// 設定
export type FlashcardSettings = {
  // Learning Steps (分単位)
  learningSteps: number[];

  // Graduating
  graduatingInterval: number;  // 日
  easyInterval: number;        // 日（Easyボタン用、今回は使わない）

  // Reviews
  startingEase: number;        // 初期Ease Factor
  maximumInterval: number;     // 最大間隔（日）

  // Lapses
  relearningSteps: number[];   // 分単位
  newInterval: number;         // 失敗時の間隔係数 (0.6 = 60%)
  minimumInterval: number;     // 最小間隔（日）

  // Daily Limits
  newCardsPerDay: number;
  maxReviewsPerDay: number;
};

// デフォルト設定（手厚く復習する設定）
// Review間隔の推移: 7日 → 13日 → 23日 → 41日 → 74日 → 120日
export const DEFAULT_SETTINGS: FlashcardSettings = {
  learningSteps: [10, 1440, 4320],  // 10分, 1日, 3日
  graduatingInterval: 7,
  easyInterval: 4,
  startingEase: 1.4,              // 2.5 → 1.4（手厚く復習）
  maximumInterval: 120,           // 365 → 120（4ヶ月に1回は必ず復習）
  relearningSteps: [10, 1440],  // 10分, 1日
  newInterval: 0.5,
  minimumInterval: 1,
  newCardsPerDay: 200,
  maxReviewsPerDay: 9999,
};

// 今日の学習情報
export type TodayStats = {
  newCardsRemaining: number;
  reviewCardsRemaining: number;
  learningCardsRemaining: number;
  completedToday: number;
};
