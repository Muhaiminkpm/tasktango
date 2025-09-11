'use client';

import { Task } from '@/lib/types';
import { useCallback, useEffect, useState } from 'react';
import { TaskCard } from './task-card';
import { TaskDialog } from './task-dialog';
import { EmptyState } from './empty-state';
import { Button } from '../ui/button';
import { Plus } from 'lucide-react';
import { useAuth } from '@/app/providers';
import { getTasks } from '@/lib/actions/tasks';
import { useSearchParams } from 'next/navigation';
import type { Priority } from '@/lib/types';
import { TaskListSkeleton } from './task-list-skeleton';

type TaskListProps = {
  completed: boolean;
};

export function TaskList({ completed }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const { user } = useAuth();
  const searchParams = useSearchParams();

  const fetchTasks = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    const priorityFilter = (searchParams.get('priority') as Priority) || 'all';
    const userTasks = await getTasks(user.uid, completed, priorityFilter);
    setTasks(userTasks);
    setIsLoading(false);
  }, [user, completed, searchParams]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setIsDialogOpen(true);
  };

  const handleOpenDialog = () => {
    setEditingTask(null);
    setIsDialogOpen(true);
  };
  
  const handleTaskUpdate = () => {
    fetchTasks();
  }
  
  const emptyTitle = completed ? "No completed tasks" : "No active tasks";
  const emptyDescription = completed ? "Get to work and complete some tasks!" : "You're all caught up! Create a new task to get started.";

  if (isLoading) {
    return <TaskListSkeleton />;
  }

  if (tasks.length === 0) {
    return (
      <>
        <EmptyState
          title={emptyTitle}
          description={emptyDescription}
          action={<Button onClick={handleOpenDialog}><Plus className="mr-2 h-4 w-4" />Create Task</Button>}
        />
        <TaskDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} task={editingTask} onTaskUpdate={handleTaskUpdate} />
      </>
    );
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tasks.map(task => (
          <TaskCard key={task.id} task={task} onEdit={() => handleEdit(task)} onUpdate={handleTaskUpdate} />
        ))}
      </div>
      <TaskDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} task={editingTask} onTaskUpdate={handleTaskUpdate} />
    </>
  );
}
