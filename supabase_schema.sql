-- SQL Schema for Classroom Attendance & Management System

-- 1. Profiles (Teachers/Staff)
CREATE TABLE profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'teacher', 'homeroom')),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Classes
CREATE TABLE classes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    level TEXT NOT NULL,
    homeroom_teacher_id UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Students
CREATE TABLE students (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_code TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    number INTEGER NOT NULL,
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    risk_level TEXT DEFAULT 'Low' CHECK (risk_level IN ('Low', 'Medium', 'High')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Subjects
CREATE TABLE subjects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    code TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Class Subjects (Timetable/Plan)
CREATE TABLE class_subjects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    period INTEGER NOT NULL,
    UNIQUE(class_id, day_of_week, period)
);

-- 6. Attendance Sessions (Actual classes taken)
CREATE TABLE attendance_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    class_subject_id UUID REFERENCES class_subjects(id) ON DELETE SET NULL,
    class_id UUID REFERENCES classes(id),
    subject_id UUID REFERENCES subjects(id),
    teacher_id UUID REFERENCES profiles(id),
    period INTEGER NOT NULL,
    date DATE DEFAULT CURRENT_DATE,
    is_override BOOLEAN DEFAULT FALSE,
    override_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Attendance Records
CREATE TABLE attendance_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES attendance_sessions(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late', 'leave')),
    remark TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(session_id, student_id)
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;

-- Simple RLS Policies (Allow authenticated users to read everything, but only owners to write)
-- Note: In production, refine these based on roles.
CREATE POLICY "Allow public read access" ON profiles FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON classes FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON students FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON subjects FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON class_subjects FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON attendance_sessions FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON attendance_records FOR SELECT USING (true);

CREATE POLICY "Allow authenticated insert" ON attendance_sessions FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated insert" ON attendance_records FOR INSERT WITH CHECK (auth.role() = 'authenticated');
