'use client';

import { useEffect, useState, useMemo } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { Task, TaskFromFirestore } from '@/lib/types';
import { useAuth } from '@/app/providers';
import { AdminTaskCard } from '@/components/admin/admin-task-card';

type GroupedTasks = {
  [userIdentifier: string]: Task[];
};

export function UserTaskList() {
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
        });
        setTasks(tasksFromDb.filter(t => t.createdAt && t.dueDate));
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
    if (identifier.includes('@')) {
      return identifier.split('@')[0];
    }
    return identifier;
  }

  if (isLoading) {
    return <div>Loading users and tasks...</div>;
  }

  if (Object.keys(groupedTasks).length === 0) {
    return <div>No tasks found across all users.</div>;
  }

  return (
    <div className="space-y-8">
      {Object.entries(groupedTasks).map(([identifier, userTasks]) => (
        <div key={identifier}>
          <h2 className="text-xl font-semibold font-headline mb-4">
            {getDisplayName(identifier)} ({userTasks.length} tasks)
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {userTasks.map((task) => (
              <AdminTaskCard key={task.id} task={task} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
