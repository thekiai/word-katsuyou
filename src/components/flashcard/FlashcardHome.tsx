/**
 * フラッシュカードホーム画面（韓国語 → 日本語）
 */

import { useFlashcardProgress } from '../../hooks/useFlashcardProgress';
import { FlashcardStudy } from './FlashcardStudy';
import { WordList } from './WordList';
import { FlashcardHomeBase } from './FlashcardHomeBase';
import { topikWords } from '../../data/topikWords';

export const FlashcardHome = () => {
  return (
    <FlashcardHomeBase
      title="単語帳（韓→日）"
      colorScheme="blue"
      words={topikWords}
      difficultWordsStorageKey="difficult-words-beginner"
      level="beginner"
      direction="kr-jp"
      progressHook={useFlashcardProgress}
      StudyComponent={FlashcardStudy}
      WordListComponent={WordList}
    />
  );
};
