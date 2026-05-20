import { supabase } from '@/lib/supabase';
import { AttendanceSession, AttendanceRecord, AttendanceStatus } from '@/types';

export const attendanceService = {
  async getTodaySchedule(teacherId: string, dayOfWeek: number) {
    const { data, error } = await supabase
      .from('class_subjects')
      .select(`
        *,
        classes (name),
        subjects (name)
      `)
      .eq('teacher_id', teacherId)
      .eq('day_of_week', dayOfWeek)
      .order('period', { ascending: true });

    if (error) throw error;
    return data;
  },

  async getTeacherScheduleSchema(teacherId: string) {
    const { data, error } = await supabase
      .from('class_subjects')
      .select('*')
      .eq('teacher_id', teacherId);

    if (error) throw error;
    return data;
  },

  async getTeacherSessionsForRange(teacherId: string, startDate: string, endDate: string) {
    const { data, error } = await supabase
      .from('attendance_sessions')
      .select('id, date, class_subject_id, period')
      .eq('teacher_id', teacherId)
      .gte('date', startDate)
      .lte('date', endDate);

    if (error) throw error;
    return data;
  },

  async getSessionsByDate(teacherId: string, date: string) {
    const { data, error } = await supabase
      .from('attendance_sessions')
      .select(`
        *,
        classes (name),
        subjects (name)
      `)
      .eq('teacher_id', teacherId)
      .eq('date', date);

    if (error) throw error;
    return data;
  },

  async createSession(session: Partial<AttendanceSession>) {
    const { data, error } = await supabase
      .from('attendance_sessions')
      .insert(session)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getSessionStudents(classId: string) {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('class_id', classId)
      .order('number', { ascending: true });

    if (error) throw error;
    return data;
  },

  async saveAttendanceRecords(records: Partial<AttendanceRecord>[]) {
    const { data, error } = await supabase
      .from('attendance_records')
      .upsert(records, { onConflict: 'session_id, student_id' });

    if (error) throw error;
    return data;
  },

  async getLatestSessionRecords(classId: string, subjectId: string) {
    // Get the most recent session for this class and subject
    const { data: session, error: sError } = await supabase
      .from('attendance_sessions')
      .select('id')
      .eq('class_id', classId)
      .eq('subject_id', subjectId)
      .order('date', { ascending: false })
      .limit(1)
      .single();

    if (sError || !session) return [];

    const { data: records, error: rError } = await supabase
      .from('attendance_records')
      .select('student_id, status')
      .eq('session_id', session.id);

    if (rError) throw rError;
    return records;
  }
};
