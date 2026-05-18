import { Classroom, Student, Subject, ClassSession, AttendanceRecord, SchoolSettings, UserProfile } from '@/types';

export const mockSchoolSettings: SchoolSettings = {
  id: 'school-default-id',
  school_name: 'โรงเรียนสาธิตวิทยาคม KSN',
  logo_url: null, // We can generate a beautiful placeholder or dynamic CSS logo
  academic_year: '2567',
  semester: 1
};

export const mockClassrooms: Classroom[] = [
  { id: 'c1', name: 'ม.1/1', level: 'ม.1', student_count: 5 },
  { id: 'c2', name: 'ม.1/2', level: 'ม.1', student_count: 4 },
  { id: 'c3', name: 'ม.2/1', level: 'ม.2', student_count: 3 },
  { id: 'c4', name: 'ม.3/1', level: 'ม.3', student_count: 0 }
];

export const mockStudents: Student[] = [
  { id: 's1', student_code: '10001', prefix: 'เด็กชาย', first_name: 'สมชาย', last_name: 'รักเรียน', classroom_id: 'c1', gender: 'male', birth_date: '2013-05-12', phone: '0812345678', parent_name: 'นายสมบัติ รักเรียน', parent_phone: '0812345678', photo_url: null, is_active: true },
  { id: 's2', student_code: '10002', prefix: 'เด็กหญิง', first_name: 'ณิชา', last_name: 'เก่งกาจ', classroom_id: 'c1', gender: 'female', birth_date: '2013-08-20', phone: '0898765432', parent_name: 'นางสมศรี เก่งกาจ', parent_phone: '0898765432', photo_url: null, is_active: true },
  { id: 's3', student_code: '10003', prefix: 'เด็กชาย', first_name: 'ปกรณ์', last_name: 'มุ่งมั่น', classroom_id: 'c1', gender: 'male', birth_date: '2013-02-15', phone: '0865432109', parent_name: 'นายปรีชา มุ่งมั่น', parent_phone: '0865432109', photo_url: null, is_active: true },
  { id: 's4', student_code: '10004', prefix: 'เด็กหญิง', first_name: 'กานดา', last_name: 'สุขใจ', classroom_id: 'c1', gender: 'female', birth_date: '2013-11-30', phone: '0845678901', parent_name: 'นางกนกวรรณ สุขใจ', parent_phone: '0845678901', photo_url: null, is_active: true },
  { id: 's5', student_code: '10005', prefix: 'เด็กชาย', first_name: 'ธีรเดช', last_name: 'เรียนดี', classroom_id: 'c1', gender: 'male', birth_date: '2013-04-05', phone: '0834567890', parent_name: 'นายธวัช เรียนดี', parent_phone: '0834567890', photo_url: null, is_active: true },
  
  { id: 's6', student_code: '10006', prefix: 'เด็กชาย', first_name: 'อนันต์', last_name: 'ใฝ่รู้', classroom_id: 'c2', gender: 'male', birth_date: '2013-01-10', phone: '0823456789', parent_name: 'นายอรุณ ใฝ่รู้', parent_phone: '0823456789', photo_url: null, is_active: true },
  { id: 's7', student_code: '10007', prefix: 'เด็กหญิง', first_name: 'พัชรา', last_name: 'ศรีสวย', classroom_id: 'c2', gender: 'female', birth_date: '2013-09-14', phone: '0854321098', parent_name: 'นางพรรณราย ศรีสวย', parent_phone: '0854321098', photo_url: null, is_active: true },
  { id: 's8', student_code: '10008', prefix: 'เด็กชาย', first_name: 'กิตติ', last_name: 'มีปัญญา', classroom_id: 'c2', gender: 'male', birth_date: '2013-03-25', phone: '0876543210', parent_name: 'นายก้อง มีปัญญา', parent_phone: '0876543210', photo_url: null, is_active: true },
  { id: 's9', student_code: '10009', prefix: 'เด็กหญิง', first_name: 'วรรณิศา', last_name: 'ใจเย็น', classroom_id: 'c2', gender: 'female', birth_date: '2013-07-07', phone: '0887654321', parent_name: 'นางวรรณ ใจเย็น', parent_phone: '0887654321', photo_url: null, is_active: true },

  { id: 's10', student_code: '20001', prefix: 'เด็กชาย', first_name: 'ชาญชัย', last_name: 'ยอดเยี่ยม', classroom_id: 'c3', gender: 'male', birth_date: '2012-06-18', phone: '0890123456', parent_name: 'นายเดชา ยอดเยี่ยม', parent_phone: '0890123456', photo_url: null, is_active: true },
  { id: 's11', student_code: '20002', prefix: 'เด็กหญิง', first_name: 'นภาพร', last_name: 'รุ่งเรือง', classroom_id: 'c3', gender: 'female', birth_date: '2012-10-22', phone: '0878901234', parent_name: 'นางนภา รุ่งเรือง', parent_phone: '0878901234', photo_url: null, is_active: true },
  { id: 's12', student_code: '20003', prefix: 'เด็กชาย', first_name: 'มานะ', last_name: 'อดทน', classroom_id: 'c3', gender: 'male', birth_date: '2012-12-12', phone: '0867890123', parent_name: 'นายทนง อดทน', parent_phone: '0867890123', photo_url: null, is_active: true }
];

export const mockSubjects: Subject[] = [
  { id: 'sub1', code: 'ค21101', name: 'คณิตศาสตร์พื้นฐาน', credit: 1.5 },
  { id: 'sub2', code: 'ว21101', name: 'วิทยาศาสตร์และเทคโนโลยี', credit: 1.5 },
  { id: 'sub3', code: 'อ21101', name: 'ภาษาอังกฤษพื้นฐาน', credit: 1.0 },
  { id: 'sub4', code: 'ท21101', name: 'ภาษาไทย', credit: 1.0 }
];

export const mockUserProfiles: UserProfile[] = [
  { id: 'u1', full_name: 'ครูสมปอง วิเศษสุข', role: 'admin', avatar_url: null },
  { id: 'u2', full_name: 'ครูวิภา แก้วประสิทธิ์', role: 'teacher', avatar_url: null }
];

export const mockClassSessions: ClassSession[] = [
  // Monday
  { id: 'cs1', subject_id: 'sub1', classroom_id: 'c1', teacher_id: 'u1', day_of_week: 1, period_number: 1, start_time: '08:30:00', end_time: '09:20:00', academic_year: '2567', semester: 1 },
  { id: 'cs2', subject_id: 'sub2', classroom_id: 'c1', teacher_id: 'u2', day_of_week: 1, period_number: 2, start_time: '09:20:00', end_time: '10:10:00', academic_year: '2567', semester: 1 },
  // Tuesday
  { id: 'cs3', subject_id: 'sub3', classroom_id: 'c1', teacher_id: 'u1', day_of_week: 2, period_number: 1, start_time: '08:30:00', end_time: '09:20:00', academic_year: '2567', semester: 1 },
  { id: 'cs4', subject_id: 'sub4', classroom_id: 'c1', teacher_id: 'u2', day_of_week: 2, period_number: 3, start_time: '10:30:00', end_time: '11:20:00', academic_year: '2567', semester: 1 },
  // Monday for c2
  { id: 'cs5', subject_id: 'sub3', classroom_id: 'c2', teacher_id: 'u1', day_of_week: 1, period_number: 1, start_time: '08:30:00', end_time: '09:20:00', academic_year: '2567', semester: 1 },
  { id: 'cs6', subject_id: 'sub1', classroom_id: 'c2', teacher_id: 'u2', day_of_week: 1, period_number: 3, start_time: '10:30:00', end_time: '11:20:00', academic_year: '2567', semester: 1 }
];

export const mockAttendanceRecords: AttendanceRecord[] = [
  { id: 'ar1', session_id: 'cs1', student_id: 's1', attendance_date: '2026-05-18', status: 'present', note: null, checked_by: 'u1' },
  { id: 'ar2', session_id: 'cs1', student_id: 's2', attendance_date: '2026-05-18', status: 'present', note: null, checked_by: 'u1' },
  { id: 'ar3', session_id: 'cs1', student_id: 's3', attendance_date: '2026-05-18', status: 'late', note: 'สาย 5 นาที', checked_by: 'u1' },
  { id: 'ar4', session_id: 'cs1', student_id: 's4', attendance_date: '2026-05-18', status: 'absent', note: null, checked_by: 'u1' },
  { id: 'ar5', session_id: 'cs1', student_id: 's5', attendance_date: '2026-05-18', status: 'leave', note: 'ลากิจ', checked_by: 'u1' }
];

// Helper to check environment variables configuration
export const isSupabaseConfigured = (): boolean => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  // If keys are placeholder or undefined, return false
  return !!(url && key && url.startsWith('http') && !url.includes('your-'));
};
