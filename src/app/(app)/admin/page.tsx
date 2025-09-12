
'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export default function AdminSplashPage() {
  const router = useRouter();
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
        setIsFadingOut(true);
        setTimeout(() => {
            router.push('/admin/dashboard');
        }, 500);
    }, 1000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div 
        className={cn(
            "flex h-full flex-1 items-center justify-center transition-opacity duration-500",
            isFadingOut ? 'opacity-0' : 'opacity-100'
        )}
    >
      <div className="text-center">
        <h2 className="text-2xl font-semibold font-headline">Welcome, Admin</h2>
        <p className="text-muted-foreground">
          Loading dashboard...
        </p>
      </div>
    </div>
  );
}
