
'use client';

import { AdminDashboardClient } from './admin-dashboard-client';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminDashboardClient>
      {children}
    </AdminDashboardClient>
  );
}
