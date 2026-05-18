'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import MobileNav from '@/components/layout/MobileNav';
import { getSchoolSettings } from '@/lib/db';
import { SchoolSettings } from '@/types';

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [settings, setSettings] = useState<SchoolSettings | null>(null);

  const fetchSettings = async () => {
    try {
      const data = await getSchoolSettings();
      setSettings(data);
    } catch (error) {
      console.error('Failed to load settings in layout:', error);
    }
  };

  useEffect(() => {
    fetchSettings();
    // Setup a listener for settings changes
    window.addEventListener('ksn-settings-updated', fetchSettings);
    return () => {
      window.removeEventListener('ksn-settings-updated', fetchSettings);
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070b13] transition-colors duration-300">
      {/* Sidebar for Desktop */}
      <Sidebar schoolSettings={settings} />

      {/* Topbar for Dashboard */}
      <Topbar />

      {/* Main Content Area */}
      <main className="pt-16 pb-24 md:pb-6 md:pl-64 min-h-screen transition-all duration-300">
        <div className="p-4 sm:p-6 max-w-7xl mx-auto animate-fade-in">
          {children}
        </div>
      </main>

      {/* Ergonomic Floating Navigation for Smart Phones */}
      <MobileNav />
    </div>
  );
}
