export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-full">
        {children}
    </div>
  );
}
