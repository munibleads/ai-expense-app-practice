import { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'AI-Powered Expense Tracker',
    template: '%s | AI-Powered Expense Tracker',
  },
  description: 'Upload your receipts and let AI do the work. Track expenses, generate reports, and manage your finances with ease.',
  keywords: [
    'expense tracker',
    'AI',
    'receipt scanner',
    'finance management',
    'budget tracking',
    'expense management',
    'financial planning',
    'receipt OCR',
    'expense analytics',
    'business expenses'
  ],
  authors: [{ name: 'Your Company Name' }],
  creator: 'Your Company Name',
  publisher: 'Your Company Name',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://your-domain.com',
    title: 'AI-Powered Expense Tracker',
    description: 'Upload your receipts and let AI do the work. Track expenses, generate reports, and manage your finances with ease.',
    siteName: 'AI-Powered Expense Tracker',
    images: [{
      url: 'https://your-domain.com/og-image.jpg',
      width: 1200,
      height: 630,
      alt: 'AI-Powered Expense Tracker',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI-Powered Expense Tracker',
    description: 'Upload your receipts and let AI do the work. Track expenses, generate reports, and manage your finances with ease.',
    creator: '@yourhandle',
    images: ['https://your-domain.com/twitter-image.jpg'],
  },
  verification: {
    google: 'your-google-site-verification',
    yandex: 'your-yandex-verification',
    yahoo: 'your-yahoo-verification',
    other: {
      me: ['your-domain.com'],
    },
  },
  appleWebApp: {
    title: 'AI-Powered Expense Tracker',
    statusBarStyle: 'black-translucent',
    startupImage: [
      '/apple-splash-2048-2732.jpg',
      '/apple-splash-1668-2224.jpg',
      '/apple-splash-1536-2048.jpg',
      '/apple-splash-1125-2436.jpg',
      '/apple-splash-1242-2208.jpg',
    ],
  },
  applicationName: 'AI-Powered Expense Tracker',
  referrer: 'origin-when-cross-origin',
  category: 'finance',
}; 