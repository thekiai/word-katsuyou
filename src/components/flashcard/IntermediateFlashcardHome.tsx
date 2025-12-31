/**
 * 中級フラッシュカードホーム画面（韓国語 → 日本語）
 */

import { useIntermediateFlashcardProgress } from '../../hooks/useIntermediateFlashcardProgress';
import { IntermediateFlashcardStudy } from './IntermediateFlashcardStudy';
import { IntermediateWordList } from './IntermediateWordList';
import { FlashcardHomeBase } from './FlashcardHomeBase';
import { topikWords2 } from '../../data/topikWords2';

export const IntermediateFlashcardHome = () => {
  return (
    <FlashcardHomeBase
      title="中級単語（韓→日）"
      colorScheme="blue"
      words={topikWords2}
      difficultWordsStorageKey="difficult-words-intermediate"
      level="intermediate"
      progressHook={useIntermediateFlashcardProgress}
      StudyComponent={IntermediateFlashcardStudy}
      WordListComponent={IntermediateWordList}
    />
  );
};
