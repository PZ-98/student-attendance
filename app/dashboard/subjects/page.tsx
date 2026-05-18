'use client';

import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Plus, 
  Trash2, 
  Search, 
  X,
  PlusCircle,
  HelpCircle,
  FileSpreadsheet
} from 'lucide-react';
import { getSubjects, createSubject, deleteSubject } from '@/lib/db';
import { Subject } from '@/types';
import toast from 'react-hot-toast';

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal form states
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [subjectCode, setSubjectCode] = useState<string>('');
  const [subjectName, setSubjectName] = useState<string>('');
  const [credit, setCredit] = useState<number>(1.5);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const data = await getSubjects();
      setSubjects(data);
    } catch (error) {
      toast.error('ไม่สามารถโหลดข้อมูลรายวิชาได้');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('คุณแน่ใจหรือไม่ที่จะลบวิชานี้ออกจากระบบ?')) return;
    try {
      await deleteSubject(id);
      setSubjects(subjects.filter(s => s.id !== id));
      toast.success('ลบวิชาเรียนสำเร็จ');
    } catch (error: any) {
      toast.error('ลบวิชาเรียนไม่สำเร็จ: ' + error.message);
    }
  };

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectCode.trim() || !subjectName.trim()) {
      toast.error('กรุณากรอกข้อมูลจำเป็นให้ครบถ้วน');
      return;
    }

    setSubmitting(true);
    try {
      await createSubject({
        code: subjectCode.toUpperCase(),
        name: subjectName,
        credit
      });
      await fetchSubjects();
      toast.success('เพิ่มวิชาเรียนใหม่สำเร็จ!');
      setIsModalOpen(false);
      
      setSubjectCode('');
      setSubjectName('');
      setCredit(1.5);
    } catch (error: any) {
      toast.error('รหัสวิชาซ้ำ หรือข้อมูลผิดพลาด: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredSubjects = subjects.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="glass-panel rounded-3xl p-6 relative overflow-hidden bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-transparent">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <BookOpen className="h-5 w-5 text-indigo-500" />
              <span className="text-xs font-bold text-indigo-600 tracking-wide uppercase">Curriculum Management</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-100">
              วิชาเรียนและหลักสูตร
            </h2>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
              เพิ่มและกำหนดวิชาเรียน รหัสวิชา หน่วยกิต เพื่อใช้ในการเช็คชื่อและออกตารางสอนประจำภาคเรียน
            </p>
          </div>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="self-start md:self-auto bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-xxs px-4 py-2.5 rounded-xl shadow-md shadow-indigo-500/20 transition-all flex items-center gap-2 active:scale-95"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>เพิ่มวิชาใหม่</span>
          </button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="glass-panel rounded-2xl p-5">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-500 dark:text-slate-400">ค้นหาวิชาเรียน</label>
          <div className="relative">
            <input 
              type="text"
              placeholder="พิมพ์ชื่อวิชา หรือรหัสวิชา..."
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
          </div>
        </div>
      </div>

      {/* Subjects list grid */}
      <div className="glass-panel rounded-3xl overflow-hidden">
        <div className="p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-semibold text-slate-400">กำลังโหลดวิชาเรียน...</span>
            </div>
          ) : filteredSubjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-16 gap-4">
              <div className="h-14 w-14 rounded-full bg-slate-100 dark:bg-slate-900/60 flex items-center justify-center text-slate-400">
                <BookOpen className="h-7 w-7" />
              </div>
              <div className="max-w-xs space-y-1">
                <h4 className="font-bold text-slate-700 dark:text-slate-300">ไม่พบข้อมูลวิชาเรียน</h4>
                <p className="text-xxs text-slate-400">ยังไม่มีรายวิชาอยู่ในระบบ หรือคำค้นหาไม่ตรงกับวิชาใด</p>
              </div>
            </div>
          ) : (
            <div>
              {/* DESKTOP TABLE */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200/50 dark:border-slate-800/50">
                      <th className="pb-3 text-xxs font-bold text-slate-400 uppercase tracking-wider">รหัสวิชา</th>
                      <th className="pb-3 text-xxs font-bold text-slate-400 uppercase tracking-wider">ชื่อวิชา</th>
                      <th className="pb-3 text-xxs font-bold text-slate-400 uppercase tracking-wider">น้ำหนักหน่วยกิต</th>
                      <th className="pb-3 text-right text-xxs font-bold text-slate-400 uppercase tracking-wider">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/55 dark:divide-slate-800/40">
                    {filteredSubjects.map(subj => (
                      <tr key={subj.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-900/20 transition-colors">
                        <td className="py-4 text-xs font-bold text-slate-600 dark:text-slate-400">{subj.code}</td>
                        <td className="py-4">
                          <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{subj.name}</span>
                        </td>
                        <td className="py-4 text-xs font-semibold text-slate-500">{subj.credit} หน่วยกิต</td>
                        <td className="py-4 text-right">
                          <button 
                            onClick={() => handleDelete(subj.id)}
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

              {/* MOBILE GRID CARD LIST */}
              <div className="md:hidden space-y-3">
                {filteredSubjects.map(subj => (
                  <div key={subj.id} className="glass-panel p-4 rounded-2xl flex items-center justify-between border border-slate-200/50 dark:border-slate-800/50">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-slate-100 dark:bg-slate-900/60 flex items-center justify-center font-bold text-slate-600 text-xxs">
                        {subj.code.slice(0, 2)}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">{subj.name}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-4xs text-slate-400">รหัส {subj.code}</span>
                          <span className="text-4xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold dark:bg-slate-900 dark:text-slate-300">
                            {subj.credit} หน่วยกิต
                          </span>
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={() => handleDelete(subj.id)}
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
      {/* MODAL: ADD SUBJECT */}
      {/* =================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="glass-panel bg-white dark:bg-slate-950 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 dark:text-slate-200">เพิ่มวิชาเรียนใหม่</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAddSubject} className="p-6 space-y-4">
              {/* Code */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500">รหัสวิชา *</label>
                <input 
                  type="text"
                  required
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="เช่น ว21101"
                  value={subjectCode}
                  onChange={(e) => setSubjectCode(e.target.value)}
                />
              </div>

              {/* Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500">ชื่อวิชาเรียน *</label>
                <input 
                  type="text"
                  required
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="เช่น วิทยาศาสตร์พื้นฐาน"
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                />
              </div>

              {/* Credits */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500">น้ำหนักหน่วยกิต</label>
                <select 
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-sm font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={credit}
                  onChange={(e) => setCredit(Number(e.target.value))}
                >
                  <option value={0.5}>0.5 หน่วยกิต</option>
                  <option value={1.0}>1.0 หน่วยกิต</option>
                  <option value={1.5}>1.5 หน่วยกิต</option>
                  <option value={2.0}>2.0 หน่วยกิต</option>
                  <option value={3.0}>3.0 หน่วยกิต</option>
                </select>
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
