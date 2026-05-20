import { supabase } from './supabase';
import { AttendanceRecord, AttendanceSession } from '@/types';

const OFFLINE_QUEUE_KEY = 'attendance_offline_queue';

interface OfflineSession {
  id: string;
  session: Partial<AttendanceSession>;
  records: Partial<AttendanceRecord>[];
}

export const offlineService = {
  // Save to local storage when offline
  async queueSession(session: Partial<AttendanceSession>, records: Partial<AttendanceRecord>[]) {
    const queue = this.getQueue();
    const newEntry: OfflineSession = {
      id: crypto.randomUUID(), // Use UUID for deduplication
      session,
      records
    };
    queue.push(newEntry);
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
  },

  getQueue(): OfflineSession[] {
    const data = localStorage.getItem(OFFLINE_QUEUE_KEY);
    return data ? JSON.parse(data) : [];
  },

  clearQueue() {
    localStorage.removeItem(OFFLINE_QUEUE_KEY);
  },

  // Sync when online
  async syncData() {
    const queue = this.getQueue();
    if (queue.length === 0) return { success: true, count: 0 };

    try {
      for (const item of queue) {
        // 1. Create Session
        const { data: session, error: sError } = await supabase
          .from('attendance_sessions')
          .insert({
            ...item.session,
            created_at: new Date().toISOString(), // Ensure original timestamp if needed
          })
          .select()
          .single();

        if (sError) throw sError;

        // 2. Create Records
        const recordsToInsert = item.records.map(r => ({
          ...r,
          session_id: session.id
        }));

        const { error: rError } = await supabase
          .from('attendance_records')
          .insert(recordsToInsert);

        if (rError) throw rError;
      }

      this.clearQueue();
      return { success: true, count: queue.length };
    } catch (error) {
      console.error('Offline sync failed:', error);
      return { success: false, error };
    }
  },

  isOnline(): boolean {
    return typeof window !== 'undefined' ? window.navigator.onLine : true;
  }
};
