import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import './globals.css';

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: 'ระบบเช็คชื่อนักเรียน KSN Attendance System',
  description: 'ระบบลงเวลาและเช็คชื่อนักเรียนผ่านเว็บแอปพลิเคชัน สำหรับโรงเรียนและสถาบันการศึกษา',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className="light">
      <body className="antialiased selection:bg-indigo-500 selection:text-white">
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        {children}
      </body>
    </html>
  );
}
