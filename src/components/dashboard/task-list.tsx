
'use client';

import type {Priority, Task, TaskFromFirestore} from '@/lib/types';
import {useCallback, useEffect, useState} from 'react';
import {TaskCard} from './task-card';
import {TaskDialog} from './task-dialog';
import {EmptyState} from './empty-state';
import {Button} from '../ui/button';
import {Plus} from 'lucide-react';
import {useAuth} from '@/app/providers';
import {useSearchParams} from 'next/navigation';
import {TaskListSkeleton} from './task-list-skeleton';
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
} from 'firebase/firestore';
import {db} from '@/lib/firebase/client';
import { parseISO } from 'date-fns';

type TaskListProps = {
  completed: boolean;
};

export function TaskList({completed}: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const {user} = useAuth();
  const searchParams = useSearchParams();

  const fetchAndSetTasks = useCallback(() => {
    if (!user) {
      setTasks([]);
      setIsLoading(false);
      return () => {};
    }

    setIsLoading(true);
    const tasksCollection = collection(db, 'tasks');
    const q = query(
      tasksCollection,
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      querySnapshot => {
        let tasksFromDb: Task[] = querySnapshot.docs.map(doc => {
          const data = doc.data() as TaskFromFirestore;
          return {
            id: doc.id,
            ...data,
            // Convert Firestore Timestamps to ISO strings
            dueDate: data.dueDate.toDate().toISOString(),
            createdAt: data.createdAt.toDate().toISOString(),
          };
        });

        // Client-side filtering for completion status
        tasksFromDb = tasksFromDb.filter(
          task => task.isCompleted === completed
        );
        
        // Client-side filtering for priority
        const priorityFilter = (searchParams.get('priority') as Priority) || 'all';
        if (priorityFilter !== 'all') {
          tasksFromDb = tasksFromDb.filter(
            task => task.priority === priorityFilter
          );
        }

        // Client-side sorting
        const priorityOrder: Record<Priority, number> = {
          high: 1,
          medium: 2,
          low: 3,
        };

        tasksFromDb.sort((a, b) => {
            // Sort by due date first
            const dateA = parseISO(a.dueDate).getTime();
            const dateB = parseISO(b.dueDate).getTime();
            if (dateA !== dateB) {
                return dateA - dateB;
            }
            // Then by priority if not completed
            if (!completed) {
                return priorityOrder[a.priority] - priorityOrder[b.priority];
            }
            return 0;
        });


        setTasks(tasksFromDb);
        setIsLoading(false);
      },
      error => {
        console.error('Error fetching tasks: ', error);
        setIsLoading(false);
      }
    );

    return unsubscribe;
  }, [user, completed, searchParams]);


  useEffect(() => {
    const unsubscribe = fetchAndSetTasks();
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [fetchAndSetTasks]);

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setIsDialogOpen(true);
  };

  const handleOpenDialog = () => {
    setEditingTask(null);
    setIsDialogOpen(true);
  };

  const handleTaskUpdate = () => {
    // No longer need to manually refetch, onSnapshot handles it.
  };

  const emptyTitle = completed ? 'No completed tasks' : 'No active tasks';
  const emptyDescription = completed
    ? 'Get to work and complete some tasks!'
    : "You're all caught up! Create a new task to get started.";

  if (isLoading) {
    return <TaskListSkeleton />;
  }

  if (tasks.length === 0) {
    return (
      <>
        <EmptyState
          title={emptyTitle}
          description={emptyDescription}
          action={
            !completed && (
              <Button onClick={handleOpenDialog}>
                <Plus className="mr-2 h-4 w-4" />
                Create Task
              </Button>
            )
          }
        />
        <TaskDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          task={editingTask}
        />
      </>
    );
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tasks.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            onEdit={() => handleEdit(task)}
            onUpdate={handleTaskUpdate}
          />
        ))}
      </div>
      <TaskDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        task={editingTask}
      />
    </>
  );
}
