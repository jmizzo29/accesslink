import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AccessLink - Accessible Travel Made Easy',
  description: 'Find truly accessible travel options for wheelchair users. Search accessible Airbnbs, hotels, and airports.',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=5',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="theme-color" content="#0066cc" />
      </head>
      <body className="antialiased bg-access-light text-access-dark">
        <div id="root">{children}</div>
      </body>
    </html>
  );
}
