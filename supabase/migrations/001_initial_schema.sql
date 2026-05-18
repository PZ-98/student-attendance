-- =============================================
-- 001_initial_schema.sql
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. SCHOOL SETTINGS (single row for school details)
CREATE TABLE IF NOT EXISTS public.school_settings (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_name   TEXT NOT NULL DEFAULT 'โรงเรียนของเรา',
  logo_url      TEXT,
  academic_year TEXT DEFAULT '2567',
  semester      INT DEFAULT 1,
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- Insert default setting row if it doesn't exist
INSERT INTO public.school_settings (school_name, academic_year, semester)
VALUES ('โรงเรียนสาธิตการเรียนรู้', '2567', 1)
ON CONFLICT DO NOTHING;

-- 2. CLASSROOMS (ห้องเรียน)
CREATE TABLE IF NOT EXISTS public.classrooms (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL UNIQUE,          -- e.g. "ม.1/1", "ป.6/2"
  level      TEXT NOT NULL,                 -- e.g. "ม.1", "ป.6"
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. STUDENTS (นักเรียน)
CREATE TABLE IF NOT EXISTS public.students (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_code  TEXT UNIQUE NOT NULL,   -- รหัสนักเรียน
  prefix        TEXT,                   -- เด็กชาย / เด็กหญิง / นาย / นางสาว
  first_name    TEXT NOT NULL,
  last_name     TEXT NOT NULL,
  classroom_id  UUID REFERENCES public.classrooms(id) ON DELETE SET NULL,
  gender        TEXT CHECK (gender IN ('male', 'female')),
  birth_date    DATE,
  phone         TEXT,
  parent_name   TEXT,
  parent_phone  TEXT,
  photo_url     TEXT,
  is_active     BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- 4. SUBJECTS (วิชาเรียน)
CREATE TABLE IF NOT EXISTS public.subjects (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code         TEXT UNIQUE NOT NULL,    -- รหัสวิชา e.g. "ว21101"
  name         TEXT NOT NULL,           -- ชื่อวิชา
  credit       NUMERIC(3,1) DEFAULT 1.0,
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- 5. CLASS SESSIONS / SCHEDULE (คาบเรียน / ตารางเรียน)
CREATE TABLE IF NOT EXISTS public.class_sessions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id    UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
  classroom_id  UUID REFERENCES public.classrooms(id) ON DELETE CASCADE,
  teacher_id    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  day_of_week   INT CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
  period_number INT NOT NULL,           -- คาบที่ e.g. 1, 2, 3, 4, 5...
  start_time    TIME,
  end_time      TIME,
  academic_year TEXT DEFAULT '2567',
  semester      INT DEFAULT 1,
  created_at    TIMESTAMPTZ DEFAULT now(),
  UNIQUE (subject_id, classroom_id, day_of_week, period_number, academic_year, semester)
);

-- 6. ATTENDANCE RECORDS (บันทึกการเข้าเรียน)
CREATE TABLE IF NOT EXISTS public.attendance_records (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id       UUID REFERENCES public.class_sessions(id) ON DELETE CASCADE,
  student_id       UUID REFERENCES public.students(id) ON DELETE CASCADE,
  attendance_date  DATE NOT NULL DEFAULT CURRENT_DATE,
  status           TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late', 'leave', 'sick')), -- มา, ขาด, สาย, ลา, ป่วย
  note             TEXT,
  checked_by       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ DEFAULT now(),
  UNIQUE (session_id, student_id, attendance_date)
);

-- 7. USER PROFILES (ประวัติผู้ใช้งาน / ครู)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT,
  role        TEXT DEFAULT 'teacher' CHECK (role IN ('admin', 'teacher')),
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for all tables
ALTER TABLE public.school_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow select for authenticated users" ON public.school_settings;
DROP POLICY IF EXISTS "Allow all for admin users" ON public.school_settings;

-- RLS Policies for user_profiles
CREATE POLICY "Allow users to read profiles" ON public.user_profiles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow users to update own profile" ON public.user_profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id);

-- RLS Policies for school_settings
CREATE POLICY "Allow select school_settings for all" ON public.school_settings
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow full access to school_settings for admin" ON public.school_settings
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- RLS Policies for classrooms
CREATE POLICY "Allow read classrooms for authenticated" ON public.classrooms
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow write classrooms for admin" ON public.classrooms
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- RLS Policies for students
CREATE POLICY "Allow read students for authenticated" ON public.students
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow write students for admin" ON public.students
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- RLS Policies for subjects
CREATE POLICY "Allow read subjects for authenticated" ON public.subjects
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow write subjects for admin" ON public.subjects
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- RLS Policies for class_sessions
CREATE POLICY "Allow read class_sessions for authenticated" ON public.class_sessions
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow write class_sessions for admin" ON public.class_sessions
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- RLS Policies for attendance_records
CREATE POLICY "Allow read attendance_records for authenticated" ON public.attendance_records
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow insert/update attendance_records for teachers/admin" ON public.attendance_records
  FOR ALL TO authenticated USING (true);

-- Automatically handle user creation in auth.users -> public.user_profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email),
    COALESCE(new.raw_user_meta_data->>'role', 'teacher')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
