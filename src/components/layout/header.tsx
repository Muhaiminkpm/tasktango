
import { UserNav } from '@/components/layout/user-nav';

type HeaderProps = {
    title?: string;
    children?: React.ReactNode;
}

export function Header({ title, children }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
        <div className="flex items-center gap-4">
            {title ? (
                <h1 className="text-xl font-semibold font-headline">{title}</h1>
            ) : null}
            {!title && children}
        </div>
      <div className="flex items-center gap-4">
        <UserNav />
      </div>
    </header>
  );
}
