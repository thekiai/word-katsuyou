/**
 * 逆方向フラッシュカードホーム画面（日本語 → 韓国語）
 */

import { useReverseFlashcardProgress } from '../../hooks/useReverseFlashcardProgress';
import { ReverseFlashcardStudy } from './ReverseFlashcardStudy';
import { FlashcardHomeBase } from './FlashcardHomeBase';
import { topikWords } from '../../data/topikWords';

export const ReverseFlashcardHome = () => {
  return (
    <FlashcardHomeBase
      title="単語帳（日→韓）"
      colorScheme="cyan"
      words={topikWords}
      difficultWordsStorageKey="difficult-words-beginner-reverse"
      level="beginner"
      direction="jp-kr"
      progressHook={useReverseFlashcardProgress}
      StudyComponent={ReverseFlashcardStudy}
    />
  );
};
