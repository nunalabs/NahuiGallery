import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from './providers';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

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
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable}`}>
      <body className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
