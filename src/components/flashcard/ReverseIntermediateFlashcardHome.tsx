/**
 * 中級逆方向フラッシュカードホーム画面（日本語 → 韓国語）
 */

import { useReverseIntermediateFlashcardProgress } from '../../hooks/useReverseIntermediateFlashcardProgress';
import { ReverseIntermediateFlashcardStudy } from './ReverseIntermediateFlashcardStudy';
import { FlashcardHomeBase } from './FlashcardHomeBase';
import { topikWords2 } from '../../data/topikWords2';

export const ReverseIntermediateFlashcardHome = () => {
  return (
    <FlashcardHomeBase
      title="中級単語（日→韓）"
      colorScheme="cyan"
      words={topikWords2}
      difficultWordsStorageKey="difficult-words-intermediate-reverse"
      level="intermediate"
      progressHook={useReverseIntermediateFlashcardProgress}
      StudyComponent={ReverseIntermediateFlashcardStudy}
    />
  );
};
