import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Flashcards A320 - Azul Airlines',
  description: 'Sistema de Flashcards para Treinamento de Pilotos A320',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <div className="min-h-screen w-full">
          {children}
        </div>
      </body>
    </html>
  )
}
