
'use client';

import { Suspense } from 'react';
import { DashboardClient } from './dashboard-client';
import { KanbanBoard } from '@/components/dashboard/kanban-board';

export default function DashboardPage() {
  return (
    <DashboardClient>
      <Suspense fallback={<div>Loading...</div>}>
        <KanbanBoard />
      </Suspense>
    </DashboardClient>
  );
}
