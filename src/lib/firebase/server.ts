
import admin from 'firebase-admin';
import {getApps, initializeApp, cert} from 'firebase-admin/app';
import {cookies} from 'next/headers';
import {
  SESSION_COOKIE_NAME,
  SESSION_COOKIE_EXPIRES_IN,
} from '@/lib/constants';

function initializeFirebaseAdmin() {
  if (getApps().length > 0) {
    return admin.app();
  }

  const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!serviceAccountString || serviceAccountString === 'your-base64-encoded-service-account') {
    console.warn(
      'Firebase Admin SDK not initialized. Set FIREBASE_SERVICE_ACCOUNT.'
    );
    return null;
  }

  try {
    const decodedString = Buffer.from(serviceAccountString, 'base64').toString('utf-8');
    const serviceAccount = JSON.parse(decodedString);
    
    return initializeApp({
      credential: cert(serviceAccount),
    });
  } catch (e: any) {
    // This is a common error when the private key has newlines.
    if (e instanceof SyntaxError && e.message.includes('Bad control character')) {
        try {
            const decodedString = Buffer.from(serviceAccountString, 'base64').toString('utf-8');
            const serviceAccount = JSON.parse(decodedString.replace(/\n/g, '\\n'));
             return initializeApp({
                credential: cert(serviceAccount),
            });
        } catch(e2) {
             console.error(
                'Error parsing Firebase service account key even after fixing newlines.', e2
            );
            return null;
        }
    }
    console.error(
      'Error parsing Firebase service account key.', e
    );
    return null;
  }
}

function isFirebaseAdminInitialized() {
    return getApps().length > 0;
}

export async function createSessionCookie(idToken: string) {
  initializeFirebaseAdmin();
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
    sameSite: 'lax',
  });
}

export async function clearSessionCookie() {
  cookies().delete(SESSION_COOKIE_NAME);
}

export async function getCurrentUser() {
    initializeFirebaseAdmin();
    if (!isFirebaseAdminInitialized()) {
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
    initializeFirebaseAdmin();
    if (!isFirebaseAdminInitialized()) {
        throw new Error('Firebase Admin SDK not initialized. Cannot access Firestore.');
    }
    return admin.firestore();
}
