'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Calendar, Users, BarChart2, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', icon: Home, label: 'หน้าแรก' },
  { href: '/schedule', icon: Calendar, label: 'ตารางสอน' },
  { href: '/students', icon: Users, label: 'นักเรียน' },
  { href: '/analytics', icon: BarChart2, label: 'รายงาน' },
  { href: '/settings', icon: Settings, label: 'ตั้งค่า' },
];

export function Navbar() {
  const pathname = usePathname();

  // Hide Navbar when on attendance taking page to prioritize the Save button
  if (pathname.startsWith('/attendance/') && pathname.split('/').length === 3) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/98 backdrop-blur-2xl border-t-2 border-[#edf2f7] md:relative md:border-t-0 md:border-b-2">
      <div className="container mx-auto px-4">
        <div className="flex justify-around items-center h-24 md:h-28">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center space-y-1.5 relative px-5 py-2 transition-all duration-300",
                  isActive ? "text-[#55a060] scale-110" : "text-[#718096] hover:text-[#55a060]"
                )}
              >
                <div className={cn(
                  "p-3 rounded-2xl transition-all duration-300 border-2",
                  isActive ? "bg-[#55a060]/10 border-[#55a060]/20" : "bg-transparent border-transparent"
                )}>
                  <item.icon size={28} strokeWidth={isActive ? 3 : 2} />
                </div>
                <span className={cn(
                  "text-[12px] font-black tracking-tight",
                  isActive ? "opacity-100" : "opacity-80"
                )}>{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute -top-1 w-16 h-2 bg-[#55a060] rounded-full hidden md:block"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
