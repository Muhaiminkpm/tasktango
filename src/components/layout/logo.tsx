import { ListTodo } from 'lucide-react';
import Link from 'next/link';

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <ListTodo className="h-6 w-6 text-primary" />
      <h1 className="text-xl font-headline font-semibold text-foreground">
        TaskTango
      </h1>
    </Link>
  );
}
