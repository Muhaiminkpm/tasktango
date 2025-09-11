
'use client';
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
    orderBy('dueDate', 'asc')
  );

  const snapshot = await getDocs(q);

  let tasks: Task[] = snapshot.docs.map(doc => {
    const data = doc.data() as TaskFromFirestore;
    return {
      id: doc.id,
      ...data,
      dueDate: data.dueDate.toDate().toISOString(),
      createdAt: data.createdAt.toDate().toISOString(),
    };
  });

  tasks = tasks.filter(task => task.isCompleted === completed);

  if (priorityFilter !== 'all') {
    tasks = tasks.filter(task => task.priority === priorityFilter);
  }

  const priorityOrder: Record<Priority, number> = {high: 1, medium: 2, low: 3};
  if (!completed) {
    tasks.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  }

  return tasks;
}


export async function addTask(payload: NewTaskPayload, userId: string) {
  const newTask = {
    ...payload,
    userId,
    description: payload.description || '',
    dueDate: Timestamp.fromDate(new Date(payload.dueDate)),
    isCompleted: false,
    createdAt: Timestamp.now(),
  };

  await addDoc(collection(db, 'tasks'), newTask);
}

export async function updateTask(id: string, payload: Partial<NewTaskPayload>) {
  const taskRef = doc(db, 'tasks', id);
  const dataToUpdate: Partial<TaskFromFirestore> = {};
  if (payload.title) dataToUpdate.title = payload.title;
  if (payload.description) dataToUpdate.description = payload.description;
  if (payload.priority) dataToUpdate.priority = payload.priority;
  if (payload.dueDate) dataToUpdate.dueDate = Timestamp.fromDate(new Date(payload.dueDate));

  await updateDoc(taskRef, dataToUpdate);
}

export async function toggleTaskCompletion(id: string, isCompleted: boolean) {
  const taskRef = doc(db, 'tasks', id);
  await updateDoc(taskRef, {isCompleted: !isCompleted});
}

export async function deleteTask(id: string) {
  const taskRef = doc(db, 'tasks', id);
  await deleteDoc(taskRef);
}

