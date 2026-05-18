'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Users, 
  BarChart3, 
  Settings
} from 'lucide-react';

export default function MobileNav() {
  const pathname = usePathname();

  const navItems = [
    { name: 'แดชบอร์ด', href: '/dashboard', icon: LayoutDashboard },
    { name: 'เช็คชื่อ', href: '/dashboard/attendance', icon: CheckSquare },
    { name: 'นักเรียน', href: '/dashboard/students', icon: Users },
    { name: 'รายงาน', href: '/dashboard/reports', icon: BarChart3 },
    { name: 'ตั้งค่า', href: '/dashboard/settings', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-4 left-4 right-4 h-16 md:hidden glass-panel rounded-2xl flex items-center justify-around px-2 shadow-xl shadow-slate-900/10 border border-slate-200/50 dark:border-slate-800/50 z-40">
      {navItems.map((item) => {
        const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all duration-200 relative group -webkit-tap-highlight-color-transparent"
          >
            {/* Active background glow */}
            {isActive && (
              <span className="absolute inset-0 bg-indigo-500/10 dark:bg-indigo-400/10 rounded-xl animate-fade-in" />
            )}
            
            {/* Icon */}
            <Icon 
              className={`h-5 w-5 transition-transform duration-200 group-active:scale-90 ${
                isActive 
                  ? 'text-indigo-500 dark:text-indigo-400 scale-110' 
                  : 'text-slate-500 dark:text-slate-400'
              }`} 
            />

            {/* Label */}
            <span 
              className={`text-4xs mt-1 font-semibold transition-colors duration-200 ${
                isActive 
                  ? 'text-indigo-500 dark:text-indigo-400 font-bold' 
                  : 'text-slate-400 dark:text-slate-500'
              }`}
            >
              {item.name}
            </span>

            {/* Active Indicator Dot */}
            {isActive && (
              <span className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
