'use client';

import { Suspense } from 'react';
import { AdminDashboardClient } from './admin-dashboard-client';
import { UserTaskList } from './user-task-list';

export default function AdminPage() {
  return (
    <AdminDashboardClient>
      <Suspense fallback={<div>Loading all tasks...</div>}>
        <UserTaskList />
      </Suspense>
    </AdminDashboardClient>
  );
}
