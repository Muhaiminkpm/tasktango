
'use client';

import { Suspense } from 'react';
import { DashboardClient } from './dashboard-client';
import { TaskListSkeleton } from '@/components/dashboard/task-list-skeleton';
import { TaskList } from '@/components/dashboard/task-list';

export default function DashboardPage() {
  return (
    <DashboardClient>
      <Suspense fallback={<TaskListSkeleton />}>
        <TaskList completed={false} />
      </Suspense>
    </DashboardClient>
  );
}
