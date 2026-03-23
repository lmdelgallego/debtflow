import type { Metadata } from "next";
import { cn } from "@/lib/utils";
import { AuthProvider } from "@/context/auth-context";
import { ToastProvider } from "@/components/ui/Toast";

import "./globals.css";

export const metadata: Metadata = {
  title: "DebtFlow",
  description: "Gestiona ingresos, gastos y deudas en un solo lugar.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="relative min-h-full dark">
      <body
        className={cn(
          "bg-background font-sans antialiased"
        )}
      >
        <ToastProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
