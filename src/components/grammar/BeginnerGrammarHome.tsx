/**
 * 初級文法フラッシュカードホーム画面
 */

import { GrammarFlashcardHome } from './GrammarFlashcardHome';
import { beginnerGrammar } from '../../data/grammarData';
import { useBeginnerGrammarProgress } from '../../hooks/useGrammarFlashcardProgress';

export const BeginnerGrammarHome = () => {
  return (
    <GrammarFlashcardHome
      title="初級文法"
      grammarData={beginnerGrammar}
      useProgressHook={useBeginnerGrammarProgress}
    />
  );
};
