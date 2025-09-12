
import { Header } from '@/components/layout/header';

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen">
        <Header title="Admin Dashboard" />
        <div className="flex-1 overflow-hidden">
            {children}
        </div>
    </div>
  );
}
