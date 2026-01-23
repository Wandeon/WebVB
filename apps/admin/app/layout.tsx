import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import './globals.css';

export const metadata: Metadata = {
  title: 'Admin | Veliki Bukovec',
  description: 'Administratorsko sučelje za Općinu Veliki Bukovec',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="hr">
      <body>{children}</body>
    </html>
  );
}
