
'use client';

import { useEffect, useState, useMemo } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { Task, TaskFromFirestore } from '@/lib/types';
import { useAuth } from '@/app/providers';
import { cn } from '@/lib/utils';
import { Users } from 'lucide-react';
import type { SelectedUserData } from './layout';
import { ScrollArea } from '@/components/ui/scroll-area';

type GroupedTasks = {
  [userIdentifier: string]: Task[];
};

type UserTaskListProps = {
  onUserSelect: (data: SelectedUserData) => void;
  selectedIdentifier?: string;
};

export function UserTaskList({ onUserSelect, selectedIdentifier }: UserTaskListProps) {
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
    return identifier.substring(0, 10) + '...'; // Truncate long UIDs
  }

  const handleUserClick = (identifier: string) => {
    onUserSelect({
      identifier,
      tasks: groupedTasks[identifier],
    });
  };

  const sortedUserIdentifiers = useMemo(() => {
    return Object.keys(groupedTasks).sort((a, b) => a.localeCompare(b));
  }, [groupedTasks]);


  return (
    <aside className="hidden flex-col border-r bg-secondary/50 lg:flex">
       <div className="flex h-16 items-center border-b px-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
              <Users className="h-5 w-5" />
              <span>Users</span>
          </h2>
       </div>
       <ScrollArea className="flex-1">
        <nav className="grid items-start p-4 text-sm font-medium">
            {isLoading ? (
              <p className="px-3 py-2 text-muted-foreground">Loading users...</p>
            ) : sortedUserIdentifiers.length > 0 ? (
                sortedUserIdentifiers.map((identifier) => (
                <button
                  key={identifier}
                  onClick={() => handleUserClick(identifier)}
                  className={cn(
                    'flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                    {
                      'bg-primary/10 text-primary': selectedIdentifier === identifier,
                    }
                  )}
                >
                  <span className="truncate">{getDisplayName(identifier)}</span>
                  <span className="ml-auto rounded-md bg-primary/20 px-2.5 py-0.5 text-xs text-primary">
                    {groupedTasks[identifier].length}
                  </span>
                </button>
              ))
            ) : (
              <p className="px-3 py-2 text-muted-foreground">No users with tasks found.</p>
            )}
        </nav>
       </ScrollArea>
    </aside>
  );
}
