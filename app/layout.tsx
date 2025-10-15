import type { Metadata } from "next";
import "./globals.css";
import { Providers } from './providers';
import { defaultMetadata } from '@/lib/seo-config';

export const metadata: Metadata = defaultMetadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
