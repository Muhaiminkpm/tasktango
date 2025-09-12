
'use client';

import { useEffect, useState, useMemo } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import type { Task, TaskFromFirestore } from '@/lib/types';
import { AdminTaskCard } from '@/components/admin/admin-task-card';
import { cn } from '@/lib/utils';

type GroupedTasks = {
  [userIdentifier: string]: Task[];
};

export function AdminDashboardClient() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [selectedIdentifier, setSelectedIdentifier] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

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
        }).filter(t => t.createdAt && t.dueDate); // Filter out tasks with invalid dates
        
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

  const groupedTasks = useMemo(() => {
    return tasks.reduce((acc, task) => {
      const identifier = task.userEmail || task.userId;
      if (!acc[identifier]) {
        acc[identifier] = [];
      }
      acc[identifier].push(task);
      return acc;
    }, {} as GroupedTasks);
  }, [tasks]);
  
  const sortedUserIdentifiers = useMemo(() => {
    return Object.keys(groupedTasks).sort((a, b) => a.localeCompare(b));
  }, [groupedTasks]);

  useEffect(() => {
    // This effect ensures that if the currently selected user is removed
    // (e.g., all their tasks are deleted), we don't have a dangling selection.
    if (selectedIdentifier && !sortedUserIdentifiers.includes(selectedIdentifier)) {
        setSelectedIdentifier(null);
    }
  }, [sortedUserIdentifiers, selectedIdentifier]);


  const getDisplayName = (identifier: string) => {
    if (!identifier) return 'Unknown User';
    // Check if it's an email and extract the prefix
    if (identifier.includes('@')) {
      return identifier.split('@')[0];
    }
    // Otherwise, return the identifier (likely a userId)
    return identifier;
  };

  const selectedUserTasks = selectedIdentifier ? groupedTasks[selectedIdentifier] : [];

  if (isLoading) {
    return (
        <div className="flex h-full items-center justify-center rounded-lg border border-dashed shadow-sm">
            <p className="text-muted-foreground">Loading users and tasks...</p>
        </div>
    );
  }

  if (showSplash) {
      return (
        <div className="flex h-full flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm transition-opacity duration-500">
            <div className="text-center">
                <h2 className="text-xl font-semibold">Welcome, Admin</h2>
                <p className="text-muted-foreground">
                    Select a user from the sidebar to view their tasks.
                </p>
            </div>
        </div>
      );
  }

  return (
    <div className={cn("grid min-h-[calc(100vh_-_4rem)] w-full lg:grid-cols-[280px_1fr] transition-opacity duration-500", showSplash ? 'opacity-0' : 'opacity-100')}>
        <aside className="hidden border-r bg-secondary/50 lg:block">
            <div className="flex h-full max-h-screen flex-col gap-2">
                <div className="flex h-16 items-center border-b px-6">
                    <h2 className="font-semibold text-lg">Users</h2>
                </div>
                <div className="flex-1 overflow-auto py-2">
                    <nav className="grid items-start px-4 text-sm font-medium">
                        {sortedUserIdentifiers.map(identifier => (
                            <button
                                key={identifier}
                                onClick={() => setSelectedIdentifier(identifier)}
                                className={`flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary ${selectedIdentifier === identifier ? 'bg-primary/10 text-primary' : ''}`}
                            >
                                <span className="truncate">{getDisplayName(identifier)}</span>
                                <span className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs">
                                  {groupedTasks[identifier].length}
                                </span>
                            </button>
                        ))}
                    </nav>
                </div>
            </div>
        </aside>
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
            {selectedIdentifier ? (
                selectedUserTasks.length > 0 ? (
                    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
                        {selectedUserTasks.map(task => (
                            <AdminTaskCard key={task.id} task={task} />
                        ))}
                    </div>
                ) : (
                    <div className="flex h-full flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm">
                        <div className="text-center">
                            <h2 className="text-xl font-semibold">No Tasks Found</h2>
                            <p className="text-muted-foreground">
                                No tasks for {getDisplayName(selectedIdentifier)}.
                            </p>
                        </div>
                    </div>
                )
            ) : (
                <div className="flex h-full flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm">
                    <div className="text-center">
                        <h2 className="text-xl font-semibold">Welcome, Admin</h2>
                        <p className="text-muted-foreground">
                            Select a user from the sidebar to view their tasks.
                        </p>
                    </div>
                </div>
            )}
        </main>
    </div>
  );
}
