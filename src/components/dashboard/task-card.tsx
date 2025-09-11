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
import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {Checkbox} from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {deleteTask, toggleTaskCompletion} from '@/lib/actions/tasks';
import {Priority, Task} from '@/lib/types';
import {cn} from '@/lib/utils';
import {format, isPast} from 'date-fns';
import {Calendar, Edit, MoreVertical, Trash2} from 'lucide-react';
import {useTransition} from 'react';
import {useToast} from '../ui/use-toast';

type TaskCardProps = {
  task: Task;
  onEdit: () => void;
};

const priorityStyles: Record<
  Priority,
  {badge: 'default' | 'secondary' | 'destructive'; ring: string}
> = {
  high: {badge: 'destructive', ring: 'ring-destructive'},
  medium: {badge: 'secondary', ring: 'ring-yellow-500'},
  low: {badge: 'default', ring: 'ring-green-500'},
};

export function TaskCard({task, onEdit}: TaskCardProps) {
  const [isPending, startTransition] = useTransition();
  const {toast} = useToast();

  const handleToggleCompletion = () => {
    startTransition(async () => {
      try {
        await toggleTaskCompletion(task.id, task.isCompleted);
      } catch (error) {
        toast({variant: 'destructive', description: 'Failed to update task.'});
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await deleteTask(task.id);
        toast({description: 'Task deleted.'});
      } catch (error) {
        toast({variant: 'destructive', description: 'Failed to delete task.'});
      }
    });
  };

  const dueDate = task.dueDate.toDate();
  const isOverdue = isPast(dueDate) && !task.isCompleted;

  return (
    <Card
      className={cn(
        'transition-all',
        task.isCompleted ? 'bg-secondary/40' : 'bg-card'
      )}
    >
      <CardHeader className="flex flex-row items-start gap-4 space-y-0 p-4">
        <div className="flex items-center space-x-4 pt-1">
          <Checkbox
            id={`task-${task.id}`}
            checked={task.isCompleted}
            onCheckedChange={handleToggleCompletion}
            disabled={isPending}
            aria-label={`Mark ${task.title} as ${
              task.isCompleted ? 'incomplete' : 'complete'
            }`}
          />
        </div>
        <div className="grid gap-1 flex-1">
          <CardTitle
            className={cn(
              'text-lg transition-colors',
              task.isCompleted && 'line-through text-muted-foreground'
            )}
          >
            {task.title}
          </CardTitle>
          {task.description && (
            <CardDescription
              className={cn(
                'text-sm transition-colors',
                task.isCompleted && 'line-through text-muted-foreground/80'
              )}
            >
              {task.description}
            </CardDescription>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem
                  onSelect={e => e.preventDefault()}
                  className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete the task &quot;{task.title}&quot;. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    disabled={isPending}
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="flex space-x-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Badge
              variant={priorityStyles[task.priority].badge}
              className="capitalize"
            >
              {task.priority}
            </Badge>
          </div>
          <div
            className={cn('flex items-center', isOverdue && 'text-destructive')}
          >
            <Calendar className="mr-1 h-4 w-4" />
            {format(dueDate, 'MMM d, yyyy')}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
