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
  GraduationCap,
  School
} from 'lucide-react';
import { SchoolSettings } from '@/types';

interface SidebarProps {
  schoolSettings: SchoolSettings | null;
}

export default function Sidebar({ schoolSettings }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { name: 'แดชบอร์ด',             href: '/dashboard',             icon: LayoutDashboard },
    { name: 'เช็คชื่อเข้าเรียน',      href: '/dashboard/attendance',  icon: CheckSquare },
    { name: 'ห้องเรียน',              href: '/dashboard/classrooms',  icon: School },
    { name: 'ข้อมูลนักเรียน',          href: '/dashboard/students',    icon: Users },
    { name: 'วิชาเรียน',              href: '/dashboard/subjects',    icon: BookOpen },
    { name: 'ตารางสอน / คาบเรียน',  href: '/dashboard/sessions',    icon: Calendar },
    { name: 'รายงานการเข้าเรียน',     href: '/dashboard/reports',     icon: BarChart3 },
    { name: 'ตั้งค่าระบบ',            href: '/dashboard/settings',    icon: Settings },
  ];

  return (
    <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-slate-200 bg-white md:flex z-30 shadow-sm">
      {/* Brand Header */}
      <div className="flex h-16 items-center px-5 border-b border-slate-100 gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/25 shrink-0">
          <GraduationCap className="h-5 w-5" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="font-bold text-slate-800 text-sm leading-tight truncate">
            {schoolSettings?.school_name || 'KSN School'}
          </span>
          <span className="text-xs text-blue-600 font-medium mt-0.5">
            ปีการศึกษา {schoolSettings?.academic_year || '2567'}
          </span>
        </div>
      </div>

      {/* Nav List */}
      <nav className="flex-1 space-y-0.5 px-3 py-4 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={true}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {/* Active left bar */}
              {isActive && (
                <span className="absolute left-3 w-1 h-5 rounded-full bg-blue-600" />
              )}
              <Icon className={`h-4.5 w-4.5 shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-100">
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-slate-50 cursor-pointer">
          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700 text-sm shrink-0">
            ค
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-semibold text-slate-700 truncate">ครูสมปอง (แอดมิน)</span>
            <span className="text-xs text-slate-400 uppercase tracking-wider" style={{fontSize:'0.6rem'}}>Administrator</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
