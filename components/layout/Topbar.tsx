'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Bell, CloudLightning, Database } from 'lucide-react';
import { isSupabaseConfigured } from '@/lib/mockData';

export default function Topbar() {
  const pathname = usePathname();

  const getTitle = () => {
    if (pathname.includes('/attendance')) return 'เช็คชื่อเข้าเรียน';
    if (pathname.includes('/students'))   return 'ข้อมูลนักเรียน';
    if (pathname.includes('/subjects'))   return 'วิชาเรียน';
    if (pathname.includes('/sessions'))   return 'ตารางสอน / คาบเรียน';
    if (pathname.includes('/reports'))    return 'รายงานการเข้าเรียน';
    if (pathname.includes('/settings'))   return 'ตั้งค่าระบบ';
    return 'แดชบอร์ดภาพรวม';
  };

  const getThaiDate = () => {
    const d = new Date();
    const days = ['วันอาทิตย์','วันจันทร์','วันอังคาร','วันพุธ','วันพฤหัสบดี','วันศุกร์','วันเสาร์'];
    const months = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'];
    return `${days[d.getDay()]}ที่ ${d.getDate()} ${months[d.getMonth()]} พ.ศ. ${d.getFullYear() + 543}`;
  };

  const hasDb = isSupabaseConfigured();

  return (
    <header className="topbar fixed top-0 right-0 left-0 md:left-64 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-5 z-20 shadow-sm">
      {/* Page Title */}
      <div className="flex flex-col">
        <h1 className="text-base font-bold text-slate-800 leading-tight">
          {getTitle()}
        </h1>
        <p className="text-slate-400 font-medium hidden sm:block" style={{fontSize:'0.65rem'}}>
          {getThaiDate()}
        </p>
      </div>

      {/* Right — DB pill + bell */}
      <div className="flex items-center gap-3">
        {/* Database status pill */}
        <div
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-semibold border transition-all`}
          style={{
            fontSize: '0.65rem',
            background: hasDb ? '#f0fdf4' : '#fffbeb',
            color:      hasDb ? '#16a34a' : '#d97706',
            borderColor:hasDb ? '#bbf7d0' : '#fde68a',
          }}
          title={hasDb ? 'Connected to Supabase' : 'Running on Local Mock DB'}
        >
          {hasDb ? (
            <>
              <Database className="h-3 w-3" />
              <span>Supabase Connected</span>
            </>
          ) : (
            <>
              <CloudLightning className="h-3 w-3 animate-pulse" />
              <span>โหมดทดลอง (Mock DB)</span>
            </>
          )}
        </div>

        {/* Bell */}
        <button className="relative p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-blue-500" />
        </button>
      </div>
    </header>
  );
}
