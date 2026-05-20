'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart2, 
  Download, 
  FileText, 
  FileSpreadsheet, 
  TrendingDown, 
  TrendingUp,
  Calendar,
  ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function AnalyticsPage() {
  const [exporting, setExporting] = useState(false);

  const exportToExcel = () => {
    const data = [
      { นักเรียน: 'สมชาย ใจดี', ชั้น: '4A', มาเรียน: 45, ขาด: 5, สาย: 2, อัตรา: '86.5%' },
      { นักเรียน: 'วิภาดา รักเรียน', ชั้น: '3C', มาเรียน: 52, ขาด: 0, สาย: 0, อัตรา: '100%' },
      { นักเรียน: 'มานะ มีนา', ชั้น: '5B', มาเรียน: 48, ขาด: 4, สาย: 1, อัตรา: '90.5%' },
    ];
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "รายงานการเช็คชื่อ");
    XLSX.writeFile(wb, "รายงานการเข้าเรียน.xlsx");
  };

  const exportToPDF = async () => {
    setExporting(true);
    const input = document.getElementById('report-content');
    if (input) {
      const canvas = await html2canvas(input);
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save("รายงานการเข้าเรียน.pdf");
    }
    setExporting(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-28">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            รายงานและสถิติ
          </h1>
          <p className="text-slate-500 font-bold">วิเคราะห์ข้อมูลการเข้าเรียนรายบุคคลและรายห้อง</p>
        </div>
        <div className="flex gap-2">
          <div className="relative group">
            <button className="flex items-center gap-3 px-8 py-4 bg-primary text-white rounded-[1.5rem] font-black text-lg shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all">
              <Download size={22} />
              ส่งออกรายงาน
              <ChevronDown size={18} />
            </button>
            <div className="absolute right-0 top-full mt-3 w-56 bg-white dark:bg-slate-900 rounded-[1.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 p-3 hidden group-hover:block z-50">
              <button 
                onClick={exportToExcel}
                className="w-full flex items-center gap-4 px-5 py-4 hover:bg-primary/5 rounded-xl text-sm font-black text-slate-600 dark:text-slate-300 transition-colors"
              >
                <FileSpreadsheet size={20} className="text-emerald-500" />
                Excel (.xlsx)
              </button>
              <button 
                onClick={exportToPDF}
                className="w-full flex items-center gap-4 px-5 py-4 hover:bg-primary/5 rounded-xl text-sm font-black text-slate-600 dark:text-slate-300 transition-colors"
              >
                <FileText size={20} className="text-rose-500" />
                PDF Report
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Overview Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 rounded-2xl flex items-center justify-center">
              <TrendingUp size={28} />
            </div>
            <span className="text-emerald-500 text-[10px] font-black bg-emerald-50 px-2 py-1 rounded-lg">+2.4%</span>
          </div>
          <h3 className="text-3xl font-black mb-1">94.2%</h3>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">การมาเรียนเฉลี่ย</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="w-14 h-14 bg-rose-50 dark:bg-rose-950/20 text-rose-600 rounded-2xl flex items-center justify-center">
              <TrendingDown size={28} />
            </div>
            <span className="text-rose-500 text-[10px] font-black bg-rose-50 px-2 py-1 rounded-lg">-1.2%</span>
          </div>
          <h3 className="text-3xl font-black mb-1">12</h3>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">นักเรียนที่ขาดเรียนบ่อย</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="w-14 h-14 bg-secondary rounded-2xl text-primary flex items-center justify-center">
              <BarChart2 size={28} />
            </div>
            <span className="text-primary text-[10px] font-black bg-secondary px-2 py-1 rounded-lg">เสถียร</span>
          </div>
          <h3 className="text-3xl font-black mb-1">ม.4/1</h3>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">ห้องที่มีระเบียบที่สุด</p>
        </motion.div>
      </div>

      {/* Report Preview */}
      <section className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-2xl font-black">แนวโน้มประจำเดือน</h2>
          <button className="flex items-center gap-2 text-sm font-black text-slate-400">
            <Calendar size={18} />
            เมษายน 2567
          </button>
        </div>
        <div id="report-content" className="bg-white dark:bg-slate-900 p-10 rounded-[3.5rem] border border-slate-50 dark:border-slate-800 shadow-sm overflow-hidden min-h-[450px]">
          <div className="h-64 flex items-end justify-between gap-3 px-6">
            {[65, 80, 45, 90, 70, 85, 95, 60, 75, 88].map((h, i) => (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${h}%` }}
                transition={{ delay: i * 0.05, duration: 0.8 }}
                className={cn(
                  "flex-grow rounded-t-2xl",
                  h > 70 ? "bg-primary" : h > 50 ? "bg-primary/50" : "bg-rose-300"
                )}
              />
            ))}
          </div>
          <div className="mt-10 grid grid-cols-5 text-center text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">
            <span>สัปดาห์ 1</span>
            <span>สัปดาห์ 2</span>
            <span>สัปดาห์ 3</span>
            <span>สัปดาห์ 4</span>
            <span>สัปดาห์ 5</span>
          </div>
        </div>
      </section>
    </div>
  );
}
