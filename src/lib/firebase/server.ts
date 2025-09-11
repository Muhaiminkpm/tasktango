import admin from 'firebase-admin';
import {getApps, initializeApp, cert} from 'firebase-admin/app';
import {cookies} from 'next/headers';
import {NextResponse} from 'next/server';
import {
  SESSION_COOKIE_NAME,
  SESSION_COOKIE_EXPIRES_IN,
} from '@/lib/constants';

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
  ? JSON.parse(Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT, 'base64').toString('utf-8'))
  : undefined;

if (!getApps().length) {
  initializeApp({
    credential: serviceAccount ? cert(serviceAccount) : undefined,
  });
}

export async function createSessionCookie(idToken: string) {
  const sessionCookie = await admin
    .auth()
    .createSessionCookie(idToken, {expiresIn: SESSION_COOKIE_EXPIRES_IN});

  cookies().set(SESSION_COOKIE_NAME, sessionCookie, {
    maxAge: SESSION_COOKIE_EXPIRES_IN,
    httpOnly: true,
    secure: true,
  });

  return NextResponse.json({status: 'success'}, {status: 200});
}

export async function clearSessionCookie() {
  cookies().delete(SESSION_COOKIE_NAME);
}

export async function getCurrentUser() {
  const sessionCookie = cookies().get(SESSION_COOKIE_NAME)?.value;
  if (!sessionCookie) return null;

  try {
    const decodedClaims = await admin.auth().verifySessionCookie(sessionCookie, true);
    return decodedClaims;
  } catch (error) {
    return null;
  }
}

export const db = admin.firestore();
