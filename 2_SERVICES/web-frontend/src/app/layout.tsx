import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: {
    default: 'iWORKZ - Global Talent Placement Platform',
    template: '%s | iWORKZ'
  },
  description: 'AI-powered global talent placement platform connecting skilled professionals with opportunities worldwide. Streamlined compliance, smart matching, and seamless onboarding.',
  keywords: ['jobs', 'talent', 'global', 'AI', 'matching', 'compliance', 'placement'],
  authors: [{ name: 'iWORKZ Team' }],
  creator: 'iWORKZ',
  publisher: 'iWORKZ',
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
    url: 'https://iworkz.com',
    siteName: 'iWORKZ',
    title: 'iWORKZ - Global Talent Placement Platform',
    description: 'AI-powered global talent placement platform connecting skilled professionals with opportunities worldwide.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'iWORKZ Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'iWORKZ - Global Talent Placement Platform',
    description: 'AI-powered global talent placement platform connecting skilled professionals with opportunities worldwide.',
    images: ['/og-image.jpg'],
    creator: '@iworkz',
  },
  verification: {
    google: 'google-site-verification-token',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={`${inter.className} antialiased`}>
        <Providers>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'var(--background)',
                color: 'var(--foreground)',
                border: '1px solid var(--border)',
              },
              success: {
                iconTheme: {
                  primary: 'var(--primary)',
                  secondary: 'var(--primary-foreground)',
                },
              },
              error: {
                iconTheme: {
                  primary: 'var(--destructive)',
                  secondary: 'var(--destructive-foreground)',
                },
              },
            }}
          />
        </Providers>
      </body>
    </html>
  )
}