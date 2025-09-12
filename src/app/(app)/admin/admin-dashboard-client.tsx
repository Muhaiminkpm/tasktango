
'use client';

import { Header } from '@/components/layout/header';
import type { SelectedUserData } from './layout';

export function AdminDashboardClient({ selectedUser }: { selectedUser: SelectedUserData }) {

  const getDisplayName = (identifier: string) => {
    if (!identifier) return 'All Users';
    if (identifier.includes('@')) {
      return identifier.split('@')[0];
    }
    return identifier;
  };
  
  const taskCount = selectedUser?.tasks.length ?? 0;
  const title = getDisplayName(selectedUser?.identifier || '');
  const subTitle = `(${taskCount} ${taskCount === 1 ? 'task' : 'tasks'})`;

  return (
    <>
      <Header title="Admin Dashboard">
         {selectedUser && <span className="text-sm text-muted-foreground">{title} {subTitle}</span>}
      </Header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
        {selectedUser ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {selectedUser.tasks.map(task => (
                    <AdminTaskCard key={task.id} task={task} />
                ))}
            </div>
        ) : (
            <div className="flex h-full items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-semibold">Select a user</h2>
                    <p className="text-muted-foreground">Choose a user from the sidebar to view their tasks.</p>
                </div>
            </div>
        )}
      </main>
    </>
  );
}
