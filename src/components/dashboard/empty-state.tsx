import { Button } from '@/components/ui/button';
import { ListX } from 'lucide-react';

type EmptyStateProps = {
    title: string;
    description: string;
    action?: React.ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm">
      <div className="flex flex-col items-center gap-2 text-center">
        <ListX className="h-12 w-12 text-muted-foreground/50" />
        <h3 className="text-2xl font-bold tracking-tight font-headline">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
        {action}
      </div>
    </div>
  );
}
