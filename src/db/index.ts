/**
 * IndexedDB初期化
 */

import { openDB, DBSchema, IDBPDatabase } from 'idb';

const DB_NAME = 'word-katsuyou-db';
const DB_VERSION = 1;
const STORE_NAME = 'kv-store';

interface KVStoreDB extends DBSchema {
  [STORE_NAME]: {
    key: string;
    value: unknown;
  };
}

let dbPromise: Promise<IDBPDatabase<KVStoreDB>> | null = null;

export function getDB(): Promise<IDBPDatabase<KVStoreDB>> {
  if (!dbPromise) {
    dbPromise = openDB<KVStoreDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      },
    });
  }
  return dbPromise;
}

export { STORE_NAME };
