import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/lib/context/app-context';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: 'Restro Counter System - Modern Restaurant POS & Kitchen Display',
  description: 'Manage counter orders, payments, menus, and real-time kitchen display operations from one unified restaurant management system.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-[#fcfcfd] text-gray-900 font-sans antialiased selection:bg-amber-100 selection:text-amber-900" suppressHydrationWarning>
        <AppProvider>
          {children}
          <Toaster position="top-right" richColors closeButton />
        </AppProvider>
      </body>
    </html>
  );
}
