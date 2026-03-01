import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Mentor Pilot - Fabrika de App',
  description: 'Sistema de Flashcards Premium para Treinamento de Pilotos',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="antialiased min-h-screen selection:bg-azul-vibrante/40 selection:text-white">
        <div className="min-h-screen w-full flex flex-col">
          {children}
        </div>
      </body>
    </html>
  )
}
