
'use client';

import { Header } from '@/components/layout/header';
import { TaskFilters } from '@/components/dashboard/task-filters';

export function CompletedTasksClient({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header title="Completed Tasks">
        <TaskFilters />
      </Header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
        {children}
      </main>
    </>
  );
}
