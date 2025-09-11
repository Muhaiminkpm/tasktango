
import type { Priority } from '@/lib/types';
import { Suspense } from 'react';
import { TasksDataLoader } from './completed-tasks-data-loader';
import { CompletedTasksClient } from './completed-tasks-client';
import { TaskListSkeleton } from '@/components/dashboard/task-list-skeleton';

export default function CompletedPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const priorityFilter = (searchParams?.priority as Priority) || 'all';

  return (
    <CompletedTasksClient>
      <Suspense fallback={<TaskListSkeleton />}>
        <TasksDataLoader completed={true} priorityFilter={priorityFilter} />
      </Suspense>
    </CompletedTasksClient>
  );
}
