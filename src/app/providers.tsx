'use client';

import {auth} from '@/lib/firebase/client';
import type {User} from '@/lib/types';
import {onAuthStateChanged, signOut} from 'firebase/auth';
import {usePathname, useRouter} from 'next/navigation';
import React, {createContext, useContext, useEffect, useState} from 'react';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

const PROTECTED_ROUTES = ['/', '/completed', '/admin'];
const AUTH_ROUTES = ['/login', '/signup'];
const ADMIN_EMAIL = 'admintasktango@gmail.com';

export function Providers({children}: {children: React.ReactNode}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, firebaseUser => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (loading) return;

    const isProtectedRoute = PROTECTED_ROUTES.some(route =>
      pathname.startsWith(route) && route !== '/' || pathname === '/'
    );
    const isAuthRoute = AUTH_ROUTES.some(route => pathname.startsWith(route));
    const isAdminUser = user?.email === ADMIN_EMAIL;

    if (!user && isProtectedRoute) {
      router.push('/login');
      return;
    }
    
    if (user) {
      if (isAuthRoute) {
        router.push(isAdminUser ? '/admin' : '/');
        return;
      }
      if (isAdminUser && pathname !== '/admin') {
          router.push('/admin');
      }
      if (!isAdminUser && pathname === '/admin') {
          router.push('/');
      }
    }

  }, [user, loading, pathname, router]);

  const logout = async () => {
    await signOut(auth);
    router.push('/login');
  };
  
  // This loading state check remains crucial. It prevents routing logic
  // from executing before the user's authentication state is determined.
  // It also prevents a flash of content if the user is not authenticated.
  const isAuthPage = AUTH_ROUTES.includes(pathname);
  if (loading && !isAuthPage) {
      return (
          <div className="flex min-h-screen items-center justify-center">
              <p>Loading...</p>
          </div>
      )
  }

  return (
    <AuthContext.Provider value={{user, loading, logout}}>
      {children}
    </AuthContext.Provider>
  );
}
