'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="fixed top-4 right-4 p-3 rounded-full bg-white/10 dark:bg-white/5 border border-white/20 hover:bg-white/20 transition-all z-50 backdrop-blur-md shadow-lg"
      aria-label="Alternar tema"
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  )
}
