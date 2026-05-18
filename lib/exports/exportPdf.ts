import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Student, AttendanceRecord, SchoolSettings } from '@/types';
import toast from 'react-hot-toast';

// Google Fonts CDN link for Sarabun-Regular
const THAI_FONT_URL = 'https://fonts.gstatic.com/s/sarabun/v14/DtVkJxTe2W470znsUPzyZg.ttf';

const fetchFontAsBase64 = async (url: string): Promise<string> => {
  const res = await fetch(url);
  const blob = await res.blob();
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64data = reader.result as string;
      const base64 = base64data.split(',')[1];
      resolve(base64);
    };
    reader.readAsDataURL(blob);
  });
};

export const exportAttendanceToPdf = async (
  classroomName: string,
  subjectName: string,
  date: string,
  students: Student[],
  attendanceState: Record<string, string>,
  attendanceNotes: Record<string, string>,
  schoolSettings: SchoolSettings | null
) => {
  const loadToast = toast.loading('กำลังสร้างไฟล์ PDF และแปลงฟอนต์ภาษาไทย...');

  try {
    // 1. Fetch Thai Font
    const fontBase64 = await fetchFontAsBase64(THAI_FONT_URL);
    
    // 2. Initialize jsPDF
    const doc = new jsPDF() as any;
    
    // 3. Register Font
    doc.addFileToVFS('Sarabun-Regular.ttf', fontBase64);
    doc.addFont('Sarabun-Regular.ttf', 'Sarabun', 'normal');
    doc.setFont('Sarabun');

    // 4. Draw Header Design
    const schoolName = schoolSettings?.school_name || 'โรงเรียนสาธิตวิทยาคม KSN';
    const acadYear = schoolSettings?.academic_year || '2567';
    
    doc.setFontSize(18);
    doc.setTextColor(15, 23, 42); // deep slate
    doc.text(schoolName, 105, 20, { align: 'center' });

    doc.setFontSize(12);
    doc.setTextColor(100, 116, 139); // cool gray
    doc.text(`รายงานการเข้าเรียน - ปีการศึกษา ${acadYear}`, 105, 27, { align: 'center' });

    // Classroom details
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text(`ห้องเรียน: ${classroomName}`, 20, 38);
    doc.text(`วิชา: ${subjectName}`, 90, 38);
    doc.text(`วันที่เช็คชื่อ: ${date}`, 155, 38);

    // Draw thin separator line
    doc.setDrawColor(226, 232, 240);
    doc.line(20, 43, 190, 43);

    // 5. Prepare Table Data
    const tableHeaders = ['ลำดับ', 'รหัสนักเรียน', 'ชื่อ-นามสกุล', 'สถานะการเช็คชื่อ', 'หมายเหตุ'];
    
    const tableRows = students.map((s, idx) => {
      const status = attendanceState[s.id];
      let statusTh = 'ยังไม่ได้เช็ค';
      if (status === 'present') statusTh = 'มาเรียน';
      if (status === 'absent') statusTh = 'ขาดเรียน';
      if (status === 'late') statusTh = 'สาย';
      if (status === 'leave') statusTh = 'ลา';
      if (status === 'sick') statusTh = 'ป่วย';

      return [
        idx + 1,
        s.student_code,
        `${s.prefix || ''}${s.first_name} ${s.last_name}`,
        statusTh,
        attendanceNotes[s.id] || '-'
      ];
    });

    // 6. Draw Table using jsPDF autoTable
    doc.autoTable({
      head: [tableHeaders],
      body: tableRows,
      startY: 47,
      margin: { left: 20, right: 20 },
      styles: {
        font: 'Sarabun',
        fontSize: 9,
        cellPadding: 3
      },
      headStyles: {
        fillColor: [79, 70, 229], // Indigo primary
        textColor: [255, 255, 255],
        fontStyle: 'normal'
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      }
    });

    // 7. Draw Footer (Page numbers, timestamps)
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(156, 163, 175);
      doc.text(`สร้างโดยระบบเช็คชื่อ KSN Attendance System | หน้า ${i} จาก ${pageCount}`, 105, 285, { align: 'center' });
    }

    // 8. Save PDF
    doc.save(`Attendance_${classroomName}_${date}.pdf`);
    
    toast.dismiss(loadToast);
    toast.success('สร้างรายงาน PDF สำเร็จ!');
  } catch (error: any) {
    console.error('PDF generation error:', error);
    toast.dismiss(loadToast);
    toast.error('ไม่สามารถส่งออก PDF ได้: ' + error.message);
  }
};
