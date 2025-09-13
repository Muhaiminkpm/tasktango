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
import { Checkbox } from '@/components/ui/checkbox';
import {Calendar as CalendarIcon, Loader2} from 'lucide-react';
import {cn} from '@/lib/utils';
import {format, parseISO} from 'date-fns';
import {useEffect, useState} from 'react';
import {addTask, updateTask} from '@/lib/actions/tasks';
import {useToast} from '@/hooks/use-toast';
import {Priority, Task} from '@/lib/types';
import { useAuth } from '@/app/providers';

type TaskDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task | null;
};

export function TaskDialog({open, onOpenChange, task}: TaskDialogProps) {
  const isEditing = !!task;
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [customerInteraction, setCustomerInteraction] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const {toast} = useToast();

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setPriority(task.priority);
      setDueDate(parseISO(task.dueDate));
      setCustomerInteraction(task.customerInteraction || false);
      setCustomerName(task.customerName || '');
    } else {
      setTitle('');
      setDescription('');
      setPriority('medium');
      setDueDate(undefined);
      setCustomerInteraction(false);
      setCustomerName('');
    }
  }, [task, open]);


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user || !user.email) {
        toast({variant: "destructive", title: "Error", description: "You must be logged in."})
        return;
    };
    if (!title || !dueDate) {
        toast({variant: "destructive", title: "Error", description: "Title and due date are required."})
        return;
    }
    if (customerInteraction && !customerName) {
        toast({variant: "destructive", title: "Error", description: "Customer name is required for customer interactions."})
        return;
    }

    setIsLoading(true);

    const taskData = {
        title,
        description,
        priority,
        dueDate: dueDate.toISOString(),
        customerInteraction,
        customerName: customerInteraction ? customerName : '',
    };

    try {
        if (isEditing && task) {
            await updateTask(task.id, taskData);
            toast({
                title: 'Success',
                description: 'Task updated successfully.',
            });
        } else {
            await addTask(taskData, user.uid, user.email);
            toast({
                title: 'Success',
                description: 'Task created successfully.',
            });
        }
        onOpenChange(false);
    } catch(error) {
        console.error("Failed to save task:", error);
        toast({
            variant: 'destructive',
            title: 'Error',
            description: `Failed to ${isEditing ? 'update' : 'create'} task.`,
        });
    } finally {
        setIsLoading(false);
    }
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
        <form onSubmit={handleSubmit}>
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
              </div>
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
               <Label htmlFor="customerInteraction" className="text-right">
                Customer
               </Label>
               <div className="col-span-3 flex items-center space-x-2">
                <Checkbox
                    id="customerInteraction"
                    checked={customerInteraction}
                    onCheckedChange={(checked) => setCustomerInteraction(checked as boolean)}
                />
                <label
                    htmlFor="customerInteraction"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                    Customer Interaction
                </label>
               </div>
            </div>

            {customerInteraction && (
                 <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="customerName" className="text-right">
                        Customer Name
                    </Label>
                    <Input
                        id="customerName"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="col-span-3"
                        placeholder="Enter customer's name"
                        required
                    />
                </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isEditing ? 'Save Changes' : 'Create Task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
