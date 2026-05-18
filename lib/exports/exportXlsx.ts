import * as XLSX from 'xlsx';
import { Student } from '@/types';

export const exportStudentsToXlsx = (students: Student[], filename = 'student_list.xlsx') => {
  const rows = students.map((s, idx) => ({
    'ลำดับ': idx + 1,
    'รหัสนักเรียน': s.student_code,
    'คำนำหน้า': s.prefix || '',
    'ชื่อ': s.first_name,
    'นามสกุล': s.last_name,
    'ห้องเรียน': s.classroom?.name || '',
    'เพศ': s.gender === 'male' ? 'ชาย' : s.gender === 'female' ? 'หญิง' : '',
    'เบอร์โทรศัพท์': s.phone || '',
    'ชื่อผู้ปกครอง': s.parent_name || '',
    'เบอร์โทรผู้ปกครอง': s.parent_phone || ''
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'รายชื่อนักเรียน');

  // Define column widths
  worksheet['!cols'] = [
    { wch: 6 },   // ลำดับ
    { wch: 15 },  // รหัสประจำตัว
    { wch: 10 },  // คำนำหน้า
    { wch: 18 },  // ชื่อ
    { wch: 18 },  // นามสกุล
    { wch: 12 },  // ห้อง
    { wch: 8 },   // เพศ
    { wch: 15 },  // เบอร์โทร
    { wch: 20 },  // ผู้ปกครอง
    { wch: 15 }   // เบอร์โทรผู้ปกครอง
  ];

  XLSX.writeFile(workbook, filename);
};
