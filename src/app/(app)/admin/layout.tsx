
'use client';

import { ReactNode, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { AdminHeaderFilters } from '@/components/admin/admin-header-filters';
import { FilterValue } from '@/app/(app)/admin/admin-dashboard-client';

function AdminLayoutContent({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams();
  const filter = (searchParams.get('filter') as FilterValue) || 'today';

  // Pass the filter down to the children (AdminDashboardClient)
  const childrenWithProps = React.cloneElement(children as React.ReactElement, { filter });

  return (
    <div className="flex flex-col h-screen">
      <Header title="Admin Dashboard">
        <AdminHeaderFilters initialFilter={filter} />
      </Header>
      <main className="flex-1 overflow-y-auto bg-background">
        {childrenWithProps}
      </main>
    </div>
  );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
    return (
        <Suspense fallback={<div className="flex h-screen w-full items-center justify-center"><p>Loading...</p></div>}>
            <AdminLayoutContent>{children}</AdminLayoutContent>
        </Suspense>
    )
}
