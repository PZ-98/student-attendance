'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  Calendar, 
  CheckSquare, 
  BarChart3, 
  Settings, 
  GraduationCap
} from 'lucide-react';
import { SchoolSettings } from '@/types';

interface SidebarProps {
  schoolSettings: SchoolSettings | null;
}

export default function Sidebar({ schoolSettings }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { name: 'แดชบอร์ด', href: '/dashboard', icon: LayoutDashboard },
    { name: 'เช็คชื่อเข้าเรียน', href: '/dashboard/attendance', icon: CheckSquare },
    { name: 'ข้อมูลนักเรียน', href: '/dashboard/students', icon: Users },
    { name: 'วิชาเรียน', href: '/dashboard/subjects', icon: BookOpen },
    { name: 'ตารางสอน / คาบเรียน', href: '/dashboard/sessions', icon: Calendar },
    { name: 'รายงานการเข้าเรียน', href: '/dashboard/reports', icon: BarChart3 },
    { name: 'ตั้งค่าระบบ', href: '/dashboard/settings', icon: Settings },
  ];

  return (
    <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-slate-200/80 bg-white/90 backdrop-blur-md dark:border-slate-800/60 dark:bg-slate-950/80 md:flex z-30">
      {/* Brand Header */}
      <div className="flex h-16 items-center px-6 border-b border-slate-100 dark:border-slate-800/80 gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500 text-white shadow-lg shadow-indigo-500/30">
          <GraduationCap className="h-5 w-5" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="font-bold text-slate-800 dark:text-slate-200 truncate">
            {schoolSettings?.school_name || 'KSN School'}
          </span>
          <span className="text-xxs text-indigo-500 font-medium">
            ปีการศึกษา {schoolSettings?.academic_year || '2567'}
          </span>
        </div>
      </div>

      {/* Nav List */}
      <nav className="flex-1 space-y-1.5 px-4 py-6 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900/60 dark:hover:text-slate-200'
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-50 dark:bg-slate-900/40">
          <div className="h-8 w-8 rounded-full bg-slate-300 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 text-sm">
            ค
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">ครูสมปอง (แอดมิน)</span>
            <span className="text-3xs text-slate-400 dark:text-slate-500 uppercase tracking-wider">Administrator</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
