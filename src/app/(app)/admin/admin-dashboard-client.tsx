
'use client';

import { useEffect, useState, useMemo } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import type { Task, TaskFromFirestore } from '@/lib/types';
import { AdminTaskCard } from '@/components/admin/admin-task-card';
import { Skeleton } from '@/components/ui/skeleton';

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


  if (isLoading) {
    return (
      <div className="p-6">
        <Skeleton className="h-8 w-1/4 mb-4" />
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
    );
  }

  return (
    <div className="flex flex-col">
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
            {userSections.map(section => (
                <section key={section.identifier} className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">
                        {section.displayName} 
                        <span className="text-sm font-normal text-muted-foreground ml-2">({section.taskCount} tasks)</span>
                    </h2>
                    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {section.tasks.map(task => (
                            <AdminTaskCard key={task.id} task={task} />
                        ))}
                    </div>
                </section>
            ))}
        </main>
    </div>
  );
}

