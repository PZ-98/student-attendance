'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Download, 
  FileSpreadsheet, 
  FileText, 
  Search, 
  Calendar, 
  Users as UsersIcon, 
  Smile, 
  Info,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { 
  getClassrooms, 
  getSubjects, 
  getClassSessions, 
  getStudents, 
  getAttendanceRecords,
  getSchoolSettings
} from '@/lib/db';
import { Classroom, Subject, ClassSession, Student, SchoolSettings } from '@/types';
import { exportStudentsToXlsx } from '@/lib/exports/exportXlsx';
import { exportAttendanceToPdf } from '@/lib/exports/exportPdf';
import toast from 'react-hot-toast';

export default function ReportsPage() {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [sessions, setSessions] = useState<ClassSession[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [schoolSettings, setSchoolSettings] = useState<SchoolSettings | null>(null);

  // Selection states
  const [selectedClassroom, setSelectedClassroom] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedSession, setSelectedSession] = useState<string>('');
  const [reportDate, setReportDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // Loaded data state
  const [attendanceState, setAttendanceState] = useState<Record<string, string>>({});
  const [attendanceNotes, setAttendanceNotes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const loadInit = async () => {
      try {
        const [roomsData, subsData, sessData, stdsData, settingsData] = await Promise.all([
          getClassrooms(),
          getSubjects(),
          getClassSessions(),
          getStudents(),
          getSchoolSettings()
        ]);
        setClassrooms(roomsData);
        setSubjects(subsData);
        setSessions(sessData);
        setStudents(stdsData);
        setSchoolSettings(settingsData);

        if (roomsData.length > 0) setSelectedClassroom(roomsData[0].id);
        if (subsData.length > 0) setSelectedSubject(subsData[0].id);
      } catch (err) {
        toast.error('โหลดข้อมูลตัวกรองไม่สำเร็จ');
      }
    };
    loadInit();
  }, []);

  // Sync session based on selection
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

  // Load attendance data based on selected filters
  useEffect(() => {
    if (!selectedClassroom) return;

    const loadReportData = async () => {
      setLoading(true);
      try {
        const records = await getAttendanceRecords(reportDate);
        const stateMap: Record<string, string> = {};
        const notesMap: Record<string, string> = {};

        records.forEach(r => {
          stateMap[r.student_id] = r.status;
          if (r.note) notesMap[r.student_id] = r.note;
        });

        setAttendanceState(stateMap);
        setAttendanceNotes(notesMap);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadReportData();
  }, [reportDate, selectedClassroom, selectedSession]);

  const classroomDetails = classrooms.find(c => c.id === selectedClassroom);
  const subjectDetails = subjects.find(s => s.id === selectedSubject);

  const filteredStudents = students.filter(s => s.classroom_id === selectedClassroom);

  // Export functions
  const handlePdfExport = () => {
    if (filteredStudents.length === 0) {
      toast.error('ไม่พบรายชื่อนักเรียนสำหรับการพิมพ์รายงาน');
      return;
    }
    
    exportAttendanceToPdf(
      classroomDetails?.name || 'ไม่มีข้อมูลห้องเรียน',
      subjectDetails ? `${subjectDetails.code} - ${subjectDetails.name}` : 'ไม่มีข้อมูลวิชา',
      reportDate,
      filteredStudents,
      attendanceState,
      attendanceNotes,
      schoolSettings
    );
  };

  const handleXlsxExport = () => {
    if (filteredStudents.length === 0) {
      toast.error('ไม่มีข้อมูลให้ออกไฟล์ Excel');
      return;
    }

    // Convert raw attendance map to sheet row
    const rows = filteredStudents.map((s, idx) => {
      const status = attendanceState[s.id];
      let statusTh = 'ยังไม่ได้เช็ค';
      if (status === 'present') statusTh = 'มาเรียน';
      if (status === 'absent') statusTh = 'ขาดเรียน';
      if (status === 'late') statusTh = 'สาย';
      if (status === 'leave') statusTh = 'ลา';
      if (status === 'sick') statusTh = 'ป่วย';

      return {
        'ลำดับ': idx + 1,
        'รหัสประจำตัว': s.student_code,
        'ชื่อ-นามสกุล': `${s.prefix || ''}${s.first_name} ${s.last_name}`,
        'ห้องเรียน': classroomDetails?.name || '',
        'วิชาเรียน': subjectDetails?.name || '',
        'วันที่บันทึก': reportDate,
        'สถานะเข้าเรียน': statusTh,
        'หมายเหตุ': attendanceNotes[s.id] || '-'
      };
    });

    const worksheet = require('xlsx').utils.json_to_sheet(rows);
    const workbook = require('xlsx').utils.book_new();
    require('xlsx').utils.book_append_sheet(workbook, worksheet, 'รายงานเช็คชื่อ');
    
    worksheet['!cols'] = [
      { wch: 6 },
      { wch: 15 },
      { wch: 25 },
      { wch: 10 },
      { wch: 20 },
      { wch: 15 },
      { wch: 15 },
      { wch: 25 }
    ];

    require('xlsx').writeFile(workbook, `Report_${classroomDetails?.name || 'School'}_${reportDate}.xlsx`);
    toast.success('ส่งออกไฟล์ Excel สำหรับรายงานเช็คชื่อสำเร็จ!');
  };

  const presentCount = filteredStudents.filter(s => attendanceState[s.id] === 'present').length;
  const absentCount = filteredStudents.filter(s => attendanceState[s.id] === 'absent').length;
  const lateCount = filteredStudents.filter(s => attendanceState[s.id] === 'late').length;
  const leaveCount = filteredStudents.filter(s => attendanceState[s.id] === 'leave' || attendanceState[s.id] === 'sick').length;
  const uncheckedCount = filteredStudents.length - (presentCount + absentCount + lateCount + leaveCount);

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="glass-panel rounded-3xl p-6 relative overflow-hidden bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-transparent">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <BarChart3 className="h-5 w-5 text-indigo-500" />
              <span className="text-xs font-bold text-indigo-600 tracking-wide uppercase">Attendance Analytics</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-100">
              รายงานวิเคราะห์และส่งออกข้อมูล
            </h2>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
              ตรวจสอบสถิติเปอร์เซ็นต์การเข้าห้องเรียนรายคาบ ดึงสถิติรวมรายวัน และส่งออกเป็นเอกสารใบลงเวลา XLSX หรือใบเซ็นชื่อ PDF ภาษาไทยสมบูรณ์
            </p>
          </div>

          {filteredStudents.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={handleXlsxExport}
                className="bg-white hover:bg-slate-50 text-slate-700 font-bold text-xxs px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm transition-all flex items-center gap-2 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800"
              >
                <FileSpreadsheet className="h-4 w-4 text-emerald-500" />
                <span>ส่งออกรายงาน XLSX</span>
              </button>

              <button 
                onClick={handlePdfExport}
                className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-xxs px-4 py-2.5 rounded-xl shadow-md shadow-indigo-500/20 transition-all flex items-center gap-2 active:scale-95"
              >
                <FileText className="h-4 w-4" />
                <span>พิมพ์รายงาน PDF</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Control panel filter */}
      <div className="glass-panel rounded-2xl p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Date */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-500 dark:text-slate-400">เลือกวันที่ต้องการสรุป</label>
          <input 
            type="date"
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 focus:outline-none"
            value={reportDate}
            onChange={(e) => setReportDate(e.target.value)}
          />
        </div>

        {/* Classroom */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-500 dark:text-slate-400">ห้องเรียน</label>
          <select 
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 focus:outline-none"
            value={selectedClassroom}
            onChange={(e) => setSelectedClassroom(e.target.value)}
          >
            <option value="">-- เลือกห้องเรียน --</option>
            {classrooms.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Subject */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-500 dark:text-slate-400">วิชาเรียน</label>
          <select 
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 focus:outline-none"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
          >
            <option value="">-- เลือกวิชาเรียน --</option>
            {subjects.map(s => (
              <option key={s.id} value={s.id}>{s.code} - {s.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Attendance Stats Dashboard Row */}
      {selectedClassroom && filteredStudents.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5 animate-fade-in">
          <div className="glass-panel p-4 rounded-2xl flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-black text-indigo-500">{filteredStudents.length}</span>
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

      {/* Main summary list */}
      <div className="glass-panel rounded-3xl overflow-hidden">
        <div className="p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-semibold text-slate-400">กำลังดึงข้อมูลรายงานเช็คชื่อ...</span>
            </div>
          ) : !selectedClassroom ? (
            <div className="flex flex-col items-center justify-center text-center py-16 gap-4">
              <div className="h-14 w-14 rounded-full bg-slate-100 dark:bg-slate-900/60 flex items-center justify-center text-slate-400">
                <Info className="h-7 w-7" />
              </div>
              <div className="max-w-xs space-y-1">
                <h4 className="font-bold text-slate-700 dark:text-slate-300">กรุณาเลือกห้องเรียนก่อน</h4>
                <p className="text-xxs text-slate-400">ระบุเงื่อนไขห้องเรียนและรายวิชาด้านบนเพื่อเปิดดูข้อมูลสถิติรายงาน</p>
              </div>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-16 gap-4">
              <div className="h-14 w-14 rounded-full bg-slate-100 dark:bg-slate-900/60 flex items-center justify-center text-slate-400">
                <UsersIcon className="h-7 w-7" />
              </div>
              <div className="max-w-xs space-y-1">
                <h4 className="font-bold text-slate-700 dark:text-slate-300">ไม่พบบัญชีรายชื่อนักเรียน</h4>
                <p className="text-xxs text-slate-400">ห้องเรียนที่เลือกยังไม่มีการบันทึกรายชื่อนักเรียนในฐานข้อมูล</p>
              </div>
            </div>
          ) : (
            <div>
              {/* DESKTOP SUMMARY LIST TABLE */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200/50 dark:border-slate-800/50">
                      <th className="pb-3 text-xxs font-bold text-slate-400 uppercase tracking-wider">ลำดับ</th>
                      <th className="pb-3 text-xxs font-bold text-slate-400 uppercase tracking-wider">รหัสประจำตัว</th>
                      <th className="pb-3 text-xxs font-bold text-slate-400 uppercase tracking-wider">ชื่อ-นามสกุล</th>
                      <th className="pb-3 text-xxs font-bold text-slate-400 uppercase tracking-wider">ห้องเรียน</th>
                      <th className="pb-3 text-center text-xxs font-bold text-slate-400 uppercase tracking-wider">สถานะ</th>
                      <th className="pb-3 text-xxs font-bold text-slate-400 tracking-wider">หมายเหตุ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/55 dark:divide-slate-800/40">
                    {filteredStudents.map((student, idx) => {
                      const status = attendanceState[student.id];
                      return (
                        <tr key={student.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-900/20 transition-colors">
                          <td className="py-4 text-xs font-bold text-slate-400">{idx + 1}</td>
                          <td className="py-4 text-xs font-bold text-slate-500">{student.student_code}</td>
                          <td className="py-4">
                            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                              {student.prefix || ''}{student.first_name} {student.last_name}
                            </span>
                          </td>
                          <td className="py-4 text-xs font-semibold text-slate-500">{classroomDetails?.name}</td>
                          <td className="py-4">
                            <div className="flex justify-center">
                              {status === 'present' && <span className="text-3xs font-bold bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full border border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-800/20">มาเรียน</span>}
                              {status === 'absent' && <span className="text-3xs font-bold bg-red-50 text-red-600 px-3 py-1 rounded-full border border-red-100 dark:bg-red-950/20 dark:text-red-400 dark:border-red-800/20">ขาดเรียน</span>}
                              {status === 'late' && <span className="text-3xs font-bold bg-amber-50 text-amber-600 px-3 py-1 rounded-full border border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-800/20">มาสาย</span>}
                              {status === 'leave' && <span className="text-3xs font-bold bg-blue-50 text-blue-600 px-3 py-1 rounded-full border border-blue-100 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-800/20">ลากิจ</span>}
                              {status === 'sick' && <span className="text-3xs font-bold bg-purple-50 text-purple-600 px-3 py-1 rounded-full border border-purple-100 dark:bg-purple-950/20 dark:text-purple-400 dark:border-purple-800/20">ลาป่วย</span>}
                              {!status && <span className="text-3xs font-bold bg-slate-50 text-slate-400 px-3 py-1 rounded-full border border-slate-100 dark:bg-slate-900 dark:text-slate-500">ยังไม่ได้เช็ค</span>}
                            </div>
                          </td>
                          <td className="py-4 text-xs text-slate-400 font-semibold">{attendanceNotes[student.id] || '-'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* MOBILE ERGONOMIC CARD LIST */}
              <div className="md:hidden space-y-3.5">
                {filteredStudents.map((student, idx) => {
                  const status = attendanceState[student.id];
                  return (
                    <div key={student.id} className="glass-panel p-4 rounded-2xl flex items-center justify-between border border-slate-200/50 dark:border-slate-800/50">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-slate-100 dark:bg-slate-900/60 flex items-center justify-center font-bold text-slate-500 text-xs">
                          {idx + 1}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-snug">
                            {student.prefix || ''}{student.first_name} {student.last_name}
                          </h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-4xs text-slate-400">รหัส {student.student_code}</span>
                            {attendanceNotes[student.id] && (
                              <span className="text-4xs text-slate-400 font-semibold">({attendanceNotes[student.id]})</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div>
                        {status === 'present' && <span className="text-4xs font-bold bg-emerald-50 text-emerald-600 px-2.5 py-0.5 rounded-full border border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400">มาเรียน</span>}
                        {status === 'absent' && <span className="text-4xs font-bold bg-red-50 text-red-600 px-2.5 py-0.5 rounded-full border border-red-100 dark:bg-red-950/20 dark:text-red-400">ขาด</span>}
                        {status === 'late' && <span className="text-4xs font-bold bg-amber-50 text-amber-600 px-2.5 py-0.5 rounded-full border border-amber-100 dark:bg-amber-950/20 dark:text-amber-400">สาย</span>}
                        {status === 'leave' && <span className="text-4xs font-bold bg-blue-50 text-blue-600 px-2.5 py-0.5 rounded-full border border-blue-100 dark:bg-blue-950/20 dark:text-blue-400">ลา</span>}
                        {status === 'sick' && <span className="text-4xs font-bold bg-purple-50 text-purple-600 px-2.5 py-0.5 rounded-full border border-purple-100 dark:bg-purple-950/20 dark:text-purple-400">ป่วย</span>}
                        {!status && <span className="text-4xs font-bold bg-slate-50 text-slate-400 px-2.5 py-0.5 rounded-full border border-slate-100 dark:bg-slate-900">ไม่เช็ค</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
