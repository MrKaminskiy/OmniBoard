import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navigation from '@/components/Navigation'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'OmniBoard - Crypto Trading Dashboard',
  description: 'Premium crypto trading dashboard with real-time market data',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* Tabler UI CSS */}
        <link href="https://cdn.jsdelivr.net/npm/@tabler/core@latest/dist/css/tabler.min.css" rel="stylesheet" />
        {/* Tabler Icons */}
        <link href="https://cdn.jsdelivr.net/npm/@tabler/icons@latest/iconfont/tabler-icons.min.css" rel="stylesheet" />
      </head>
      <body className={`${inter.className} theme-dark`}>
        <Navigation />
        <main className="container-xl py-4">
          {children}
        </main>
        {/* Tabler UI JavaScript */}
        <script defer src="https://cdn.jsdelivr.net/npm/@tabler/core@latest/dist/js/tabler.min.js"></script>
      </body>
    </html>
  )
}
