
'use client';

import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { TaskDialog } from '@/components/dashboard/task-dialog';
import { useState } from 'react';
import { TaskFilters } from '@/components/dashboard/task-filters';

export function DashboardClient({ children }: { children: React.ReactNode }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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
        {children}
      </main>
      <TaskDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </>
  );
}
