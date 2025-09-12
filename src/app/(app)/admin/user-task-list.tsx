'use client';

import { useEffect, useState, useMemo } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { Task, TaskFromFirestore } from '@/lib/types';
import { useAuth } from '@/app/providers';
import { UserTasksDrawer } from '@/components/admin/user-tasks-drawer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';

type GroupedTasks = {
  [userIdentifier: string]: Task[];
};

export function UserTaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
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

  const handleUserClick = (identifier: string) => {
    setSelectedUser(identifier);
  };

  const handleDrawerClose = () => {
    setSelectedUser(null);
  };

  if (isLoading) {
    return <div>Loading users and tasks...</div>;
  }

  if (Object.keys(groupedTasks).length === 0) {
    return <div>No tasks found across all users.</div>;
  }
  
  const selectedUserTasks = selectedUser ? groupedTasks[selectedUser] : [];

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            <span>Users</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(groupedTasks).map(([identifier, userTasks]) => (
              <button
                key={identifier}
                onClick={() => handleUserClick(identifier)}
                className="w-full text-left p-4 rounded-lg hover:bg-secondary transition-colors flex justify-between items-center border"
              >
                <div>
                  <p className="font-semibold">{getDisplayName(identifier)}</p>
                  <p className="text-sm text-muted-foreground">{identifier}</p>
                </div>
                <span className="text-sm font-medium text-muted-foreground bg-secondary/80 px-2 py-1 rounded-md">
                  {userTasks.length} {userTasks.length === 1 ? 'task' : 'tasks'}
                </span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <UserTasksDrawer
        open={!!selectedUser}
        onClose={handleDrawerClose}
        userIdentifier={selectedUser}
        tasks={selectedUserTasks}
      />
    </>
  );
}
