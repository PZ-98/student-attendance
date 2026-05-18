'use client';

import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Plus, 
  Trash2, 
  X,
  Clock,
  BookOpen,
  Users as UsersIcon,
  Filter
} from 'lucide-react';
import { 
  getClassrooms, 
  getSubjects, 
  getClassSessions, 
  createClassSession, 
  deleteClassSession 
} from '@/lib/db';
import { Classroom, Subject, ClassSession } from '@/types';
import toast from 'react-hot-toast';

export default function SessionsPage() {
  const [sessions, setSessions] = useState<ClassSession[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedClassroom, setSelectedClassroom] = useState<string>('');

  // Form states
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [subjectId, setSubjectId] = useState<string>('');
  const [classroomId, setClassroomId] = useState<string>('');
  const [dayOfWeek, setDayOfWeek] = useState<number>(1); // Monday default
  const [periodNumber, setPeriodNumber] = useState<number>(1);
  const [startTime, setStartTime] = useState<string>('08:30');
  const [endTime, setEndTime] = useState<string>('09:20');
  const [submitting, setSubmitting] = useState<boolean>(false);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [sessionsData, classroomsData, subjectsData] = await Promise.all([
        getClassSessions(),
        getClassrooms(),
        getSubjects()
      ]);
      setSessions(sessionsData);
      setClassrooms(classroomsData);
      setSubjects(subjectsData);
      
      if (classroomsData.length > 0) setClassroomId(classroomsData[0].id);
      if (subjectsData.length > 0) setSubjectId(subjectsData[0].id);
    } catch (error) {
      toast.error('ไม่สามารถโหลดข้อมูลตารางเรียนได้');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('คุณแน่ใจหรือไม่ที่จะลบตารางสอน/คาบเรียนนี้?')) return;
    try {
      await deleteClassSession(id);
      setSessions(sessions.filter(s => s.id !== id));
      toast.success('ลบคาบเรียนสำเร็จ');
    } catch (error: any) {
      toast.error('ลบไม่สำเร็จ: ' + error.message);
    }
  };

  const handleAddSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectId || !classroomId) {
      toast.error('กรุณาเลือกวิชาและห้องเรียน');
      return;
    }

    setSubmitting(true);
    try {
      await createClassSession({
        subject_id: subjectId,
        classroom_id: classroomId,
        teacher_id: 'u1', // Default Admin teacher
        day_of_week: Number(dayOfWeek),
        period_number: Number(periodNumber),
        start_time: startTime + ':00',
        end_time: endTime + ':00',
        academic_year: '2567',
        semester: 1
      });
      await fetchInitialData();
      toast.success('เพิ่มตารางสอนสำเร็จ!');
      setIsModalOpen(false);
    } catch (error: any) {
      toast.error('คาบเรียนซ้ำซ้อนในตารางสอน: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const getDayName = (day: number) => {
    const days = ['วันอาทิตย์', 'วันจันทร์', 'วันอังคาร', 'วันพุธ', 'วันพฤหัสบดี', 'วันศุกร์', 'วันเสาร์'];
    return days[day] || '';
  };

  const getDayColor = (day: number) => {
    const colors = [
      'bg-red-500/10 text-red-600',       // Sun
      'bg-yellow-500/10 text-yellow-600', // Mon
      'bg-pink-500/10 text-pink-600',     // Tue
      'bg-green-500/10 text-green-600',   // Wed
      'bg-orange-500/10 text-orange-600', // Thu
      'bg-sky-500/10 text-sky-600',       // Fri
      'bg-purple-500/10 text-purple-600'  // Sat
    ];
    return colors[day] || 'bg-slate-500/10 text-slate-600';
  };

  // Filter sessions based on classroom
  const filteredSessions = sessions.filter(s => 
    selectedClassroom === '' || s.classroom_id === selectedClassroom
  ).sort((a, b) => {
    if (a.day_of_week !== b.day_of_week) return a.day_of_week - b.day_of_week;
    return a.period_number - b.period_number;
  });

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="glass-panel rounded-3xl p-6 relative overflow-hidden bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-transparent">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Calendar className="h-5 w-5 text-indigo-500" />
              <span className="text-xs font-bold text-indigo-600 tracking-wide uppercase">Teaching Timetable</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-100">
              ตารางเรียนและตารางสอน
            </h2>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
              จัดสรรวิชาเรียนให้แก่ห้องเรียนต่างๆ ตามวัน คาบเรียน และระยะเวลา เพื่อใช้เป็นฐานข้อมูลในการเลือกเช็คชื่อนักเรียนเข้าเรียนรายคาบ
            </p>
          </div>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="self-start md:self-auto bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-xxs px-4 py-2.5 rounded-xl shadow-md shadow-indigo-500/20 transition-all flex items-center gap-2 active:scale-95"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>จัดตารางสอน</span>
          </button>
        </div>
      </div>

      {/* Classroom Filter */}
      <div className="glass-panel rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
          <Filter className="h-5 w-5" />
          <span className="text-xs font-bold">กรองตารางสอน</span>
        </div>
        <select 
          className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-64"
          value={selectedClassroom}
          onChange={(e) => setSelectedClassroom(e.target.value)}
        >
          <option value="">แสดงทั้งหมด ทุกห้องเรียน</option>
          {classrooms.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Main sessions grid */}
      <div className="glass-panel rounded-3xl overflow-hidden">
        <div className="p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-semibold text-slate-400">กำลังโหลดตารางเรียน...</span>
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-16 gap-4">
              <div className="h-14 w-14 rounded-full bg-slate-100 dark:bg-slate-900/60 flex items-center justify-center text-slate-400">
                <Calendar className="h-7 w-7" />
              </div>
              <div className="max-w-xs space-y-1">
                <h4 className="font-bold text-slate-700 dark:text-slate-300">ไม่พบตารางสอน</h4>
                <p className="text-xxs text-slate-400">ยังไม่มีการจัดคาบเรียนและตารางสอนในระบบ</p>
              </div>
            </div>
          ) : (
            <div>
              {/* DESKTOP VIEW */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200/50 dark:border-slate-800/50">
                      <th className="pb-3 text-xxs font-bold text-slate-400 uppercase tracking-wider">วันเรียน</th>
                      <th className="pb-3 text-xxs font-bold text-slate-400 uppercase tracking-wider">คาบเรียน</th>
                      <th className="pb-3 text-xxs font-bold text-slate-400 uppercase tracking-wider">เวลาเรียน</th>
                      <th className="pb-3 text-xxs font-bold text-slate-400 uppercase tracking-wider">ห้องเรียน</th>
                      <th className="pb-3 text-xxs font-bold text-slate-400 uppercase tracking-wider">วิชาเรียน</th>
                      <th className="pb-3 text-right text-xxs font-bold text-slate-400 uppercase tracking-wider">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/55 dark:divide-slate-800/40">
                    {filteredSessions.map(sess => (
                      <tr key={sess.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-900/20 transition-colors">
                        <td className="py-4">
                          <span className={`text-xxs font-bold px-3 py-1 rounded-full ${getDayColor(sess.day_of_week)}`}>
                            {getDayName(sess.day_of_week)}
                          </span>
                        </td>
                        <td className="py-4 text-xs font-bold text-slate-700 dark:text-slate-300">คาบที่ {sess.period_number}</td>
                        <td className="py-4">
                          <span className="text-xs text-slate-500 font-semibold flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 text-slate-400" />
                            {sess.start_time?.slice(0, 5)} - {sess.end_time?.slice(0, 5)} น.
                          </span>
                        </td>
                        <td className="py-4 text-xs font-bold text-slate-600 dark:text-slate-300">{sess.classroom?.name}</td>
                        <td className="py-4">
                          <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                            {sess.subject?.code} - {sess.subject?.name}
                          </span>
                        </td>
                        <td className="py-4 text-right">
                          <button 
                            onClick={() => handleDelete(sess.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="h-4.5 w-4.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* MOBILE VIEW */}
              <div className="md:hidden space-y-3">
                {filteredSessions.map(sess => (
                  <div key={sess.id} className="glass-panel p-4 rounded-2xl flex items-center justify-between border border-slate-200/50 dark:border-slate-800/50">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-3xs font-bold px-2 py-0.5 rounded-full ${getDayColor(sess.day_of_week)}`}>
                          {getDayName(sess.day_of_week).slice(3)}
                        </span>
                        <span className="text-3xs font-black text-slate-600 dark:text-slate-400">คาบที่ {sess.period_number}</span>
                        <span className="text-4xs text-slate-400 font-bold">{sess.start_time?.slice(0, 5)} น.</span>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-tight">
                          {sess.subject?.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-4xs text-slate-400">{sess.subject?.code}</span>
                          <span className="text-4xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 font-bold dark:bg-indigo-950/20 dark:text-indigo-400">
                            ห้อง {sess.classroom?.name}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={() => handleDelete(sess.id)}
                      className="p-2 rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* =================================================== */}
      {/* MODAL: ADD TIMETABLE SLOT */}
      {/* =================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="glass-panel bg-white dark:bg-slate-950 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 dark:text-slate-200">เพิ่มจัดตารางสอนใหม่</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAddSession} className="p-6 space-y-4">
              {/* Classroom Selector */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500">ห้องเรียน *</label>
                <select 
                  required
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-sm font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={classroomId}
                  onChange={(e) => setClassroomId(e.target.value)}
                >
                  <option value="">-- เลือกห้องเรียน --</option>
                  {classrooms.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Subject Selector */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500">วิชาสอน *</label>
                <select 
                  required
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-sm font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                >
                  <option value="">-- เลือกวิชาสอน --</option>
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.code} - {s.name}</option>
                  ))}
                </select>
              </div>

              {/* Day and Period Slots */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500">วันเรียน *</label>
                  <select 
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-sm font-semibold text-slate-800 dark:text-slate-200"
                    value={dayOfWeek}
                    onChange={(e) => setDayOfWeek(Number(e.target.value))}
                  >
                    <option value={1}>วันจันทร์</option>
                    <option value={2}>วันอังคาร</option>
                    <option value={3}>วันพุธ</option>
                    <option value={4}>วันพฤหัสบดี</option>
                    <option value={5}>วันศุกร์</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500">คาบที่ *</label>
                  <select 
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-sm font-semibold text-slate-800 dark:text-slate-200"
                    value={periodNumber}
                    onChange={(e) => setPeriodNumber(Number(e.target.value))}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                      <option key={num} value={num}>คาบที่ {num}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Time Schedule range */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500">เวลาเริ่มเรียน</label>
                  <input 
                    type="time"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-sm"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500">เวลาสิ้นสุด</label>
                  <input 
                    type="time"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-sm"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-50"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-xs px-6 py-2 rounded-xl transition-all shadow-md shadow-indigo-500/20"
                >
                  {submitting ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
