'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { LogIn, Mail, Lock, AlertCircle, School } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message); // Show actual error from Supabase
      setLoading(false);
    } else {
      router.push('/');
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#f0f2ee]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-10"
      >
        <div className="text-center space-y-4">
          <div className="w-24 h-24 bg-[#55a060] rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl shadow-[#55a060]/30 border-4 border-white">
            <School size={48} className="text-white" />
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-black text-[#1a202c] tracking-tight">เข้าสู่ระบบ</h1>
            <p className="text-[#4a5568] font-bold text-lg">Classroom Attendance System</p>
          </div>
        </div>

        <div className="bg-white p-10 rounded-[3.5rem] border-2 border-[#d1d8e0] shadow-sm space-y-8">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-3">
              <label className="text-[12px] font-black uppercase tracking-[0.2em] text-[#718096] px-2 flex items-center gap-2">
                <Mail size={16} className="text-[#55a060]" /> อีเมลผู้ใช้งาน
              </label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="teacher@school.com"
                className="w-full p-6 bg-[#f7fafc] border-2 border-[#edf2f7] rounded-[2rem] focus:ring-4 focus:ring-[#55a060]/10 outline-none transition-all font-black text-lg"
              />
            </div>

            <div className="space-y-3">
              <label className="text-[12px] font-black uppercase tracking-[0.2em] text-[#718096] px-2 flex items-center gap-2">
                <Lock size={16} className="text-[#55a060]" /> รหัสผ่าน
              </label>
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-6 bg-[#f7fafc] border-2 border-[#edf2f7] rounded-[2rem] focus:ring-4 focus:ring-[#55a060]/10 outline-none transition-all font-black text-lg"
              />
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-4 bg-[#fff0f0] border-2 border-[#d63031]/10 rounded-2xl flex items-center gap-3 text-[#d63031] font-bold"
              >
                <AlertCircle size={20} />
                <span>{error}</span>
              </motion.div>
            )}

            <button
              disabled={loading}
              type="submit"
              className="w-full py-6 bg-[#55a060] text-white font-black text-2xl rounded-[2.5rem] shadow-xl shadow-[#55a060]/20 flex items-center justify-center gap-4 hover:bg-[#3d7a48] transition-all active:scale-95 disabled:opacity-50 border-2 border-white/20"
            >
              {loading ? (
                <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn size={28} />
                  เข้าสู่ระบบ
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-[#a0aec0] font-bold text-sm tracking-wide">
          หากลืมรหัสผ่าน กรุณาติดต่อฝ่าย IT ของโรงเรียน
        </p>
      </motion.div>
    </div>
  );
}
