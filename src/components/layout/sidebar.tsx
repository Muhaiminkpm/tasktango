'use client';

import { Logo } from '@/components/layout/logo';
import { cn } from '@/lib/utils';
import { CheckCircle2, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  {
    href: '/',
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    href: '/completed',
    label: 'Completed',
    icon: CheckCircle2,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 flex-col border-r bg-secondary/50 lg:flex">
      <div className="flex h-16 items-center border-b px-6">
        <Logo />
      </div>
      <div className="flex-1">
        <nav className="grid items-start px-4 py-4 text-sm font-medium">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                {
                  'bg-primary/10 text-primary': pathname === item.href,
                }
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
}
