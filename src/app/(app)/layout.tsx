import { Sidebar } from '@/components/layout/sidebar';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen w-full lg:grid-cols-[256px_1fr]">
        <Sidebar />
        <div className="flex flex-col">
            {children}
        </div>
    </div>
  );
}
