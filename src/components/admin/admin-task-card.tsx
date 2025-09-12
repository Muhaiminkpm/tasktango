'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { deleteTask } from '@/lib/actions/tasks';
import { Task } from '@/lib/types';
import { cn } from '@/lib/utils';
import { format, isPast, parseISO } from 'date-fns';
import { Calendar, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

type AdminTaskCardProps = {
  task: Task;
};

export function AdminTaskCard({ task }: AdminTaskCardProps) {
  const [isPending, setIsPending] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    setIsPending(true);
    try {
      await deleteTask(task.id);
      toast({ description: 'Task deleted successfully.' });
    } catch (error) {
      toast({ variant: 'destructive', description: 'Failed to delete task.' });
    } finally {
      setIsPending(false);
    }
  };

  const dueDate = parseISO(task.dueDate);
  const isOverdue = isPast(dueDate) && task.status !== 'done';
  const isCompleted = task.status === 'done';

  const getDisplayName = (email: string) => {
    return email.split('@')[0];
  }

  return (
    <Card
      className={cn(
        'flex flex-col justify-between transition-all bg-card shadow-sm hover:shadow-md',
        isCompleted && 'bg-secondary/40'
      )}
    >
      <CardHeader className="p-4">
        <CardTitle
          className={cn(
            'text-base font-semibold',
            isCompleted && 'line-through text-muted-foreground'
          )}
        >
          {task.title}
        </CardTitle>
        {task.description && (
          <CardDescription
            className={cn(
              'text-xs text-muted-foreground',
              isCompleted && 'line-through'
            )}
          >
            {task.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="flex flex-col space-y-2 text-xs text-muted-foreground">
            <div className="flex items-center">
                <Badge variant={isCompleted ? 'default' : 'secondary'} className="capitalize text-xs">{task.status}</Badge>
            </div>
            <div className={cn('flex items-center', isOverdue && 'text-destructive')}>
                <Calendar className="mr-1.5 h-3.5 w-3.5" />
                {format(dueDate, 'MMM d, yyyy')}
            </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center p-4 pt-0">
         <p className="text-xs text-muted-foreground font-medium">
            {task.userEmail ? getDisplayName(task.userEmail) : task.userId}
          </p>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive">
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action will permanently delete the task "{task.title}". This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className={cn(buttonVariants({ variant: 'destructive' }))}
                disabled={isPending}
              >
                {isPending ? 'Deleting...' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
}
