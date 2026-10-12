import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/lib/context/app-context';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: 'ServDesk - Restaurant Counter POS & Kitchen Display System',
  description: 'ServDesk - Modern Counter POS, Khata Book & Kitchen Display System powered by Alvora Tech Solution.',
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
