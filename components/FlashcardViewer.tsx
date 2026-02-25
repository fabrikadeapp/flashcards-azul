'use client'

import { useState, useEffect } from 'react'
import { Flashcard } from '@/lib/supabase'
import ThemeToggle from './ThemeToggle'

interface FlashcardViewerProps {
  flashcards: Flashcard[]
}

export default function FlashcardViewer({ flashcards }: FlashcardViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [shuffledCards, setShuffledCards] = useState<Flashcard[]>([])

  // Embaralhar cartas ao carregar
  useEffect(() => {
    const shuffled = [...flashcards].sort(() => Math.random() - 0.5)
    setShuffledCards(shuffled)
    setCurrentIndex(0)
    setIsFlipped(false)
  }, [flashcards])

  // Salvar progresso no localStorage
  useEffect(() => {
    if (shuffledCards.length > 0) {
      localStorage.setItem('currentIndex', currentIndex.toString())
      localStorage.setItem('isFlipped', isFlipped.toString())
    }
  }, [currentIndex, isFlipped, shuffledCards])

  // Restaurar progresso do localStorage
  useEffect(() => {
    const savedIndex = localStorage.getItem('currentIndex')
    const savedFlipped = localStorage.getItem('isFlipped')

    if (savedIndex) setCurrentIndex(parseInt(savedIndex))
    if (savedFlipped) setIsFlipped(savedFlipped === 'true')
  }, [])

  // Navegação por teclado
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        // Revela resposta
        if (!isFlipped) {
          setIsFlipped(true)
        }
      } else if (e.key === 'ArrowDown') {
        // Próxima pergunta
        setCurrentIndex((prev) => (prev + 1) % shuffledCards.length)
        setIsFlipped(false)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [isFlipped, shuffledCards.length])

  if (shuffledCards.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-slate-900">
        <div className="text-center">
          <p className="text-xl text-slate-600 dark:text-slate-400">Carregando flashcards...</p>
        </div>
      </div>
    )
  }

  const currentCard = shuffledCards[currentIndex]
  const progress = `${currentIndex + 1} / ${shuffledCards.length}`

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex flex-col items-center justify-center p-4 transition-colors duration-300">
      <ThemeToggle />

      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-azul dark:text-blue-400 mb-2">
          ✈️ Flashcards A320
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Treinamento para Elevação de Comandante - Azul Airlines
        </p>
      </div>

      {/* Progresso */}
      <div className="mb-6 text-center">
        <p className="text-lg font-semibold text-slate-700 dark:text-slate-300">
          {progress}
        </p>
        <div className="w-64 h-2 bg-slate-200 dark:bg-slate-700 rounded-full mt-2 overflow-hidden">
          <div
            className="h-full bg-azul dark:bg-blue-500 transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / shuffledCards.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Flashcard */}
      <div
        onClick={() => setIsFlipped(!isFlipped)}
        className="flashcard w-full max-w-2xl h-96 mb-8 cursor-pointer"
      >
        {!isFlipped ? (
          <div className="flashcard-front">
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              Pergunta #{currentCard.numero}
            </p>
            <p className="text-lg mt-8 text-slate-800 dark:text-slate-200 leading-relaxed">
              {currentCard.pergunta}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-8">
              → Pressione SETA DIREITA ou clique para revelar resposta
            </p>
          </div>
        ) : (
          <div className="flashcard-back">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 font-semibold">
              RESPOSTA
            </p>
            <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed">
              {currentCard.resposta}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-8">
              {currentCard.modulo} • {currentCard.categoria}
            </p>
          </div>
        )}
      </div>

      {/* Controles */}
      <div className="flex gap-4 mb-12">
        <button
          onClick={() => {
            setCurrentIndex((prev) => (prev - 1 + shuffledCards.length) % shuffledCards.length)
            setIsFlipped(false)
          }}
          className="px-6 py-3 bg-slate-300 dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg font-semibold hover:bg-slate-400 dark:hover:bg-slate-600 transition-colors"
        >
          ← Anterior
        </button>
        <button
          onClick={() => {
            setCurrentIndex((prev) => (prev + 1) % shuffledCards.length)
            setIsFlipped(false)
          }}
          className="px-6 py-3 bg-azul dark:bg-blue-600 text-white rounded-lg font-semibold hover:bg-azul-dark dark:hover:bg-blue-700 transition-colors"
        >
          Próxima ↓
        </button>
      </div>

      {/* Keyboard hints */}
      <div className="text-center text-sm text-slate-500 dark:text-slate-400 space-y-1">
        <p>→ Direita: Revelar resposta</p>
        <p>↓ Baixo: Próxima pergunta</p>
        <p>← Esquerda: Pergunta anterior</p>
      </div>

      {/* Info módulo */}
      <div className="mt-12 text-center">
        <p className="text-xs text-slate-500 dark:text-slate-500">
          Módulo: <span className="font-semibold">{currentCard.modulo}</span> •
          Categoria: <span className="font-semibold">{currentCard.categoria}</span>
        </p>
      </div>
    </div>
  )
}
