'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, ChevronRight, ChevronLeft, AlertCircle, MapPin, CheckCircle2 } from 'lucide-react';
import { attendanceService } from '@/services/attendanceService';
import Link from 'next/link';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export default function SchedulePage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  
  const [scheduleSchema, setScheduleSchema] = useState<any[]>([]);
  const [monthSessions, setMonthSessions] = useState<any[]>([]);
  const [schedule, setSchedule] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const teacherId = 'mock-teacher-id';

  // 1. Fetch teacher's overall schedule schema (timetable) once
  useEffect(() => {
    async function initAndFetchSchema() {
      try {
        const schema = await attendanceService.getTeacherScheduleSchema(teacherId);
        setScheduleSchema(schema || []);
      } catch (error) {
        console.error('Failed to fetch schedule schema:', error);
      }
    }
    initAndFetchSchema();
  }, []);

  // 2. Fetch all recorded attendance sessions for the current visible month
  useEffect(() => {
    async function fetchMonthData() {
      try {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const start = format(new Date(year, month, 1), 'yyyy-MM-dd');
        const end = format(new Date(year, month + 1, 0), 'yyyy-MM-dd');
        
        const sessions = await attendanceService.getTeacherSessionsForRange(teacherId, start, end);
        setMonthSessions(sessions || []);
      } catch (error) {
        console.error('Failed to fetch month sessions:', error);
      }
    }
    fetchMonthData();
  }, [currentMonth]);

  // 3. Fetch schedule and recorded sessions for the selected date
  useEffect(() => {
    async function fetchSelectedDateSchedule() {
      setLoading(true);
      try {
        const dayOfWeek = selectedDate.getDay();
        const dateStr = format(selectedDate, 'yyyy-MM-dd');
        
        // Fetch schedule schema for this day of week
        const daySchedule = await attendanceService.getTodaySchedule(teacherId, dayOfWeek);
        
        // Fetch sessions created on this date
        const checkedSessions = await attendanceService.getSessionsByDate(teacherId, dateStr);
        
        // Map schedule with checked sessions
        const mappedSchedule = daySchedule?.map((item: any) => {
          const session = checkedSessions?.find((s: any) => s.class_subject_id === item.id);
          return {
            ...item,
            isChecked: !!session,
            sessionId: session?.id || null
          };
        }) || [];
        
        // Find override sessions (substitute teaching) on this date
        const overrideSessions = checkedSessions?.filter((s: any) => s.is_override) || [];
        
        // Map overrides to schedule list format
        const mappedOverrides = overrideSessions.map((session: any) => {
          return {
            id: session.id,
            period: session.period,
            is_override: true,
            isChecked: true,
            sessionId: session.id,
            subjects: { name: session.subjects?.name || 'สอนแทน / เปลี่ยนวิชาพิเศษ' },
            classes: { name: session.classes?.name || 'คลาสพิเศษ' }
          };
        });

        // Combine standard schedule and overrides, then sort by period
        const finalSchedule = [...mappedSchedule, ...mappedOverrides].sort((a, b) => a.period - b.period);
        setSchedule(finalSchedule);
      } catch (error) {
        console.error('Failed to fetch selected date schedule:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchSelectedDateSchedule();
  }, [selectedDate, scheduleSchema, monthSessions]);

  const handlePrevMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  // Generate date grid for calendar
  const getCalendarGrid = () => {
    const startDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
    const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
    
    const daysGrid: Date[] = [];
    
    // Previous month padding
    const prevMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    const daysInPrevMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 0).getDate();
    for (let i = startDay - 1; i >= 0; i--) {
      daysGrid.push(new Date(prevMonth.getFullYear(), prevMonth.getMonth(), daysInPrevMonth - i));
    }
    
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      daysGrid.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i));
    }
    
    // Next month padding to keep grid neat (42 cells)
    const remainingCells = 42 - daysGrid.length;
    const nextMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
    for (let i = 1; i <= remainingCells; i++) {
      daysGrid.push(new Date(nextMonth.getFullYear(), nextMonth.getMonth(), i));
    }
    
    return daysGrid;
  };

  // Determine status color/symbol for each day cell
  const getDayStatus = (dateObj: Date) => {
    const dateStr = format(dateObj, 'yyyy-MM-dd');
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const dayOfWeek = dateObj.getDay();
    
    const daySchema = scheduleSchema.filter(s => s.day_of_week === dayOfWeek);
    const hasClasses = daySchema.length > 0;
    
    const dateSessions = monthSessions.filter(s => s.date === dateStr);
    const sessionsCount = dateSessions.length;
    
    const isFuture = dateStr > todayStr;

    // 1. Holiday / Day Off (No classes scheduled and no override sessions)
    if (!hasClasses && sessionsCount === 0) {
      return 'holiday';
    }
    
    // 2. Future day with classes
    if (isFuture) {
      return 'future';
    }
    
    // 3. Unchecked day (For past/today: Has classes but 0 recorded sessions)
    if (sessionsCount === 0) {
      return 'unchecked';
    }
    
    // 4. Partially checked (Has recorded sessions but fewer than scheduled classes)
    if (sessionsCount < daySchema.length) {
      return 'partial';
    }
    
    // 5. Fully checked
    return 'checked';
  };

  const getDayStyle = (dateObj: Date) => {
    const status = getDayStatus(dateObj);
    const isSelected = format(dateObj, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
    const isCurrentMonth = dateObj.getMonth() === currentMonth.getMonth();
    
    let baseStyle = "h-12 w-full rounded-2xl flex flex-col items-center justify-center relative transition-all active:scale-95 border-2 ";
    
    if (!isCurrentMonth) {
      baseStyle += "opacity-30 ";
    }
    
    if (isSelected) {
      baseStyle += "border-[#55a060] ring-4 ring-[#55a060]/15 scale-105 z-10 ";
    } else {
      baseStyle += "border-transparent ";
    }
    
    switch (status) {
      case 'holiday':
        return {
          className: baseStyle + "bg-[#e2e8f0]/40 text-[#a0aec0]",
          dotColor: "bg-[#cbd5e0]"
        };
      case 'unchecked':
        return {
          className: baseStyle + "bg-[#fff0f0] text-[#d63031] border-[#fff0f0]/30 font-black",
          dotColor: "bg-[#d63031]"
        };
      case 'partial':
        return {
          className: baseStyle + "bg-[#fff9f0] text-[#e67e22] border-[#fff9f0]/30 font-black",
          dotColor: "bg-[#e67e22]"
        };
      case 'checked':
        return {
          className: baseStyle + "bg-[#e6ffec] text-[#3d7a48] border-[#e6ffec]/30 font-black",
          dotColor: "bg-[#55a060]"
        };
      case 'future':
      default:
        return {
          className: baseStyle + "bg-white text-[#1a202c] border-[#edf2f7] hover:border-[#cbd5e0]",
          dotColor: null
        };
    }
  };

  const weekDays = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];
  const daysGrid = getCalendarGrid();

  return (
    <div className="max-w-2xl mx-auto space-y-10 pb-24">
      {/* Calendar Card */}
      <div className="bg-white rounded-[3rem] p-8 border-2 border-[#d1d8e0] shadow-sm space-y-6">
        <div className="flex items-center justify-between px-2">
          <button 
            onClick={handlePrevMonth}
            className="p-3 bg-[#f7fafc] border-2 border-[#edf2f7] rounded-2xl hover:text-[#55a060] hover:border-[#55a060] transition-all"
          >
            <ChevronLeft size={20} />
          </button>
          <h2 className="text-xl font-black text-[#1a202c]">
            {format(currentMonth, 'MMMM yyyy', { locale: th })}
          </h2>
          <button 
            onClick={handleNextMonth}
            className="p-3 bg-[#f7fafc] border-2 border-[#edf2f7] rounded-2xl hover:text-[#55a060] hover:border-[#55a060] transition-all"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Days of week */}
        <div className="grid grid-cols-7 gap-2 text-center text-[11px] font-black text-[#a0aec0] uppercase tracking-wider">
          {weekDays.map(d => (
            <span key={d} className={cn(d === 'อา.' && 'text-red-500', d === 'ส.' && 'text-blue-500')}>
              {d}
            </span>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {daysGrid.map((dateObj, idx) => {
            const { className, dotColor } = getDayStyle(dateObj);
            return (
              <motion.button
                key={idx}
                whileHover={{ scale: 1.05 }}
                onClick={() => setSelectedDate(dateObj)}
                className={className}
              >
                <span className="text-sm font-bold">{dateObj.getDate()}</span>
                {dotColor && (
                  <span className={cn("w-1.5 h-1.5 rounded-full absolute bottom-1.5", dotColor)} />
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-x-5 gap-y-2.5 items-center justify-center pt-5 text-[11px] font-black text-[#718096] border-t border-[#edf2f7]">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#d63031]" />
            <span>ยังไม่ได้เช็ค</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#e67e22]" />
            <span>เช็คบางส่วน</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#55a060]" />
            <span>เช็คครบแล้ว</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#cbd5e0]" />
            <span>วันหยุด / ไม่มีเรียน</span>
          </div>
        </div>
      </div>

      <header className="space-y-3">
        <h1 className="text-3xl font-black tracking-tight text-[#1a202c]">
          {format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') 
            ? 'ตารางสอนวันนี้' 
            : `ตารางสอนวัน${format(selectedDate, 'EEEE', { locale: th })}`
          }
        </h1>
        <p className="text-[#4a5568] font-bold flex items-center gap-2 text-lg">
          <Calendar size={22} className="text-[#55a060]" />
          {format(selectedDate, 'EEEEที่ d MMMM yyyy', { locale: th })}
        </p>
      </header>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-[#55a060]"></div>
        </div>
      ) : schedule.length === 0 ? (
        <div className="bg-white rounded-[3rem] p-16 text-center border-2 border-dashed border-[#d1d8e0] space-y-8">
          <div className="bg-[#f6e58d]/30 w-24 h-24 rounded-[2.5rem] flex items-center justify-center mx-auto text-[#55a060] border-4 border-white shadow-sm">
            <Clock size={48} />
          </div>
          <div className="space-y-3">
            <h3 className="font-black text-2xl text-[#1a202c]">ไม่มีตารางสอนในวันนี้</h3>
            <p className="text-[#718096] font-bold text-sm max-w-xs mx-auto">
              ไม่มีคาบสอนที่ถูกบันทึกไว้ในวันนี้ คุณสามารถพักผ่อนหรือจัดการงานอื่นๆ ได้เต็มที่ครับ
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-6">
          {schedule.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link 
                href={item.isChecked ? `/attendance/${item.sessionId}` : `/attendance/${item.id}?date=${format(selectedDate, 'yyyy-MM-dd')}`}
                className={cn(
                  "block group bg-white p-7 rounded-[3rem] border-2 transition-all shadow-sm hover:shadow-2xl hover:shadow-[#55a060]/5",
                  item.isChecked 
                    ? "border-[#55a060]/20 hover:border-[#55a060]" 
                    : "border-[#d1d8e0] hover:border-[#d63031]"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="bg-[#f6e58d] text-[#55a060] text-[12px] font-black px-4 py-2 rounded-2xl uppercase tracking-widest border border-white">
                        คาบที่ {item.period}
                      </span>
                      {item.is_override && (
                        <span className="bg-[#fff0f0] text-[#d63031] text-[12px] font-black px-4 py-2 rounded-2xl flex items-center gap-1.5 uppercase tracking-widest border border-[#d63031]/10">
                          <AlertCircle size={14} />
                          สอนแทน
                        </span>
                      )}
                      {item.isChecked ? (
                        <span className="bg-[#e6ffec] text-[#3d7a48] text-[12px] font-black px-4 py-2 rounded-2xl flex items-center gap-1.5 border border-[#55a060]/10">
                          <CheckCircle2 size={14} />
                          เช็คชื่อแล้ว
                        </span>
                      ) : (
                        <span className={cn(
                          "text-[12px] font-black px-4 py-2 rounded-2xl flex items-center gap-1.5 border",
                          format(selectedDate, 'yyyy-MM-dd') > format(new Date(), 'yyyy-MM-dd')
                            ? "bg-[#f5f6fa] text-[#a0aec0] border-[#cbd5e0]/20"
                            : "bg-[#fff0f0] text-[#d63031] border-[#d63031]/10"
                        )}>
                          <AlertCircle size={14} />
                          {format(selectedDate, 'yyyy-MM-dd') > format(new Date(), 'yyyy-MM-dd') ? 'รอเช็คชื่อ' : 'ยังไม่ได้เช็ค'}
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="text-3xl font-black text-[#1a202c] group-hover:text-[#55a060] transition-colors leading-tight">
                        {item.subjects?.name}
                      </h3>
                      <div className="flex items-center gap-5 mt-2 text-[#4a5568] font-black text-lg">
                        <span>ชั้น {item.classes?.name}</span>
                        <span className="flex items-center gap-2">
                          <MapPin size={18} className="text-[#a0aec0]" />
                          ห้อง 421
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className={cn(
                    "w-14 h-14 rounded-2xl bg-[#f7fafc] border-2 border-[#edf2f7] flex items-center justify-center text-[#cbd5e0] transition-all",
                    item.isChecked 
                      ? "group-hover:bg-[#55a060] group-hover:text-white group-hover:border-[#55a060]"
                      : "group-hover:bg-[#d63031] group-hover:text-white group-hover:border-[#d63031]"
                  )}>
                    <ChevronRight size={32} />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      <div className="pt-8">
        <Link 
          href="/attendance/override"
          className="w-full py-8 flex items-center justify-center gap-4 rounded-[3rem] border-2 border-dashed border-[#cbd5e0] text-[#718096] hover:text-[#55a060] hover:border-[#55a060] hover:bg-[#55a060]/5 transition-all font-black text-2xl"
        >
          <AlertCircle size={28} />
          สอนแทน หรือ เปลี่ยนวิชานอกแผน
        </Link>
      </div>
    </div>
  );
}
