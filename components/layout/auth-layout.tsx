'use client';

import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileNav } from '@/components/layout/MobileNav';
import { Header } from '@/components/layout/Header';
import { ProtectedRoute } from '@/components/auth/protected-route';

export function AuthLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-coffee-50">
        <Sidebar />
        <Header />
        <main className="lg:pl-64 pb-20 lg:pb-0">
          <div className="container mx-auto p-4 lg:p-8">
            {children}
          </div>
        </main>
        <MobileNav />
      </div>
    </ProtectedRoute>
  );
}

