import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/shared/ThemeProvider';
import { Outfit, Plus_Jakarta_Sans } from 'next/font/google';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'AskCET — AI-Powered RAG College Information Assistant',
  description: 'Instant, source-grounded answers to all your college queries powered by Retrieval-Augmented Generation.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark ${outfit.variable} ${jakarta.variable}`}>
      <body className="dark min-h-screen flex flex-col font-outfit antialiased selection:bg-cyan-500/20 selection:text-cyan-300 transition-colors duration-500">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
