'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Task } from '@/lib/types';
import { AdminTaskCard } from './admin-task-card';

type UserTasksDrawerProps = {
  open: boolean;
  onClose: () => void;
  userIdentifier: string | null;
  tasks: Task[];
};

export function UserTasksDrawer({ open, onClose, userIdentifier, tasks }: UserTasksDrawerProps) {
  if (!userIdentifier) return null;

  const getDisplayName = (identifier: string) => {
    if (identifier.includes('@')) {
      return identifier.split('@')[0];
    }
    return identifier;
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-xl w-full overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{getDisplayName(userIdentifier)}'s Tasks</SheetTitle>
          <SheetDescription>
            A list of all tasks assigned to {userIdentifier}.
          </SheetDescription>
        </SheetHeader>
        <div className="py-4">
          {tasks.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-1">
              {tasks.map((task) => (
                <AdminTaskCard key={task.id} task={task} />
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground mt-8">No tasks found for this user.</p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
