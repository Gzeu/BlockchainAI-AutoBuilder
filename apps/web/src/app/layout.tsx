import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'BlockchainAI AutoBuilder',
  description: 'Platforma de automatizare pentru dezvoltarea aplicațiilor blockchain și AI',
  keywords: ['blockchain', 'AI', 'automation', 'Web3', 'MultiversX'],
  authors: [{ name: 'George Pricop', url: 'https://github.com/Gzeu' }],
  openGraph: {
    title: 'BlockchainAI AutoBuilder',
    description: 'Platforma de automatizare pentru dezvoltarea aplicațiilor blockchain și AI',
    url: 'https://blockchainai-autobuilder.vercel.app',
    siteName: 'BlockchainAI AutoBuilder',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'ro_RO',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BlockchainAI AutoBuilder',
    description: 'Platforma de automatizare pentru dezvoltarea aplicațiilor blockchain și AI',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ro" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <Providers>
          <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            <Header />
            <main className="container mx-auto px-4 py-8">
              {children}
            </main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  )
}