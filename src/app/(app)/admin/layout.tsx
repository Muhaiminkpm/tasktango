
'use client';

import { useState } from 'react';
import { UserTaskList } from './user-task-list';
import { Task } from '@/lib/types';

export type SelectedUserData = {
  identifier: string;
  tasks: Task[];
} | null;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [selectedUser, setSelectedUser] = useState<SelectedUserData>(null);

  return (
    <div className="grid min-h-[calc(100vh-4rem)] w-full lg:grid-cols-[300px_1fr]">
      <UserTaskList onUserSelect={setSelectedUser} selectedIdentifier={selectedUser?.identifier} />
      <div className="flex flex-col">
        {children({ selectedUser })}
      </div>
    </div>
  );
}
