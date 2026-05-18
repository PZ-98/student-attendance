export interface SchoolSettings {
  id: string;
  school_name: string;
  logo_url: string | null;
  academic_year: string;
  semester: number;
  updated_at?: string;
}

export interface Classroom {
  id: string;
  name: string;
  level: string;
  created_at?: string;
  student_count?: number; // Calculated helper
}

export interface Student {
  id: string;
  student_code: string;
  prefix: string | null;
  first_name: string;
  last_name: string;
  classroom_id: string | null;
  gender: 'male' | 'female' | null;
  birth_date: string | null;
  phone: string | null;
  parent_name: string | null;
  parent_phone: string | null;
  photo_url: string | null;
  is_active: boolean;
  created_at?: string;
  classroom?: Classroom; // Joined classroom helper
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  credit: number;
  created_at?: string;
}

export interface ClassSession {
  id: string;
  subject_id: string;
  classroom_id: string;
  teacher_id: string | null;
  day_of_week: number; // 0-6
  period_number: number;
  start_time: string | null; // e.g. "08:30"
  end_time: string | null;   // e.g. "09:20"
  academic_year: string;
  semester: number;
  created_at?: string;
  subject?: Subject;       // Joined helper
  classroom?: Classroom;   // Joined helper
  teacher?: UserProfile;   // Joined helper
}

export interface AttendanceRecord {
  id: string;
  session_id: string;
  student_id: string;
  attendance_date: string; // YYYY-MM-DD
  status: 'present' | 'absent' | 'late' | 'leave' | 'sick';
  note: string | null;
  checked_by: string | null;
  created_at?: string;
  student?: Student; // Joined helper
}

export interface UserProfile {
  id: string;
  full_name: string | null;
  role: 'admin' | 'teacher';
  avatar_url: string | null;
  created_at?: string;
}
