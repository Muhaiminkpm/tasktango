
import { Header } from '@/components/layout/header';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col">
        <Header title="Admin Dashboard" />
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
            {children}
        </main>
    </div>
  );
}
