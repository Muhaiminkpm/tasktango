
import type { Priority } from '@/lib/types';
import { Suspense } from 'react';
import { TasksDataLoader } from './tasks-data-loader';
import { DashboardClient } from './dashboard-client';
import { TaskListSkeleton } from '@/components/dashboard/task-list-skeleton';

export default function DashboardPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const priorityFilter = (searchParams?.priority as Priority) || 'all';

  return (
    <DashboardClient>
      <Suspense fallback={<TaskListSkeleton />}>
        <TasksDataLoader completed={false} priorityFilter={priorityFilter} />
      </Suspense>
    </DashboardClient>
  );
}
