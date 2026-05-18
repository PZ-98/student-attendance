'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Users, 
  BarChart3, 
  Settings,
  School
} from 'lucide-react';

export default function MobileNav() {
  const pathname = usePathname();

  const navItems = [
    { name: 'แดชบอร์ด',   href: '/dashboard',             icon: LayoutDashboard },
    { name: 'เช็คชื่อ',   href: '/dashboard/attendance',  icon: CheckSquare },
    { name: 'ห้องเรียน', href: '/dashboard/classrooms',  icon: School },
    { name: 'นักเรียน',   href: '/dashboard/students',    icon: Users },
    { name: 'ตั้งค่า',    href: '/dashboard/settings',    icon: Settings },
  ];

  return (
    <nav className="mobile-nav fixed bottom-3 left-3 right-3 h-16 md:hidden rounded-2xl flex items-center justify-around px-2 z-40">
      {navItems.map((item) => {
        const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            prefetch={true}
            className="flex flex-col items-center justify-center w-14 h-12 rounded-xl transition-all duration-150 relative group"
          >
            {/* Active highlight */}
            {isActive && (
              <span className="absolute inset-0 bg-blue-50 rounded-xl" />
            )}
            
            <Icon 
              className={`relative h-5 w-5 transition-transform duration-150 group-active:scale-90 ${
                isActive ? 'text-blue-600 scale-105' : 'text-slate-400'
              }`} 
            />
            <span 
              className={`relative mt-0.5 font-semibold transition-colors duration-150 ${
                isActive ? 'text-blue-600 font-bold' : 'text-slate-400'
              }`}
              style={{fontSize:'0.6rem'}}
            >
              {item.name}
            </span>

            {/* Active dot */}
            {isActive && (
              <span className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-blue-500" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
