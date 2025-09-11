'use client';

import { Task } from '@/lib/types';
import { useState } from 'react';
import { TaskCard } from './task-card';
import { TaskDialog } from './task-dialog';
import { EmptyState } from './empty-state';
import { Button } from '../ui/button';
import { Plus } from 'lucide-react';

type TaskListProps = {
  tasks: Task[];
  emptyTitle: string;
  emptyDescription: string;
};

export function TaskList({ tasks, emptyTitle, emptyDescription }: TaskListProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setIsDialogOpen(true);
  };

  const handleOpenDialog = () => {
    setEditingTask(null);
    setIsDialogOpen(true);
  };

  if (tasks.length === 0) {
    return (
      <>
        <EmptyState
          title={emptyTitle}
          description={emptyDescription}
          action={<Button onClick={handleOpenDialog}><Plus className="mr-2 h-4 w-4" />Create Task</Button>}
        />
        <TaskDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} task={editingTask} />
      </>
    );
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tasks.map(task => (
          <TaskCard key={task.id} task={task} onEdit={() => handleEdit(task)} />
        ))}
      </div>
      <TaskDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} task={editingTask} />
    </>
  );
}
