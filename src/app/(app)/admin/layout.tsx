
'use client';

import React, { ReactNode, useState } from 'react';
import { Header } from '@/components/layout/header';
import { AdminHeaderFilters } from '@/components/admin/admin-header-filters';
import { FilterValue } from '@/app/(app)/admin/admin-dashboard-client';

function AdminLayoutContent({ children }: { children: ReactNode }) {
  const [filter, setFilter] = useState<FilterValue>('today');

  // Pass the filter down to the children (AdminDashboardClient)
  const childrenWithProps = React.cloneElement(children as React.ReactElement, { filter });

  return (
    <div className="flex flex-col h-screen">
      <Header>
        <AdminHeaderFilters filter={filter} onFilterChange={setFilter} />
      </Header>
      <main className="flex-1 overflow-y-auto bg-background">
        {childrenWithProps}
      </main>
    </div>
  );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
    return <AdminLayoutContent>{children}</AdminLayoutContent>
}
