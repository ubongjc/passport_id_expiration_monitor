import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'IDMonitor - Secure Passport & ID Expiration Tracking',
  description: 'Zero-knowledge passport and ID expiration monitoring with encrypted document storage',
  keywords: ['passport', 'id', 'expiration', 'reminder', 'secure', 'encrypted'],
  authors: [{ name: 'IDMonitor Team' }],
  openGraph: {
    title: 'IDMonitor - Never Miss a Document Expiration',
    description: 'Secure, zero-knowledge document expiration tracking',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={inter.className}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
