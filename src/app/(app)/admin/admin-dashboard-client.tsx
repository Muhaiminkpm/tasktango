
'use client';

import { useEffect, useState, useMemo } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import type { Task, TaskFromFirestore } from '@/lib/types';
import { useAuth } from '@/app/providers';
import { AdminTaskCard } from '@/components/admin/admin-task-card';

type GroupedTasks = {
  [userIdentifier: string]: Task[];
};

export function AdminDashboardClient() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user || user.email !== 'admintasktango@gmail.com') {
      setIsLoading(false);
      return;
    }

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
  }, [user]);

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

  const getDisplayName = (identifier: string) => {
    if (!identifier) return 'Unknown User';
    if (identifier.includes('@')) {
      return identifier.split('@')[0];
    }
    return identifier;
  };
  
  const sortedUserIdentifiers = useMemo(() => {
    return Object.keys(groupedTasks).sort((a, b) => a.localeCompare(b));
  }, [groupedTasks]);

  if (isLoading) {
    return (
        <div className="flex h-full items-center justify-center rounded-lg border border-dashed shadow-sm">
            <p className="text-muted-foreground">Loading tasks...</p>
        </div>
    );
  }

  if (sortedUserIdentifiers.length === 0) {
    return (
      <div className="flex h-full items-center justify-center rounded-lg border border-dashed shadow-sm">
        <div className="text-center">
          <h2 className="text-xl font-semibold">No Tasks Found</h2>
          <p className="text-muted-foreground">There are currently no tasks across all users.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {sortedUserIdentifiers.map(identifier => {
        const userTasks = groupedTasks[identifier];
        const taskCount = userTasks.length;
        const title = getDisplayName(identifier);
        
        return (
          <section key={identifier}>
            <div className="mb-4">
              <h2 className="text-xl font-semibold">{title}</h2>
              <p className="text-sm text-muted-foreground">
                {taskCount} {taskCount === 1 ? 'task' : 'tasks'}
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {userTasks.map(task => (
                <AdminTaskCard key={task.id} task={task} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
