'use client';

import React, { useState, useEffect } from 'react';
import { 
  School, 
  Plus, 
  Trash2, 
  Search, 
  X,
  Users
} from 'lucide-react';
import { getClassrooms, createClassroom, deleteClassroom } from '@/lib/db';
import { Classroom } from '@/types';
import toast from 'react-hot-toast';

export default function ClassroomsPage() {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [roomName, setRoomName] = useState('');
  const [roomLevel, setRoomLevel] = useState('ม.1');

  const fetchClassrooms = async () => {
    setLoading(true);
    try {
      const data = await getClassrooms();
      setClassrooms(data);
    } catch {
      toast.error('ไม่สามารถโหลดข้อมูลห้องเรียนได้');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchClassrooms(); }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`ลบห้องเรียน "${name}" ออกจากระบบ?\nนักเรียนในห้องนี้จะถูกยกเลิกการกำหนดห้องเรียน`)) return;
    try {
      await deleteClassroom(id);
      setClassrooms(prev => prev.filter(c => c.id !== id));
      toast.success(`ลบห้อง ${name} สำเร็จ`);
    } catch (e: any) {
      toast.error('ลบไม่สำเร็จ: ' + e.message);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName.trim()) { toast.error('กรุณากรอกชื่อห้องเรียน'); return; }
    setSubmitting(true);
    try {
      await createClassroom({ name: roomName.trim(), level: roomLevel });
      await fetchClassrooms();
      toast.success(`เพิ่มห้อง ${roomName} สำเร็จ!`);
      setIsModalOpen(false);
      setRoomName('');
    } catch (e: any) {
      toast.error('ชื่อห้องเรียนซ้ำ หรือข้อมูลผิดพลาด');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = classrooms.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.level.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const levelGroups = ['ป.1','ป.2','ป.3','ป.4','ป.5','ป.6','ม.1','ม.2','ม.3','ม.4','ม.5','ม.6'];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <School className="h-4.5 w-4.5 text-blue-600" />
              <span className="text-xs font-bold text-blue-600 tracking-wide uppercase">Classroom Management</span>
            </div>
            <h2 className="text-xl font-bold text-slate-800">จัดการห้องเรียน</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              เพิ่ม แก้ไข และลบห้องเรียน เพื่อใช้กำหนดนักเรียนและตารางสอน
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="self-start md:self-auto flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-4 py-2.5 rounded-xl shadow-sm shadow-blue-500/20 transition-colors active:scale-95"
          >
            <Plus className="h-4 w-4" />
            เพิ่มห้องเรียนใหม่
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
        <div className="relative">
          <input
            type="text"
            placeholder="ค้นหาห้องเรียน เช่น ม.1/1, ป.4..."
            className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <Search className="absolute left-3.5 top-3 h-4.5 w-4.5 text-slate-400" />
        </div>
      </div>

      {/* Classrooms Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="h-8 w-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-slate-400">กำลังโหลด...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
              <div className="h-14 w-14 rounded-2xl bg-blue-50 flex items-center justify-center">
                <School className="h-7 w-7 text-blue-400" />
              </div>
              <div>
                <p className="font-semibold text-slate-700">ยังไม่มีห้องเรียนในระบบ</p>
                <p className="text-sm text-slate-400 mt-0.5">กดปุ่ม "เพิ่มห้องเรียนใหม่" เพื่อเริ่มต้น</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {filtered.map(room => (
                <div
                  key={room.id}
                  className="group relative flex flex-col gap-3 p-4 rounded-xl border border-slate-200 hover:border-blue-200 hover:bg-blue-50/40 transition-all duration-150"
                >
                  {/* Room Icon + Name */}
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                      <School className="h-5 w-5 text-blue-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-800 leading-tight">{room.name}</p>
                      <p className="text-xs text-slate-400 mt-0.5">ระดับชั้น {room.level}</p>
                    </div>
                  </div>

                  {/* Student count */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Users className="h-3.5 w-3.5 text-slate-400" />
                      <span>{room.student_count ?? 0} คน</span>
                    </div>
                    <button
                      onClick={() => handleDelete(room.id, room.name)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ================================================ */}
      {/* MODAL: เพิ่มห้องเรียน */}
      {/* ================================================ */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800">เพิ่มห้องเรียนใหม่</h3>
              <button
                onClick={() => { setIsModalOpen(false); setRoomName(''); }}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAdd} className="p-5 space-y-4">
              {/* Level */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600">ระดับชั้น</label>
                <select
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={roomLevel}
                  onChange={e => setRoomLevel(e.target.value)}
                >
                  {levelGroups.map(l => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>

              {/* Room Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600">ชื่อห้องเรียน *</label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="เช่น ม.1/1, ป.4/2"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={roomName}
                  onChange={e => setRoomName(e.target.value)}
                />
                <p className="text-xs text-slate-400">ชื่อห้องจะต้องไม่ซ้ำกับที่มีอยู่ในระบบ</p>
              </div>

              {/* Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => { setIsModalOpen(false); setRoomName(''); }}
                  className="px-4 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-50 rounded-xl transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-sm transition-colors disabled:opacity-60"
                >
                  {submitting ? 'กำลังบันทึก...' : 'บันทึกห้องเรียน'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
