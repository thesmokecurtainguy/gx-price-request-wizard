import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'GX Price Request Wizard',
  description: 'Guided quote request for Stoebich elevator smoke curtains',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <div className="mx-auto max-w-4xl p-6">
          {children}
        </div>
      </body>
    </html>
  );
}
