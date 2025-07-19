import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ApolloProvider } from '@/lib/apollo-provider'
import { AuthProvider } from '@/lib/auth-context'
import { ClientOnly } from '@/lib/client-only'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Continuo - All-in-One Business Management',
  description: 'AI-powered business management platform for small businesses',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ApolloProvider>
          <ClientOnly fallback={<div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          </div>}>
            <AuthProvider>
              {children}
            </AuthProvider>
          </ClientOnly>
        </ApolloProvider>
      </body>
    </html>
  )
}
