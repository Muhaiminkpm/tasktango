'use client';

import { AdminDashboardClient } from '../admin-dashboard-client';
import { Suspense } from 'react';

// A simple wrapper for the client component to allow for suspense features like useSearchParams
function AdminDashboardPage() {
  return <AdminDashboardClient />;
}

export default function SuspenseWrapper() {
    return (
        <Suspense fallback={<div className="flex h-full w-full items-center justify-center"><p>Loading Dashboard...</p></div>}>
            <AdminDashboardPage />
        </Suspense>
    )
}
