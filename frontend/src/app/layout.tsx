import { Inter } from 'next/font/google'
import './globals.css'
import { NextAuthProvider as Providers } from './providers'
import PyodidLoader from "@/components/PyodideLoader"

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Backdrop - Professional Backtesting Platform',
  description: 'Test your trading strategies with precision using historical Indian stock market data.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {``
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen bg-gradient-to-b from-[#0A0F1E] to-[#1A1F2E] text-white antialiased selection:bg-blue-500/20`}>
        <div className="fixed inset-0 bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
        <Providers>
          {/* <PyodidLoader/> */}
          {children}
        </Providers>
      </body>
    </html>
  )
}
