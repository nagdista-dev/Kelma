import Dexie, { type Table } from 'dexie';
import type { SessionRecord } from '@/types/index';

class PlayWithWordsDB extends Dexie {
  sessions!: Table<SessionRecord>;

  constructor() {
    super('PlayWithWordsDB');
    this.version(1).stores({
      sessions: '++id, date, completed',
    });
  }
}

export const db = new PlayWithWordsDB();
