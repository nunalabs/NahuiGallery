import type { Metadata, Viewport } from 'next';
import { Providers } from './providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'NahuiGallery - Premium NFT Platform on ANDE Network',
  description:
    'Discover, create, and trade premium NFT art on ANDE Network. Ultra-low fees, instant confirmations, automatic royalties.',
  keywords: [
    'NFT',
    'Art',
    'ANDE Network',
    'NFT Marketplace',
    'Digital Art',
    'Latin American Art',
    'Blockchain',
  ],
  authors: [{ name: 'Nuna Labs', url: 'https://nunalabs.com' }],
  metadataBase: new URL('https://nahuigallery.art'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://nahuigallery.art',
    siteName: 'NahuiGallery',
    title: 'NahuiGallery - Premium NFT Platform',
    description: 'Premium NFT platform on ANDE Network',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'NahuiGallery',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@NahuiGallery',
    creator: '@NahuiGallery',
    title: 'NahuiGallery - Premium NFT Platform',
    description: 'Premium NFT platform on ANDE Network',
    images: ['/twitter-image.png'],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
