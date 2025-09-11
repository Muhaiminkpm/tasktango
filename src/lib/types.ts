import { Timestamp } from 'firebase/firestore';

export type Priority = 'low' | 'medium' | 'high';

interface BaseTask {
  title: string;
  description: string;
  priority: Priority;
  isCompleted: boolean;
  userId: string;
}

export interface Task extends BaseTask {
  id: string;
  dueDate: string; // Serialized as ISO string
  createdAt: string; // Serialized as ISO string
}

export interface TaskFromFirestore extends BaseTask {
  dueDate: Timestamp;
  createdAt: Timestamp;
}

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}
