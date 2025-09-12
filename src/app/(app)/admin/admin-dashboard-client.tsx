'use client';

import { useEffect, useState, useMemo } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import type { Task, TaskFromFirestore } from '@/lib/types';
import { AdminTaskCard } from '@/components/admin/admin-task-card';

type GroupedTasks = {
  [userIdentifier: string]: Task[];
};

export function AdminDashboardClient() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
        }).filter(t => t.createdAt && t.dueDate && t.userId); // Filter out tasks with invalid dates or no user
        
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
      if (!identifier) return acc;
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

  const getDisplayName = (identifier: string) => {
    if (!identifier) return 'Unknown User';
    if (identifier.includes('@')) {
      return identifier.split('@')[0];
    }
    return identifier.length > 12 ? `${identifier.substring(0, 12)}...` : identifier;
  };

  if (isLoading) {
    return (
        <div className="flex h-[calc(100vh_-_4rem)] items-center justify-center rounded-lg border-dashed shadow-sm">
            <p className="text-muted-foreground">Loading users and tasks...</p>
        </div>
    );
  }

  if (sortedUserIdentifiers.length === 0) {
    return (
        <div className="flex h-full flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm">
            <div className="text-center">
                <h2 className="text-xl font-semibold">No Tasks Found</h2>
                <p className="text-muted-foreground">
                    There are no tasks for any user yet.
                </p>
            </div>
        </div>
    );
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
        {sortedUserIdentifiers.map(identifier => (
            <section key={identifier} className="space-y-4">
                <div className="flex items-baseline gap-3">
                    <h2 className="text-xl font-semibold">{getDisplayName(identifier)}</h2>
                    <p className="text-sm text-muted-foreground">({groupedTasks[identifier].length} {groupedTasks[identifier].length === 1 ? 'task' : 'tasks'})</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {groupedTasks[identifier].map(task => (
                        <AdminTaskCard key={task.id} task={task} />
                    ))}
                </div>
            </section>
        ))}
    </main>
  );
}
