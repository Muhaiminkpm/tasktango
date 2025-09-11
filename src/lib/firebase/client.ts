import {initializeApp, getApps, getApp} from 'firebase/app';
import {getAuth} from 'firebase/auth';
import {getFirestore} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyCvi-Wp7wtl2y5aEcWcekm14CTjj0EiGG4',
  authDomain: 'studio-5759297052-61ee5.firebaseapp.com',
  projectId: 'studio-5759297052-61ee5',
  storageBucket: 'studio-5759297052-61ee5.appspot.com',
  messagingSenderId: '542214912337',
  appId: '1:542214912337:web:540de702032829801f7b70',
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export {app, auth, db};
