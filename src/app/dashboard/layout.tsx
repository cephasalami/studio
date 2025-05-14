'use client';

import type { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { SidebarProvider, Sidebar, SidebarInset, SidebarTrigger, SidebarHeader, SidebarContent, SidebarFooter } from '@/components/ui/sidebar';
import { SidebarNav } from '@/components/dashboard/sidebar-nav';
import { UserNav } from '@/components/dashboard/user-nav';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Bell, Settings } from 'lucide-react';
import Link from 'next/link';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { userRole, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !userRole) {
      router.replace('/login');
    }
  }, [userRole, loading, router]);

  if (loading || !userRole) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <svg className="animate-spin h-16 w-16 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar variant="sidebar" collapsible="icon" className="border-r shadow-md">
        <SidebarHeader className="p-4 border-b border-sidebar-border">
          <Link href="/dashboard" className="flex items-center gap-2 text-sidebar-foreground hover:text-sidebar-primary transition-colors">
            <ShieldCheck className="h-8 w-8 text-sidebar-primary" />
            <span className="font-semibold text-xl group-data-[collapsible=icon]:hidden">EstateWatch</span>
          </Link>
        </SidebarHeader>
        <SidebarContent className="p-2">
          <SidebarNav role={userRole} />
        </SidebarContent>
        <SidebarFooter className="p-4 mt-auto border-t border-sidebar-border group-data-[collapsible=icon]:p-2">
           <Button variant="ghost" size="icon" className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:w-full">
             <Settings />
             <span className="sr-only group-data-[collapsible=icon]:hidden ml-2">Settings</span>
           </Button>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="flex flex-col">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 backdrop-blur-sm px-6 shadow-sm">
          <div className="flex items-center">
            <SidebarTrigger className="mr-4 lg:hidden" /> {/* Hidden on large screens */}
            <h1 className="text-xl font-semibold text-foreground">{userRole} Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-accent-foreground">
              <Bell size={20} />
              <span className="sr-only">Notifications</span>
            </Button>
            <UserNav userRole={userRole} onLogout={logout} />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6 bg-background">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
