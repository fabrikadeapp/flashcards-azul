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

  const [isEditingMode, setIsEditingMode] = useState(false)
  const [editValue, setEditValue] = useState('')
  const [allowEditing, setAllowEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const [isAddingNew, setIsAddingNew] = useState(false)
  const [newPergunta, setNewPergunta] = useState('')
  const [newResposta, setNewResposta] = useState('')

  // Obter configurações de permissão de edição
  useEffect(() => {
    fetch('/api/admin/settings')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.settings) {
          setAllowEditing(data.settings.allowFlashcardEditing)
        }
      })
      .catch(console.error)
  }, [])

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
      // Impede navegação se estiver editando
      if (isEditingMode) return

      if (e.key === 'ArrowRight' || e.key === ' ') {
        if (!isFlipped) setIsFlipped(true)
      } else if (e.key === 'ArrowDown') {
        setCurrentIndex((prev) => (prev + 1) % shuffledCards.length)
        setIsFlipped(false)
      } else if (e.key === 'ArrowLeft') {
        setCurrentIndex((prev) => (prev - 1 + shuffledCards.length) % shuffledCards.length)
        setIsFlipped(false)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [isFlipped, shuffledCards.length, isEditingMode])

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

  const startEditing = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsEditingMode(true)
    setEditValue(isFlipped ? currentCard.resposta : currentCard.pergunta)
  }

  const cancelEditing = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsEditingMode(false)
    setEditValue('')
  }

  const handleSaveEdit = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!editValue.trim()) return

    setIsSaving(true)
    const payload = {
      numero: currentCard.numero,
      ...(isFlipped ? { newResposta: editValue } : { newPergunta: editValue })
    }

    try {
      const res = await fetch('/api/flashcards/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        const newCards = [...shuffledCards]
        if (isFlipped) newCards[currentIndex].resposta = editValue
        else newCards[currentIndex].pergunta = editValue
        setShuffledCards(newCards)
        setIsEditingMode(false)
      } else {
        alert('Falha ao atualizar o card.')
      }
    } catch (err) {
      alert('Erro de conexão ao salvar.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddNew = async () => {
    if (!newPergunta.trim() || !newResposta.trim()) {
      alert('Por favor preencha pergunta e resposta.')
      return
    }

    setIsSaving(true)
    try {
      const res = await fetch('/api/flashcards/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pergunta: newPergunta, resposta: newResposta })
      })

      const data = await res.json()
      if (res.ok) {
        setShuffledCards(prev => [data.flashcard, ...prev])
        setCurrentIndex(0)
        setIsAddingNew(false)
        setNewPergunta('')
        setNewResposta('')
        setIsFlipped(false)
      } else {
        alert(data.error || 'Erro ao criar flashcard.')
      }
    } catch (err) {
      alert('Erro de conexão ao criar.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0B1F3B] flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 transition-colors duration-500 overflow-hidden relative">

      {/* Background glow para ambiente Premium */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#1E63FF] rounded-full mix-blend-screen filter blur-[200px] opacity-20 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#F5B942] rounded-full mix-blend-screen filter blur-[200px] opacity-10 pointer-events-none"></div>

      <ThemeToggle />

      {/* Header */}
      <div className="text-center z-10 mb-8 sm:mb-12 mt-12 sm:mt-0">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#FFFFFF] tracking-tight mb-2 md:mb-4">
          Mentor <span className="text-[#1E63FF]">Pilot</span>
        </h1>
        <p className="text-sm md:text-base text-[#F5B942] tracking-widest uppercase font-semibold">
          Treinamento Operacional A320
        </p>
      </div>

      {/* Progresso Apple Style */}
      <div className="z-10 w-full max-w-4xl text-center mb-8">
        <div className="flex justify-between items-end mb-3 px-2">
          <span className="text-white/50 text-xs font-semibold uppercase tracking-widest">Progresso Mental</span>
          <span className="text-[#FFFFFF] text-lg font-bold bg-white/10 px-4 py-1 rounded-full backdrop-blur-md border border-white/5">
            {progress}
          </span>
        </div>
        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
          <div
            className="h-full bg-gradient-to-r from-[#1E63FF] to-[#F5B942] shadow-[0_0_10px_rgba(30,99,255,0.8)] transition-all duration-700 ease-out"
            style={{ width: `${((currentIndex + 1) / shuffledCards.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Flashcard Hero */}
      <div className="z-10 w-full flex justify-center mb-10 perspective-1000">
        <div
          onClick={() => {
            if (!isEditingMode) setIsFlipped(!isFlipped)
          }}
          className={`flashcard relative w-full ${isEditingMode ? 'cursor-default shadow-[0_0_30px_rgba(30,99,255,0.4)]' : ''}`}
        >
          {/* subtle border top gradient inner */}
          <div className="absolute inset-0 rounded-3xl border border-white/20 pointer-events-none z-20"></div>

          {allowEditing && !isEditingMode && (
            <button
              onClick={startEditing}
              className="absolute top-4 right-4 z-30 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white/50 hover:text-white transition backdrop-blur-md border border-white/5"
              title="Editar"
            >
              ✏️
            </button>
          )}

          {isEditingMode ? (
            <div className="w-full h-full flex flex-col items-center justify-center animate-fade-in p-4 z-30">
              <textarea
                autoFocus
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className="w-full h-3/4 p-6 bg-white/10 text-white rounded-2xl resize-none outline-none focus:ring-2 focus:ring-[#1E63FF]/50 border border-white/20 backdrop-blur-md 
                           text-xl md:text-2xl text-center leading-relaxed font-light"
              />
              <div className="flex gap-4 mt-6">
                <button
                  onClick={cancelEditing}
                  disabled={isSaving}
                  className="px-6 py-2 rounded-full border border-white/20 text-white/70 hover:bg-white/10 hover:text-white transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={isSaving}
                  className="px-6 py-2 rounded-full bg-[#1E63FF] text-white hover:bg-blue-500 transition shadow-[0_0_15px_rgba(30,99,255,0.4)]"
                >
                  {isSaving ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </div>
          ) : !isFlipped ? (
            <div className="flashcard-front animate-fade-in flex flex-col justify-center items-center h-full">
              <span className="absolute top-8 left-8 text-white/20 text-6xl font-serif">"</span>
              <p className="px-4 md:px-8">
                {currentCard.pergunta}
              </p>
              <span className="absolute bottom-8 right-8 text-white/20 text-6xl font-serif leading-none">"</span>
              <p className="absolute bottom-8 left-0 right-0 text-center text-xs md:text-sm text-[#1E63FF] font-medium tracking-wide animate-pulse">
                Clique para Revelar a Resposta
              </p>
            </div>
          ) : (
            <div className="flashcard-back animate-fade-in flex flex-col justify-center items-center h-full">
              <div className="absolute top-8 w-12 h-1 bg-[#F5B942] rounded-full mx-auto mb-8"></div>
              <p className="px-4 md:px-8 font-light text-xl md:text-3xl text-white">
                {currentCard.resposta}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Controles Glassmorphism */}
      <div className="z-10 flex gap-4 md:gap-6 mb-12">
        <button
          onClick={() => {
            setCurrentIndex((prev) => (prev - 1 + shuffledCards.length) % shuffledCards.length)
            setIsFlipped(false)
          }}
          className="btn-secondary w-36 md:w-48 group"
        >
          <span className="group-hover:-translate-x-1 transition-transform mr-2">←</span> Anterior
        </button>
        <button
          onClick={() => {
            setCurrentIndex((prev) => (prev + 1) % shuffledCards.length)
            setIsFlipped(false)
          }}
          className="btn-primary w-36 md:w-48 group"
        >
          Próxima <span className="group-hover:translate-x-1 transition-transform ml-2">→</span>
        </button>
      </div>

      {/* Keyboard hints */}
      <div className="z-10 text-center text-xs text-white/40 space-y-1 mb-8 opacity-50 hover:opacity-100 transition-opacity">
        <p>→ / Espaço: Revelar • ↓ Próxima • ← Anterior</p>
      </div>

      {allowEditing && (
        <div className="z-10 absolute top-6 right-6 flex gap-4">
          <button
            onClick={() => setIsAddingNew(true)}
            className="flex items-center gap-2 bg-[#1E63FF]/30 hover:bg-[#1E63FF]/50 text-white/90 px-4 py-2 rounded-full backdrop-blur-md border border-[#1E63FF]/30 transition shadow-lg text-sm font-medium"
          >
            <span>+</span> Novo Flashcard
          </button>
        </div>
      )}

      {/* Info módulo (se aplicável / mantido para compatibilidade base de dados futura) */}
      <div className="z-10 mt-auto text-center hidden md:block">
        <p className="text-[10px] uppercase tracking-widest text-[#F5B942]/60">
          POWERED BY <span className="font-bold text-white/60">FABRIKA DE APP</span>
        </p>
      </div>

      {/* Modal para Adicionar Novo Flashcard */}
      {isAddingNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0B1F3B] border border-white/10 rounded-3xl p-6 md:p-8 w-full max-w-2xl shadow-2xl flex flex-col gap-6">
            <h2 className="text-2xl font-bold text-white mb-2">Criar Novo Flashcard</h2>

            <div className="flex flex-col gap-2">
              <label className="text-sm text-white/60 font-medium">Pergunta</label>
              <textarea
                value={newPergunta}
                onChange={(e) => setNewPergunta(e.target.value)}
                autoFocus
                className="w-full h-32 p-4 bg-white/5 text-white rounded-xl resize-none outline-none focus:ring-2 focus:ring-[#1E63FF]/50 border border-white/20 text-lg leading-relaxed placeholder-white/20"
                placeholder="Insira o texto da pergunta..."
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm text-white/60 font-medium">Resposta</label>
              <textarea
                value={newResposta}
                onChange={(e) => setNewResposta(e.target.value)}
                className="w-full h-32 p-4 bg-white/5 text-white rounded-xl resize-none outline-none focus:ring-2 focus:ring-[#1E63FF]/50 border border-white/20 text-lg leading-relaxed placeholder-white/20"
                placeholder="Insira o texto da resposta..."
              />
            </div>

            <div className="flex justify-end gap-4 mt-4">
              <button
                onClick={() => setIsAddingNew(false)}
                disabled={isSaving}
                className="px-6 py-2.5 rounded-full border border-white/20 text-white/70 hover:bg-white/10 hover:text-white transition font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddNew}
                disabled={isSaving}
                className="px-6 py-2.5 rounded-full bg-[#1E63FF] text-white hover:bg-blue-500 transition shadow-[0_0_15px_rgba(30,99,255,0.4)] font-medium"
              >
                {isSaving ? 'Criando...' : 'Adicionar Flashcard'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
