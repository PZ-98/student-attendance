'use client';

import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  School, 
  Calendar, 
  UploadCloud, 
  Save, 
  Lock, 
  CheckCircle2, 
  AlertTriangle,
  RefreshCw,
  Palette
} from 'lucide-react';
import { getSchoolSettings, updateSchoolSettings } from '@/lib/db';
import { SchoolSettings } from '@/types';
import toast from 'react-hot-toast';
import { isSupabaseConfigured } from '@/lib/mockData';

export default function SettingsPage() {
  const [settings, setSettings] = useState<SchoolSettings | null>(null);
  const [schoolName, setSchoolName] = useState<string>('');
  const [academicYear, setAcademicYear] = useState<string>('');
  const [semester, setSemester] = useState<number>(1);
  const [logoUrl, setLogoUrl] = useState<string>('');
  
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const data = await getSchoolSettings();
        setSettings(data);
        setSchoolName(data.school_name);
        setAcademicYear(data.academic_year);
        setSemester(data.semester);
        setLogoUrl(data.logo_url || '');
      } catch (error) {
        toast.error('โหลดข้อมูลการตั้งค่าไม่สำเร็จ');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolName.trim()) {
      toast.error('กรุณากรอกชื่อโรงเรียน');
      return;
    }

    setSaving(true);
    try {
      const updated = await updateSchoolSettings({
        id: settings?.id || 'school-default-id',
        school_name: schoolName,
        academic_year: academicYear,
        semester: semester,
        logo_url: logoUrl || null
      });
      
      setSettings(updated);
      toast.success('บันทึกการตั้งค่าระบบเสร็จสิ้น');

      // Dispatch custom event to trigger immediate sidebar update!
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('ksn-settings-updated'));
      }
    } catch (error) {
      toast.error('ไม่สามารถบันทึกข้อมูลได้');
    } finally {
      setSaving(false);
    }
  };

  const hasDb = isSupabaseConfigured();

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="glass-panel rounded-3xl p-6 relative overflow-hidden bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-transparent">
        <div className="flex items-center gap-2 mb-1.5">
          <Settings className="h-5 w-5 text-indigo-500" />
          <span className="text-xs font-bold text-indigo-600 tracking-wide uppercase">System Settings</span>
        </div>
        <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-100">
          ตั้งค่าการทำงานและแบรนด์โรงเรียน
        </h2>
        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
          แก้ไขชื่อโรงเรียน อัปโหลดรูปภาพตราสัญลักษณ์ กำหนดปีการศึกษาปัจจุบัน และตั้งค่าเชื่อมต่อฐานข้อมูล
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Settings Form Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel rounded-3xl p-6">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-5 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <School className="h-5 w-5 text-indigo-500" />
              ข้อมูลสถานศึกษา
            </h3>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2">
                <RefreshCw className="h-8 w-8 text-indigo-500 animate-spin" />
                <span className="text-xs text-slate-400">กำลังโหลด...</span>
              </div>
            ) : (
              <form onSubmit={handleSave} className="space-y-5">
                {/* School Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400">ชื่อโรงเรียน (ภาษาไทย)</label>
                  <input 
                    type="text"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="เช่น โรงเรียนสาธิตวิทยาคม KSN"
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                  />
                </div>

                {/* Academic Year and Semester Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400">ปีการศึกษาปัจจุบัน</label>
                    <input 
                      type="text"
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="เช่น 2567"
                      value={academicYear}
                      onChange={(e) => setAcademicYear(e.target.value)}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400">ภาคเรียน / เทอม</label>
                    <select 
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      value={semester}
                      onChange={(e) => setSemester(Number(e.target.value))}
                    >
                      <option value={1}>ภาคเรียนที่ 1</option>
                      <option value={2}>ภาคเรียนที่ 2</option>
                      <option value={3}>ภาคเรียนพิเศษ (ฤดูร้อน)</option>
                    </select>
                  </div>
                </div>

                {/* School Logo */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400">ลิงก์รูปภาพ Logo โรงเรียน</label>
                  <input 
                    type="url"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="https://example.com/logo.png"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                  />
                  <span className="text-4xs text-slate-400">
                    * สามารถใส่ที่อยู่ URL รูปภาพออนไลน์ของโรงเรียน หรืออัปโหลดไปยัง Supabase Storage Bucket &apos;school-assets&apos;
                  </span>
                </div>

                {/* Submit button */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-md shadow-indigo-500/20 transition-all flex items-center gap-2 group active:scale-95 disabled:opacity-75"
                  >
                    {saving ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>กำลังบันทึก...</span>
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        <span>บันทึกการเปลี่ยนแปลง</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Database & Cloud Connection Info Panel */}
        <div className="space-y-6">
          <div className="glass-panel rounded-3xl p-6 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-5 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-3">
                <Lock className="h-5 w-5 text-indigo-500" />
                สถานะเชื่อมต่อข้อมูล
              </h3>

              <div className="space-y-4">
                {hasDb ? (
                  <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/50 rounded-2xl p-4 space-y-2.5">
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="h-5 w-5" />
                      <span className="text-xs font-bold">Supabase Cloud Active</span>
                    </div>
                    <p className="text-xxs text-emerald-700/80 dark:text-emerald-400/80 leading-relaxed">
                      ระบบได้เชื่อมต่อกับฐานข้อมูล Supabase PostgreSQL แบบออนไลน์เรียบร้อยแล้ว ข้อมูลจะคงอยู่ถาวรและแบ่งปันการบันทึกระหว่างแอดมินและครูผู้เช็คชื่อได้แบบ Real-time
                    </p>
                  </div>
                ) : (
                  <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 rounded-2xl p-4 space-y-2.5">
                    <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                      <AlertTriangle className="h-5 w-5 animate-pulse" />
                      <span className="text-xs font-bold">โหมดทดลองใช้ (Local Storage)</span>
                    </div>
                    <p className="text-xxs text-amber-700/80 dark:text-amber-400/80 leading-relaxed">
                      ระบบกำลังใช้ **ฐานข้อมูลจำลอง (Mock Local DB)** ภายในเว็บเบราว์เซอร์ของคุณ ข้อมูลสามารถบันทึก แก้ไข ค้นหา นำเข้า/ส่งออกไฟล์ XLSX และ PDF ได้จริง แต่ข้อมูลจะถูกบันทึกไว้ในเบราว์เซอร์ของคุณเท่านั้น (ไม่เชื่อมต่อคลาวด์)
                    </p>
                  </div>
                )}

                <div className="border-t border-slate-100 dark:border-slate-800/80 pt-4 space-y-3">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">วิธีเชื่อมต่อฐานข้อมูล Supabase จริง</span>
                  <ol className="list-decimal pl-4 text-xxs text-slate-400 space-y-1.5 leading-relaxed">
                    <li>ไปที่เว็บไซต์ Supabase.com และสมัครโครงการเปล่า</li>
                    <li>เข้าเมนู SQL Editor นำสคริปต์ SQL Migration ไปวางเพื่อสร้างตาราง</li>
                    <li>คัดลอกไฟล์ `.env.local` ในโฟลเดอร์โครงการ แล้วใส่ค่า `URL` และ `ANON_KEY`</li>
                    <li>รันแอปพลิเคชันอีกครั้ง ระบบจะเปลี่ยนเป็นโหมดออนไลน์โดยอัตโนมัติ!</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
