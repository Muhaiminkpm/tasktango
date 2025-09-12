
'use client';

import { useState } from 'react';
import { UserTaskList } from './user-task-list';
import type { Task } from '@/lib/types';
import { Header } from '@/components/layout/header';
import { AdminTaskCard } from '@/components/admin/admin-task-card';

export type SelectedUserData = {
  identifier: string;
  tasks: Task[];
} | null;


export function AdminDashboardClient({ children }: { children: React.ReactNode }) {
  const [selectedUser, setSelectedUser] = useState<SelectedUserData>(null);

  const getDisplayName = (identifier: string) => {
    if (!identifier) return 'All Users';
    if (identifier.includes('@')) {
      return identifier.split('@')[0];
    }
    return identifier;
  };
  
  const taskCount = selectedUser?.tasks.length ?? 0;
  const title = getDisplayName(selectedUser?.identifier || '');

  return (
    <div className="grid min-h-[calc(100vh-4rem)] w-full lg:grid-cols-[300px_1fr]">
      <UserTaskList onUserSelect={setSelectedUser} selectedIdentifier={selectedUser?.identifier} />
      <div className="flex flex-col">
        <Header title="Admin Dashboard">
            {selectedUser && <span className="text-lg font-medium text-muted-foreground">{title}</span>}
        </Header>
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
            {selectedUser ? (
                <>
                <p className="text-muted-foreground">{taskCount} {taskCount === 1 ? 'task' : 'tasks'} found</p>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {selectedUser.tasks.map(task => (
                        <AdminTaskCard key={task.id} task={task} />
                    ))}
                </div>
                </>
            ) : (
                <div className="flex h-full items-center justify-center rounded-lg border border-dashed shadow-sm">
                    <div className="text-center">
                        <h2 className="text-xl font-semibold">Select a user</h2>
                        <p className="text-muted-foreground">Choose a user from the sidebar to view their tasks.</p>
                    </div>
                </div>
            )}
        </main>
      </div>
    </div>
  );
}
