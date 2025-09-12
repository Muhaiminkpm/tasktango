'use client';
import {
  collection,
  addDoc,
  Timestamp,
  doc,
  updateDoc,
  deleteDoc,
  writeBatch,
} from 'firebase/firestore';
import {db} from '@/lib/firebase/client';
import type {Priority, TaskStatus} from '@/lib/types';

type NewTaskPayload = {
  title: string;
  description: string;
  priority: Priority;
  dueDate: string;
};

export async function addTask(payload: NewTaskPayload, userId: string, userEmail: string) {
  if (!userId || !userEmail) {
    throw new Error('User ID and email are required to create a task.');
  }
  const newTask = {
    ...payload,
    userId,
    userEmail,
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

  // By using updateDoc, we ensure that other fields like userId and createdAt remain untouched.
  await updateDoc(taskRef, dataToUpdate);
}

export async function updateTaskStatus(
  taskId: string,
  taskName: string,
  previousStage: TaskStatus,
  newStage: TaskStatus,
  userId: string,
  userEmail: string,
) {
  const batch = writeBatch(db);

  // Reference to the task document
  const taskRef = doc(db, 'tasks', taskId);
  // Update the status field of the task
  batch.update(taskRef, { status: newStage });

  // Reference to a new document in the task stage history collection
  const stageHistoryRef = doc(collection(db, 'taskStages'));
  // Create a log of the stage change
  batch.set(stageHistoryRef, {
    taskId,
    taskName,
    previousStage,
    newStage,
    updatedAt: Timestamp.now(),
    userId,
    userEmail,
  });

  // Commit both writes as a single atomic operation
  await batch.commit();
}


export async function deleteTask(id: string) {
  const taskRef = doc(db, 'tasks', id);
  await deleteDoc(taskRef);
}
