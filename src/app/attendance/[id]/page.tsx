import AttendanceClient from './AttendanceClient';

export function generateStaticParams() {
  return [{ id: 'mock-class-id' }];
}

export default function Page() {
  return <AttendanceClient />;
}
