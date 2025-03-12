import { Inter } from 'next/font/google'
import './globals.css'
import { NextAuthProvider as Providers } from './providers'
import PyodidLoader from "@/components/PyodideLoader"
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Backdrop - Professional Backtesting Platform',
  description: 'Test your trading strategies with precision using historical Indian stock market data.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen bg-gradient-to-b from-[#0A0F1E] to-[#1A1F2E] text-white antialiased selection:bg-blue-500/20`}>
        <div className="fixed inset-0 bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
        <Providers>
          {/* <PyodidLoader/> */}
          {children}
          <Toaster 
            position="top-center"
            toastOptions={{
              className: 'dark:bg-gray-800 dark:text-white',
              style: {
                background: '#1f2937',
                color: '#fff',
              },
              success: {
                iconTheme: {
                  primary: '#10B981',
                  secondary: '#fff',
                }
              },
              error: {
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#fff',
                }
              }
            }}
          />
        </Providers>
      </body>
    </html>
  )
}
