import { Timestamp } from 'firebase/firestore';

export type Priority = 'low' | 'medium' | 'high';
export type TaskStatus = 'todo' | 'inProgress' | 'done';

interface BaseTask {
  title: string;
  description: string;
  priority: Priority;
  status: TaskStatus;
  userId: string;
  userEmail: string;
}

export interface Task extends BaseTask {
  id: string;
  dueDate: string; // Serialized as ISO string for client-side use
  createdAt: string; // Serialized as ISO string for client-side use
}

// This type represents the data structure in Firestore
export interface TaskFromFirestore {
  title: string;
  description: string;
  priority: Priority;
  status: TaskStatus;
  userId: string;
  userEmail: string;
  dueDate: Timestamp;
  createdAt: Timestamp;
}

export interface TaskStageHistory {
  taskId: string;
  taskName: string;
  previousStage: TaskStatus;
  newStage: TaskStatus;
  updatedAt: Timestamp;
  userId: string;
  userEmail: string;
}

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}
