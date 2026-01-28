/**
 * localStorage → IndexedDB 自動マイグレーション
 */

import { storage } from './storage';

const MIGRATION_KEY = 'idb-migration-completed';

// マイグレーション対象のlocalStorageキー一覧
const STORAGE_KEYS = [
  // 動詞進捗
  'verbProgress',
  // フラッシュカード進捗（初級）
  'flashcard-progress',
  'flashcard-sessions',
  'flashcard-today-stats',
  // フラッシュカード進捗（中級）
  'intermediate-flashcard-progress',
  'intermediate-flashcard-sessions',
  'intermediate-flashcard-today-stats',
  // リバースフラッシュカード進捗（初級）
  'reverse-flashcard-progress',
  'reverse-flashcard-sessions',
  'reverse-flashcard-today-stats',
  // リバースフラッシュカード進捗（中級）
  'reverse-intermediate-flashcard-progress',
  'reverse-intermediate-flashcard-sessions',
  'reverse-intermediate-flashcard-today-stats',
  // 文法フラッシュカード進捗
  'grammar-flashcard-progress',
  'grammar-flashcard-sessions',
  'grammar-flashcard-today-stats',
  'intermediate-grammar-flashcard-progress',
  'intermediate-grammar-flashcard-sessions',
  'intermediate-grammar-flashcard-today-stats',
  // メモ
  'word-memos',
  'word-memos-intermediate',
  'grammar-memos',
  'grammar-memos-intermediate',
  // タイムアタックスコア
  'time-attack-scores',
  // 覚えづらい単語リスト除外
  'difficult-words-excluded',
  'intermediate-difficult-words-excluded',
  'reverse-difficult-words-excluded',
  'reverse-intermediate-difficult-words-excluded',
];

export async function migrateFromLocalStorage(): Promise<void> {
  // 既にマイグレーション完了している場合はスキップ
  const migrated = await storage.getItem<boolean>(MIGRATION_KEY);
  if (migrated) {
    return;
  }

  console.log('Starting migration from localStorage to IndexedDB...');

  let migratedCount = 0;
  for (const key of STORAGE_KEYS) {
    try {
      const value = localStorage.getItem(key);
      if (value !== null) {
        // JSONとしてパースして保存
        const parsed = JSON.parse(value);
        await storage.setItem(key, parsed);
        migratedCount++;
        // 元のlocalStorageデータはバックアップとして残す
      }
    } catch (e) {
      console.error(`Failed to migrate key: ${key}`, e);
    }
  }

  // マイグレーション完了フラグを設定
  await storage.setItem(MIGRATION_KEY, true);
  console.log(`Migration completed. Migrated ${migratedCount} keys.`);
}
