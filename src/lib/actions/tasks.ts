// src/lib/actions/tasks.ts
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  addDoc,
  Timestamp,
  doc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import {db} from '@/lib/firebase/client';
import type {Priority, Task, TaskFromFirestore} from '@/lib/types';

type NewTaskPayload = {
  title: string;
  description: string;
  priority: Priority;
  dueDate: string;
};

export async function getTasks(
  userId: string,
  completed: boolean,
  priorityFilter: Priority | 'all'
): Promise<Task[]> {
  if (!userId) return [];

  const tasksCollection = collection(db, 'tasks');
  let q = query(
    tasksCollection,
    where('userId', '==', userId),
    where('isCompleted', '==', completed)
  );

  if (priorityFilter !== 'all') {
    q = query(q, where('priority', '==', priorityFilter));
  }

  q = query(q, orderBy('dueDate', 'asc'));

  const snapshot = await getDocs(q);

  const tasks: Task[] = snapshot.docs.map(doc => {
    const data = doc.data() as TaskFromFirestore;
    return {
      id: doc.id,
      ...data,
      dueDate: data.dueDate.toDate().toISOString(),
      createdAt: data.createdAt.toDate().toISOString(),
    };
  });

  const priorityOrder: Record<Priority, number> = {high: 1, medium: 2, low: 3};
  tasks.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return tasks;
}

export async function addTask(payload: NewTaskPayload, userId: string) {
  const newTask: Omit<TaskFromFirestore, 'createdAt'> & {createdAt: Timestamp} = {
    title: payload.title,
    description: payload.description || '',
    priority: payload.priority,
    dueDate: Timestamp.fromDate(new Date(payload.dueDate)),
    isCompleted: false,
    userId: userId,
    createdAt: Timestamp.now(),
  };

  await addDoc(collection(db, 'tasks'), newTask);
}

export async function updateTask(id: string, payload: NewTaskPayload) {
  const taskRef = doc(db, 'tasks', id);
  await updateDoc(taskRef, {
    title: payload.title,
    description: payload.description,
    priority: payload.priority,
    dueDate: Timestamp.fromDate(new Date(payload.dueDate)),
  });
}

export async function toggleTaskCompletion(id: string, isCompleted: boolean) {
  const taskRef = doc(db, 'tasks', id);
  await updateDoc(taskRef, {isCompleted: !isCompleted});
}

export async function deleteTask(id: string) {
  const taskRef = doc(db, 'tasks', id);
  await deleteDoc(taskRef);
}
