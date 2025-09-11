import { Logo } from "@/components/layout/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-secondary/50 p-4">
        <div className="mb-8">
            <Logo />
        </div>
        <div className="w-full max-w-sm">
            {children}
        </div>
    </div>
  );
}
