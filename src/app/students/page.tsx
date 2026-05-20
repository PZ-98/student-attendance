'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Upload, 
  FileSpreadsheet, 
  Plus, 
  Search, 
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

export default function StudentsPage() {
  const [importing, setImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<{ success: boolean; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setImportStatus(null);

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        const studentsToInsert = await Promise.all(data.map(async (row: any) => {
          const { data: classData } = await supabase
            .from('classes')
            .select('id')
            .eq('name', row.class_name)
            .single();

          return {
            student_code: row.student_code.toString(),
            full_name: row.full_name,
            number: parseInt(row.number),
            class_id: classData?.id,
          };
        }));

        const { error } = await supabase.from('students').insert(studentsToInsert);
        if (error) throw error;

        setImportStatus({ success: true, message: `นำเข้าข้อมูลนักเรียน ${data.length} คน เรียบร้อยแล้ว!` });
      } catch (err: any) {
        setImportStatus({ success: false, message: err.message || 'การนำเข้าข้อมูลล้มเหลว' });
      } finally {
        setImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-28">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            จัดการนักเรียน
          </h1>
          <p className="text-slate-500 font-bold">จัดการข้อมูลนักเรียนและรายห้องเรียน</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={importing}
            className="flex items-center gap-3 px-6 py-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[1.5rem] font-black text-slate-600 dark:text-slate-200 hover:border-primary transition-all shadow-sm disabled:opacity-50"
          >
            <Upload size={22} className="text-primary" />
            นำเข้าไฟล์ Excel
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImport} 
            accept=".xlsx, .xls" 
            className="hidden" 
          />
          <button className="flex items-center gap-3 px-6 py-4 bg-primary text-white rounded-[1.5rem] font-black text-lg shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95">
            <Plus size={22} />
            เพิ่มนักเรียน
          </button>
        </div>
      </header>

      {importStatus && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "p-6 rounded-[2rem] border-2 flex items-center gap-4",
            importStatus.success 
              ? "bg-emerald-50 border-emerald-100 text-emerald-800" 
              : "bg-rose-50 border-rose-100 text-rose-800"
          )}
        >
          {importStatus.success ? <CheckCircle2 size={28} /> : <XCircle size={28} />}
          <p className="font-black text-lg">{importStatus.message}</p>
        </motion.div>
      )}

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={24} />
          <input
            type="text"
            placeholder="ค้นหาด้วยชื่อ หรือ รหัสนักเรียน..."
            className="w-full pl-14 pr-6 py-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-lg shadow-sm"
          />
        </div>
        <button className="flex items-center gap-3 px-8 py-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] font-black text-slate-400 hover:text-primary transition-all shadow-sm">
          <Filter size={24} />
          เลือกชั้นเรียน
        </button>
      </div>

      {/* Student List Placeholder */}
      <div className="bg-white dark:bg-slate-900 rounded-[3.5rem] border border-slate-50 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="p-16 text-center space-y-6">
          <div className="w-28 h-28 bg-secondary/50 rounded-[2.5rem] flex items-center justify-center mx-auto text-primary">
            <Users size={56} />
          </div>
          <div className="space-y-3">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">ยังไม่มีข้อมูลนักเรียน</h3>
            <p className="text-slate-500 font-medium max-w-sm mx-auto">
              เริ่มต้นด้วยการนำเข้าไฟล์ Excel หรือเพิ่มนักเรียนด้วยตนเองเพื่อจัดการห้องเรียนของคุณ
            </p>
          </div>
          <div className="pt-6 flex flex-col items-center gap-3">
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">รูปแบบหัวตาราง Excel ที่รองรับ</p>
            <div className="flex gap-3 flex-wrap justify-center">
              {['student_code', 'full_name', 'number', 'class_name'].map(col => (
                <span key={col} className="bg-slate-50 dark:bg-slate-800 px-4 py-1.5 rounded-full text-xs font-black text-slate-400 border border-slate-100 dark:border-slate-700">
                  {col}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
