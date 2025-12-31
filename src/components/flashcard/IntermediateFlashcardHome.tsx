/**
 * 中級フラッシュカードホーム画面（韓国語 → 日本語）
 */

import { useIntermediateFlashcardProgress } from '../../hooks/useIntermediateFlashcardProgress';
import { IntermediateFlashcardStudy } from './IntermediateFlashcardStudy';
import { IntermediateWordList } from './IntermediateWordList';
import { FlashcardHomeBase } from './FlashcardHomeBase';

export const IntermediateFlashcardHome = () => {
  return (
    <FlashcardHomeBase
      title="中級単語（韓→日）"
      colorScheme="blue"
      progressHook={useIntermediateFlashcardProgress}
      StudyComponent={IntermediateFlashcardStudy}
      WordListComponent={IntermediateWordList}
    />
  );
};
