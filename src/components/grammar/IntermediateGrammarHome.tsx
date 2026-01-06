/**
 * 中級文法フラッシュカードホーム画面
 */

import { GrammarFlashcardHome } from './GrammarFlashcardHome';
import { intermediateGrammar } from '../../data/grammarData';
import { useIntermediateGrammarProgress } from '../../hooks/useGrammarFlashcardProgress';

export const IntermediateGrammarHome = () => {
  return (
    <GrammarFlashcardHome
      title="中級文法"
      grammarData={intermediateGrammar}
      useProgressHook={useIntermediateGrammarProgress}
      level="intermediate"
    />
  );
};
