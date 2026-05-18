import * as XLSX from 'xlsx';
import { createStudent, getClassrooms, createClassroom } from '../db';

export const importStudentsFromXlsx = async (file: File): Promise<{ successCount: number; errors: string[] }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Parse rows to JSON objects
        const rawJson: any[] = XLSX.utils.sheet_to_json(worksheet);
        
        const classrooms = await getClassrooms();
        let successCount = 0;
        const errors: string[] = [];
        
        for (let i = 0; i < rawJson.length; i++) {
          const row = rawJson[i];
          const studentCode = row['รหัสนักเรียน'] || row['รหัสประจำตัว'] || row['student_code'];
          const firstName = row['ชื่อ'] || row['first_name'];
          const lastName = row['นามสกุล'] || row['last_name'];
          const prefix = row['คำนำหน้า'] || row['prefix'] || null;
          const classroomName = row['ห้องเรียน'] || row['ห้อง'] || row['classroom'];
          
          if (!studentCode || !firstName || !lastName) {
            errors.push(`แถวที่ ${i + 2}: ข้อมูลจำเป็น (รหัส, ชื่อ, นามสกุล) ไม่ครบถ้วน`);
            continue;
          }
          
          // Find or dynamically create classroom
          let classroomId = null;
          if (classroomName) {
            const trimmedRoom = String(classroomName).trim();
            let matchedRoom = classrooms.find(c => c.name.toLowerCase() === trimmedRoom.toLowerCase());
            if (!matchedRoom) {
              const level = trimmedRoom.split('/')[0] || trimmedRoom;
              matchedRoom = await createClassroom({ name: trimmedRoom, level });
              classrooms.push(matchedRoom); // Update cached lookup
            }
            classroomId = matchedRoom.id;
          }
          
          // Parse Gender
          let gender: 'male' | 'female' | null = null;
          const rawGender = String(row['เพศ'] || '').trim();
          if (rawGender.includes('ชาย') || rawGender.toLowerCase() === 'male' || rawGender.toLowerCase() === 'm') {
            gender = 'male';
          } else if (rawGender.includes('หญิง') || rawGender.toLowerCase() === 'female' || rawGender.toLowerCase() === 'f') {
            gender = 'female';
          }
          
          try {
            await createStudent({
              student_code: String(studentCode).trim(),
              prefix: prefix ? String(prefix).trim() : null,
              first_name: String(firstName).trim(),
              last_name: String(lastName).trim(),
              classroom_id: classroomId,
              gender,
              birth_date: row['วันเกิด'] ? String(row['วันเกิด']).trim() : null,
              phone: row['เบอร์โทร'] || row['เบอร์โทรศัพท์'] ? String(row['เบอร์โทร'] || row['เบอร์โทรศัพท์']).trim() : null,
              parent_name: row['ผู้ปกครอง'] || row['ชื่อผู้ปกครอง'] ? String(row['ผู้ปกครอง'] || row['ชื่อผู้ปกครอง']).trim() : null,
              parent_phone: row['เบอร์โทรผู้ปกครอง'] ? String(row['เบอร์โทรผู้ปกครอง']).trim() : null,
              photo_url: null,
              is_active: true
            });
            successCount++;
          } catch (err: any) {
            errors.push(`แถวที่ ${i + 2}: ไม่สามารถบันทึกลงฐานข้อมูลได้ (รหัสซ้ำ หรือข้อมูลผิดประเภท)`);
          }
        }
        
        resolve({ successCount, errors });
      } catch (err: any) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
};
export const getXlsxTemplateBlob = () => {
  const ws = XLSX.utils.json_to_sheet([
    {
      'รหัสนักเรียน': '10001',
      'คำนำหน้า': 'เด็กชาย',
      'ชื่อ': 'สมหมาย',
      'นามสกุล': 'ใจดี',
      'ห้องเรียน': 'ม.1/1',
      'เพศ': 'ชาย',
      'วันเกิด': '2013-05-20',
      'เบอร์โทรศัพท์': '0812345678',
      'ชื่อผู้ปกครอง': 'นายวิชัย ใจดี',
      'เบอร์โทรผู้ปกครอง': '0812345678'
    }
  ]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Template');
  return XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
};
export const downloadXlsxTemplate = () => {
  const data = getXlsxTemplateBlob();
  const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'ksn_student_template.xlsx';
  a.click();
  URL.revokeObjectURL(url);
};
