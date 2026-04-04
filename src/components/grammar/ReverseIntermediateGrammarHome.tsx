/**
 * 中級文法（日→韓）フラッシュカードホーム画面
 */

import { GrammarFlashcardHome } from './GrammarFlashcardHome';
import { intermediateGrammar } from '../../data/grammarData';
import { useReverseIntermediateGrammarProgress } from '../../hooks/useGrammarFlashcardProgress';

export const ReverseIntermediateGrammarHome = () => {
  return (
    <GrammarFlashcardHome
      title="中級文法（日→韓）"
      grammarData={intermediateGrammar}
      useProgressHook={useReverseIntermediateGrammarProgress}
      level="intermediate"
      direction="ja-ko"
    />
  );
};
