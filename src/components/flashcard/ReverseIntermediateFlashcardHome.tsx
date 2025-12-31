/**
 * 中級逆方向フラッシュカードホーム画面（日本語 → 韓国語）
 */

import { useReverseIntermediateFlashcardProgress } from '../../hooks/useReverseIntermediateFlashcardProgress';
import { ReverseIntermediateFlashcardStudy } from './ReverseIntermediateFlashcardStudy';
import { FlashcardHomeBase } from './FlashcardHomeBase';

export const ReverseIntermediateFlashcardHome = () => {
  return (
    <FlashcardHomeBase
      title="中級単語（日→韓）"
      colorScheme="cyan"
      progressHook={useReverseIntermediateFlashcardProgress}
      StudyComponent={ReverseIntermediateFlashcardStudy}
    />
  );
};
