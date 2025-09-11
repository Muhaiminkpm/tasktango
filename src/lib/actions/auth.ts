'use server';

import {
  createSessionCookie,
  clearSessionCookie,
} from '@/lib/firebase/server';
import {redirect} from 'next/navigation';

export async function loginWithIdToken(idToken: string) {
  await createSessionCookie(idToken);
  redirect('/');
}

export async function logout() {
  await clearSessionCookie();
  redirect('/login');
}
