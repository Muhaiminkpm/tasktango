'use client';
import {
  collection,
  addDoc,
  Timestamp,
  doc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import {db} from '@/lib/firebase/client';
import type {Priority, TaskFromFirestore, TaskStatus} from '@/lib/types';

type NewTaskPayload = {
  title: string;
  description: string;
  priority: Priority;
  dueDate: string;
};

export async function addTask(payload: NewTaskPayload, userId: string) {
  const newTask = {
    ...payload,
    userId,
    description: payload.description || '',
    dueDate: Timestamp.fromDate(new Date(payload.dueDate)),
    status: 'todo' as TaskStatus,
    createdAt: Timestamp.now(),
  };

  await addDoc(collection(db, 'tasks'), newTask);
}

export async function updateTask(
  id: string,
  payload: Partial<NewTaskPayload>
) {
  const taskRef = doc(db, 'tasks', id);
  const dataToUpdate: {[key: string]: any} = {};
  if (payload.title) dataToUpdate.title = payload.title;
  if (payload.description !== undefined) dataToUpdate.description = payload.description;
  if (payload.priority) dataToUpdate.priority = payload.priority;
  if (payload.dueDate)
    dataToUpdate.dueDate = Timestamp.fromDate(new Date(payload.dueDate));

  await updateDoc(taskRef, dataToUpdate);
}

export async function updateTaskStatus(id: string, status: TaskStatus) {
  const taskRef = doc(db, 'tasks', id);
  await updateDoc(taskRef, {status});
}

export async function toggleTaskCompletion(id: string, isCompleted: boolean) {
  const taskRef = doc(db, 'tasks', id);
  await updateDoc(taskRef, {isCompleted: !isCompleted});
}

export async function deleteTask(id: string) {
  const taskRef = doc(db, 'tasks', id);
  await deleteDoc(taskRef);
}
