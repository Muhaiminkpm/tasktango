// src/lib/actions/auth.ts
'use server';

import {createSessionCookie, clearSessionCookie} from '@/lib/firebase/server';
import {redirect} from 'next/navigation';

export async function loginWithIdToken(idToken: string) {
  try {
    await createSessionCookie(idToken);
    redirect('/');
  } catch (error) {
    console.error('Failed to create session cookie:', error);
    // Redirecting to login with an error query parameter
    // The login page can then use this to display a message
    return redirect('/login?error=auth-failed');
  }
}

export async function logout() {
  await clearSessionCookie();
  redirect('/login');
}
