import { Timestamp } from 'firebase/firestore';

export type Priority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  dueDate: Timestamp;
  isCompleted: boolean;
  createdAt: Timestamp;
  userId: string;
}

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}
