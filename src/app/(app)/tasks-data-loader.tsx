import { getTasks } from '@/lib/actions/tasks';
import type { Priority } from '@/lib/types';
import { TaskList } from '@/components/dashboard/task-list';

export async function TasksDataLoader({
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
