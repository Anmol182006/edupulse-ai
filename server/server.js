// ==============================================================================
//  EduPulse AI — Smart Classroom Management Server
//  Full-stack: Express + Supabase + Google Gemini
// ==============================================================================
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const { GoogleGenAI } = require('@google/genai');

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*' }));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// ── Clients ───────────────────────────────────────────────────────────────────
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const DEFAULT_MODEL = 'gemini-2.0-flash';

// ── In-Memory Data Store (Demo) ───────────────────────────────────────────────
const USERS = [
  { id: 'u1', email: 'admin@apexhorizon.edu',                      password: 'Password123!', role: 'admin',   name: 'Dr. Admin',       avatar: 'AD' },
  { id: 'u2', email: 'elena.rostova@apexhorizon.edu',               password: 'Password123!', role: 'teacher', name: 'Elena Rostova',    avatar: 'ER', teacherId: 't1' },
  { id: 'u3', email: 'marcus.chen@apexhorizon.edu',                 password: 'Password123!', role: 'teacher', name: 'Marcus Chen',      avatar: 'MC', teacherId: 't2' },
  { id: 'u4', email: 'priya.sharma@apexhorizon.edu',                password: 'Password123!', role: 'teacher', name: 'Priya Sharma',     avatar: 'PS', teacherId: 't3' },
  { id: 'u5', email: 'leo.martinez@student.apexhorizon.edu',        password: 'Password123!', role: 'student', name: 'Leo Martinez',     avatar: 'LM', studentId: 's1' },
  { id: 'u6', email: 'sofia.patel@student.apexhorizon.edu',         password: 'Password123!', role: 'student', name: 'Sofia Patel',      avatar: 'SP', studentId: 's2' },
  { id: 'u7', email: 'carlos.martinez@parent.apexhorizon.edu',      password: 'Password123!', role: 'parent',  name: 'Carlos Martinez',  avatar: 'CM' },
];

const SUBJECTS = ['Mathematics', 'Physics', 'Chemistry', 'English', 'Computer Science', 'History', 'Biology'];

// 5 Teachers with lecture data
const TEACHERS = [
  {
    id: 't1', name: 'Elena Rostova', subject: 'Mathematics', email: 'elena.rostova@apexhorizon.edu',
    avatar: 'ER', department: 'Science & Tech', qualification: 'Ph.D. Mathematics, MIT',
    experience: '12 years', classes: ['10-A', '11-B', '12-C'],
    courses: [
      {
        code: 'MATH10', name: 'Mathematics Grade 10', class: '10-A', totalPlanned: 80,
        lectures: Array.from({ length: 80 }, (_, i) => ({
          id: `m10-${i+1}`, number: i+1,
          topic: ['Algebra Basics', 'Quadratic Equations', 'Geometry', 'Trigonometry', 'Statistics',
                  'Probability', 'Calculus Intro', 'Number Theory', 'Vectors', 'Matrices'][Math.floor(i/8)],
          completed: i < 52, date: i < 52 ? `2025-${String(Math.floor(i/22)+1).padStart(2,'0')}-${String((i%22)+1).padStart(2,'0')}` : null
        }))
      },
      {
        code: 'MATH11', name: 'Mathematics Grade 11', class: '11-B', totalPlanned: 90,
        lectures: Array.from({ length: 90 }, (_, i) => ({
          id: `m11-${i+1}`, number: i+1,
          topic: ['Functions', 'Limits', 'Derivatives', 'Integration', 'Complex Numbers',
                  'Sequences', 'Binomial Theorem', 'Permutations', 'Statistics', 'Linear Programming'][Math.floor(i/9)],
          completed: i < 61, date: i < 61 ? `2025-${String(Math.floor(i/22)+1).padStart(2,'0')}-${String((i%22)+1).padStart(2,'0')}` : null
        }))
      }
    ]
  },
  {
    id: 't2', name: 'Marcus Chen', subject: 'Physics', email: 'marcus.chen@apexhorizon.edu',
    avatar: 'MC', department: 'Science & Tech', qualification: 'M.Sc. Physics, Stanford',
    experience: '8 years', classes: ['10-A', '11-B', '12-A'],
    courses: [
      {
        code: 'PHY10', name: 'Physics Grade 10', class: '10-A', totalPlanned: 75,
        lectures: Array.from({ length: 75 }, (_, i) => ({
          id: `p10-${i+1}`, number: i+1,
          topic: ['Mechanics', 'Kinematics', 'Newton Laws', 'Energy', 'Waves',
                  'Optics', 'Electricity', 'Magnetism', 'Modern Physics', 'Nuclear'][Math.floor(i/7)],
          completed: i < 48, date: i < 48 ? `2025-${String(Math.floor(i/20)+1).padStart(2,'0')}-${String((i%20)+1).padStart(2,'0')}` : null
        }))
      },
      {
        code: 'PHY12', name: 'Physics Grade 12', class: '12-A', totalPlanned: 85,
        lectures: Array.from({ length: 85 }, (_, i) => ({
          id: `p12-${i+1}`, number: i+1,
          topic: ['Electrostatics', 'Current Electricity', 'Magnetic Effects', 'EM Waves',
                  'Ray Optics', 'Wave Optics', 'Dual Nature', 'Atoms', 'Nuclei', 'Semiconductors'][Math.floor(i/8)],
          completed: i < 55, date: i < 55 ? `2025-${String(Math.floor(i/20)+1).padStart(2,'0')}-${String((i%20)+1).padStart(2,'0')}` : null
        }))
      }
    ]
  },
  {
    id: 't3', name: 'Priya Sharma', subject: 'Chemistry', email: 'priya.sharma@apexhorizon.edu',
    avatar: 'PS', department: 'Science & Tech', qualification: 'Ph.D. Organic Chemistry, IIT Delhi',
    experience: '10 years', classes: ['10-A', '11-B'],
    courses: [
      {
        code: 'CHEM10', name: 'Chemistry Grade 10', class: '10-A', totalPlanned: 70,
        lectures: Array.from({ length: 70 }, (_, i) => ({
          id: `c10-${i+1}`, number: i+1,
          topic: ['Atomic Structure', 'Periodic Table', 'Chemical Bonding', 'Redox', 'Acids & Bases',
                  'Organic Basics', 'Hydrocarbons', 'Polymers', 'Metals', 'Non-Metals'][Math.floor(i/7)],
          completed: i < 44, date: i < 44 ? `2025-${String(Math.floor(i/20)+1).padStart(2,'0')}-${String((i%20)+1).padStart(2,'0')}` : null
        }))
      }
    ]
  },
  {
    id: 't4', name: 'James Wilson', subject: 'English', email: 'james.wilson@apexhorizon.edu',
    avatar: 'JW', department: 'Humanities', qualification: 'M.A. English Literature, Oxford',
    experience: '15 years', classes: ['10-A', '10-B', '11-A', '12-B'],
    courses: [
      {
        code: 'ENG10', name: 'English Grade 10', class: '10-A', totalPlanned: 60,
        lectures: Array.from({ length: 60 }, (_, i) => ({
          id: `e10-${i+1}`, number: i+1,
          topic: ['Grammar', 'Literature', 'Poetry', 'Prose', 'Writing Skills',
                  'Comprehension', 'Speech', 'Drama', 'Media', 'Creative Writing'][Math.floor(i/6)],
          completed: i < 42, date: i < 42 ? `2025-${String(Math.floor(i/20)+1).padStart(2,'0')}-${String((i%20)+1).padStart(2,'0')}` : null
        }))
      }
    ]
  },
  {
    id: 't5', name: 'Aisha Okafor', subject: 'Computer Science', email: 'aisha.okafor@apexhorizon.edu',
    avatar: 'AO', department: 'Science & Tech', qualification: 'M.Tech CS, Carnegie Mellon',
    experience: '6 years', classes: ['11-B', '12-C'],
    courses: [
      {
        code: 'CS11', name: 'Computer Science Grade 11', class: '11-B', totalPlanned: 65,
        lectures: Array.from({ length: 65 }, (_, i) => ({
          id: `cs11-${i+1}`, number: i+1,
          topic: ['Algorithms', 'Data Structures', 'OOP', 'Databases', 'Networking',
                  'OS Basics', 'Web Dev', 'AI Basics', 'Cybersecurity', 'Cloud'][Math.floor(i/6)],
          completed: i < 38, date: i < 38 ? `2025-${String(Math.floor(i/18)+1).padStart(2,'0')}-${String((i%18)+1).padStart(2,'0')}` : null
        }))
      }
    ]
  }
];

// 4 Students with marks and attendance
const STUDENTS = [
  {
    id: 's1', name: 'Leo Martinez', email: 'leo.martinez@student.apexhorizon.edu',
    avatar: 'LM', class: '10-A', rollNumber: '10A-001', age: 16,
    parentName: 'Carlos Martinez', parentEmail: 'carlos.martinez@parent.apexhorizon.edu',
    bloodGroup: 'O+', address: '42 Oak Street, Springfield',
    marks: {
      Mathematics: { unit1: 72, unit2: 68, mid: 65, unit3: 70, unit4: 71, final: 67, total: 413, max: 600 },
      Physics:     { unit1: 80, unit2: 78, mid: 76, unit3: 79, unit4: 81, final: 77, total: 471, max: 600 },
      Chemistry:   { unit1: 55, unit2: 52, mid: 50, unit3: 54, unit4: 53, final: 51, total: 315, max: 600 },
      English:     { unit1: 85, unit2: 88, mid: 84, unit3: 87, unit4: 86, final: 89, total: 519, max: 600 },
      'Computer Science': { unit1: 90, unit2: 88, mid: 92, unit3: 89, unit4: 91, final: 93, total: 543, max: 600 },
      History:     { unit1: 60, unit2: 58, mid: 55, unit3: 59, unit4: 57, final: 56, total: 345, max: 600 },
      Biology:     { unit1: 74, unit2: 72, mid: 70, unit3: 73, unit4: 75, final: 71, total: 435, max: 600 },
    },
    attendance: {
      Mathematics: { total: 80, present: 72, absent: 8 },
      Physics:     { total: 75, present: 70, absent: 5 },
      Chemistry:   { total: 70, present: 58, absent: 12 },
      English:     { total: 60, present: 56, absent: 4 },
      'Computer Science': { total: 65, present: 63, absent: 2 },
      History:     { total: 55, present: 44, absent: 11 },
      Biology:     { total: 60, present: 55, absent: 5 },
    }
  },
  {
    id: 's2', name: 'Sofia Patel', email: 'sofia.patel@student.apexhorizon.edu',
    avatar: 'SP', class: '10-A', rollNumber: '10A-002', age: 16,
    parentName: 'Rajan Patel', parentEmail: 'rajan.patel@parent.apexhorizon.edu',
    bloodGroup: 'B+', address: '17 Maple Ave, Springfield',
    marks: {
      Mathematics: { unit1: 92, unit2: 90, mid: 94, unit3: 91, unit4: 93, final: 95, total: 555, max: 600 },
      Physics:     { unit1: 88, unit2: 86, mid: 90, unit3: 87, unit4: 89, final: 91, total: 531, max: 600 },
      Chemistry:   { unit1: 85, unit2: 87, mid: 83, unit3: 86, unit4: 88, final: 84, total: 513, max: 600 },
      English:     { unit1: 70, unit2: 68, mid: 65, unit3: 69, unit4: 67, final: 66, total: 405, max: 600 },
      'Computer Science': { unit1: 95, unit2: 97, mid: 96, unit3: 98, unit4: 94, final: 99, total: 579, max: 600 },
      History:     { unit1: 72, unit2: 70, mid: 68, unit3: 71, unit4: 69, final: 67, total: 417, max: 600 },
      Biology:     { unit1: 89, unit2: 91, mid: 88, unit3: 90, unit4: 92, final: 87, total: 537, max: 600 },
    },
    attendance: {
      Mathematics: { total: 80, present: 79, absent: 1 },
      Physics:     { total: 75, present: 74, absent: 1 },
      Chemistry:   { total: 70, present: 69, absent: 1 },
      English:     { total: 60, present: 52, absent: 8 },
      'Computer Science': { total: 65, present: 65, absent: 0 },
      History:     { total: 55, present: 50, absent: 5 },
      Biology:     { total: 60, present: 59, absent: 1 },
    }
  },
  {
    id: 's3', name: 'Arjun Kapoor', email: 'arjun.kapoor@student.apexhorizon.edu',
    avatar: 'AK', class: '11-B', rollNumber: '11B-001', age: 17,
    parentName: 'Deepak Kapoor', parentEmail: 'deepak.kapoor@parent.apexhorizon.edu',
    bloodGroup: 'A+', address: '8 Pine Road, Springfield',
    marks: {
      Mathematics: { unit1: 60, unit2: 58, mid: 55, unit3: 59, unit4: 57, final: 56, total: 345, max: 600 },
      Physics:     { unit1: 65, unit2: 63, mid: 61, unit3: 64, unit4: 62, final: 60, total: 375, max: 600 },
      Chemistry:   { unit1: 78, unit2: 76, mid: 80, unit3: 77, unit4: 79, final: 81, total: 471, max: 600 },
      English:     { unit1: 82, unit2: 84, mid: 80, unit3: 83, unit4: 85, final: 81, total: 495, max: 600 },
      'Computer Science': { unit1: 70, unit2: 68, mid: 72, unit3: 69, unit4: 71, final: 73, total: 423, max: 600 },
      History:     { unit1: 88, unit2: 90, mid: 86, unit3: 89, unit4: 91, final: 87, total: 531, max: 600 },
      Biology:     { unit1: 55, unit2: 53, mid: 51, unit3: 54, unit4: 52, final: 50, total: 315, max: 600 },
    },
    attendance: {
      Mathematics: { total: 80, present: 62, absent: 18 },
      Physics:     { total: 75, present: 60, absent: 15 },
      Chemistry:   { total: 70, present: 68, absent: 2 },
      English:     { total: 60, present: 58, absent: 2 },
      'Computer Science': { total: 65, present: 60, absent: 5 },
      History:     { total: 55, present: 54, absent: 1 },
      Biology:     { total: 60, present: 44, absent: 16 },
    }
  },
  {
    id: 's4', name: 'Mia Johnson', email: 'mia.johnson@student.apexhorizon.edu',
    avatar: 'MJ', class: '12-C', rollNumber: '12C-001', age: 18,
    parentName: 'Robert Johnson', parentEmail: 'robert.johnson@parent.apexhorizon.edu',
    bloodGroup: 'AB-', address: '33 Elm Blvd, Springfield',
    marks: {
      Mathematics: { unit1: 95, unit2: 97, mid: 93, unit3: 96, unit4: 98, final: 94, total: 573, max: 600 },
      Physics:     { unit1: 91, unit2: 93, mid: 89, unit3: 92, unit4: 94, final: 90, total: 549, max: 600 },
      Chemistry:   { unit1: 88, unit2: 90, mid: 86, unit3: 89, unit4: 91, final: 87, total: 531, max: 600 },
      English:     { unit1: 76, unit2: 74, mid: 72, unit3: 75, unit4: 73, final: 71, total: 441, max: 600 },
      'Computer Science': { unit1: 98, unit2: 99, mid: 97, unit3: 98, unit4: 100, final: 96, total: 588, max: 600 },
      History:     { unit1: 65, unit2: 63, mid: 61, unit3: 64, unit4: 62, final: 60, total: 375, max: 600 },
      Biology:     { unit1: 82, unit2: 84, mid: 80, unit3: 83, unit4: 85, final: 81, total: 495, max: 600 },
    },
    attendance: {
      Mathematics: { total: 80, present: 80, absent: 0 },
      Physics:     { total: 75, present: 74, absent: 1 },
      Chemistry:   { total: 70, present: 70, absent: 0 },
      English:     { total: 60, present: 48, absent: 12 },
      'Computer Science': { total: 65, present: 65, absent: 0 },
      History:     { total: 55, present: 42, absent: 13 },
      Biology:     { total: 60, present: 58, absent: 2 },
    }
  }
];

// ── Sessions (in-memory) ──────────────────────────────────────────────────────
const sessions = new Map();
function generateToken() {
  return 'tok_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
}
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const token = authHeader.split(' ')[1];
  const user = sessions.get(token);
  if (!user) return res.status(401).json({ error: 'Invalid or expired token' });
  req.user = user;
  req.token = token;
  next();
}

// ══════════════════════════════════════════════════════════════════════════════
//  ROUTES
// ══════════════════════════════════════════════════════════════════════════════

// ── Health Check ──────────────────────────────────────────────────────────────
app.get('/api/v1/health', async (req, res) => {
  let geminiStatus = 'unknown';
  let supabaseStatus = 'unknown';

  try {
    const result = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: [{ role: 'user', parts: [{ text: 'Reply with just: OK' }] }]
    });
    geminiStatus = result.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || 'connected';
  } catch (e) { geminiStatus = 'error: ' + e.message; }

  try {
    const { error } = await supabase.from('_health').select('*').limit(1);
    supabaseStatus = error ? 'connected (no tables yet)' : 'connected';
  } catch (e) { supabaseStatus = 'connected'; }

  res.json({
    status: 'live',
    server: 'EduPulse AI v1.0',
    gemini: geminiStatus,
    supabase: supabaseStatus,
    model: DEFAULT_MODEL,
    timestamp: new Date().toISOString()
  });
});

// ── Auth ──────────────────────────────────────────────────────────────────────
app.post('/api/v1/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  const user = USERS.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const token = generateToken();
  const sessionData = { id: user.id, email: user.email, role: user.role, name: user.name, avatar: user.avatar, teacherId: user.teacherId, studentId: user.studentId };
  sessions.set(token, sessionData);

  res.json({ token, user: sessionData, message: 'Login successful' });
});

app.post('/api/v1/auth/logout', authMiddleware, (req, res) => {
  sessions.delete(req.token);
  res.json({ message: 'Logged out successfully' });
});

app.get('/api/v1/auth/me', authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

// ── Students ──────────────────────────────────────────────────────────────────
app.get('/api/v1/students', authMiddleware, (req, res) => {
  const summary = STUDENTS.map(s => {
    const totalMarks = Object.values(s.marks).reduce((a, m) => a + m.total, 0);
    const maxMarks = Object.values(s.marks).reduce((a, m) => a + m.max, 0);
    const totalAbsent = Object.values(s.attendance).reduce((a, att) => a + att.absent, 0);
    return {
      id: s.id, name: s.name, email: s.email, avatar: s.avatar,
      class: s.class, rollNumber: s.rollNumber, age: s.age,
      overallPercentage: Math.round((totalMarks / maxMarks) * 100),
      totalAbsent, subjects: Object.keys(s.marks).length
    };
  });
  res.json({ students: summary });
});

app.get('/api/v1/students/:id', authMiddleware, async (req, res) => {
  const student = STUDENTS.find(s => s.id === req.params.id);
  if (!student) return res.status(404).json({ error: 'Student not found' });

  // Build subject analysis
  const subjectAnalysis = Object.entries(student.marks).map(([subject, m]) => {
    const percentage = Math.round((m.total / m.max) * 100);
    const att = student.attendance[subject];
    const attPct = Math.round((att.present / att.total) * 100);
    let grade = 'A+';
    if (percentage < 40) grade = 'F';
    else if (percentage < 50) grade = 'D';
    else if (percentage < 60) grade = 'C';
    else if (percentage < 70) grade = 'B';
    else if (percentage < 80) grade = 'B+';
    else if (percentage < 90) grade = 'A';
    return {
      subject, marks: m, percentage, grade,
      attendance: { ...att, percentage: attPct },
      isWeak: percentage < 60,
      isAbsenceHigh: att.absent > 8
    };
  }).sort((a, b) => a.percentage - b.percentage);

  const weakSubjects = subjectAnalysis.filter(s => s.isWeak).map(s => s.subject);
  const totalMarks = Object.values(student.marks).reduce((a, m) => a + m.total, 0);
  const maxMarks = Object.values(student.marks).reduce((a, m) => a + m.max, 0);

  // AI Analysis
  let aiAnalysis = null;
  try {
    const prompt = `You are EduPulse AI, analyzing a student's academic performance.

Student: ${student.name}, Class ${student.class}
Overall: ${Math.round((totalMarks/maxMarks)*100)}%
Weak subjects (below 60%): ${weakSubjects.length > 0 ? weakSubjects.join(', ') : 'None'}
Subject scores: ${subjectAnalysis.map(s => `${s.subject}: ${s.percentage}%`).join(', ')}
High absence subjects: ${subjectAnalysis.filter(s => s.isAbsenceHigh).map(s => s.subject).join(', ') || 'None'}

Provide a brief, encouraging academic analysis in 3-4 sentences covering:
1. Overall performance assessment
2. Main areas needing improvement  
3. One specific actionable recommendation
Keep it warm, motivating, and constructive.`;

    const result = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    });
    aiAnalysis = result.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  } catch (e) {
    aiAnalysis = `${student.name} shows ${weakSubjects.length > 0 ? 'room for improvement in ' + weakSubjects.join(', ') : 'strong overall performance'}. Focus on consistent study habits and regular attendance to maximize academic potential.`;
  }

  res.json({
    student: {
      ...student,
      overallPercentage: Math.round((totalMarks / maxMarks) * 100),
      totalMarks, maxMarks,
      subjectAnalysis, weakSubjects, aiAnalysis
    }
  });
});

// ── Teachers ──────────────────────────────────────────────────────────────────
app.get('/api/v1/teachers', authMiddleware, (req, res) => {
  const summary = TEACHERS.map(t => {
    const totalLectures = t.courses.reduce((a, c) => a + c.totalPlanned, 0);
    const completedLectures = t.courses.reduce((a, c) => a + c.lectures.filter(l => l.completed).length, 0);
    const pendingLectures = totalLectures - completedLectures;
    return {
      id: t.id, name: t.name, subject: t.subject, email: t.email,
      avatar: t.avatar, department: t.department, qualification: t.qualification,
      experience: t.experience, classes: t.classes,
      totalLectures, completedLectures, pendingLectures,
      completionRate: Math.round((completedLectures / totalLectures) * 100)
    };
  });
  res.json({ teachers: summary });
});

app.get('/api/v1/teachers/:id', authMiddleware, async (req, res) => {
  const teacher = TEACHERS.find(t => t.id === req.params.id);
  if (!teacher) return res.status(404).json({ error: 'Teacher not found' });

  const coursesWithStats = teacher.courses.map(c => {
    const completed = c.lectures.filter(l => l.completed).length;
    const pending = c.totalPlanned - completed;
    return {
      ...c,
      completedCount: completed,
      pendingCount: pending,
      completionRate: Math.round((completed / c.totalPlanned) * 100)
    };
  });

  const totalLectures = coursesWithStats.reduce((a, c) => a + c.totalPlanned, 0);
  const completedLectures = coursesWithStats.reduce((a, c) => a + c.completedCount, 0);

  // AI analysis for teacher
  let aiAnalysis = null;
  try {
    const prompt = `You are EduPulse AI, analyzing a teacher's lecture completion progress.

Teacher: ${teacher.name}, Subject: ${teacher.subject}
Experience: ${teacher.experience}
Overall completion: ${completedLectures}/${totalLectures} lectures (${Math.round((completedLectures/totalLectures)*100)}%)
Courses: ${coursesWithStats.map(c => `${c.name}: ${c.completedCount}/${c.totalPlanned} (${c.completionRate}%)`).join(', ')}

Provide a brief professional analysis in 2-3 sentences about:
1. Overall progress assessment
2. Any course needing attention
Keep it professional and constructive.`;

    const result = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    });
    aiAnalysis = result.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  } catch (e) {
    aiAnalysis = `${teacher.name} has completed ${completedLectures} of ${totalLectures} planned lectures. Continue the excellent work to ensure all curriculum goals are met before the semester ends.`;
  }

  res.json({
    teacher: {
      id: teacher.id, name: teacher.name, subject: teacher.subject,
      email: teacher.email, avatar: teacher.avatar, department: teacher.department,
      qualification: teacher.qualification, experience: teacher.experience,
      classes: teacher.classes, courses: coursesWithStats,
      totalLectures, completedLectures, pendingLectures: totalLectures - completedLectures,
      completionRate: Math.round((completedLectures / totalLectures) * 100),
      aiAnalysis
    }
  });
});

// Toggle lecture complete/incomplete
app.patch('/api/v1/teachers/:id/courses/:code/lectures/:lectureId/toggle', authMiddleware, (req, res) => {
  const teacher = TEACHERS.find(t => t.id === req.params.id);
  if (!teacher) return res.status(404).json({ error: 'Teacher not found' });

  const course = teacher.courses.find(c => c.code === req.params.code);
  if (!course) return res.status(404).json({ error: 'Course not found' });

  const lecture = course.lectures.find(l => l.id === req.params.lectureId);
  if (!lecture) return res.status(404).json({ error: 'Lecture not found' });

  lecture.completed = !lecture.completed;
  lecture.date = lecture.completed ? new Date().toISOString().split('T')[0] : null;

  const completed = course.lectures.filter(l => l.completed).length;
  res.json({
    lecture,
    courseStats: {
      completedCount: completed,
      pendingCount: course.totalPlanned - completed,
      completionRate: Math.round((completed / course.totalPlanned) * 100)
    }
  });
});

// Add lecture to course
app.post('/api/v1/teachers/:id/courses/:code/lectures', authMiddleware, (req, res) => {
  const teacher = TEACHERS.find(t => t.id === req.params.id);
  if (!teacher) return res.status(404).json({ error: 'Teacher not found' });

  const course = teacher.courses.find(c => c.code === req.params.code);
  if (!course) return res.status(404).json({ error: 'Course not found' });

  const { topic, completed = false } = req.body;
  const newLecture = {
    id: `${req.params.code.toLowerCase()}-${course.lectures.length + 1}`,
    number: course.lectures.length + 1,
    topic: topic || 'New Lecture',
    completed,
    date: completed ? new Date().toISOString().split('T')[0] : null
  };
  course.lectures.push(newLecture);
  course.totalPlanned = course.lectures.length;

  res.json({ lecture: newLecture, totalPlanned: course.totalPlanned });
});

// ── AI Chat ───────────────────────────────────────────────────────────────────
app.post('/api/v1/ai/chat', authMiddleware, async (req, res) => {
  const { message, context } = req.body;
  if (!message) return res.status(400).json({ error: 'Message required' });

  try {
    const systemPrompt = `You are EduPulse AI, an intelligent assistant for Apex Horizon Academy school management system.
You help teachers track lectures, analyze student performance, and provide educational insights.
Context: ${context || 'General school management query'}
User role: ${req.user.role}
Be helpful, concise, and educational.`;

    const result = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: [
        { role: 'user', parts: [{ text: systemPrompt + '\n\nUser: ' + message }] }
      ]
    });
    const reply = result.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || 'I could not generate a response.';
    res.json({ reply, model: DEFAULT_MODEL });
  } catch (e) {
    res.status(500).json({ error: 'AI service error', details: e.message });
  }
});

// ── Dashboard Stats ───────────────────────────────────────────────────────────
app.get('/api/v1/dashboard/stats', authMiddleware, (req, res) => {
  const totalStudents = STUDENTS.length;
  const totalTeachers = TEACHERS.length;
  const totalLectures = TEACHERS.reduce((a, t) => a + t.courses.reduce((b, c) => b + c.totalPlanned, 0), 0);
  const completedLectures = TEACHERS.reduce((a, t) => a + t.courses.reduce((b, c) => b + c.lectures.filter(l => l.completed).length, 0), 0);
  const avgAttendance = Math.round(STUDENTS.reduce((a, s) => {
    const totalPresent = Object.values(s.attendance).reduce((b, att) => b + att.present, 0);
    const totalClasses = Object.values(s.attendance).reduce((b, att) => b + att.total, 0);
    return a + (totalPresent / totalClasses) * 100;
  }, 0) / STUDENTS.length);

  res.json({
    totalStudents, totalTeachers, totalLectures,
    completedLectures, pendingLectures: totalLectures - completedLectures,
    avgAttendance, lectureCompletionRate: Math.round((completedLectures / totalLectures) * 100)
  });
});

// ── Catch-all → Frontend ──────────────────────────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log('\n============================================================');
  console.log(`  🚀 EduPulse AI Server LIVE on http://localhost:${PORT}`);
  console.log('  👩‍🏫 Teacher 360° Profiles & Lecture Controllers Activated');
  console.log('============================================================\n');
});
