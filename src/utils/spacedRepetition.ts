/**
 * SM-2 Spaced Repetition Algorithm Implementation
 * Based on Anki best practices for vocabulary learning
 */

import {
  CardProgress,
  CardState,
  AnswerGrade,
  FlashcardSettings,
  DEFAULT_SETTINGS,
} from '../types/flashcard';

/**
 * 新しいカードの初期進捗を作成
 */
export function createInitialProgress(wordId: number): CardProgress {
  return {
    wordId,
    state: 'new',
    easeFactor: DEFAULT_SETTINGS.startingEase,
    interval: 0,
    dueDate: new Date().toISOString(),
    learningStep: 0,
    repetitions: 0,
    lapses: 0,
    lastReview: null,
  };
}

/**
 * 分を加算した日時を取得
 */
function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

/**
 * 日を加算した日時を取得
 */
function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * 回答に基づいてカード進捗を更新
 */
export function processAnswer(
  progress: CardProgress,
  grade: AnswerGrade,
  settings: FlashcardSettings = DEFAULT_SETTINGS
): CardProgress {
  const now = new Date();
  const updated = { ...progress, lastReview: now.toISOString() };

  switch (progress.state) {
    case 'new':
    case 'learning':
      return processLearningAnswer(updated, grade, settings, now);

    case 'review':
      return processReviewAnswer(updated, grade, settings, now);

    case 'relearning':
      return processRelearningAnswer(updated, grade, settings, now);

    default:
      return updated;
  }
}

/**
 * Learning状態での回答処理
 */
function processLearningAnswer(
  progress: CardProgress,
  grade: AnswerGrade,
  settings: FlashcardSettings,
  now: Date
): CardProgress {
  const { learningSteps, graduatingInterval } = settings;

  if (grade === 'again') {
    // ステップ0に戻る
    return {
      ...progress,
      state: 'learning',
      learningStep: 0,
      dueDate: addMinutes(now, learningSteps[0]).toISOString(),
      repetitions: 0,
    };
  }

  // Good: 次のステップへ
  const nextStep = progress.learningStep + 1;

  if (nextStep >= learningSteps.length) {
    // 全ステップ完了 → Reviewへ昇格
    return {
      ...progress,
      state: 'review',
      learningStep: 0,
      interval: graduatingInterval,
      dueDate: addDays(now, graduatingInterval).toISOString(),
      repetitions: progress.repetitions + 1,
    };
  }

  // 次のLearningステップへ
  const nextInterval = learningSteps[nextStep];
  return {
    ...progress,
    state: 'learning',
    learningStep: nextStep,
    dueDate: addMinutes(now, nextInterval).toISOString(),
    repetitions: progress.repetitions + 1,
  };
}

/**
 * Review状態での回答処理
 */
function processReviewAnswer(
  progress: CardProgress,
  grade: AnswerGrade,
  settings: FlashcardSettings,
  now: Date
): CardProgress {
  const { maximumInterval } = settings;

  if (grade === 'again') {
    // 学習中に戻す（最初からやり直し）
    return {
      ...progress,
      state: 'learning',
      learningStep: 0,
      interval: 0,
      dueDate: addMinutes(now, settings.learningSteps[0]).toISOString(),
      easeFactor: Math.max(1.3, progress.easeFactor - 0.2),
      lapses: progress.lapses + 1,
      repetitions: 0,
    };
  }

  // Good: 間隔を伸ばす
  const newIntervalDays = Math.min(
    maximumInterval,
    Math.round(progress.interval * progress.easeFactor)
  );

  return {
    ...progress,
    interval: newIntervalDays,
    dueDate: addDays(now, newIntervalDays).toISOString(),
    repetitions: progress.repetitions + 1,
  };
}

/**
 * Relearning状態での回答処理
 */
function processRelearningAnswer(
  progress: CardProgress,
  grade: AnswerGrade,
  settings: FlashcardSettings,
  now: Date
): CardProgress {
  const { relearningSteps } = settings;

  if (grade === 'again') {
    // ステップ0に戻る
    return {
      ...progress,
      learningStep: 0,
      dueDate: addMinutes(now, relearningSteps[0]).toISOString(),
    };
  }

  // Good: Relearningステップ完了 → Reviewへ戻る
  const nextStep = progress.learningStep + 1;

  if (nextStep >= relearningSteps.length) {
    // Reviewへ復帰（intervalは既に減少済み）
    return {
      ...progress,
      state: 'review',
      learningStep: 0,
      dueDate: addDays(now, progress.interval).toISOString(),
      repetitions: 1,
    };
  }

  // 次のRelearningステップへ
  return {
    ...progress,
    learningStep: nextStep,
    dueDate: addMinutes(now, relearningSteps[nextStep]).toISOString(),
  };
}

/**
 * カードが今日学習可能かどうかを判定
 */
export function isDue(progress: CardProgress): boolean {
  const now = new Date();
  const dueDate = new Date(progress.dueDate);
  return dueDate <= now;
}

/**
 * 今日の日付文字列を取得（YYYY-MM-DD形式、ローカルタイム）
 */
export function getTodayString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * カードを優先度順にソート
 * 1. Relearning（再学習中）
 * 2. Learning（学習中）
 * 3. Review（期限切れの復習）
 * 4. New（新規）
 */
export function sortCardsByPriority(cards: CardProgress[]): CardProgress[] {
  const priorityOrder: Record<CardState, number> = {
    relearning: 0,
    learning: 1,
    review: 2,
    new: 3,
  };

  return [...cards].sort((a, b) => {
    // まず状態で比較
    const priorityDiff = priorityOrder[a.state] - priorityOrder[b.state];
    if (priorityDiff !== 0) return priorityDiff;

    // 同じ状態なら期限日で比較
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });
}

/**
 * 学習セッション用のカードを取得
 */
export function getStudyQueue(
  allProgress: CardProgress[],
  settings: FlashcardSettings = DEFAULT_SETTINGS
): {
  dueCards: CardProgress[];
  newCards: CardProgress[];
  learningCards: CardProgress[];
} {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const dueCards: CardProgress[] = [];
  const newCards: CardProgress[] = [];
  const learningCards: CardProgress[] = [];

  for (const progress of allProgress) {
    const dueDate = new Date(progress.dueDate);

    if (progress.state === 'new') {
      newCards.push(progress);
    } else if (progress.state === 'learning' || progress.state === 'relearning') {
      if (dueDate <= now) {
        learningCards.push(progress);
      }
    } else if (progress.state === 'review') {
      if (dueDate <= todayStart || dueDate <= now) {
        dueCards.push(progress);
      }
    }
  }

  // 新規カードは1日の上限まで
  const limitedNewCards = newCards.slice(0, settings.newCardsPerDay);

  return {
    dueCards: sortCardsByPriority(dueCards),
    newCards: limitedNewCards,
    learningCards: sortCardsByPriority(learningCards),
  };
}

/**
 * 次のボタン押下時の間隔をプレビュー表示用に計算
 */
export function getIntervalPreview(
  progress: CardProgress,
  grade: AnswerGrade,
  settings: FlashcardSettings = DEFAULT_SETTINGS
): string {
  const { learningSteps, graduatingInterval, relearningSteps } = settings;

  if (progress.state === 'new' || progress.state === 'learning') {
    if (grade === 'again') {
      return formatInterval(learningSteps[0]);
    }
    const nextStep = progress.learningStep + 1;
    if (nextStep >= learningSteps.length) {
      return `${graduatingInterval}日`;
    }
    return formatInterval(learningSteps[nextStep]);
  }

  if (progress.state === 'review') {
    if (grade === 'again') {
      return formatInterval(relearningSteps[0]);
    }
    const newIntervalDays = Math.min(
      settings.maximumInterval,
      Math.round(progress.interval * progress.easeFactor)
    );
    return `${newIntervalDays}日`;
  }

  if (progress.state === 'relearning') {
    if (grade === 'again') {
      return formatInterval(relearningSteps[0]);
    }
    return `${progress.interval}日`;
  }

  return '';
}

/**
 * 分単位の間隔を人間が読みやすい形式に変換
 */
function formatInterval(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}分後`;
  }
  if (minutes < 1440) {
    return `${Math.round(minutes / 60)}時間後`;
  }
  return `${Math.round(minutes / 1440)}日後`;
}
