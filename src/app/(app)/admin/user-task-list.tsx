'use client';

import { useEffect, useState, useMemo } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { Task, TaskFromFirestore } from '@/lib/types';
import { useAuth } from '@/app/providers';
import { TaskCard } from '@/components/dashboard/task-card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

type GroupedTasks = {
  [key: string]: {
    userEmail: string;
    tasks: Task[];
  };
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
            dueDate: data.dueDate.toDate().toISOString(),
            createdAt: data.createdAt.toDate().toISOString(),
          } as Task;
        });
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
      const { userId } = task;
      if (!acc[userId]) {
        acc[userId] = {
          userEmail: `User ID: ${userId}`, // No email available on task doc
          tasks: [],
        };
      }
      acc[userId].tasks.push(task);
      return acc;
    }, {} as GroupedTasks);
  }, [tasks]);

  if (isLoading) {
    return <div>Loading users and tasks...</div>;
  }

  if (Object.keys(groupedTasks).length === 0) {
    return <div>No tasks found across all users.</div>;
  }

  return (
    <div className="space-y-6">
      {Object.entries(groupedTasks).map(([userId, { userEmail, tasks }]) => (
        <div key={userId}>
          <h2 className="text-xl font-semibold font-headline mb-2">{userEmail} ({tasks.length} tasks)</h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>View Tasks</AccordionTrigger>
              <AccordionContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 pt-4">
                  {tasks.map((task) => (
                    <TaskCard key={task.id} task={task} onEdit={() => {}} />
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      ))}
    </div>
  );
}
