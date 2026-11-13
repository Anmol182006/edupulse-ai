-- ============================================================
-- EduPulse AI — Initial Schema Migration (001)
-- Supabase Project: pkpqlmckzeqfiikcjebq
-- 16 Tables for Full School Management System
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── 1. Schools ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS schools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  logo_url TEXT,
  established_year INT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 2. Academic Years ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS academic_years (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  year_label TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_current BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 3. Terms ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS terms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  academic_year_id UUID REFERENCES academic_years(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  term_number INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 4. Departments ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  head_teacher_id UUID,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 5. Teachers ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS teachers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  department_id UUID REFERENCES departments(id),
  employee_id TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  avatar_initials TEXT,
  subject_specialization TEXT,
  qualification TEXT,
  experience_years INT DEFAULT 0,
  date_of_joining DATE,
  date_of_birth DATE,
  address TEXT,
  blood_group TEXT,
  gender TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 6. Students ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  roll_number TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT,
  avatar_url TEXT,
  avatar_initials TEXT,
  date_of_birth DATE,
  gender TEXT,
  blood_group TEXT,
  address TEXT,
  admission_date DATE,
  current_class TEXT,
  current_section TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 7. Parents ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS parents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  relationship TEXT DEFAULT 'parent',
  occupation TEXT,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 8. Student-Parents Junction ───────────────────────────────
CREATE TABLE IF NOT EXISTS student_parents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES parents(id) ON DELETE CASCADE,
  relationship TEXT DEFAULT 'parent',
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, parent_id)
);

-- ── 9. Subjects ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  department_id UUID REFERENCES departments(id),
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  description TEXT,
  credit_hours INT DEFAULT 3,
  is_compulsory BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 10. Classes ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  academic_year_id UUID REFERENCES academic_years(id),
  name TEXT NOT NULL,
  section TEXT NOT NULL,
  class_teacher_id UUID REFERENCES teachers(id),
  room_number TEXT,
  capacity INT DEFAULT 40,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 11. Class Enrollments ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS class_enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  academic_year_id UUID REFERENCES academic_years(id),
  enrollment_date DATE DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, class_id, academic_year_id)
);

-- ── 12. Courses ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES teachers(id),
  subject_id UUID REFERENCES subjects(id),
  class_id UUID REFERENCES classes(id),
  academic_year_id UUID REFERENCES academic_years(id),
  course_code TEXT NOT NULL,
  course_name TEXT NOT NULL,
  total_planned_lectures INT DEFAULT 60,
  description TEXT,
  syllabus_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 13. Lecture Plans ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS lecture_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  lecture_number INT NOT NULL,
  topic TEXT NOT NULL,
  subtopics TEXT[],
  learning_objectives TEXT,
  resources TEXT,
  estimated_duration INT DEFAULT 60,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(course_id, lecture_number)
);

-- ── 14. Lecture Completions ───────────────────────────────────
CREATE TABLE IF NOT EXISTS lecture_completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lecture_plan_id UUID REFERENCES lecture_plans(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES teachers(id),
  completed_date DATE NOT NULL,
  actual_duration INT,
  coverage_percentage INT DEFAULT 100,
  notes TEXT,
  student_feedback_score NUMERIC(3,2),
  is_completed BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 15. Assessments ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  max_marks INT NOT NULL,
  passing_marks INT,
  exam_date DATE,
  term_id UUID REFERENCES terms(id),
  weightage NUMERIC(5,2) DEFAULT 100.00,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 16. Assessment Scores ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS assessment_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  marks_obtained NUMERIC(6,2) NOT NULL,
  percentage NUMERIC(5,2),
  grade TEXT,
  remarks TEXT,
  is_absent BOOLEAN DEFAULT FALSE,
  graded_by UUID REFERENCES teachers(id),
  graded_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(assessment_id, student_id)
);

-- ── Indexes ───────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_teachers_school ON teachers(school_id);
CREATE INDEX IF NOT EXISTS idx_students_school ON students(school_id);
CREATE INDEX IF NOT EXISTS idx_courses_teacher ON courses(teacher_id);
CREATE INDEX IF NOT EXISTS idx_courses_class ON courses(class_id);
CREATE INDEX IF NOT EXISTS idx_lecture_plans_course ON lecture_plans(course_id);
CREATE INDEX IF NOT EXISTS idx_lecture_completions_course ON lecture_completions(course_id);
CREATE INDEX IF NOT EXISTS idx_assessment_scores_student ON assessment_scores(student_id);
CREATE INDEX IF NOT EXISTS idx_class_enrollments_student ON class_enrollments(student_id);

-- ── Seed: Demo School ──────────────────────────────────────────
INSERT INTO schools (name, code, address, email, website, established_year)
VALUES ('Apex Horizon Academy', 'AHA', '123 Education Blvd, Springfield', 'info@apexhorizon.edu', 'https://apexhorizon.edu', 2005)
ON CONFLICT (code) DO NOTHING;

-- Success message
SELECT 'EduPulse AI: All 16 tables created successfully!' AS migration_status;
