'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Download, 
  Upload, 
  Search, 
  Trash2, 
  Edit3, 
  X, 
  UserCheck, 
  HelpCircle,
  FileSpreadsheet,
  AlertCircle
} from 'lucide-react';
import { 
  getStudents, 
  getClassrooms, 
  createStudent, 
  deleteStudent 
} from '@/lib/db';
import { Student, Classroom } from '@/types';
import { exportStudentsToXlsx } from '@/lib/exports/exportXlsx';
import { importStudentsFromXlsx, downloadXlsxTemplate } from '@/lib/imports/importStudents';
import toast from 'react-hot-toast';

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedClassroom, setSelectedClassroom] = useState<string>('');

  // Add Student Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [studentCode, setStudentCode] = useState<string>('');
  const [prefix, setPrefix] = useState<string>('เด็กชาย');
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [classroomId, setClassroomId] = useState<string>('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [phone, setPhone] = useState<string>('');
  const [parentName, setParentName] = useState<string>('');
  const [parentPhone, setParentPhone] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Import Modal State
  const [isImportOpen, setIsImportOpen] = useState<boolean>(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState<boolean>(false);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [studentsData, classroomsData] = await Promise.all([
        getStudents(),
        getClassrooms()
      ]);
      setStudents(studentsData);
      setClassrooms(classroomsData);
      if (classroomsData.length > 0) {
        setClassroomId(classroomsData[0].id);
      }
    } catch (error) {
      toast.error('ไม่สามารถโหลดข้อมูลนักเรียนได้');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  // Filter students
  const filteredStudents = students.filter(s => {
    const matchesSearch = searchQuery === '' || 
      `${s.prefix || ''}${s.first_name} ${s.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.student_code.includes(searchQuery);
    const matchesClass = selectedClassroom === '' || s.classroom_id === selectedClassroom;
    return matchesSearch && matchesClass;
  });

  // Handle delete student
  const handleDelete = async (id: string) => {
    if (!window.confirm('คุณแน่ใจหรือไม่ที่จะลบนักเรียนคนนี้ออกจากระบบ?')) return;
    try {
      await deleteStudent(id);
      setStudents(students.filter(s => s.id !== id));
      toast.success('ลบนักเรียนสำเร็จ');
    } catch (error: any) {
      toast.error('ลบนักเรียนไม่สำเร็จ: ' + error.message);
    }
  };

  // Add new student submit
  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentCode.trim() || !firstName.trim() || !lastName.trim()) {
      toast.error('กรุณากรอกข้อมูลจำเป็นให้ครบถ้วน');
      return;
    }

    setSubmitting(true);
    try {
      const newStd = await createStudent({
        student_code: studentCode,
        prefix,
        first_name: firstName,
        last_name: lastName,
        classroom_id: classroomId || null,
        gender,
        birth_date: null,
        phone: phone || null,
        parent_name: parentName || null,
        parent_phone: parentPhone || null,
        photo_url: null,
        is_active: true
      });

      // Reload
      await fetchInitialData();
      toast.success('เพิ่มข้อมูลนักเรียนใหม่สำเร็จ!');
      setIsModalOpen(false);
      
      // Clear forms
      setStudentCode('');
      setFirstName('');
      setLastName('');
      setPhone('');
      setParentName('');
      setParentPhone('');
    } catch (error: any) {
      toast.error('รหัสนักเรียนซ้ำ หรือข้อมูลผิดพลาด: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Excel Export
  const handleExport = () => {
    if (filteredStudents.length === 0) {
      toast.error('ไม่มีรายชื่อนักเรียนให้ส่งออก');
      return;
    }
    exportStudentsToXlsx(filteredStudents, 'ksn_student_roster.xlsx');
    toast.success('ส่งออกไฟล์ Excel สำเร็จ!');
  };

  // Handle Excel Import
  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importFile) {
      toast.error('กรุณาเลือกไฟล์ Excel');
      return;
    }

    setImporting(true);
    try {
      const res = await importStudentsFromXlsx(importFile);
      await fetchInitialData();
      toast.success(`นำเข้าสำเร็จ! เพิ่มนักเรียนใหม่ ${res.successCount} คน`);
      if (res.errors.length > 0) {
        console.warn(res.errors);
        toast.error(`มีข้อผิดพลาดบางแถว (${res.errors.length} แถว)`);
      }
      setIsImportOpen(false);
      setImportFile(null);
    } catch (error: any) {
      toast.error('นำเข้าไฟล์ล้มเหลว: ' + error.message);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title banner */}
      <div className="glass-panel rounded-3xl p-6 relative overflow-hidden bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-transparent">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Users className="h-5 w-5 text-indigo-500" />
              <span className="text-xs font-bold text-indigo-600 tracking-wide uppercase">Student Registry</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-100">
              ระบบจัดการข้อมูลนักเรียน
            </h2>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
              ดูแลรายชื่อนักเรียน ค้นหา จัดการข้อมูลรายบุคคล หรือนำเข้าและส่งออกเป็นไฟล์ตารางสรุป (.xlsx) ได้ทันที
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2.5">
            {/* Download Template */}
            <button 
              onClick={downloadXlsxTemplate}
              className="bg-white hover:bg-slate-50 text-slate-700 font-bold text-xxs px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm transition-all flex items-center gap-2 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800"
            >
              <Download className="h-3.5 w-3.5" />
              <span>เทมเพลต XLSX</span>
            </button>

            {/* Import Button */}
            <button 
              onClick={() => setIsImportOpen(true)}
              className="bg-white hover:bg-slate-50 text-slate-700 font-bold text-xxs px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm transition-all flex items-center gap-2 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800"
            >
              <Upload className="h-3.5 w-3.5 text-indigo-500" />
              <span>นำเข้า XLSX</span>
            </button>

            {/* Export Button */}
            <button 
              onClick={handleExport}
              className="bg-white hover:bg-slate-50 text-slate-700 font-bold text-xxs px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm transition-all flex items-center gap-2 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-500" />
              <span>ส่งออก XLSX</span>
            </button>

            {/* Add Student Button */}
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-xxs px-4 py-2.5 rounded-xl shadow-md shadow-indigo-500/20 transition-all flex items-center gap-2 active:scale-95"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>เพิ่มนักเรียนใหม่</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filters Column */}
      <div className="glass-panel rounded-2xl p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Search */}
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <label className="text-xs font-bold text-slate-500 dark:text-slate-400">ค้นหารายชื่อ / รหัสนักเรียน</label>
          <div className="relative">
            <input 
              type="text"
              placeholder="พิมพ์ชื่อ นามสกุล หรือรหัสประจำตัวที่ต้องการค้นหา..."
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
          </div>
        </div>

        {/* Classroom Filter */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-500 dark:text-slate-400">ตัวกรองห้องเรียน</label>
          <select 
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={selectedClassroom}
            onChange={(e) => setSelectedClassroom(e.target.value)}
          >
            <option value="">ทั้งหมด ทุกระดับชั้น</option>
            {classrooms.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Student List Container */}
      <div className="glass-panel rounded-3xl overflow-hidden">
        <div className="p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-semibold text-slate-400">กำลังโหลดนักเรียน...</span>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-16 gap-4">
              <div className="h-14 w-14 rounded-full bg-slate-100 dark:bg-slate-900/60 flex items-center justify-center text-slate-400">
                <Users className="h-7 w-7" />
              </div>
              <div className="max-w-xs space-y-1">
                <h4 className="font-bold text-slate-700 dark:text-slate-300">ไม่พบบัญชีรายชื่อนักเรียน</h4>
                <p className="text-xxs text-slate-400">ยังไม่มีนักเรียนบันทึกอยู่ หรือคำค้นหาของคุณไม่พบคู่ที่เหมาะสม</p>
              </div>
            </div>
          ) : (
            <div>
              {/* DESKTOP STYLED TABLE */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200/50 dark:border-slate-800/50">
                      <th className="pb-3 text-xxs font-bold text-slate-400 uppercase tracking-wider">รหัสประจำตัว</th>
                      <th className="pb-3 text-xxs font-bold text-slate-400 uppercase tracking-wider">ชื่อ-นามสกุล</th>
                      <th className="pb-3 text-xxs font-bold text-slate-400 uppercase tracking-wider">ห้องเรียน</th>
                      <th className="pb-3 text-xxs font-bold text-slate-400 uppercase tracking-wider">เพศ</th>
                      <th className="pb-3 text-xxs font-bold text-slate-400 uppercase tracking-wider">เบอร์โทรผู้ปกครอง</th>
                      <th className="pb-3 text-right text-xxs font-bold text-slate-400 uppercase tracking-wider">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/55 dark:divide-slate-800/40">
                    {filteredStudents.map(student => (
                      <tr key={student.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-900/20 transition-colors">
                        <td className="py-4 text-xs font-bold text-slate-600 dark:text-slate-400">{student.student_code}</td>
                        <td className="py-4">
                          <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                            {student.prefix || ''}{student.first_name} {student.last_name}
                          </span>
                        </td>
                        <td className="py-4 text-xs font-semibold text-slate-500">{student.classroom?.name || '-'}</td>
                        <td className="py-4 text-xs font-semibold text-slate-500">
                          {student.gender === 'male' ? 'ชาย' : student.gender === 'female' ? 'หญิง' : '-'}
                        </td>
                        <td className="py-4 text-xs font-semibold text-slate-500">{student.parent_phone || '-'}</td>
                        <td className="py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button 
                              onClick={() => handleDelete(student.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="h-4.5 w-4.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* MOBILE STYLED LIST (Ergonomic thumb layout) */}
              <div className="md:hidden space-y-3.5">
                {filteredStudents.map(student => (
                  <div key={student.id} className="glass-panel p-4 rounded-2xl flex items-center justify-between border border-slate-200/50 dark:border-slate-800/50">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-slate-100 dark:bg-slate-900/60 flex items-center justify-center font-bold text-slate-600 text-xs">
                        {student.student_code.slice(-2)}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">
                          {student.prefix || ''}{student.first_name} {student.last_name}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-4xs text-slate-400">รหัส {student.student_code}</span>
                          <span className="text-4xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold dark:bg-slate-900 dark:text-slate-300">
                            {student.classroom?.name || '-'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={() => handleDelete(student.id)}
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
      {/* MODAL 1: ADD STUDENT MODAL */}
      {/* =================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="glass-panel bg-white dark:bg-slate-950 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 dark:text-slate-200">เพิ่มนักเรียนใหม่</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleAddStudent} className="p-6 space-y-4">
              {/* Student Code */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500">รหัสประจำตัวนักเรียน *</label>
                <input 
                  type="text"
                  required
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="เช่น 10001"
                  value={studentCode}
                  onChange={(e) => setStudentCode(e.target.value)}
                />
              </div>

              {/* Name Details Row */}
              <div className="grid grid-cols-3 gap-2">
                <div className="flex flex-col gap-1.5 col-span-1">
                  <label className="text-xs font-bold text-slate-500">คำนำหน้า</label>
                  <select 
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={prefix}
                    onChange={(e) => setPrefix(e.target.value)}
                  >
                    <option value="เด็กชาย">เด็กชาย</option>
                    <option value="เด็กหญิง">เด็กหญิง</option>
                    <option value="นาย">นาย</option>
                    <option value="นางสาว">นางสาว</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5 col-span-1">
                  <label className="text-xs font-bold text-slate-500">ชื่อจริง *</label>
                  <input 
                    type="text"
                    required
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1.5 col-span-1">
                  <label className="text-xs font-bold text-slate-500">นามสกุล *</label>
                  <input 
                    type="text"
                    required
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>

              {/* Classroom & Gender */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500">ห้องเรียน *</label>
                  <select 
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={classroomId}
                    onChange={(e) => setClassroomId(e.target.value)}
                  >
                    <option value="">-- เลือกห้องเรียน --</option>
                    {classrooms.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500">เพศ</label>
                  <div className="grid grid-cols-2 gap-2 mt-0.5">
                    <button 
                      type="button"
                      onClick={() => setGender('male')}
                      className={`py-2 rounded-xl text-xxs font-bold border transition-all ${
                        gender === 'male' 
                          ? 'bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-950/20' 
                          : 'bg-slate-50 border-slate-200 text-slate-500 dark:bg-slate-900'
                      }`}
                    >
                      ชาย
                    </button>
                    <button 
                      type="button"
                      onClick={() => setGender('female')}
                      className={`py-2 rounded-xl text-xxs font-bold border transition-all ${
                        gender === 'female' 
                          ? 'bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-950/20' 
                          : 'bg-slate-50 border-slate-200 text-slate-500 dark:bg-slate-900'
                      }`}
                    >
                      หญิง
                    </button>
                  </div>
                </div>
              </div>

              {/* Parents phone number */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500">เบอร์โทรศัพท์ผู้ปกครอง</label>
                <input 
                  type="text"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="เช่น 0812345678"
                  value={parentPhone}
                  onChange={(e) => setParentPhone(e.target.value)}
                />
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

      {/* =================================================== */}
      {/* MODAL 2: IMPORT EXCEL MODAL */}
      {/* =================================================== */}
      {isImportOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="glass-panel bg-white dark:bg-slate-950 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 dark:text-slate-200">นำเข้าข้อมูลจาก Excel</h3>
              <button 
                onClick={() => setIsImportOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleImportSubmit} className="p-6 space-y-4">
              <div className="bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200/50 rounded-2xl p-4 flex gap-3">
                <AlertCircle className="h-5 w-5 text-indigo-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="text-xs font-bold text-indigo-700 dark:text-indigo-400">คำชี้แนะการนำเข้า</span>
                  <p className="text-4xs text-indigo-600/80 dark:text-indigo-400/80 leading-normal">
                    กรุณาใช้ไฟล์ตามรูปแบบเทมเพลตที่ดาวน์โหลดได้จากปุ่มเทมเพลตเท่านั้น ชื่อคอลัมน์ของไฟล์ Excel ต้องตรงตามข้อกำหนดเพื่อความถูกต้องในการจับคู่ข้อมูล
                  </p>
                </div>
              </div>

              {/* File Dropzone */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500">อัปโหลดไฟล์ Excel (.xlsx)</label>
                <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-indigo-500/70 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all bg-slate-50/50 dark:bg-slate-900/35 relative">
                  <input 
                    type="file"
                    accept=".xlsx"
                    required
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        setImportFile(e.target.files[0]);
                      }
                    }}
                  />
                  <Upload className="h-8 w-8 text-slate-400" />
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    {importFile ? importFile.name : 'ลากไฟล์มาวางที่นี่ หรือคลิกเพื่อเลือกไฟล์'}
                  </span>
                  <span className="text-4xs text-slate-400">จำกัดขนาดไฟล์ไม่เกิน 5MB</span>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsImportOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-50"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={importing}
                  className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-xs px-6 py-2 rounded-xl transition-all shadow-md shadow-indigo-500/20 flex items-center gap-2"
                >
                  {importing ? (
                    <>
                      <div className="h-4.5 w-4.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>กำลังนำเข้า...</span>
                    </>
                  ) : (
                    <span>เริ่มการนำเข้า</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
