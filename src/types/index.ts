export type UserRole = 'admin' | 'teacher' | 'homeroom';

export interface Profile {
  id: string;
  full_name: string;
  role: UserRole;
  created_at: string;
}

export interface Class {
  id: string;
  name: string;
  homeroom_teacher_id: string | null;
}

export interface Student {
  id: string;
  student_code: string;
  full_name: string;
  number: number;
  class_id: string;
}

export interface Subject {
  id: string;
  name: string;
}

export interface ClassSubject {
  id: string;
  class_id: string;
  subject_id: string;
  teacher_id: string;
  period: number;
  day_of_week: number;
}

export interface AttendanceSession {
  id: string;
  class_subject_id: string | null;
  class_id: string;
  subject_id: string;
  teacher_id: string;
  period: number;
  date: string;
  is_override: boolean;
  override_reason: string | null;
}

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'leave';

export interface AttendanceRecord {
  id: string;
  session_id: string;
  student_id: string;
  status: AttendanceStatus;
}

export interface AttendanceSummary {
  student_id: string;
  class_subject_id: string;
  absent_count: number;
  late_count: number;
}

export interface Notification {
  id: string;
  user_id: string;
  student_id: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface AuditLog {
  id: string;
  action: string;
  entity: string;
  old_value: any;
  new_value: any;
  changed_by: string;
  created_at: string;
}

export type RiskLevel = 'low' | 'medium' | 'high';

export interface AIInsight {
  student_id: string;
  risk_score: number;
  risk_level: RiskLevel;
  updated_at: string;
}
