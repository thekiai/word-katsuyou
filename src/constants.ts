import { ConjugationField } from './types';

export const CONJUGATION_FIELDS: ConjugationField[] = [
  { key: 'base', label: '原型' },
  { key: 'present', label: '現在' },
  { key: 'past', label: '過去' },
  { key: 'future', label: '未来' },
  { key: 'go', label: '連用（고）' },
  { key: 'seo', label: '連用（서）' },
  { key: 'negative_an', label: '否定（안）' },
  { key: 'negative_jian', label: '否定（지 않아요）' },
  { key: 'possible', label: '可能' },
];
