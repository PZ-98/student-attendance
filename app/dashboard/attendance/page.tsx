'use client';

import React, { useState, useEffect } from 'react';
import { 
  Check, 
  X, 
  Clock, 
  FileText, 
  AlertCircle, 
  Search, 
  BookOpen, 
  Users as UsersIcon, 
  UserCheck, 
  Sparkles, 
  Smile,
  ChevronRight,
  Info
} from 'lucide-react';
import { 
  getClassrooms, 
  getSubjects, 
  getClassSessions, 
  getStudents, 
  getAttendanceRecords, 
  saveAttendanceRecords 
} from '@/lib/db';
import { Classroom, Subject, ClassSession, Student, AttendanceRecord } from '@/types';
import toast from 'react-hot-toast';

export default function AttendancePage() {
  // Data State
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [sessions, setSessions] = useState<ClassSession[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  
  // Selection State
  const [selectedClassroom, setSelectedClassroom] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedSession, setSelectedSession] = useState<string>('');
  const [attendanceDate, setAttendanceDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // Search/Filter in Student List
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Attendance Check State
  // Map of studentId -> status
  const [attendanceState, setAttendanceState] = useState<Record<string, 'present' | 'absent' | 'late' | 'leave' | 'sick'>>({});
  const [attendanceNotes, setAttendanceNotes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  // Load initial configurations
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        const [roomsData, subData, sessData, stdData] = await Promise.all([
          getClassrooms(),
          getSubjects(),
          getClassSessions(),
          getStudents()
        ]);
        setClassrooms(roomsData);
        setSubjects(subData);
        setSessions(sessData);
        setStudents(stdData);

        // Pre-select first items if available
        if (roomsData.length > 0) setSelectedClassroom(roomsData[0].id);
        if (subData.length > 0) setSelectedSubject(subData[0].id);
      } catch (err) {
        console.error(err);
        toast.error('โหลดข้อมูลตั้งต้นไม่สำเร็จ');
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, []);

  // Sync session based on selected classroom and subject
  useEffect(() => {
    const matched = sessions.find(
      s => s.classroom_id === selectedClassroom && s.subject_id === selectedSubject
    );
    if (matched) {
      setSelectedSession(matched.id);
    } else {
      setSelectedSession('');
    }
  }, [selectedClassroom, selectedSubject, sessions]);

  // Load attendance records when date, classroom, or session changes
  useEffect(() => {
    if (!selectedClassroom) return;

    const loadRecords = async () => {
      try {
        const records = await getAttendanceRecords(attendanceDate);
        const stateMap: Record<string, 'present' | 'absent' | 'late' | 'leave' | 'sick'> = {};
        const notesMap: Record<string, string> = {};

        records.forEach(r => {
          stateMap[r.student_id] = r.status as any;
          if (r.note) notesMap[r.student_id] = r.note;
        });

        setAttendanceState(stateMap);
        setAttendanceNotes(notesMap);
      } catch (err) {
        console.error(err);
      }
    };
    loadRecords();
  }, [attendanceDate, selectedClassroom, selectedSession]);

  // Filter students based on classroom
  const filteredStudents = students.filter(s => {
    const matchesClass = s.classroom_id === selectedClassroom;
    const matchesSearch = searchQuery === '' || 
      `${s.prefix || ''}${s.first_name} ${s.last_name}`.includes(searchQuery) ||
      s.student_code.includes(searchQuery);
    return matchesClass && matchesSearch;
  });

  // Handle single status change
  const handleStatusChange = (studentId: string, status: 'present' | 'absent' | 'late' | 'leave' | 'sick') => {
    setAttendanceState(prev => ({
      ...prev,
      [studentId]: status
    }));

    // Trigger subtle touch haptic feedback if available (native web api)
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(15);
    }
  };

  // Bulk Actions
  const handleMarkAllPresent = () => {
    const updated: typeof attendanceState = { ...attendanceState };
    filteredStudents.forEach(s => {
      updated[s.id] = 'present';
    });
    setAttendanceState(updated);
    toast.success('ทำเครื่องหมาย "มาเรียน" ให้กับทุกคนในหน้านี้แล้ว');
  };

  const handleMarkAllAbsent = () => {
    const updated: typeof attendanceState = { ...attendanceState };
    filteredStudents.forEach(s => {
      updated[s.id] = 'absent';
    });
    setAttendanceState(updated);
    toast.success('ทำเครื่องหมาย "ขาดเรียน" ให้กับทุกคนในหน้านี้แล้ว');
  };

  // Save current attendance data to DB
  const handleSaveAttendance = async () => {
    if (!selectedClassroom) {
      toast.error('กรุณาเลือกห้องเรียน');
      return;
    }
    
    // Find active session
    let sessionId = selectedSession;
    if (!sessionId) {
      // If no timetable session found, create a dummy or search default
      const matched = sessions.find(s => s.classroom_id === selectedClassroom);
      if (matched) {
        sessionId = matched.id;
      } else {
        toast.error('ไม่พบคลังคาบเรียนสำหรับคู่วิชาและห้องเรียนนี้ กรุณาไปตั้งค่าตารางสอนก่อน');
        return;
      }
    }

    setSaving(true);
    try {
      const recordsToSave = filteredStudents.map(s => ({
        session_id: sessionId,
        student_id: s.id,
        attendance_date: attendanceDate,
        status: attendanceState[s.id] || 'present', // Default to present if unselected
        note: attendanceNotes[s.id] || null,
        checked_by: 'u1' // Mock Admin user
      }));

      await saveAttendanceRecords(recordsToSave);
      toast.success('บันทึกเช็คชื่อเข้าเรียนเสร็จสมบูรณ์!');
    } catch (err: any) {
      console.error(err);
      toast.error('เกิดข้อผิดพลาดในการบันทึก: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Statistics calculation for circular counters
  const totalInClass = filteredStudents.length;
  const presentCount = filteredStudents.filter(s => attendanceState[s.id] === 'present').length;
  const absentCount = filteredStudents.filter(s => attendanceState[s.id] === 'absent').length;
  const lateCount = filteredStudents.filter(s => attendanceState[s.id] === 'late').length;
  const leaveCount = filteredStudents.filter(s => attendanceState[s.id] === 'leave' || attendanceState[s.id] === 'sick').length;
  
  const checkedPercent = totalInClass > 0 
    ? Math.round((filteredStudents.filter(s => attendanceState[s.id]).length / totalInClass) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      {/* Top Welcome Title for Attendance */}
      <div className="glass-panel rounded-3xl p-6 relative overflow-hidden bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-transparent">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Sparkles className="h-5 w-5 text-indigo-500 animate-spin-slow" />
              <span className="text-xs font-bold text-indigo-600 tracking-wide uppercase">Attendance Module</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              บันทึกการเช็คชื่อเข้าเรียน <Smile className="h-6 w-6 text-yellow-500" />
            </h2>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
              เลือกห้องเรียนและวิชาเพื่อเริ่มเช็คชื่ออย่างรวดเร็ว รองรับการแตะเช็คชื่อบนหน้าจอมือถือได้อย่างสะดวกสบาย
            </p>
          </div>
        </div>
      </div>

      {/* Control filters panel */}
      <div className="glass-panel rounded-2xl p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Date Selector */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-500 dark:text-slate-400">วันที่เช็คชื่อ</label>
          <input 
            type="date"
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={attendanceDate}
            onChange={(e) => setAttendanceDate(e.target.value)}
          />
        </div>

        {/* Classroom Selector */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-500 dark:text-slate-400">ระดับชั้น / ห้องเรียน</label>
          <select 
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={selectedClassroom}
            onChange={(e) => setSelectedClassroom(e.target.value)}
          >
            <option value="">-- เลือกห้องเรียน --</option>
            {classrooms.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Subject Selector */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-500 dark:text-slate-400">วิชาเรียน</label>
          <select 
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
          >
            <option value="">-- เลือกวิชาเรียน --</option>
            {subjects.map(s => (
              <option key={s.id} value={s.id}>{s.code} - {s.name}</option>
            ))}
          </select>
        </div>

        {/* Search Student */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-500 dark:text-slate-400">ค้นหาตามชื่อ/รหัส</label>
          <div className="relative">
            <input 
              type="text"
              placeholder="ค้นหานักเรียน..."
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
          </div>
        </div>
      </div>

      {/* Attendance Stats Dashboard Row */}
      {selectedClassroom && filteredStudents.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
          <div className="glass-panel p-4 rounded-2xl flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-black text-indigo-500">{totalInClass}</span>
            <span className="text-3xs font-bold text-slate-400 mt-1 uppercase">นักเรียนทั้งหมด</span>
          </div>
          <div className="glass-panel p-4 rounded-2xl flex flex-col items-center justify-center text-center border-l-4 border-l-emerald-500">
            <span className="text-2xl font-black text-emerald-500">{presentCount}</span>
            <span className="text-3xs font-bold text-slate-400 mt-1 uppercase">มาเรียน</span>
          </div>
          <div className="glass-panel p-4 rounded-2xl flex flex-col items-center justify-center text-center border-l-4 border-l-red-500">
            <span className="text-2xl font-black text-red-500">{absentCount}</span>
            <span className="text-3xs font-bold text-slate-400 mt-1 uppercase">ขาดเรียน</span>
          </div>
          <div className="glass-panel p-4 rounded-2xl flex flex-col items-center justify-center text-center border-l-4 border-l-amber-500">
            <span className="text-2xl font-black text-amber-500">{lateCount}</span>
            <span className="text-3xs font-bold text-slate-400 mt-1 uppercase">สาย</span>
          </div>
          <div className="glass-panel p-4 rounded-2xl flex flex-col items-center justify-center text-center border-l-4 border-l-blue-500 col-span-2 sm:col-span-1">
            <span className="text-2xl font-black text-blue-500">{leaveCount}</span>
            <span className="text-3xs font-bold text-slate-400 mt-1 uppercase">ลา / ป่วย</span>
          </div>
        </div>
      )}

      {/* Main Student Check-In Section */}
      <div className="glass-panel rounded-3xl overflow-hidden">
        {/* Table/Card Header Actions */}
        <div className="bg-slate-50/50 dark:bg-slate-900/30 px-6 py-4 flex flex-col sm:flex-row items-center justify-between border-b border-slate-200/50 dark:border-slate-800/50 gap-4">
          <div className="flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-indigo-500" />
            <h3 className="font-bold text-slate-800 dark:text-slate-200">รายชื่อเช็คเข้าเรียน</h3>
            <span className="text-xxs px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-bold dark:bg-indigo-950/40 dark:text-indigo-400">
              ความคืบหน้า {checkedPercent}%
            </span>
          </div>
          
          {selectedClassroom && filteredStudents.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
              <button 
                onClick={handleMarkAllPresent}
                className="flex-1 sm:flex-initial text-xxs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-200/40 px-3 py-1.5 rounded-xl hover:bg-emerald-100 transition-colors"
              >
                มาเรียนทุกคน
              </button>
              <button 
                onClick={handleMarkAllAbsent}
                className="flex-1 sm:flex-initial text-xxs font-bold text-red-600 bg-red-50 dark:bg-red-950/20 dark:text-red-400 border border-red-200/40 px-3 py-1.5 rounded-xl hover:bg-red-100 transition-colors"
              >
                ขาดเรียนทุกคน
              </button>
            </div>
          )}
        </div>

        {/* Content body */}
        <div className="p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-semibold text-slate-400">กำลังโหลดรายชื่อนักเรียน...</span>
            </div>
          ) : !selectedClassroom ? (
            <div className="flex flex-col items-center justify-center text-center py-16 gap-4">
              <div className="h-14 w-14 rounded-full bg-slate-100 dark:bg-slate-900/60 flex items-center justify-center text-slate-400">
                <Info className="h-7 w-7" />
              </div>
              <div className="max-w-xs space-y-1">
                <h4 className="font-bold text-slate-700 dark:text-slate-300">กรุณาเลือกห้องเรียนก่อน</h4>
                <p className="text-xxs text-slate-400">กรุณาเลือกข้อมูลห้องเรียนและวิชาเรียนทางด้านบนเพื่อเปิดตารางลงเวลาเช็คชื่อ</p>
              </div>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-16 gap-4">
              <div className="h-14 w-14 rounded-full bg-slate-100 dark:bg-slate-900/60 flex items-center justify-center text-slate-400">
                <UsersIcon className="h-7 w-7" />
              </div>
              <div className="max-w-xs space-y-1">
                <h4 className="font-bold text-slate-700 dark:text-slate-300">ไม่พบรายชื่อนักเรียน</h4>
                <p className="text-xxs text-slate-400">ไม่พบนร.ในห้องเรียนนี้ หรือไม่มีข้อมูลที่ตรงตามผลการค้นหา</p>
              </div>
            </div>
          ) : (
            <div>
              {/* PC VIEW: Interactive Table (Hidden on small screens) */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200/50 dark:border-slate-800/50">
                      <th className="pb-3 text-xxs font-bold text-slate-400 uppercase tracking-wider">รหัสประจำตัว</th>
                      <th className="pb-3 text-xxs font-bold text-slate-400 uppercase tracking-wider">ชื่อ-นามสกุล</th>
                      <th className="pb-3 text-center text-xxs font-bold text-slate-400 uppercase tracking-wider">สถานะการเช็คชื่อ</th>
                      <th className="pb-3 text-xxs font-bold text-slate-400 uppercase tracking-wider">หมายเหตุ / เหตุผลเพิ่มเติม</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/55 dark:divide-slate-800/40">
                    {filteredStudents.map(student => {
                      const currentStatus = attendanceState[student.id];
                      return (
                        <tr key={student.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-900/20 transition-colors">
                          <td className="py-4 text-xs font-bold text-slate-500">{student.student_code}</td>
                          <td className="py-4">
                            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                              {student.prefix || ''}{student.first_name} {student.last_name}
                            </span>
                          </td>
                          <td className="py-4">
                            <div className="flex items-center justify-center gap-1">
                              {/* Status Present */}
                              <button 
                                onClick={() => handleStatusChange(student.id, 'present')}
                                className={`px-4 py-1.5 rounded-lg text-xxs font-bold transition-all ${
                                  currentStatus === 'present'
                                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                                    : 'bg-slate-100 hover:bg-slate-200/80 text-slate-500 dark:bg-slate-900/80 dark:hover:bg-slate-800'
                                }`}
                              >
                                มาเรียน
                              </button>
                              
                              {/* Status Absent */}
                              <button 
                                onClick={() => handleStatusChange(student.id, 'absent')}
                                className={`px-4 py-1.5 rounded-lg text-xxs font-bold transition-all ${
                                  currentStatus === 'absent'
                                    ? 'bg-red-500 text-white shadow-md shadow-red-500/20'
                                    : 'bg-slate-100 hover:bg-slate-200/80 text-slate-500 dark:bg-slate-900/80 dark:hover:bg-slate-800'
                                }`}
                              >
                                ขาด
                              </button>

                              {/* Status Late */}
                              <button 
                                onClick={() => handleStatusChange(student.id, 'late')}
                                className={`px-4 py-1.5 rounded-lg text-xxs font-bold transition-all ${
                                  currentStatus === 'late'
                                    ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                                    : 'bg-slate-100 hover:bg-slate-200/80 text-slate-500 dark:bg-slate-900/80 dark:hover:bg-slate-800'
                                }`}
                              >
                                สาย
                              </button>

                              {/* Status Leave */}
                              <button 
                                onClick={() => handleStatusChange(student.id, 'leave')}
                                className={`px-4 py-1.5 rounded-lg text-xxs font-bold transition-all ${
                                  currentStatus === 'leave'
                                    ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20'
                                    : 'bg-slate-100 hover:bg-slate-200/80 text-slate-500 dark:bg-slate-900/80 dark:hover:bg-slate-800'
                                }`}
                              >
                                ลา
                              </button>

                              {/* Status Sick */}
                              <button 
                                onClick={() => handleStatusChange(student.id, 'sick')}
                                className={`px-4 py-1.5 rounded-lg text-xxs font-bold transition-all ${
                                  currentStatus === 'sick'
                                    ? 'bg-purple-500 text-white shadow-md shadow-purple-500/20'
                                    : 'bg-slate-100 hover:bg-slate-200/80 text-slate-500 dark:bg-slate-900/80 dark:hover:bg-slate-800'
                                }`}
                              >
                                ป่วย
                              </button>
                            </div>
                          </td>
                          <td className="py-4">
                            <input 
                              type="text"
                              placeholder="เช่น ลาป่วยข้อเท้าแพลง..."
                              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-lg px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                              value={attendanceNotes[student.id] || ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                setAttendanceNotes(prev => ({
                                  ...prev,
                                  [student.id]: val
                                }));
                              }}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* MOBILE ERGONOMIC VIEW: Big visual touch target cards (Shown on smartphone and tablets) */}
              <div className="lg:hidden space-y-4">
                {filteredStudents.map((student) => {
                  const currentStatus = attendanceState[student.id];
                  return (
                    <div 
                      key={student.id} 
                      className={`glass-panel p-4 rounded-2xl flex flex-col gap-3.5 border transition-all duration-200 ${
                        currentStatus === 'present' ? 'border-emerald-500/35 bg-emerald-500/5' :
                        currentStatus === 'absent' ? 'border-red-500/35 bg-red-500/5' :
                        currentStatus === 'late' ? 'border-amber-500/35 bg-amber-500/5' :
                        currentStatus === 'leave' ? 'border-blue-500/35 bg-blue-500/5' :
                        currentStatus === 'sick' ? 'border-purple-500/35 bg-purple-500/5' :
                        'border-slate-200/60 dark:border-slate-800/60'
                      }`}
                    >
                      {/* Student info and quick summary icon */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center font-bold text-indigo-600 text-sm">
                            {student.student_code.slice(-2)}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-snug">
                              {student.prefix || ''}{student.first_name} {student.last_name}
                            </h4>
                            <span className="text-xxs text-slate-400 font-medium">รหัส {student.student_code}</span>
                          </div>
                        </div>

                        {/* Status Icon Indicator */}
                        {currentStatus && (
                          <div className={`h-6 w-6 rounded-full flex items-center justify-center text-white ${
                            currentStatus === 'present' ? 'bg-emerald-500' :
                            currentStatus === 'absent' ? 'bg-red-500' :
                            currentStatus === 'late' ? 'bg-amber-500' :
                            currentStatus === 'leave' ? 'bg-blue-500' :
                            'bg-purple-500'
                          }`}>
                            {currentStatus === 'present' ? <Check className="h-3.5 w-3.5 font-black" /> :
                             currentStatus === 'absent' ? <X className="h-3.5 w-3.5 font-black" /> :
                             currentStatus === 'late' ? <Clock className="h-3.5 w-3.5 font-black" /> :
                             <FileText className="h-3.5 w-3.5 font-black" />}
                          </div>
                        )}
                      </div>

                      {/* Touch Ergonomic Toggles (Color coded grids for fingers) */}
                      <div className="grid grid-cols-5 gap-2">
                        {/* มา */}
                        <button 
                          onClick={() => handleStatusChange(student.id, 'present')}
                          className={`flex flex-col items-center justify-center py-2.5 rounded-xl border transition-all ${
                            currentStatus === 'present'
                              ? 'bg-emerald-500 border-emerald-500 text-white font-bold shadow-md shadow-emerald-500/20'
                              : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100'
                          }`}
                        >
                          <span className="text-xs font-bold leading-tight">มา</span>
                        </button>

                        {/* ขาด */}
                        <button 
                          onClick={() => handleStatusChange(student.id, 'absent')}
                          className={`flex flex-col items-center justify-center py-2.5 rounded-xl border transition-all ${
                            currentStatus === 'absent'
                              ? 'bg-red-500 border-red-500 text-white font-bold shadow-md shadow-red-500/20'
                              : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100'
                          }`}
                        >
                          <span className="text-xs font-bold leading-tight">ขาด</span>
                        </button>

                        {/* สาย */}
                        <button 
                          onClick={() => handleStatusChange(student.id, 'late')}
                          className={`flex flex-col items-center justify-center py-2.5 rounded-xl border transition-all ${
                            currentStatus === 'late'
                              ? 'bg-amber-500 border-amber-500 text-white font-bold shadow-md shadow-amber-500/20'
                              : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100'
                          }`}
                        >
                          <span className="text-xs font-bold leading-tight">สาย</span>
                        </button>

                        {/* ลา */}
                        <button 
                          onClick={() => handleStatusChange(student.id, 'leave')}
                          className={`flex flex-col items-center justify-center py-2.5 rounded-xl border transition-all ${
                            currentStatus === 'leave'
                              ? 'bg-blue-500 border-blue-500 text-white font-bold shadow-md shadow-blue-500/20'
                              : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100'
                          }`}
                        >
                          <span className="text-xs font-bold leading-tight">ลา</span>
                        </button>

                        {/* ป่วย */}
                        <button 
                          onClick={() => handleStatusChange(student.id, 'sick')}
                          className={`flex flex-col items-center justify-center py-2.5 rounded-xl border transition-all ${
                            currentStatus === 'sick'
                              ? 'bg-purple-500 border-purple-500 text-white font-bold shadow-md shadow-purple-500/20'
                              : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100'
                          }`}
                        >
                          <span className="text-xs font-bold leading-tight">ป่วย</span>
                        </button>
                      </div>

                      {/* Notes for mobile */}
                      <div>
                        <input 
                          type="text"
                          placeholder="เหตุผลเพิ่มเติม (ถ้ามี)..."
                          className="w-full bg-slate-50/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xxs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          value={attendanceNotes[student.id] || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setAttendanceNotes(prev => ({
                              ...prev,
                              [student.id]: val
                            }));
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Save Button floating on mobile or static on desk */}
              <div className="mt-8 flex justify-end">
                <button
                  onClick={handleSaveAttendance}
                  disabled={saving}
                  className="w-full sm:w-auto bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-sm px-8 py-3 rounded-2xl transition-all shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 group disabled:opacity-75"
                >
                  {saving ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>กำลังบันทึกข้อมูล...</span>
                    </>
                  ) : (
                    <>
                      <UserCheck className="h-4.5 w-4.5" />
                      <span>บันทึกการเช็คชื่อเข้าเรียน</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
