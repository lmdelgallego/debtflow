'use client';

import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { SidebarProvider } from "@/context/sidebar-context";

function Layout({ children }: { children: React.ReactNode}) {
  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Navbar />
          <main className="flex-1 overflow-y-auto animate-in fade-in duration-300">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}

export default Layout;
