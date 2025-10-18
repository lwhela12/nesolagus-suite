import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Sidebar from '@/components/ui/sidebar'
import GlobalHeader from '@/components/ui/global-header'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Hollow UI',
  description: 'Survey analytics dashboard',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          <Sidebar />
          <div id="main-content" className="ml-64 transition-all">
            <GlobalHeader />
            {children}
          </div>
        </div>
      </body>
    </html>
  )
}
