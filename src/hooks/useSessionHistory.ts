import { useCallback } from 'react';
import { db } from '@/lib/db';
import type { SessionRecord } from '@/types/index';

/**
 * Provides helpers to persist and retrieve session history from IndexedDB.
 */
export function useSessionHistory() {
  const saveSession = useCallback(async (record: Omit<SessionRecord, 'id'>): Promise<number> => {
    return db.sessions.add(record as SessionRecord);
  }, []);

  const getAllSessions = useCallback(async (): Promise<SessionRecord[]> => {
    return db.sessions.orderBy('date').reverse().toArray();
  }, []);

  const getSession = useCallback(async (id: number): Promise<SessionRecord | undefined> => {
    return db.sessions.get(id);
  }, []);

  const deleteSession = useCallback(async (id: number): Promise<void> => {
    return db.sessions.delete(id);
  }, []);

  const clearAll = useCallback(async (): Promise<void> => {
    return db.sessions.clear();
  }, []);

  return { saveSession, getAllSessions, getSession, deleteSession, clearAll };
}
