import type { Metadata } from 'next';
import './globals.css';

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
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 min-h-screen flex flex-col font-sans">
        {children}
      </body>
    </html>
  );
}
