
'use client';

import { useEffect, useState, useMemo } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import type { Task, TaskFromFirestore } from '@/lib/types';
import { AdminTaskCard } from '@/components/admin/admin-task-card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { AdminTaskFilters } from '@/components/admin/admin-task-filters';
import {
  isWithinInterval,
  startOfToday,
  endOfToday,
  startOfYesterday,
  endOfYesterday,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  parseISO,
} from 'date-fns';

type GroupedTasks = {
  [userIdentifier: string]: Task[];
};

type UserSection = {
  identifier: string;
  displayName: string;
  tasks: Task[];
  taskCount: number;
};

export type FilterValue = 'all' | 'today' | 'yesterday' | 'week' | 'month';

export function AdminDashboardClient() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserSection | null>(null);
  const [filter, setFilter] = useState<FilterValue>('today');
  
  useEffect(() => {
    const tasksQuery = query(collection(db, 'tasks'));
    const unsubscribe = onSnapshot(
      tasksQuery,
      (snapshot) => {
        const tasksFromDb = snapshot.docs.map((doc) => {
          const data = doc.data() as TaskFromFirestore;
          return {
            id: doc.id,
            ...data,
            dueDate: data.dueDate?.toDate()?.toISOString(),
            createdAt: data.createdAt?.toDate()?.toISOString(),
          } as Task;
        }).filter(t => t.createdAt && t.dueDate && (t.userId || t.userEmail));
        
        setTasks(tasksFromDb);
        setIsLoading(false);
      },
      (error) => {
        console.error('Error fetching all tasks:', error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const getDisplayName = (identifier: string) => {
    if (!identifier) return 'Unknown User';
    if (identifier.includes('@')) {
      return identifier.split('@')[0];
    }
    return identifier.length > 12 ? `${identifier.substring(0, 12)}...` : identifier;
  };
  
  const groupedTasks = useMemo(() => {
    return tasks.reduce((acc, task) => {
      const identifier = task.userEmail || task.userId;
      if (!identifier) return acc;
      if (!acc[identifier]) {
        acc[identifier] = [];
      }
      acc[identifier].push(task);
      return acc;
    }, {} as GroupedTasks);
  }, [tasks]);

  const userSections = useMemo(() => {
    return Object.keys(groupedTasks).map(identifier => ({
        identifier,
        displayName: getDisplayName(identifier),
        tasks: groupedTasks[identifier],
        taskCount: groupedTasks[identifier].length,
    })).sort((a, b) => a.displayName.localeCompare(b.displayName));
  }, [groupedTasks]);

  const handleSelectUser = (section: UserSection) => {
    setSelectedUser(section);
  }

  const filteredTasks = useMemo(() => {
    if (!selectedUser) return [];

    const now = new Date();
    return selectedUser.tasks.filter(task => {
        const taskDate = parseISO(task.dueDate || task.createdAt);
        switch (filter) {
            case 'today':
                return isWithinInterval(taskDate, { start: startOfToday(), end: endOfToday() });
            case 'yesterday':
                return isWithinInterval(taskDate, { start: startOfYesterday(), end: endOfYesterday() });
            case 'week':
                return isWithinInterval(taskDate, { start: startOfWeek(now), end: endOfWeek(now) });
            case 'month':
                return isWithinInterval(taskDate, { start: startOfMonth(now), end: endOfMonth(now) });
            case 'all':
            default:
                return true;
        }
    });
  }, [selectedUser, filter]);

  if (isLoading) {
    return (
        <div className="grid h-full grid-cols-1 md:grid-cols-[280px_1fr]">
            <div className="hidden border-r bg-secondary/50 p-4 md:block">
                <Skeleton className="h-8 w-1/2 mb-4" />
                <div className="space-y-2">
                    {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
                </div>
            </div>
            <div className="p-6">
                <Skeleton className="h-8 w-1/4 mb-4" />
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="border rounded-lg p-4 space-y-3">
                            <Skeleton className="h-5 w-3/4" />
                            <Skeleton className="h-4 w-full" />
                            <div className="flex justify-between items-center pt-2">
                                <Skeleton className="h-5 w-1/3" />
                                <Skeleton className="h-8 w-8 rounded-md" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
      </div>
    );
  }

  return (
    <div className="grid h-full md:grid-cols-[280px_1fr]">
        <aside className="hidden border-r bg-secondary/50 p-4 md:flex md:flex-col">
            <h2 className="text-lg font-semibold mb-4 font-headline">Users</h2>
            <div className="flex-1 overflow-y-auto">
                <nav className="flex flex-col gap-1">
                    {userSections.map(section => (
                        <Button
                            key={section.identifier}
                            variant="ghost"
                            onClick={() => handleSelectUser(section)}
                            className={cn(
                                "w-full justify-start text-left h-auto py-2",
                                selectedUser?.identifier === section.identifier && "bg-primary/10 text-primary"
                            )}
                        >
                           <div className="flex flex-col">
                             <span className="text-sm font-medium">{section.displayName}</span>
                             <span className="text-xs text-muted-foreground">{section.taskCount} tasks</span>
                           </div>
                        </Button>
                    ))}
                </nav>
            </div>
        </aside>

        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
            {selectedUser ? (
                <section>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold font-headline">
                            Tasks for {selectedUser.displayName}
                        </h2>
                        <AdminTaskFilters filter={filter} onFilterChange={setFilter} />
                    </div>
                    {filteredTasks.length > 0 ? (
                        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {filteredTasks.map(task => (
                                <AdminTaskCard key={task.id} task={task} />
                            ))}
                        </div>
                    ) : (
                        <div className="flex h-48 items-center justify-center text-center rounded-md border border-dashed">
                            <div>
                                <h3 className="text-lg font-semibold">No tasks found</h3>
                                <p className="text-muted-foreground text-sm">No tasks match the current filter.</p>
                            </div>
                        </div>
                    )}
                </section>
            ) : (
                <div className="flex h-full items-center justify-center text-center">
                    <div>
                        <h3 className="text-lg font-semibold">Select a user</h3>
                        <p className="text-muted-foreground">Select a user from the sidebar to view their tasks.</p>
                    </div>
                </div>
            )}
        </main>
    </div>
  );
}
