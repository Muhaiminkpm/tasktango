'use client';

import { useEffect, useState, useMemo } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import type { Task, TaskFromFirestore } from '@/lib/types';
import { AdminTaskCard } from '@/components/admin/admin-task-card';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

type GroupedTasks = {
  [userIdentifier: string]: Task[];
};

export function AdminDashboardClient() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIdentifier, setSelectedIdentifier] = useState<string | null>(null);

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

  const userList = useMemo(() => {
    return Object.keys(groupedTasks).map(identifier => ({
        identifier,
        displayName: getDisplayName(identifier),
        taskCount: groupedTasks[identifier].length,
    })).sort((a, b) => a.displayName.localeCompare(b.displayName));
  }, [groupedTasks]);


  const selectedUserTasks = useMemo(() => {
      if (!selectedIdentifier) return [];
      return groupedTasks[selectedIdentifier] || [];
  }, [selectedIdentifier, groupedTasks]);


  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh_-_4rem)]">
        <div className="hidden lg:block w-[280px] border-r bg-secondary/50 p-4">
            <Skeleton className="h-8 w-1/2 mb-4" />
            <div className="space-y-2">
                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
        </div>
        <div className="flex-1 p-6 flex items-center justify-center">
             <p className="text-muted-foreground">Loading users and tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid min-h-[calc(100vh_-_4rem)] w-full lg:grid-cols-[280px_1fr]">
        <div className="hidden border-r bg-secondary/50 lg:block">
            <div className="flex h-full max-h-screen flex-col gap-2">
                <div className="flex h-16 items-center border-b px-6">
                    <h2 className="font-semibold text-lg">Users</h2>
                </div>
                <div className="flex-1 overflow-auto py-2">
                    <nav className="grid items-start px-4 text-sm font-medium">
                        {userList.map(user => (
                            <button
                                key={user.identifier}
                                onClick={() => setSelectedIdentifier(user.identifier)}
                                className={cn(
                                    'flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary text-left',
                                    selectedIdentifier === user.identifier && 'bg-primary/10 text-primary'
                                )}
                            >
                                <span className="truncate">{user.displayName}</span>
                                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs">
                                    {user.taskCount}
                                </span>
                            </button>
                        ))}
                    </nav>
                </div>
            </div>
        </div>
        <div className="flex flex-col">
            <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
                {!selectedIdentifier ? (
                    <div className="flex h-full flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm">
                        <div className="text-center">
                            <h2 className="text-xl font-semibold">Select a User</h2>
                            <p className="text-muted-foreground">
                                Select a user from the sidebar to view their tasks.
                            </p>
                        </div>
                    </div>
                ) : (
                    <>
                        <h2 className="text-xl font-semibold">Tasks for {getDisplayName(selectedIdentifier)}</h2>
                        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {selectedUserTasks.map(task => (
                                <AdminTaskCard key={task.id} task={task} />
                            ))}
                        </div>
                    </>
                )}
            </main>
        </div>
    </div>
  );
}
