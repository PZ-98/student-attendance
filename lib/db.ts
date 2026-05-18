import { supabase } from './supabase/client';
import { 
  mockSchoolSettings, 
  mockClassrooms, 
  mockStudents, 
  mockSubjects, 
  mockClassSessions, 
  mockAttendanceRecords,
  isSupabaseConfigured 
} from './mockData';
import { Classroom, Student, Subject, ClassSession, AttendanceRecord, SchoolSettings, UserProfile } from '@/types';

// Browser-safe local storage helper
const getLocalStorage = <T>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading localStorage key "${key}":`, error);
    return defaultValue;
  }
};

const setLocalStorage = <T>(key: string, value: T): void => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error setting localStorage key "${key}":`, error);
  }
};

// Initialize LocalStorage Mock DB
const initMockDB = () => {
  if (typeof window === 'undefined') return;
  if (!window.localStorage.getItem('ksn_school_settings')) setLocalStorage('ksn_school_settings', mockSchoolSettings);
  if (!window.localStorage.getItem('ksn_classrooms')) setLocalStorage('ksn_classrooms', mockClassrooms);
  if (!window.localStorage.getItem('ksn_students')) setLocalStorage('ksn_students', mockStudents);
  if (!window.localStorage.getItem('ksn_subjects')) setLocalStorage('ksn_subjects', mockSubjects);
  if (!window.localStorage.getItem('ksn_sessions')) setLocalStorage('ksn_sessions', mockClassSessions);
  if (!window.localStorage.getItem('ksn_attendance')) setLocalStorage('ksn_attendance', mockAttendanceRecords);
};

// ----------------------------------------------------
// DB ACCESS FUNCTIONS
// ----------------------------------------------------

export const getSchoolSettings = async (): Promise<SchoolSettings> => {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase.from('school_settings').select('*').maybeSingle();
    if (!error && data) return data;
    console.error('Supabase settings load error, using fallback:', error);
  }
  
  initMockDB();
  return getLocalStorage<SchoolSettings>('ksn_school_settings', mockSchoolSettings);
};

export const updateSchoolSettings = async (settings: Partial<SchoolSettings>): Promise<SchoolSettings> => {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from('school_settings')
      .update(settings)
      .eq('id', settings.id || '')
      .select()
      .single();
    if (!error && data) return data;
    console.error('Supabase settings update error:', error);
  }

  initMockDB();
  const current = getLocalStorage<SchoolSettings>('ksn_school_settings', mockSchoolSettings);
  const updated = { ...current, ...settings, updated_at: new Date().toISOString() };
  setLocalStorage('ksn_school_settings', updated);
  return updated;
};

export const getClassrooms = async (): Promise<Classroom[]> => {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase.from('classrooms').select('*');
    if (!error && data) {
      // Calculate student counts dynamically
      const { data: stdData } = await supabase.from('students').select('classroom_id');
      return data.map((room: Classroom) => {
        const count = stdData?.filter((s) => s.classroom_id === room.id).length || 0;
        return { ...room, student_count: count };
      });
    }
    console.error('Supabase classrooms error:', error);
  }

  initMockDB();
  const rooms = getLocalStorage<Classroom[]>('ksn_classrooms', mockClassrooms);
  const students = getLocalStorage<Student[]>('ksn_students', mockStudents);
  return rooms.map(room => ({
    ...room,
    student_count: students.filter(s => s.classroom_id === room.id).length
  }));
};

export const createClassroom = async (classroom: Omit<Classroom, 'id'>): Promise<Classroom> => {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase.from('classrooms').insert([classroom]).select().single();
    if (!error && data) return data;
    throw new Error(error?.message || 'Failed to create classroom');
  }

  initMockDB();
  const rooms = getLocalStorage<Classroom[]>('ksn_classrooms', mockClassrooms);
  const newRoom: Classroom = {
    ...classroom,
    id: 'c_' + Math.random().toString(36).substring(2, 9),
    student_count: 0
  };
  setLocalStorage('ksn_classrooms', [...rooms, newRoom]);
  return newRoom;
};

export const deleteClassroom = async (id: string): Promise<boolean> => {
  if (isSupabaseConfigured()) {
    const { error } = await supabase.from('classrooms').delete().eq('id', id);
    if (!error) return true;
    throw new Error(error.message);
  }

  initMockDB();
  const rooms = getLocalStorage<Classroom[]>('ksn_classrooms', mockClassrooms);
  setLocalStorage('ksn_classrooms', rooms.filter(r => r.id !== id));
  // Clean classroom associations in students
  const students = getLocalStorage<Student[]>('ksn_students', mockStudents);
  setLocalStorage('ksn_students', students.map(s => s.classroom_id === id ? { ...s, classroom_id: null } : s));
  return true;
};

export const getStudents = async (): Promise<Student[]> => {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase.from('students').select('*, classroom:classrooms(*)');
    if (!error && data) return data;
    console.error('Supabase students error:', error);
  }

  initMockDB();
  const students = getLocalStorage<Student[]>('ksn_students', mockStudents);
  const classrooms = getLocalStorage<Classroom[]>('ksn_classrooms', mockClassrooms);
  return students.map(student => ({
    ...student,
    classroom: classrooms.find(c => c.id === student.classroom_id)
  }));
};

export const createStudent = async (student: Omit<Student, 'id'>): Promise<Student> => {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase.from('students').insert([student]).select().single();
    if (!error && data) return data;
    throw new Error(error?.message || 'Failed to create student');
  }

  initMockDB();
  const students = getLocalStorage<Student[]>('ksn_students', mockStudents);
  const newStudent: Student = {
    ...student,
    id: 's_' + Math.random().toString(36).substring(2, 9),
    is_active: true
  };
  setLocalStorage('ksn_students', [...students, newStudent]);
  return newStudent;
};

export const updateStudent = async (id: string, studentUpdates: Partial<Student>): Promise<Student> => {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase.from('students').update(studentUpdates).eq('id', id).select().single();
    if (!error && data) return data;
    throw new Error(error?.message || 'Failed to update student');
  }

  initMockDB();
  const students = getLocalStorage<Student[]>('ksn_students', mockStudents);
  const updatedStudents = students.map(s => s.id === id ? { ...s, ...studentUpdates } : s);
  setLocalStorage('ksn_students', updatedStudents);
  return updatedStudents.find(s => s.id === id)!;
};

export const deleteStudent = async (id: string): Promise<boolean> => {
  if (isSupabaseConfigured()) {
    const { error } = await supabase.from('students').delete().eq('id', id);
    if (!error) return true;
    throw new Error(error.message);
  }

  initMockDB();
  const students = getLocalStorage<Student[]>('ksn_students', mockStudents);
  setLocalStorage('ksn_students', students.filter(s => s.id !== id));
  return true;
};

export const getSubjects = async (): Promise<Subject[]> => {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase.from('subjects').select('*');
    if (!error && data) return data;
    console.error('Supabase subjects error:', error);
  }

  initMockDB();
  return getLocalStorage<Subject[]>('ksn_subjects', mockSubjects);
};

export const createSubject = async (subject: Omit<Subject, 'id'>): Promise<Subject> => {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase.from('subjects').insert([subject]).select().single();
    if (!error && data) return data;
    throw new Error(error?.message || 'Failed to create subject');
  }

  initMockDB();
  const subjects = getLocalStorage<Subject[]>('ksn_subjects', mockSubjects);
  const newSubject: Subject = {
    ...subject,
    id: 'sub_' + Math.random().toString(36).substring(2, 9)
  };
  setLocalStorage('ksn_subjects', [...subjects, newSubject]);
  return newSubject;
};

export const deleteSubject = async (id: string): Promise<boolean> => {
  if (isSupabaseConfigured()) {
    const { error } = await supabase.from('subjects').delete().eq('id', id);
    if (!error) return true;
    throw new Error(error.message);
  }

  initMockDB();
  const subjects = getLocalStorage<Subject[]>('ksn_subjects', mockSubjects);
  setLocalStorage('ksn_subjects', subjects.filter(s => s.id !== id));
  return true;
};

export const getClassSessions = async (): Promise<ClassSession[]> => {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase.from('class_sessions').select('*, subject:subjects(*), classroom:classrooms(*)');
    if (!error && data) return data;
    console.error('Supabase class sessions error:', error);
  }

  initMockDB();
  const sessions = getLocalStorage<ClassSession[]>('ksn_sessions', mockClassSessions);
  const subjects = getLocalStorage<Subject[]>('ksn_subjects', mockSubjects);
  const classrooms = getLocalStorage<Classroom[]>('ksn_classrooms', mockClassrooms);
  return sessions.map(session => ({
    ...session,
    subject: subjects.find(s => s.id === session.subject_id),
    classroom: classrooms.find(c => c.id === session.classroom_id)
  }));
};

export const createClassSession = async (session: Omit<ClassSession, 'id'>): Promise<ClassSession> => {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase.from('class_sessions').insert([session]).select().single();
    if (!error && data) return data;
    throw new Error(error?.message || 'Failed to create class session');
  }

  initMockDB();
  const sessions = getLocalStorage<ClassSession[]>('ksn_sessions', mockClassSessions);
  const newSession: ClassSession = {
    ...session,
    id: 'cs_' + Math.random().toString(36).substring(2, 9)
  };
  setLocalStorage('ksn_sessions', [...sessions, newSession]);
  return newSession;
};

export const deleteClassSession = async (id: string): Promise<boolean> => {
  if (isSupabaseConfigured()) {
    const { error } = await supabase.from('class_sessions').delete().eq('id', id);
    if (!error) return true;
    throw new Error(error.message);
  }

  initMockDB();
  const sessions = getLocalStorage<ClassSession[]>('ksn_sessions', mockClassSessions);
  setLocalStorage('ksn_sessions', sessions.filter(s => s.id !== id));
  return true;
};

export const getAttendanceRecords = async (date: string, sessionId?: string): Promise<AttendanceRecord[]> => {
  if (isSupabaseConfigured()) {
    let query = supabase.from('attendance_records').select('*, student:students(*)').eq('attendance_date', date);
    if (sessionId) {
      query = query.eq('session_id', sessionId);
    }
    const { data, error } = await query;
    if (!error && data) return data;
    console.error('Supabase attendance load error:', error);
  }

  initMockDB();
  const records = getLocalStorage<AttendanceRecord[]>('ksn_attendance', mockAttendanceRecords);
  const students = getLocalStorage<Student[]>('ksn_students', mockStudents);
  
  let filtered = records.filter(r => r.attendance_date === date);
  if (sessionId) {
    filtered = filtered.filter(r => r.session_id === sessionId);
  }
  
  return filtered.map(r => ({
    ...r,
    student: students.find(s => s.id === r.student_id)
  }));
};

export const saveAttendanceRecords = async (records: Omit<AttendanceRecord, 'id'>[]): Promise<boolean> => {
  if (isSupabaseConfigured()) {
    // Perform bulk upsert in Supabase
    const { error } = await supabase
      .from('attendance_records')
      .upsert(
        records.map(r => ({
          session_id: r.session_id,
          student_id: r.student_id,
          attendance_date: r.attendance_date,
          status: r.status,
          note: r.note,
          checked_by: r.checked_by
        })),
        { onConflict: 'session_id,student_id,attendance_date' }
      );
    if (!error) return true;
    throw new Error(error.message);
  }

  initMockDB();
  const existing = getLocalStorage<AttendanceRecord[]>('ksn_attendance', mockAttendanceRecords);
  
  // Merge or insert new records
  const updated = [...existing];
  
  records.forEach(rec => {
    const idx = updated.findIndex(r => 
      r.session_id === rec.session_id && 
      r.student_id === rec.student_id && 
      r.attendance_date === rec.attendance_date
    );
    
    if (idx > -1) {
      updated[idx] = { ...updated[idx], ...rec };
    } else {
      updated.push({
        ...rec,
        id: 'ar_' + Math.random().toString(36).substring(2, 9)
      });
    }
  });
  
  setLocalStorage('ksn_attendance', updated);
  return true;
};
