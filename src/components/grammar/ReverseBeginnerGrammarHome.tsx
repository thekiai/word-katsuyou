/**
 * 初級文法（日→韓）フラッシュカードホーム画面
 */

import { GrammarFlashcardHome } from './GrammarFlashcardHome';
import { beginnerGrammar } from '../../data/grammarData';
import { useReverseBeginnerGrammarProgress } from '../../hooks/useGrammarFlashcardProgress';

export const ReverseBeginnerGrammarHome = () => {
  return (
    <GrammarFlashcardHome
      title="初級文法（日→韓）"
      grammarData={beginnerGrammar}
      useProgressHook={useReverseBeginnerGrammarProgress}
      direction="ja-ko"
    />
  );
};
