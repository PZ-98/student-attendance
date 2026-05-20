import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Classroom Attendance & Management",
  description: "Modern attendance system for schools",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="min-h-screen flex flex-col bg-[#f0f2ee]">
          {/* Add large padding bottom to clear the fixed Navbar on mobile */}
          <main className="flex-grow container mx-auto px-4 pt-8 pb-40 md:pb-32">
            {children}
          </main>
          <Navbar />
        </div>
      </body>
    </html>
  );
}
