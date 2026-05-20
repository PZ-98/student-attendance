'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Clock, FileText, ChevronLeft, Save, AlertCircle, Users } from 'lucide-react';
import { attendanceService } from '@/services/attendanceService';
import { Student, AttendanceStatus } from '@/types';
import { cn } from '@/lib/utils';

export default function AttendancePage() {
  const { id } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const dateParam = searchParams.get('date');
  
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const classId = 'mock-class-id'; 
        const subjectId = 'mock-subject-id';

        const [studentsData, lastRecords] = await Promise.all([
          attendanceService.getSessionStudents(classId),
          attendanceService.getLatestSessionRecords(classId, subjectId)
        ]);

        setStudents(studentsData || []);
        
        const initialAttendance: Record<string, AttendanceStatus> = {};
        studentsData?.forEach(s => {
          const last = lastRecords.find((r: any) => r.student_id === s.id);
          initialAttendance[s.id] = last ? last.status : 'present';
        });
        setAttendance(initialAttendance);
      } catch (error) {
        console.error('Failed to fetch attendance data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const session = await attendanceService.createSession({
        class_subject_id: id as string,
        class_id: 'mock-class-id',
        subject_id: 'mock-subject-id',
        teacher_id: 'mock-teacher-id',
        period: 1,
        date: dateParam || new Date().toISOString().split('T')[0],
      });

      const records = Object.entries(attendance).map(([studentId, status]) => ({
        session_id: session.id,
        student_id: studentId,
        status: status,
      }));

      await attendanceService.saveAttendanceRecords(records);
      router.push('/schedule?success=true');
    } catch (error) {
      console.error('Failed to save attendance:', error);
      alert('บันทึกข้อมูลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-[#55a060]"></div>
      </div>
    );
  }

  const counts = Object.values(attendance).reduce((acc, status) => {
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="max-w-2xl mx-auto pb-32">
      <header className="flex items-center gap-6 mb-12">
        <button 
          onClick={() => router.back()}
          className="p-4 bg-white border-2 border-[#d1d8e0] rounded-2xl shadow-sm hover:text-[#55a060] hover:border-[#55a060] transition-all"
        >
          <ChevronLeft size={28} />
        </button>
        <div>
          <h1 className="text-3xl font-black text-[#1a202c] line-clamp-1">
            คณิตศาสตร์ - ชั้น 4A
          </h1>
          <p className="text-lg text-[#4a5568] font-black flex items-center gap-2 mt-1">
            <Users size={20} className="text-[#55a060]" />
            นักเรียนทั้งหมด {students.length} คน
          </p>
        </div>
      </header>

      <div className="space-y-6">
        {students.map((student, index) => (
          <motion.div
            key={student.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white p-7 rounded-[3rem] border-2 border-[#d1d8e0] shadow-sm"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-[#f6e58d] border border-white rounded-2xl flex items-center justify-center font-black text-[#55a060] text-xl shadow-sm">
                  {student.number}
                </div>
                <div>
                  <h3 className="font-black text-2xl text-[#1a202c]">{student.full_name}</h3>
                  <p className="text-[12px] text-[#718096] font-black uppercase tracking-widest">{student.student_code}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              {[
                { status: 'present' as AttendanceStatus, icon: Check, label: 'มาเรียน', color: 'text-white bg-[#55a060] border-[#55a060] shadow-lg shadow-[#55a060]/20' },
                { status: 'absent' as AttendanceStatus, icon: X, label: 'ขาด', color: 'text-white bg-[#d63031] border-[#d63031] shadow-lg shadow-[#d63031]/20' },
                { status: 'late' as AttendanceStatus, icon: Clock, label: 'สาย', color: 'text-white bg-[#e67e22] border-[#e67e22] shadow-lg shadow-[#e67e22]/20' },
                { status: 'leave' as AttendanceStatus, icon: FileText, label: 'ลา', color: 'text-white bg-[#0984e3] border-[#0984e3] shadow-lg shadow-[#0984e3]/20' },
              ].map((btn) => {
                const isActive = attendance[student.id] === btn.status;
                return (
                  <button
                    key={btn.status}
                    onClick={() => handleStatusChange(student.id, btn.status)}
                    className={cn(
                      "flex flex-col items-center justify-center py-4 rounded-[1.75rem] border-2 transition-all active:scale-90",
                      isActive ? btn.color : "bg-white border-[#edf2f7] text-[#cbd5e0] hover:border-[#cbd5e0]"
                    )}
                  >
                    <btn.icon size={26} className={isActive ? "mb-1.5" : "mb-1.5 opacity-50"} />
                    <span className="text-[12px] font-black tracking-tight">{btn.label}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        ))}

        {/* Spacer to clear the bottom fixed bar */}
        <div className="h-32" />
      </div>

      {/* FIXED BOTTOM BAR (Replacing Navbar location on this page) */}
      <div className="fixed bottom-0 left-0 right-0 z-[60] bg-[#f0f2ee] border-t-2 border-[#d1d8e0] px-6 py-8 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => setShowSummary(true)}
            className="w-full py-6 bg-[#55a060] text-white font-black text-2xl rounded-[2.5rem] shadow-xl shadow-[#55a060]/20 flex items-center justify-center gap-4 hover:bg-[#3d7a48] transition-all active:scale-95 border-2 border-white/20"
          >
            <Save size={28} />
            บันทึกการเช็คชื่อ
          </button>
        </div>
      </div>

      {/* Summary Modal */}
      <AnimatePresence>
        {showSummary && (
          <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSummary(false)}
              className="absolute inset-0 bg-[#1a202c]/60 backdrop-blur-xl"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="relative bg-white w-full max-w-lg rounded-t-[3.5rem] md:rounded-[3.5rem] overflow-hidden shadow-2xl p-12 border-t-4 border-[#55a060]"
            >
              <div className="w-20 h-2 bg-[#edf2f7] rounded-full mx-auto mb-10 md:hidden" />
              
              <div className="text-center space-y-3 mb-10">
                <h2 className="text-4xl font-black text-[#1a202c]">สรุปการเข้าเรียน</h2>
                <p className="text-lg text-[#4a5568] font-black">ตรวจสอบข้อมูลก่อนยืนยันอีกครั้ง</p>
              </div>

              <div className="grid grid-cols-2 gap-5 mb-10">
                {[
                  { label: 'มาเรียน', count: counts.present || 0, color: '#55a060', bg: 'bg-[#e6ffec]' },
                  { label: 'ขาดเรียน', count: counts.absent || 0, color: '#d63031', bg: 'bg-[#fff0f0]' },
                  { label: 'สาย', count: counts.late || 0, color: '#e67e22', bg: 'bg-[#fff9f0]' },
                  { label: 'ลากิจ', count: counts.leave || 0, color: '#0984e3', bg: 'bg-[#f0f9ff]' },
                ].map((stat) => (
                  <div key={stat.label} className={cn(
                    "p-7 rounded-[2.25rem] flex flex-col items-center justify-center border-2 border-transparent shadow-sm",
                    stat.bg
                  )} style={{ color: stat.color }}>
                    <span className="text-4xl font-black">{stat.count}</span>
                    <span className="text-[12px] font-black uppercase tracking-widest opacity-80 mt-1">{stat.label}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-5">
                <button
                  disabled={saving}
                  onClick={handleSubmit}
                  className="w-full py-6 bg-[#55a060] text-white font-black text-2xl rounded-[2.25rem] shadow-xl shadow-[#55a060]/20 flex items-center justify-center gap-4 active:scale-95 transition-all"
                >
                  {saving ? (
                    <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Check size={28} strokeWidth={3} />
                      ยืนยันและบันทึก
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowSummary(false)}
                  className="w-full py-6 bg-[#f7fafc] text-[#718096] font-black text-xl rounded-[2.25rem] border-2 border-[#edf2f7] active:scale-95 transition-all"
                >
                  ย้อนกลับไปแก้ไข
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function generateStaticParams() {
  return [{ id: 'mock-class-id' }];
}
