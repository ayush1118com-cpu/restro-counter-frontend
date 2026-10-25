import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/lib/context/app-context';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: 'ServDesk - Restaurant Counter POS & Kitchen Display System',
  description: 'ServDesk - Modern Counter POS, Khata Book & Kitchen Display System powered by Alvora Tech Solution.',
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
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
          <Toaster
            position="top-right"
            richColors
            closeButton={false}
            visibleToasts={1}
            duration={2200}
            toastOptions={{
              className: 'font-sans text-xs font-semibold rounded-xl shadow-md border border-gray-100 py-2.5 px-3.5',
            }}
          />
        </AppProvider>
      </body>
    </html>
  );
}
