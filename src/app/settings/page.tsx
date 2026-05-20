'use client';

import { motion } from 'framer-motion';
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  Moon, 
  Languages, 
  LogOut,
  ChevronRight
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const settingGroups = [
    {
      title: 'บัญชีผู้ใช้',
      items: [
        { icon: User, label: 'ข้อมูลส่วนตัว', value: 'โหมดครูผู้สอน' },
        { icon: Shield, label: 'ความปลอดภัยและรหัสผ่าน', value: '' },
      ]
    },
    {
      title: 'การตั้งค่าแอพ',
      items: [
        { icon: Bell, label: 'การแจ้งเตือน', value: 'เปิดใช้งาน' },
        { icon: Moon, label: 'โหมดมืด', value: 'ปิดการใช้งาน' },
        { icon: Languages, label: 'ภาษา', value: 'ภาษาไทย (TH)' },
      ]
    }
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-10 pb-28">
      <header className="space-y-2">
        <h1 className="text-3xl font-black tracking-tight text-[#2d3436]">
          การตั้งค่า
        </h1>
        <p className="text-[#636e72] font-bold">จัดการบัญชีและปรับแต่งการใช้งาน</p>
      </header>

      <div className="space-y-10">
        {settingGroups.map((group, gIndex) => (
          <section key={group.title} className="space-y-4">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-[#b2bec3] px-6">
              {group.title}
            </h2>
            <div className="bg-white rounded-[3rem] border border-[#f1f2f6] overflow-hidden shadow-sm">
              {group.items.map((item, iIndex) => (
                <button
                  key={item.label}
                  className="w-full flex items-center justify-between p-8 hover:bg-[#96ceb4]/5 transition-colors group"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 bg-[#fdfdfb] rounded-2xl flex items-center justify-center text-[#b2bec3] group-hover:text-[#96ceb4] transition-all">
                      <item.icon size={24} />
                    </div>
                    <div className="text-left">
                      <p className="font-black text-[#2d3436] text-lg">{item.label}</p>
                      {item.value && <p className="text-xs text-[#636e72] font-bold">{item.value}</p>}
                    </div>
                  </div>
                  <ChevronRight className="text-[#dfe6e9] group-hover:text-[#96ceb4] transition-all" size={24} />
                </button>
              ))}
            </div>
          </section>
        ))}

        <button
          onClick={handleLogout}
          className="w-full p-8 bg-[#fff0f0] border border-[#ff8b94]/20 rounded-[3rem] flex items-center justify-between group hover:bg-[#fff0f0]/80 transition-all shadow-sm"
        >
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 bg-[#ff8b94] rounded-2xl flex items-center justify-center text-white shadow-xl shadow-[#ff8b94]/30">
              <LogOut size={24} />
            </div>
            <p className="font-black text-[#ff8b94] text-xl">ออกจากระบบ</p>
          </div>
          <ChevronRight className="text-[#ff8b94]/30 group-hover:text-[#ff8b94] transition-all" size={24} />
        </button>
      </div>

      <div className="text-center pt-8">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#dfe6e9]">
          เวอร์ชัน 1.0.0 (บิลด์ 20240428)
        </p>
      </div>
    </div>
  );
}
