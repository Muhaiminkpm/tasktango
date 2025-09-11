'use client';

import { Header } from '@/components/layout/header';
import { getTasks } from '@/lib/actions/tasks';
import { Priority } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { TaskDialog } from '@/components/dashboard/task-dialog';
import { Suspense, useState } from 'react';
import { TaskFilters } from '@/components/dashboard/task-filters';
import { TaskList } from '@/components/dashboard/task-list';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage({
  searchParams,
}: {
  searchParams: { priority: Priority | 'all' };
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const priorityFilter = searchParams.priority || 'all';

  return (
    <>
      <Header title="Dashboard">
        <div className='hidden md:block'>
            <TaskFilters />
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Task
        </Button>
      </Header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
        <div className='block md:hidden'>
            <TaskFilters />
        </div>
        <Suspense fallback={<TaskListSkeleton />}>
            <TasksDataLoader completed={false} priorityFilter={priorityFilter} />
        </Suspense>
      </main>
      <TaskDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </>
  );
}

async function TasksDataLoader({
  completed,
  priorityFilter,
}: {
  completed: boolean;
  priorityFilter: Priority | 'all';
}) {
  const tasks = await getTasks(completed, priorityFilter);
  return (
    <TaskList
      tasks={tasks}
      emptyTitle="No active tasks"
      emptyDescription="You're all caught up! Create a new task to get started."
    />
  );
}

function TaskListSkeleton() {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
                <CardSkeleton key={i} />
            ))}
        </div>
    );
}

function CardSkeleton() {
    return (
        <div className="p-4 border rounded-lg space-y-4">
            <div className='flex items-start gap-4'>
                <Skeleton className="h-5 w-5 rounded-sm mt-1" />
                <div className='flex-1 space-y-2'>
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                </div>
            </div>
            <div className='flex items-center gap-4'>
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-5 w-24" />
            </div>
        </div>
    )
}
