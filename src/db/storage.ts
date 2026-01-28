/**
 * localStorage互換API（IndexedDB使用）
 */

import { getDB, STORE_NAME } from './index';

export const storage = {
  async getItem<T>(key: string): Promise<T | null> {
    try {
      const db = await getDB();
      const value = await db.get(STORE_NAME, key);
      return (value as T) ?? null;
    } catch (e) {
      console.error(`Failed to get item from IndexedDB: ${key}`, e);
      return null;
    }
  },

  async setItem<T>(key: string, data: T): Promise<void> {
    try {
      const db = await getDB();
      await db.put(STORE_NAME, data, key);
    } catch (e) {
      console.error(`Failed to set item in IndexedDB: ${key}`, e);
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      const db = await getDB();
      await db.delete(STORE_NAME, key);
    } catch (e) {
      console.error(`Failed to remove item from IndexedDB: ${key}`, e);
    }
  },
};
