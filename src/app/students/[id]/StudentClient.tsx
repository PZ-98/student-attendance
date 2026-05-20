'use client';

import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, 
  User, 
  Calendar, 
  Clock, 
  AlertTriangle,
  Mail,
  Phone,
  MapPin,
  TrendingUp,
  BarChart2
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function StudentClient() {
  const { id } = useParams();
  const router = useRouter();

  // Mock data for student
  const student = {
    name: 'John Doe',
    code: 'STU-2024-001',
    class: '4A',
    number: 12,
    attendanceRate: 86.5,
    risk: 'High',
    absentCount: 5,
    lateCount: 2,
  };

  return (
    <div className="max-w-2xl mx-auto pb-24 space-y-6">
      <header className="flex items-center gap-4">
        <button 
          onClick={() => router.back()}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold">Student Profile</h1>
      </header>

      {/* Profile Header Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-6">
          <span className={cn(
            "text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border",
            student.risk === 'High' ? "bg-rose-50 text-rose-600 border-rose-100" : "bg-emerald-50 text-emerald-600 border-emerald-100"
          )}>
            {student.risk} Risk
          </span>
        </div>

        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-24 h-24 bg-primary/10 rounded-[2rem] flex items-center justify-center text-primary relative">
            <User size={48} />
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-white dark:bg-slate-900 rounded-full border-4 border-slate-50 dark:border-slate-950 flex items-center justify-center font-bold text-xs">
              {student.number}
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">{student.name}</h2>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mt-1">
              Class {student.class} • {student.code}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-8">
          <div className="text-center space-y-1">
            <p className="text-[10px] font-black text-slate-400 uppercase">Rate</p>
            <p className="text-lg font-black text-primary">{student.attendanceRate}%</p>
          </div>
          <div className="text-center space-y-1">
            <p className="text-[10px] font-black text-slate-400 uppercase">Absent</p>
            <p className="text-lg font-black text-rose-500">{student.absentCount}</p>
          </div>
          <div className="text-center space-y-1">
            <p className="text-[10px] font-black text-slate-400 uppercase">Late</p>
            <p className="text-lg font-black text-amber-500">{student.lateCount}</p>
          </div>
        </div>
      </motion.div>

      {/* Statistics Section */}
      <section className="space-y-4">
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 px-4">Performance</h3>
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <p className="text-sm font-bold">Attendance Consistency</p>
              <p className="text-sm font-black text-primary">86.5%</p>
            </div>
            <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '86.5%' }}
                className="h-full bg-primary"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Recent History Placeholder */}
      <section className="space-y-4">
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 px-4">Recent Attendance</h3>
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          {[
            { date: '2024-04-28', subject: 'Mathematics', status: 'absent' },
            { date: '2024-04-27', subject: 'English', status: 'present' },
            { date: '2024-04-26', subject: 'Science', status: 'present' },
          ].map((item, i) => (
            <div key={i} className="p-4 flex items-center justify-between border-b last:border-0 border-slate-50 dark:border-slate-800/50">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center",
                  item.status === 'present' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                )}>
                  {item.status === 'present' ? <Clock size={20} /> : <AlertTriangle size={20} />}
                </div>
                <div>
                  <p className="font-bold text-sm text-slate-900 dark:text-white">{item.subject}</p>
                  <p className="text-[10px] text-slate-500 font-medium">{item.date}</p>
                </div>
              </div>
              <span className={cn(
                "text-[10px] font-black uppercase px-2 py-1 rounded-lg",
                item.status === 'present' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
              )}>
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
