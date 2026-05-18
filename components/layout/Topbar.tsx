'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Bell, CloudLightning, Database } from 'lucide-react';
import { isSupabaseConfigured } from '@/lib/mockData';

export default function Topbar() {
  const pathname = usePathname();

  // Dynamic titles based on pathname
  const getTitle = () => {
    if (pathname.includes('/attendance')) return 'เช็คชื่อเข้าเรียน';
    if (pathname.includes('/students')) return 'ข้อมูลนักเรียน';
    if (pathname.includes('/subjects')) return 'วิชาเรียน';
    if (pathname.includes('/sessions')) return 'ตารางสอน / คาบเรียน';
    if (pathname.includes('/reports')) return 'รายงานการเข้าเรียน';
    if (pathname.includes('/settings')) return 'ตั้งค่าระบบ';
    return 'แดชบอร์ดภาพรวม';
  };

  const getThaiDate = () => {
    const d = new Date();
    const days = ['วันอาทิตย์', 'วันจันทร์', 'วันอังคาร', 'วันพุธ', 'วันพฤหัสบดี', 'วันศุกร์', 'วันเสาร์'];
    const months = [
      'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
      'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ];
    return `${days[d.getDay()]}ที่ ${d.getDate()} ${months[d.getMonth()]} พ.ศ. ${d.getFullYear() + 543}`;
  };

  const hasDb = isSupabaseConfigured();

  return (
    <header className="fixed top-0 right-0 left-0 md:left-64 h-16 border-b border-slate-200/80 bg-white/70 backdrop-blur-md dark:border-slate-800/60 dark:bg-slate-950/60 flex items-center justify-between px-6 z-20">
      {/* Title / Info */}
      <div className="flex flex-col">
        <h1 className="text-lg font-bold text-slate-800 dark:text-slate-200 leading-tight">
          {getTitle()}
        </h1>
        <p className="text-xxs text-slate-400 dark:text-slate-500 font-medium hidden sm:block">
          {getThaiDate()}
        </p>
      </div>

      {/* Right Side Buttons */}
      <div className="flex items-center gap-3">
        {/* Database indicator */}
        <div 
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xxs font-semibold shadow-sm transition-all ${
            hasDb 
              ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200/55'
              : 'bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-200/55'
          }`}
          title={hasDb ? 'Connected to Supabase' : 'Running on Mock Storage'}
        >
          {hasDb ? (
            <>
              <Database className="h-3.5 w-3.5" />
              <span>Supabase Connected</span>
            </>
          ) : (
            <>
              <CloudLightning className="h-3.5 w-3.5 animate-pulse" />
              <span>โหมดทดลอง (Mock Local DB)</span>
            </>
          )}
        </div>

        <button className="relative p-2 rounded-xl text-slate-400 hover:bg-slate-50 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-slate-900/60 dark:hover:text-slate-300">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-indigo-500" />
        </button>
      </div>
    </header>
  );
}
