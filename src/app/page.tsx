'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  UserCheck, 
  UserMinus, 
  TrendingUp, 
  AlertTriangle,
  ArrowUpRight,
  ChevronRight,
  CalendarDays
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

export default function Dashboard() {
  const [stats, setStats] = useState([
    { label: 'นักเรียนทั้งหมด', value: '-', icon: Users, color: 'text-[#3d7a48]', bg: 'bg-[#e6ffec]' },
    { label: 'มาเรียนวันนี้', value: '-', icon: UserCheck, color: 'text-[#55a060]', bg: 'bg-[#55a060]/10' },
    { label: 'ขาดเรียนวันนี้', value: '-', icon: UserMinus, color: 'text-[#d63031]', bg: 'bg-[#fff0f0]' },
    { label: 'อัตราการมาเรียน', value: '-', icon: TrendingUp, color: 'text-[#e67e22]', bg: 'bg-[#fff9f0]' },
  ]);

  const [riskStudents, setRiskStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const today = new Date().toISOString().split('T')[0];

        // 1. Total Students
        const { count: totalStudents } = await supabase
          .from('students')
          .select('*', { count: 'exact', head: true });

        // 2. Attendance Stats for Today
        const { data: todayRecords } = await supabase
          .from('attendance_records')
          .select('status')
          .gte('created_at', today);

        const present = todayRecords?.filter(r => r.status === 'present').length || 0;
        const absent = todayRecords?.filter(r => r.status === 'absent').length || 0;
        const rate = totalStudents ? ((present / totalStudents) * 100).toFixed(1) : '0.0';

        // 3. Risk Students (Based on database risk_level)
        const { data: risks } = await supabase
          .from('students')
          .select('*')
          .in('risk_level', ['Medium', 'High'])
          .limit(3);

        setStats([
          { label: 'นักเรียนทั้งหมด', value: (totalStudents || 0).toLocaleString(), icon: Users, color: 'text-[#3d7a48]', bg: 'bg-[#e6ffec]' },
          { label: 'มาเรียนวันนี้', value: present.toLocaleString(), icon: UserCheck, color: 'text-[#55a060]', bg: 'bg-[#55a060]/10' },
          { label: 'ขาดเรียนวันนี้', value: absent.toLocaleString(), icon: UserMinus, color: 'text-[#d63031]', bg: 'bg-[#fff0f0]' },
          { label: 'อัตราการมาเรียน', value: `${rate}%`, icon: TrendingUp, color: 'text-[#e67e22]', bg: 'bg-[#fff9f0]' },
        ]);

        setRiskStudents(risks?.map(s => ({
          name: s.full_name,
          class: '...', // Can join with classes table if needed
          risk: s.risk_level === 'High' ? 'สูง' : 'ปานกลาง',
          score: s.risk_level === 'High' ? 85 : 60,
          color: s.risk_level === 'High' ? 'text-[#d63031]' : 'text-[#e67e22]'
        })) || []);

      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  return (
    <div className="space-y-10 max-w-4xl mx-auto pb-40">
      <header className="flex items-center justify-between">
        <div className="space-y-1">
          <motion.h1 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-black tracking-tight text-[#1a202c]"
          >
            สวัสดีตอนเช้า 👋
          </motion.h1>
          <p className="text-[#4a5568] font-bold flex items-center gap-2 text-lg">
            <CalendarDays size={20} className="text-[#55a060]" />
            ภาพรวมการเช็คชื่อวันนี้
          </p>
        </div>
        <div className="w-16 h-16 bg-[#f6e58d] rounded-[2.25rem] flex items-center justify-center text-[#55a060] shadow-sm border-2 border-white">
          <TrendingUp size={32} />
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white p-7 rounded-[2.5rem] border-2 border-[#d1d8e0] shadow-sm hover:shadow-lg transition-all"
          >
            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-5", stat.bg)}>
              <stat.icon size={28} className={stat.color} />
            </div>
            <div className="space-y-1">
              <p className="text-[11px] font-black text-[#718096] uppercase tracking-[0.1em]">{stat.label}</p>
              <h3 className="text-3xl font-black text-[#1a202c]">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-12">
        {/* At Risk Students */}
        <section className="space-y-6">
          <div className="flex items-center justify-between px-3">
            <h2 className="text-2xl font-black flex items-center gap-3 text-[#1a202c]">
              <AlertTriangle className="text-[#f9ca24]" size={24} />
              นักเรียนกลุ่มเสี่ยง
            </h2>
            <Link href="/analytics" className="text-[#55a060] text-sm font-black flex items-center gap-1 hover:underline">
              ดูทั้งหมด <ArrowUpRight size={16} />
            </Link>
          </div>
          <div className="bg-white rounded-[2.75rem] border-2 border-[#d1d8e0] overflow-hidden shadow-sm min-h-[200px]">
            {riskStudents.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-10 text-center opacity-40 grayscale">
                <Users size={48} className="mb-2" />
                <p className="font-bold">ไม่มีข้อมูลนักเรียนกลุ่มเสี่ยง</p>
              </div>
            ) : (
              riskStudents.map((student, index) => (
                <div 
                  key={student.name} 
                  className={cn(
                    "p-6 flex items-center justify-between",
                    index !== riskStudents.length - 1 && "border-b-2 border-[#edf2f7]"
                  )}
                >
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-[#f7fafc] border border-[#edf2f7] rounded-2xl flex items-center justify-center font-black text-[#a0aec0] text-lg">
                      {student.name[0]}
                    </div>
                    <div>
                      <h4 className="font-black text-lg text-[#1a202c]">{student.name}</h4>
                      <p className="text-xs text-[#718096] font-bold uppercase tracking-tight">ชั้น {student.class}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={cn("text-[11px] font-black uppercase tracking-widest mb-1.5", student.color)}>
                      เสี่ยง{student.risk}
                    </p>
                    <div className="w-28 h-2.5 bg-[#edf2f7] rounded-full overflow-hidden border border-black/5">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${student.score}%` }}
                        className={cn("h-full", student.risk === 'สูง' ? 'bg-[#d63031]' : 'bg-[#f9ca24]')} 
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Quick Actions */}
        <section className="space-y-6">
          <h2 className="text-2xl font-black px-3 text-[#1a202c]">เมนูด่วน</h2>
          <div className="grid gap-6">
            <Link 
              href="/schedule" 
              className="p-7 bg-[#55a060] text-white rounded-[2.75rem] flex items-center justify-between group hover:shadow-2xl hover:shadow-[#55a060]/30 transition-all shadow-xl shadow-[#55a060]/10 border-2 border-white/20"
            >
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-white/20 rounded-[1.75rem] flex items-center justify-center border border-white/30">
                  <UserCheck size={32} />
                </div>
                <div>
                  <h4 className="font-black text-2xl">เช็คชื่อวันนี้</h4>
                  <p className="text-white/80 text-sm font-bold">เข้าสู่ตารางสอนและเช็คชื่อ</p>
                </div>
              </div>
              <ChevronRight className="group-hover:translate-x-3 transition-transform" size={32} />
            </Link>

            <Link 
              href="/attendance/override" 
              className="p-7 bg-white border-2 border-[#d1d8e0] rounded-[2.75rem] flex items-center justify-between group hover:border-[#55a060] transition-all shadow-sm"
            >
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-[#f6e58d] rounded-[1.75rem] text-[#55a060] flex items-center justify-center border border-white shadow-sm">
                  <AlertTriangle size={32} />
                </div>
                <div>
                  <h4 className="font-black text-2xl text-[#1a202c]">สอนแทน / เปลี่ยนวิชา</h4>
                  <p className="text-[#4a5568] text-sm font-bold">จัดการคลาสเรียนกรณีพิเศษ</p>
                </div>
              </div>
              <ChevronRight className="text-[#cbd5e0] group-hover:text-[#55a060] group-hover:translate-x-3 transition-all" size={32} />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
