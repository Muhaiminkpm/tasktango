
'use client';

import { Suspense } from 'react';
import { CompletedTasksClient } from './completed-tasks-client';
import { TaskListSkeleton } from '@/components/dashboard/task-list-skeleton';
import { TaskList } from '@/components/dashboard/task-list';

export default function CompletedPage() {
  return (
    <CompletedTasksClient>
      <Suspense fallback={<TaskListSkeleton />}>
        <TaskList completed={true} />
      </Suspense>
    </CompletedTasksClient>
  );
}
