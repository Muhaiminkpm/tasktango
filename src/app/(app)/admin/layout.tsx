
import { Header } from '@/components/layout/header';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col">
        <Header title="Admin Dashboard" />
        {children}
    </div>
  );
}
