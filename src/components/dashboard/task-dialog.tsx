'use client';

import {Button} from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Textarea} from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {Popover, PopoverContent, PopoverTrigger} from '@/components/ui/popover';
import {Calendar} from '@/components/ui/calendar';
import {Calendar as CalendarIcon, Loader2, Sparkles} from 'lucide-react';
import {cn} from '@/lib/utils';
import {format} from 'date-fns';
import {useEffect, useState, useActionState} from 'react';
import { useFormStatus} from 'react-dom';
import {addTask, getAIPriority, updateTask} from '@/lib/actions/tasks';
import {useToast} from '@/hooks/use-toast';
import {Priority, Task} from '@/lib/types';

type TaskDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task | null;
};

const initialState = {
  error: '',
  success: false,
};

function SubmitButton({isEditing}: {isEditing: boolean}) {
  const {pending} = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      {isEditing ? 'Save Changes' : 'Create Task'}
    </Button>
  );
}

export function TaskDialog({open, onOpenChange, task}: TaskDialogProps) {
  const isEditing = !!task;
  const [formState, formAction] = useActionState(
    isEditing ? updateTask.bind(null, task.id) : addTask,
    initialState
  );

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const {toast} = useToast();

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setPriority(task.priority);
      setDueDate(task.dueDate.toDate());
    } else {
      setTitle('');
      setDescription('');
      setPriority('medium');
      setDueDate(undefined);
    }
  }, [task]);

  useEffect(() => {
    if (formState.error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: formState.error,
      });
    }
    if (formState.success) {
      onOpenChange(false);
      toast({
        title: 'Success',
        description: `Task ${isEditing ? 'updated' : 'created'} successfully.`,
      });
    }
  }, [formState, toast, onOpenChange, isEditing]);

  const handleAiPriority = async () => {
    setIsAiLoading(true);
    const result = await getAIPriority({title, description, dueDate});
    if ('priority' in result) {
      setPriority(result.priority);
      toast({
        title: 'AI Suggestion',
        description: `Priority set to "${result.priority}".`,
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'AI Error',
        description: result.error,
      });
    }
    setIsAiLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline">
            {isEditing ? 'Edit Task' : 'Create Task'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the details of your task.'
              : 'Add a new task to your list.'}
          </DialogDescription>
        </DialogHeader>
        <form action={formAction}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                id="title"
                name="title"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                name="description"
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="dueDate" className="text-right">
                Due Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={'outline'}
                    className={cn(
                      'col-span-3 justify-start text-left font-normal',
                      !dueDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={setDueDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <input type="hidden" name="dueDate" value={dueDate?.toISOString()} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="priority" className="text-right">
                Priority
              </Label>
              <div className="col-span-3 flex items-center gap-2">
                <Select
                  name="priority"
                  value={priority}
                  onValueChange={value => setPriority(value as Priority)}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleAiPriority}
                  disabled={isAiLoading || !title || !dueDate}
                  title="Suggest Priority with AI"
                >
                  {isAiLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4 text-accent" />
                  )}
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <SubmitButton isEditing={isEditing} />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
