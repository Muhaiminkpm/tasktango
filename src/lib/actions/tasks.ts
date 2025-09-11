// src/lib/actions/tasks.ts
'use server';

import {revalidatePath} from 'next/cache';
import {Timestamp} from 'firebase-admin/firestore';
import {
  prioritizeTask,
  type PrioritizeTaskInput,
} from '@/ai/flows/task-prioritization';
import {getDb, getCurrentUser} from '@/lib/firebase/server';
import type {Priority, Task, TaskFromFirestore} from '@/lib/types';

export async function getTasks(
  completed: boolean,
  priorityFilter: Priority | 'all'
) {
  const user = await getCurrentUser();
  if (!user) return [];

  const db = getDb();
  let query = db
    .collection('tasks')
    .where('userId', '==', user.uid)
    .where('isCompleted', '==', completed);

  if (priorityFilter !== 'all') {
    query = query.where('priority', '==', priorityFilter);
  }

  const snapshot = await query.orderBy('dueDate', 'asc').get();

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

export async function addTask(prevState: any, formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return {error: 'Unauthorized'};

  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const priority = formData.get('priority') as Priority;
  const dueDateStr = formData.get('dueDate') as string;

  if (!title || !priority || !dueDateStr) {
    return {error: 'Missing required fields.'};
  }

  const dueDate = new Date(dueDateStr);
  const db = getDb();

  const newTask: TaskFromFirestore = {
    title,
    description: description || '',
    priority,
    dueDate: Timestamp.fromDate(dueDate),
    isCompleted: false,
    createdAt: Timestamp.now(),
    userId: user.uid,
  };

  try {
    await db.collection('tasks').add(newTask);
    revalidatePath('/');
    revalidatePath('/completed');
    return {success: true};
  } catch (e) {
    return {error: 'Failed to create task.'};
  }
}

export async function updateTask(id: string, prevState: any, formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return {error: 'Unauthorized'};

  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const priority = formData.get('priority') as Priority;
  const dueDateStr = formData.get('dueDate') as string;

  if (!title || !priority || !dueDateStr) {
    return {error: 'Missing required fields.'};
  }

  const dueDate = new Date(dueDateStr);
  const db = getDb();
  const taskRef = db.collection('tasks').doc(id);
  const doc = await taskRef.get();
  if (!doc.exists || doc.data()?.userId !== user.uid) {
    return {error: 'Task not found or unauthorized.'};
  }

  try {
    await taskRef.update({
      title,
      description,
      priority,
      dueDate: Timestamp.fromDate(dueDate),
    });

    revalidatePath('/');
    revalidatePath('/completed');
    return {success: true};
  } catch (e) {
    return {error: 'Failed to update task.'};
  }
}

export async function toggleTaskCompletion(id: string, isCompleted: boolean) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');
  
  const db = getDb();
  const taskRef = db.collection('tasks').doc(id);
  const doc = await taskRef.get();
  if (!doc.exists || doc.data()?.userId !== user.uid) {
    throw new Error('Task not found or unauthorized.');
  }

  await taskRef.update({isCompleted: !isCompleted});
  revalidatePath('/');
  revalidatePath('/completed');
}

export async function deleteTask(id: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');

  const db = getDb();
  const taskRef = db.collection('tasks').doc(id);
  const doc = await taskRef.get();
  if (!doc.exists || doc.data()?.userId !== user.uid) {
    throw new Error('Task not found or unauthorized.');
  }

  await taskRef.delete();
  revalidatePath('/');
  revalidatePath('/completed');
}

export async function getAIPriority(
  data: Omit<PrioritizeTaskInput, 'dueDate'> & {dueDate: Date | undefined}
): Promise<{priority: Priority} | {error: string}> {
  const user = await getCurrentUser();
  if (!user) return {error: 'Unauthorized'};

  if (!data.title || !data.dueDate) {
    return {error: 'Title and due date are required for AI prioritization.'};
  }

  try {
    const result = await prioritizeTask({
      title: data.title,
      description: data.description,
      dueDate: data.dueDate.toISOString(),
    });
    return {priority: result.priority};
  } catch (error) {
    console.error('AI prioritization failed:', error);
    return {error: 'Failed to get AI suggestion. Please try again.'};
  }
}
