'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, 
  Search, 
  Calendar, 
  Clock, 
  BookOpen, 
  User, 
  FileText,
  Save,
  AlertCircle,
  Users
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

export default function OverridePage() {
  const router = useRouter();
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);

  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState(1);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const [cRes, sRes, tRes] = await Promise.all([
        supabase.from('classes').select('id, name'),
        supabase.from('subjects').select('id, name'),
        supabase.from('profiles').select('id, full_name').eq('role', 'teacher'),
      ]);

      setClasses(cRes.data || []);
      setSubjects(sRes.data || []);
      setTeachers(tRes.data || []);
    }
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) {
      alert('กรุณาระบุเหตุผลในการสอนแทน');
      return;
    }

    setLoading(true);
    try {
      const { data: session, error: sError } = await supabase
        .from('attendance_sessions')
        .insert({
          class_id: selectedClass,
          subject_id: selectedSubject,
          teacher_id: selectedTeacher,
          period: selectedPeriod,
          date: new Date().toISOString().split('T')[0],
          is_override: true,
          override_reason: reason,
        })
        .select()
        .single();

      if (sError) throw sError;
      router.push(`/attendance/${session.id}`);
    } catch (error) {
      console.error('Failed to create override session:', error);
      alert('สร้างคลาสเรียนล้มเหลว กรุณาตรวจสอบว่าเลือกข้อมูลครบถ้วนหรือไม่');
    } finally {
      setLoading(false);
    }
  };

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
          <h1 className="text-3xl font-black text-[#1a202c]">
            สอนแทน / เปลี่ยนวิชา
          </h1>
          <p className="text-lg text-[#4a5568] font-black">จัดการคาบสอนกรณีพิเศษนอกแผนงาน</p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="space-y-10">
        <div className="bg-white rounded-[3.5rem] p-12 border-2 border-[#d1d8e0] shadow-sm space-y-10">
          <div className="space-y-8">
            <div className="space-y-4">
              <label className="text-[12px] font-black uppercase tracking-[0.2em] text-[#718096] flex items-center gap-3 px-2">
                <Users size={18} className="text-[#55a060]" /> เลือกชั้นเรียน
              </label>
              <select
                required
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full p-6 bg-[#f7fafc] border-2 border-[#edf2f7] rounded-[2rem] focus:ring-4 focus:ring-[#55a060]/10 outline-none transition-all font-black text-lg appearance-none"
              >
                <option value="">เลือกชั้นเรียน...</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div className="space-y-4">
              <label className="text-[12px] font-black uppercase tracking-[0.2em] text-[#718096] flex items-center gap-3 px-2">
                <BookOpen size={18} className="text-[#55a060]" /> เลือกวิชา
              </label>
              <select
                required
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full p-6 bg-[#f7fafc] border-2 border-[#edf2f7] rounded-[2rem] focus:ring-4 focus:ring-[#55a060]/10 outline-none transition-all font-black text-lg appearance-none"
              >
                <option value="">เลือกวิชา...</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="text-[12px] font-black uppercase tracking-[0.2em] text-[#718096] flex items-center gap-3 px-2">
                  <User size={18} className="text-[#55a060]" /> ครูผู้สอน
                </label>
                <select
                  required
                  value={selectedTeacher}
                  onChange={(e) => setSelectedTeacher(e.target.value)}
                  className="w-full p-6 bg-[#f7fafc] border-2 border-[#edf2f7] rounded-[2rem] focus:ring-4 focus:ring-[#55a060]/10 outline-none transition-all font-black text-lg appearance-none"
                >
                  <option value="">เลือกครู...</option>
                  {teachers.map(t => <option key={t.id} value={t.id}>{t.full_name}</option>)}
                </select>
              </div>

              <div className="space-y-4">
                <label className="text-[12px] font-black uppercase tracking-[0.2em] text-[#718096] flex items-center gap-3 px-2">
                  <Clock size={18} className="text-[#55a060]" /> คาบเรียน
                </label>
                <select
                  required
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(Number(e.target.value))}
                  className="w-full p-6 bg-[#f7fafc] border-2 border-[#edf2f7] rounded-[2rem] focus:ring-4 focus:ring-[#55a060]/10 outline-none transition-all font-black text-lg appearance-none"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(p => <option key={p} value={p}>คาบที่ {p}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[12px] font-black uppercase tracking-[0.2em] text-[#718096] flex items-center gap-3 px-2">
                <FileText size={18} className="text-[#55a060]" /> เหตุผลในการสอนแทน
              </label>
              <textarea
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="ระบุเหตุผล เช่น ครูลากิจ หรือเปลี่ยนรายวิชากะทันหัน..."
                className="w-full p-8 bg-[#f7fafc] border-2 border-[#edf2f7] rounded-[2.5rem] focus:ring-4 focus:ring-[#55a060]/10 outline-none transition-all font-black text-lg min-h-[160px]"
              />
            </div>
          </div>
        </div>

        <div className="bg-[#f6e58d]/20 p-8 rounded-[3rem] border-2 border-[#f6e58d]/50 flex items-start gap-5">
          <AlertCircle className="text-[#55a060] mt-1" size={28} />
          <div className="space-y-1">
            <h4 className="font-black text-[#1a202c] text-lg">หมายเหตุ</h4>
            <p className="text-[#4a5568] font-bold leading-relaxed">
              การสร้างคลาสเรียนกรณีพิเศษจะถูกบันทึกเพื่อใช้ในการสรุปรายงานประจำเดือน กรุณาตรวจสอบความถูกต้องก่อนเริ่มเช็คชื่อ
            </p>
          </div>
        </div>

        <button
          disabled={loading}
          type="submit"
          className="w-full py-8 bg-[#55a060] text-white font-black text-2xl rounded-[3rem] shadow-2xl shadow-[#55a060]/20 flex items-center justify-center gap-4 hover:bg-[#3d7a48] transition-all active:scale-95 disabled:opacity-50 border-2 border-white/20"
        >
          {loading ? (
            <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Save size={28} />
              เริ่มการเช็คชื่อ
            </>
          )}
        </button>
      </form>
    </div>
  );
}
