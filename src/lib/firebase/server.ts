import admin from 'firebase-admin';
import {getApps, initializeApp, cert} from 'firebase-admin/app';
import {cookies} from 'next/headers';
import {
  SESSION_COOKIE_NAME,
  SESSION_COOKIE_EXPIRES_IN,
} from '@/lib/constants';

const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT;
const placeholder = 'your-base64-encoded-service-account';

let serviceAccount: admin.ServiceAccount | undefined;

if (serviceAccountString && serviceAccountString !== placeholder) {
  try {
    serviceAccount = JSON.parse(Buffer.from(serviceAccountString, 'base64').toString('utf-8'));
  } catch (e) {
    console.error('Error parsing Firebase service account key. Make sure it is a valid Base64 encoded JSON.', e);
  }
} else if (serviceAccountString === placeholder) {
    console.warn(`Firebase Admin SDK not initialized. Please replace the placeholder value in the FIREBASE_SERVICE_ACCOUNT environment variable.`);
}

function isFirebaseAdminInitialized() {
    return getApps().length > 0;
}

if (!isFirebaseAdminInitialized() && serviceAccount) {
  initializeApp({
    credential: cert(serviceAccount),
  });
}

export async function createSessionCookie(idToken: string) {
  if (!isFirebaseAdminInitialized()) {
    throw new Error('Firebase Admin SDK not initialized. Check your FIREBASE_SERVICE_ACCOUNT environment variable.');
  }
  const sessionCookie = await admin
    .auth()
    .createSessionCookie(idToken, {expiresIn: SESSION_COOKIE_EXPIRES_IN});

  cookies().set(SESSION_COOKIE_NAME, sessionCookie, {
    maxAge: SESSION_COOKIE_EXPIRES_IN,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  });
}

export async function clearSessionCookie() {
  cookies().delete(SESSION_COOKIE_NAME);
}

export async function getCurrentUser() {
    if (!isFirebaseAdminInitialized()) {
        console.warn('Firebase Admin SDK not initialized. Cannot authenticate user.');
        return null;
    }
  const sessionCookie = cookies().get(SESSION_COOKIE_NAME)?.value;
  if (!sessionCookie) return null;

  try {
    const decodedClaims = await admin.auth().verifySessionCookie(sessionCookie, true);
    return decodedClaims;
  } catch (error) {
    return null;
  }
}

export function getDb() {
    if (!isFirebaseAdminInitialized()) {
        throw new Error('Firebase Admin SDK not initialized. Cannot access Firestore.');
    }
    return admin.firestore();
}
